import api from "@/lib/api";

// Profile
export const getProfile = () => api.get("/users/profile");

export const updateProfile = (data: {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}) => api.put("/users/profile", data);

// Email & Password
export const changeEmail = (newEmail: string, password: string) =>
  api.put("/users/change-email", { newEmail, password });

export const changePassword = (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) =>
  api.put("/users/change-password", {
    currentPassword,
    newPassword,
    confirmPassword,
  });

// 2FA
export const setup2FA = () => api.post("/users/2fa/setup");

export const verify2FA = (code: string) =>
  api.post("/users/2fa/verify", { code });

export const disable2FA = (code: string) =>
  api.post("/users/2fa/disable", { code });

// Account
export const deleteAccount = (password: string) =>
  api.delete("/users/account", { data: { password } });

export const restoreAccount = (token: string) =>
  api.post("/users/account/restore", { token });

export const verifyEmailChange = (token: string) =>
  api.get(`/users/verify-email-change?token=${token}`);
