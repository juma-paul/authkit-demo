"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/types/auth";
import Link from "next/link";
import { restoreAccount } from "@/app/api/user.api";

function RestoreAccountContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No restore token found.");
      return;
    }
    const restore = async () => {
      try {
        await restoreAccount(token);
        setStatus("success");
      } catch (err) {
        const error = err as AxiosError<ApiError>;
        setStatus("error");
        setMessage(
          error.response?.data?.error?.message ?? "Failed to restore account.",
        );
      }
    };
    restore();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardContent className="pt-10 pb-10 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-muted-foreground mx-auto" />
              <h2 className="text-2xl font-bold">Restoring your account</h2>
              <p className="text-sm text-muted-foreground">Please wait...</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="mx-auto w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold">Account Restored!</h2>
              <p className="text-sm text-muted-foreground">
                Your account has been successfully restored.
              </p>
              <Button asChild className="w-full font-semibold mt-2">
                <Link href="/login">Sign In Now</Link>
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <div className="mx-auto w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold">Restore Failed</h2>
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

export default function RestoreAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
          <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <RestoreAccountContent />
    </Suspense>
  );
}
