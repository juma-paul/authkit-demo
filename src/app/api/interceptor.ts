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

// Safety timeout to reset redirect flag if navigation doesn't complete
const setRedirecting = () => {
  redirectingToLogin = true;
  // Reset after 5s in case redirect fails (e.g., blocked by extension)
  setTimeout(() => {
    redirectingToLogin = false;
  }, 5000);
};

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
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "X-API-Key": process.env.NEXT_PUBLIC_API_KEY,
  },
});

// Refresh-safe instance (NO interceptors)
const refreshClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "X-API-Key": process.env.NEXT_PUBLIC_API_KEY,
  },
});

// Auth pages where 401 should NOT trigger redirect
const AUTH_PAGES = [
  "/login",
  "/register",
  "/2fa",
  "/auth/callback",
  "/verify-email",
  "/verify-email-change",
  "/reset-password",
  "/restore-account",
  "/forgot-password",
];

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

          // Only redirect if not already on auth pages or public pages
          if (typeof window !== "undefined" && !redirectingToLogin) {
            const isHomePage = window.location.pathname === "/";
            const isOnAuthPage = AUTH_PAGES.some((page) =>
              window.location.pathname.startsWith(page),
            );
            if (!isOnAuthPage && !isHomePage) {
              redirectingToLogin = true;
              window.location.replace("/login?reason=session_expired");
            }
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Other 401 → redirect once (but not if on auth pages or public pages)
      if (typeof window !== "undefined" && !redirectingToLogin) {
        const isHomePage = window.location.pathname === "/";
        const isOnAuthPage = AUTH_PAGES.some((page) =>
          window.location.pathname.startsWith(page),
        );
        if (!isOnAuthPage && !isHomePage) {
          setRedirecting();
          window.location.replace("/login?reason=session_expired");
        }
      }

      return Promise.reject(error);
    }

    // Handle 403 Account Deleted (but not for login/register - let the form handle it)
    if (status === 403 && errorCode === "ACCOUNT_DELETED") {
      const isAuthEndpoint = ["/auth/login", "/auth/register"].some((url) =>
        originalRequest.url?.includes(url),
      );

      // For login/register, let the form show the error - don't redirect
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // For other endpoints (e.g., accessing protected routes), redirect to login
      if (typeof window !== "undefined" && !redirectingToLogin) {
        setRedirecting();
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
