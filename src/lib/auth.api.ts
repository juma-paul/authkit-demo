import api from "@/lib/api";

export const forgotPassword = (email: string) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (
  token: string,
  newPassword: string,
  confirmPassword: string,
) => api.post("/auth/reset-password", { token, newPassword, confirmPassword });
