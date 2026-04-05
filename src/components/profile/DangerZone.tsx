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

export default function DangerZone() {
  const { logout } = useAuth();
  const router = useRouter();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteAccount(password);
      toast.success("Account deleted successfully.");
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
            <Input
              type="password"
              placeholder="Enter your password to confirm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10"
            />
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPassword("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                disabled={!password || isLoading}
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
