"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refetchUser } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const success = searchParams.get("success");
    const err = searchParams.get("error");
    const message = searchParams.get("message");

    if (success === "true") {
      (async () => {
        try {
          await refetchUser();
          toast.success("Signed in successfully", { duration: 1000 });
          await new Promise((r) => setTimeout(r, 1000));
          router.replace("/chat");
        } catch {
          toast.error("Failed to load user session", { duration: 1500 });
          await new Promise((r) => setTimeout(r, 1500));
          router.replace("/login");
        }
      })();
      return;
    }

    if (err) {
      const msg = message || "Authentication failed";
      setError(msg);
      toast.error(msg);
      return;
    }

    setError("Invalid authentication response");
  }, [searchParams, router, refetchUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Sign In Issue</CardTitle>
            <CardDescription className="text-base whitespace-pre-line pt-3">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-lg font-medium">Completing sign in...</p>
      <p className="text-sm text-muted-foreground">Please wait</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-screen gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-lg font-medium">Completing sign in...</p>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
