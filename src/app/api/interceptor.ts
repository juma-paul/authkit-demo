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
let redirectingToLogin = false;

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

//
// Main API instance
//
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "X-API-Key": process.env.NEXT_PUBLIC_API_KEY,
  },
});

// Refresh-safe instance (NO interceptors)
const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "X-API-Key": process.env.NEXT_PUBLIC_API_KEY,
  },
});

// Auth pages where 401 should NOT trigger redirect
const AUTH_PAGES = ["/login", "/register", "/2fa", "/auth/callback"];

// Public API endpoints
const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/verify-email",
  "/auth/reset-password",
  "/auth/forgot-password",
  "/auth/2fa/validate",
  "/auth/resend-verification",
  "/users/account/restore",
];

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    const errorCode = (error.response?.data as APIErrorResponse)?.error?.code;

    originalRequest._retryCount = originalRequest._retryCount ?? 0;

    // Retry network/server errors
    if (
      (!error.response || status === 500) &&
      status !== 429 &&
      originalRequest._retryCount < MAX_RETRIES
    ) {
      originalRequest._retryCount++;

      await delay(originalRequest._retryCount);

      return api(originalRequest);
    }

    // Handle 401
    if (status === 401) {
      const isPublicRequest = PUBLIC_ENDPOINTS.some((url) =>
        originalRequest.url?.includes(url),
      );

      // Never redirect public endpoints
      if (isPublicRequest) {
        return Promise.reject(error);
      }

      // Token expired → refresh FIRST (before other 401 checks)
      if (errorCode === "TOKEN_EXPIRED" && !originalRequest._retry) {
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
          // Use refresh client
          await refreshClient.post("/auth/refresh");

          processQueue(null);

          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);

          // Only redirect if not already on auth pages
          if (typeof window !== "undefined" && !redirectingToLogin) {
            const isOnAuthPage = AUTH_PAGES.some((page) =>
              window.location.pathname.startsWith(page),
            );
            if (!isOnAuthPage) {
              redirectingToLogin = true;
              window.location.replace("/login?reason=session_expired");
            }
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Other 401 → redirect once (but not if on auth pages)
      if (typeof window !== "undefined" && !redirectingToLogin) {
        const isOnAuthPage = AUTH_PAGES.some((page) =>
          window.location.pathname.startsWith(page),
        );
        if (!isOnAuthPage) {
          redirectingToLogin = true;
          window.location.replace("/login?reason=session_expired");
        }
      }

      return Promise.reject(error);
    }

    // Handle 403 Account Deleted
    if (status === 403 && errorCode === "ACCOUNT_DELETED") {
      if (typeof window !== "undefined" && !redirectingToLogin) {
        redirectingToLogin = true;
        window.location.replace("/login?reason=account_deleted");
      }
      return Promise.reject(error);
    }

    // Handle 429 Rate Limit
    if (status === 429) {
      const retryAfter = error.response?.headers?.["retry-after"];
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 30000;

      // Emit rate limit event for UI feedback
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("rate-limited", {
            detail: { retryAfter: Math.ceil(waitTime / 1000) },
          }),
        );
      }

      // Auto-retry after delay (only once per request)
      // if (!originalRequest._retry) {
      //   originalRequest._retry = true;
      //   await new Promise((resolve) => setTimeout(resolve, waitTime));
      //   return api(originalRequest);
      // }
    }

    return Promise.reject(error);
  },
);

export default api;
