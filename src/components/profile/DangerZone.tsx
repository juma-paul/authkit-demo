"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ApiError } from "@/types/auth";
import { toast } from "sonner";

import { useAuth } from "@/providers/AuthProvider";
import { deleteAccount } from "@/app/api/user.api";
import { isOAuthUser } from "@/lib/auth-utils";

export default function DangerZone() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const isOAuth = isOAuthUser(user);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      await new Promise((r) => setTimeout(r, 1000));
      router.replace("/login");
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      if (isOAuth) {
        if (emailConfirm.toLowerCase() !== user?.email?.toLowerCase()) {
          toast.error("Email does not match.");
          return;
        }
        await deleteAccount();
      } else {
        await deleteAccount(password);
      }

      toast.success("Account deleted. Redirecting to login...", {
        duration: 4000,
      });
      await new Promise((r) => setTimeout(r, 3500));
      // Don't pass reason param since we already showed a toast
      router.replace("/login");
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const message =
        error.response?.data?.error?.message ?? "Failed to delete account.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-destructive">
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground">
          These actions are irreversible. Please proceed with caution.
        </p>
      </div>

      {/* Sign Out */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Sign Out</p>
          <p className="text-xs text-muted-foreground">
            Sign out of your account on this device.
          </p>
        </div>
        {!showLogoutConfirm ? (
          <Button variant="outline" onClick={() => setShowLogoutConfirm(true)}>
            Sign Out
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              Yes, sign out
            </Button>
          </div>
        )}
      </div>

      <div className="border-t border-destructive/20" />

      {/* Delete Account */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Delete Account</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all data.
            </p>
          </div>
          {!showDeleteConfirm && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          )}
        </div>

        {showDeleteConfirm && (
          <div className="space-y-3">
            {/* Conditional input based on auth type */}
            {!isOAuth ? (
              <Input
                type="password"
                placeholder="Enter your password to confirm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10"
              />
            ) : (
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={emailConfirm}
                  onChange={(e) => setEmailConfirm(e.target.value)}
                  className="h-11 font-mono tracking-tight"
                  autoComplete="off"
                  spellCheck={false}
                />

                <p className="text-xs text-muted-foreground pl-1">
                  Enter your email to confirm:{" "}
                  <span className="font-mono text-foreground/70">
                    {user?.email}
                  </span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPassword("");
                  setEmailConfirm("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                disabled={
                  isOAuth
                    ? emailConfirm.toLowerCase() !==
                        user?.email?.toLowerCase() || isLoading
                    : !password || isLoading
                }
                onClick={handleDelete}
              >
                {isLoading ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
