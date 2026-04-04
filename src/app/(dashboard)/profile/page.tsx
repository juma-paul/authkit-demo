"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Lock, ShieldCheck, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

import ChangeEmailForm from "@/components/profile/ChangeEmailForm";

const tabs = [
  { id: "change-email", icon: Mail, label: "Email" },
  { id: "change-password", icon: Lock, label: "Password" },
  { id: "2fa", icon: ShieldCheck, label: "Two-Factor" },
  { id: "delete-account", icon: Trash2, label: "Delete", danger: true },
  { id: "restore-account", icon: RotateCcw, label: "Restore" },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("change-email");

  const fullName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || "User";
  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Premium User Card */}
        <div className="rounded-2xl border bg-card p-6 flex items-center gap-5 shadow-sm">
          <Avatar className="w-20 h-20 ring-2 ring-border shadow">
            <AvatarImage src={user?.avatar_url ?? undefined} />
            <AvatarFallback className="text-2xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <p className="text-xl font-semibold tracking-tight">{fullName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge
              variant={user?.email_verified ? "default" : "destructive"}
              className="text-xs"
            >
              {user?.email_verified ? "✓ Verified" : "✗ Not Verified"}
            </Badge>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(({ id, icon: Icon, label, danger }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                activeTab === id
                  ? danger
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-primary text-primary-foreground border-primary"
                  : danger
                    ? "text-red-500 border-transparent hover:bg-red-50 dark:hover:bg-red-900/20"
                    : "text-muted-foreground border-transparent hover:bg-muted",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Active Form Area */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm min-h-50">
          {activeTab === "change-email" && <ChangeEmailForm />}
        </div>
      </div>
    </div>
  );
}
