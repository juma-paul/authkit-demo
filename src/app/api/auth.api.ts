import api from "@/app/api/interceptor";
import { APIResponse } from "@/types/auth";

export const forgotPassword = (email: string) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (
  token: string,
  newPassword: string,
  confirmPassword: string,
) => api.post("/auth/reset-password", { token, newPassword, confirmPassword });

export const resendVerificationEmail = (email: string) =>
  api.post("/auth/resend-verification", { email });

export const getOAuthUrl = (provider: "google" | "github") =>
  api.get<APIResponse<{ url: string }>>(`/auth/oauth/url?provider=${provider}`);
