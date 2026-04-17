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

// Flag to suppress component-level error toasts when redirecting to login
// Components should check this before showing error toasts
export const isSessionExpiring = () =>
  typeof window !== "undefined" && (window as any).__sessionExpiring === true;

// Safety timeout to reset redirect flag if navigation doesn't complete
const setRedirecting = () => {
  redirectingToLogin = true;
  // Set flag to suppress component error toasts
  if (typeof window !== "undefined") {
    (window as any).__sessionExpiring = true;
  }
  // Reset after 3s in case redirect fails (e.g., blocked by extension)
  setTimeout(() => {
    redirectingToLogin = false;
    if (typeof window !== "undefined") {
      (window as any).__sessionExpiring = false;
    }
  }, 3000);
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

      // Attempt refresh for:
      // - TOKEN_EXPIRED: JWT expired but cookie still exists
      // - UNAUTHORIZED: Cookie expired (browser deleted it), but refresh token may still be valid
      // Skip if this is already a retry attempt
      const shouldAttemptRefresh =
        (errorCode === "TOKEN_EXPIRED" || errorCode === "UNAUTHORIZED") &&
        !originalRequest._retry;

      if (shouldAttemptRefresh) {
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
              setRedirecting();
              window.location.replace("/login?reason=session_expired");
            }
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Other 401 (e.g., invalid token, not expired) → redirect once
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
