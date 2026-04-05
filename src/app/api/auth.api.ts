import api from "@/app/api/api";

export const forgotPassword = (email: string) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (
  token: string,
  newPassword: string,
  confirmPassword: string,
) => api.post("/auth/reset-password", { token, newPassword, confirmPassword });

export const resendVerificationEmail = (email: string) =>
  api.post("/auth/resend-verification", { email });
