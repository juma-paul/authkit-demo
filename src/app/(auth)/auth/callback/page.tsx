"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function AuthCallbackPage() {
  const { refetchUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        // Wait for cookies to settle
        await new Promise((r) => setTimeout(r, 1000));

        await refetchUser();

        router.replace("/chat");
      } catch (error) {
        router.replace("/login");
      }
    };

    run();
  }, [refetchUser, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      Completing sign in... Please wait
    </div>
  );
}
