"use client";

import { useState } from "react";
import { getOAuthUrl } from "@/app/api/auth.api";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type OAuthProvider = "google" | "github";

export default function OAuthButtons() {
  const [loading, setLoading] = useState<OAuthProvider | null>(null);

  const handleOAuth = async (provider: OAuthProvider) => {
    setLoading(provider);
    try {
      const { data } = await getOAuthUrl(provider);
      window.location.href = data.data.url;
    } catch {
      toast.error("Failed to connect. Please try again.");
      setLoading(null);
    }
  };

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleOAuth("google")}
          disabled={loading !== null}
        >
          {loading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Google"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleOAuth("github")}
          disabled={loading !== null}
        >
          {loading === "github" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "GitHub"
          )}
        </Button>
      </div>
    </>
  );
}
