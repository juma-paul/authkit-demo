import axios, { AxiosError, AxiosRequestConfig } from "axios";

interface RetryRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

interface APIErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 500;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

const delay = (retryCount: number) =>
  new Promise((resolve) =>
    setTimeout(resolve, BASE_RETRY_DELAY * Math.pow(2, retryCount - 1)),
  );

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "X-API-Key": process.env.NEXT_PUBLIC_API_KEY,
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    const errorCode = (error.response?.data as APIErrorResponse)?.error?.code;
    const errorMessage = (error.response?.data as APIErrorResponse)?.error
      ?.message;

    originalRequest._retryCount = originalRequest._retryCount ?? 0;

    if (
      (!error.response || status === 500) &&
      originalRequest._retryCount < MAX_RETRIES
    ) {
      originalRequest._retryCount++;
      await delay(originalRequest._retryCount);
      return api(originalRequest);
    }

    // 401 Handling
    if (status === 401) {
      switch (errorCode) {
        case "TOKEN_EXPIRED":
          if (!originalRequest._retry) {
            if (isRefreshing) {
              return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
              })
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
              await api.post("/auth/refresh");
              processQueue(null);
              return api(originalRequest);
            } catch (refreshErr) {
              processQueue(refreshErr);
              window.location.href = "/login";
              return Promise.reject(refreshErr);
            } finally {
              isRefreshing = false;
            }
          }
          break;

        case "ACCOUNT_DELETED":
          window.location.href = "/login?reason=account_deleted";
          return Promise.reject(error);

        default:
          if (originalRequest.url?.includes("/auth/login")) {
            return Promise.reject(error);
          }

          if (originalRequest.url?.includes("/2fa")) {
            return Promise.reject(error); 
          }

          if (!originalRequest.url?.includes("/users/profile")) {
            window.location.href = "/login";
          }
          return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
