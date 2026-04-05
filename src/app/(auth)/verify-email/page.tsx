"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/app/api/interceptor";
import { APIResponse, ApiError } from "@/types/auth";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardContent className="pt-10 pb-10 text-center space-y-4">
          {status === "loading" && (
            <>
              <div className="text-5xl animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold">Verifying your email</h2>
              <p className="text-sm text-muted-foreground">Please wait...</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="mx-auto w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold">Email Verified!</h2>
              <p className="text-sm text-muted-foreground">
                Your account is ready.
              </p>
              <Button asChild className="w-full font-semibold mt-2">
                <Link href="/login">Sign In Now</Link>
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <div className="mx-auto w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center text-3xl">
                <XCircle className="w-12 h-12 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold">Verification Failed</h2>
              <p className="text-sm text-destructive">{message}</p>

              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Go to Login</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
