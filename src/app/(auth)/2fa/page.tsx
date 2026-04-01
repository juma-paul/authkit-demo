"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/providers/AuthProvider";
import { ApiError } from "@/types/auth";
import { toast } from "sonner";

const twoFASchema = z.object({
  code: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d+$/, "Code must contain numbers only"),
});

type TwoFAForm = z.infer<typeof twoFASchema>;

export default function TwoFAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const { validate2FA } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TwoFAForm>({
    resolver: zodResolver(twoFASchema),
    defaultValues: { code: "" },
    mode: "onSubmit",
  });

  // Auto-focus on load
  useEffect(() => {
    if (userId) {
      setTimeout(() => document.getElementById("code")?.focus(), 150);
    }
  }, [userId]);

  if (!userId) {
    router.replace("/login");
    return null;
  }

  const onSubmit = async (values: TwoFAForm) => {
    setIsLoading(true);

    try {
      await validate2FA(userId, values.code);
      router.push("/profile");
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const message =
        error.response?.data?.error?.message ??
        "Invalid 2FA code. Please try again.";
      toast.error(message);

      // Clear input and refocus
      form.setValue("code", "");
      form.setFocus("code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold">
            Two-Factor Verification
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app
          </p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="code" className="text-sm font-medium">
                    Authentication Code
                  </FieldLabel>
                  <Input
                    {...field}
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="h-12 text-center tracking-[0.5em] text-2xl font-mono"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
