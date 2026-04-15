"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Mail, Lock, ShieldCheck, User, User2 } from "lucide-react";

import { cn, capitalize, generateDisplayName } from "@/lib/utils";

import ChangeEmailForm from "@/components/profile/ChangeEmailForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import TwoFAForm from "@/components/profile/TwoFAForm";
import UpdateProfileForm from "@/components/profile/UpdateProfileForm";
import DangerZone from "@/components/profile/DangerZone";

import { isOAuthUser } from "@/lib/auth-utils";

const baseTabs = [{ id: "profile", icon: User, label: "Profile" }];

const localTabs = [
  { id: "change-email", icon: Mail, label: "Email" },
  { id: "change-password", icon: Lock, label: "Password" },
  { id: "2fa", icon: ShieldCheck, label: "Two-Factor" },
];

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  const oauth = isOAuthUser(user);

  const tabs = useMemo(() => {
    return oauth ? baseTabs : [...baseTabs, ...localTabs];
  }, [oauth]);

  const defaultTab = "profile";

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (!tabs.find((t) => t.id === activeTab)) {
      setActiveTab(defaultTab);
    }
  }, [tabs, activeTab, defaultTab]);

  if (isLoading || !user) {
    return null;
  }

  const firstName = capitalize(user?.first_name ?? undefined) ?? "";

  const lastName = capitalize(user?.last_name ?? undefined) ?? "";

  // Use real name if available, otherwise generate from email
  const fullName =
    `${firstName} ${lastName}`.trim() || generateDisplayName(user?.email);

  // Get initials from name, or null if no name set (will show User2 icon)
  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* User Card */}
        <div className="rounded-2xl border bg-card p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5 shadow-sm">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-border shadow shrink-0">
            <AvatarImage
              src={user?.avatar_url || undefined}
              alt={`${user?.first_name || "User"} avatar`}
            />

            <AvatarFallback className="bg-muted text-muted-foreground">
              {initials ? (
                <span className="text-xl sm:text-2xl font-semibold">{initials}</span>
              ) : (
                <User2 className="w-8 h-8 sm:w-10 sm:h-10" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5 min-w-0 w-full text-center sm:text-left">
            <p className="text-lg sm:text-xl font-semibold tracking-tight truncate">
              {fullName}
            </p>

            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {user?.email}
            </p>

            {/* Badges Row */}
            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 flex-wrap">
              {/* Email Verification Status */}
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-secondary/80 text-[10px] sm:text-xs font-medium">
                {user.email_verified ? (
                  <>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Verified
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full" />
                    <span className="text-amber-600 dark:text-amber-400">
                      Not verified
                    </span>
                  </>
                )}
              </div>

              {/* Account Type */}
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-secondary/80 text-[10px] sm:text-xs font-medium text-muted-foreground">
                {oauth ? (
                  <>
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="capitalize">{user.auth_provider}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>Password</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",

                activeTab === id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground border-transparent hover:bg-muted",
              )}
            >
              <Icon className="w-4 h-4" />

              {label}
            </button>
          ))}
        </div>

        {/* Active Panel */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm min-h-50">
          {activeTab === "profile" && <UpdateProfileForm />}

          {activeTab === "change-email" && <ChangeEmailForm />}

          {activeTab === "change-password" && <ChangePasswordForm />}

          {activeTab === "2fa" && <TwoFAForm />}
        </div>

        {/* Danger Zone */}
        <DangerZone />
      </div>
    </div>
  );
}