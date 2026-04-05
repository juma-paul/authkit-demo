"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { cn, capitalize } from "@/lib/utils";

const dummyChats = [
  { id: "1", title: "Morning routine habits", date: "Today" },
  { id: "2", title: "Sleep schedule optimization", date: "Today" },
  { id: "3", title: "Workout consistency tips", date: "Yesterday" },
  { id: "4", title: "Nutrition tracking goals", date: "Yesterday" },
  { id: "5", title: "Mindfulness practice", date: "Apr 1" },
  { id: "6", title: "Reading habit builder", date: "Mar 30" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeChat, setActiveChat] = useState("1");

  const firstName = capitalize(user?.first_name ?? undefined) ?? "";
  const lastName = capitalize(user?.last_name ?? undefined) ?? "";

  const fullName = `${firstName} ${lastName}`.trim() || "User";

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  const grouped = dummyChats.reduce(
    (acc, chat) => {
      if (!acc[chat.date]) acc[chat.date] = [];
      acc[chat.date].push(chat);
      return acc;
    },
    {} as Record<string, typeof dummyChats>,
  );

  return (
    <div className="flex flex-col h-full w-64 border-r bg-muted/30">
      {/* App Name */}
      <div className="px-4 py-5 border-b">
        <h1 className="text-xl font-bold tracking-tight">HabitMind</h1>
        <p className="text-xs text-muted-foreground">Your AI habit coach</p>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <Button
          className="w-full justify-start gap-2"
          onClick={() => router.push("/chat")}
        >
          <PlusCircle className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
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
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Settings className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
