"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { User, AuthContextType, APIResponse } from "@/types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Helper function to fetch user data
  const refetchUser = async () => {
    try {
      const { data } =
        await api.get<APIResponse<{ user: User }>>("/users/profile");
      setUser(data.data.user);
    } catch (error) {
      console.error(error);
      setUser(null);
    }
  };

  // Fetch user data on mount
  useEffect(() => {
    refetchUser().finally(() => setIsLoading(false));
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    const { data } = await api.post<APIResponse<{ user: User }>>(
      "/auth/login",
      { email, password },
    );
    setUser(data.data.user);
  };

  // Logout
  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  // Validate Two Factor Authentication
  const validate2FA = async (userId: string, code: string) => {
    await api.post("/auth/2fa/validate", { userId, code });
    await refetchUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, refetchUser, validate2FA }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
