"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { APIResponse, ApiError } from "@/types/auth";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    const verify = async () => {
      try {
        await api.post<APIResponse<{ message: string }>>("/auth/verify-email", {
          token,
        });
        setStatus("success");
      } catch (err) {
        const error = err as AxiosError<ApiError>;
        setStatus("error");
        setMessage(
          error.response?.data?.error?.message ?? "Verification failed.",
        );
      }
    };

    verify();
  }, [token]);

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40 transition-opacity duration-300">
      <div className="text-center space-y-3 max-w-sm">
        {status === "loading" && (
          <>
            <div className="text-5xl animate-pulse">⏳</div>
            <h2 className="text-2xl font-bold">Verifying your email</h2>
            <p className="text-sm text-muted-foreground">Please wait...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl">✅</div>
            <h2 className="text-2xl font-bold">Email verified!</h2>
            <p className="text-sm text-muted-foreground">
              Your account is ready. Redirecting to sign in...
            </p>
            <Button
              asChild
              className="w-full font-semibold mt-6 transition-all duration-200"
            >
              <Link href="/login">Sign In Now</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl">❌</div>
            <h2 className="text-2xl font-bold">Verification failed</h2>
            <p className="text-sm text-destructive">{message}</p>
            <Button
              asChild
              variant="outline"
              className="w-full mt-6 transition-all duration-200"
            >
              <Link href="/login">Go to Login</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
