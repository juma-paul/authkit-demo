"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/types/auth";
import { verifyEmailChange } from "@/lib/user.api";
import Link from "next/link";

type Status = "loading" | "success" | "error";

export default function VerifyEmailChangePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing token.");
      return;
    }
    verifyEmailChange(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        const error = err as AxiosError<ApiError>;
        setMessage(
          error.response?.data?.error?.message ?? "Something went wrong.",
        );
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardContent className="pt-10 pb-10 text-center space-y-4">
          {status === "loading" && (
            <>
              <div className="text-3xl">⏳</div>
              <h2 className="text-2xl font-bold">Verifying...</h2>
            </>
          )}
          {status === "success" && (
            <>
              <div className="mx-auto w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl">
                ✅
              </div>
              <h2 className="text-2xl font-bold">Email Changed!</h2>
              <p className="text-sm text-muted-foreground">
                Your email has been updated. Please sign in again.
              </p>
              <Link href="/login" className="text-sm underline">
                Sign in
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <div className="mx-auto w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center text-3xl">
                ⚠️
              </div>
              <h2 className="text-2xl font-bold">Verification Failed</h2>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Link href="/login" className="text-sm underline">
                Back to login
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
