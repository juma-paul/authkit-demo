"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ApiError } from "@/types/auth";
import { toast } from "sonner";
import { forgotPassword } from "@/lib/auth.api";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await forgotPassword(values.email);
      setSubmitted(true);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const message =
        error.response?.data?.error?.message ??
        "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
        <Card className="w-full max-w-md">
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <div className="mx-auto w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl">
              📬
            </div>
            <h2 className="text-2xl font-bold">Check your inbox</h2>
            <p className="text-muted-foreground text-sm">
              If an account exists for{" "}
              <span className="font-medium text-foreground">
                {form.getValues("email")}
              </span>
              , a password reset link has been sent.
            </p>
            <p className="text-xs text-muted-foreground">
              Remembered your password?{" "}
              <Link href="/login" className="underline transition-colors">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your email and we'll send you a link to reset your password
          </p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-12"
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
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remembered your password?{" "}
              <Link href="/login" className="underline transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
