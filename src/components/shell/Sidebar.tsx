"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useSidebar } from "@/providers/SidebarProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MessageSquare, Settings, X, User2 } from "lucide-react";
import Link from "next/link";
import { cn, capitalize, generateDisplayName } from "@/lib/utils";

const dummyChats = [
  { id: "1", title: "Register & verify email", date: "Features" },
  { id: "2", title: "Login with Google or GitHub", date: "Features" },
  { id: "3", title: "Two-factor authentication", date: "Features" },
  { id: "4", title: "Change email & password", date: "Features" },
  { id: "5", title: "Soft delete & restore account", date: "Features" },
  { id: "6", title: "Multi-tenant API key system", date: "Features" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const [activeChat, setActiveChat] = useState("1");

  useEffect(() => {
    close();
  }, [pathname, close]);

  const firstName = capitalize(user?.first_name ?? undefined) ?? "";
  const lastName = capitalize(user?.last_name ?? undefined) ?? "";

  const fullName =
    `${firstName} ${lastName}`.trim() || generateDisplayName(user?.email);

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || null;

  const grouped = dummyChats.reduce(
    (acc, chat) => {
      if (!acc[chat.date]) acc[chat.date] = [];
      acc[chat.date].push(chat);
      return acc;
    },
    {} as Record<string, typeof dummyChats>,
  );

  const sidebarContent = (
    <div className="flex flex-col h-full w-64 border-r bg-muted/30">
      {/* App Name */}
      <div className="px-4 py-5 border-b flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">AuthKit</h1>
          <p className="text-xs text-muted-foreground">Demo</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={close}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <Button
          className="w-full justify-start gap-2"
          onClick={() => router.push("/chat")}
        >
          <PlusCircle className="w-4 h-4" />
          Explore Features
        </Button>
      </div>

      {/* Features List */}
      <ScrollArea className="flex-1 px-2">
        {Object.entries(grouped).map(([date, chats]) => (
          <div key={date} className="mb-4">
            <p className="text-xs text-muted-foreground font-medium px-2 mb-1">
              {date}
            </p>
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors",
                  activeChat === chat.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>
        ))}
      </ScrollArea>

      {/* User Footer */}
      <div className="border-t px-3 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={user?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">
              {initials ?? <User2 className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/profile">
            <Settings className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block">{sidebarContent}</aside>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={close}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full bg-background shadow-xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

