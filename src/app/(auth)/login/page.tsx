"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import Link from "next/link";
import api from "@/app/api/interceptor";
import { APIResponse, ApiError, User } from "@/types/auth";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import OAuthButtons from "@/components/auth/OAuthButtons";

const LOGOUT_REASONS: Record<string, string> = {
  password_changed:
    "Your password was changed. Please log in with your new password.",
  email_changed: "Your email was changed. Please log in with your new email.",
  account_deleted:
    "Your account has been deleted. You can restore it within 30 days.",
  account_deleted_success:
    "Your account has been deleted successfully. You can restore it within 30 days by requesting a restoration link.",
  session_expired: "Your session expired. Please log in again.",
};

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetchUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason && LOGOUT_REASONS[reason]) {
      toast.dismiss();
      setTimeout(() => {
        toast.info(LOGOUT_REASONS[reason], {
          id: `login-reason-${reason}`,
          duration: 5000,
        });
      }, 100);
      window.history.replaceState({}, "", "/login");
    }
  }, [searchParams]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values: LoginForm) => {
    setIsLoading(true);

    try {
      const { data } = await api.post<
        APIResponse<{ user: User; requires2FA?: boolean; userId?: string }>
      >("/auth/login", values);

      if (data.data.requires2FA && data.data.userId) {
        router.replace(`/2fa?userId=${data.data.userId}`);
        return;
      }

      await refetchUser();
      toast.success("Logged in successfully", { duration: 800 });
      await new Promise((r) => setTimeout(r, 800));
      router.replace("/chat");
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const status = error.response?.status;

      if (status === 429) {
        return;
      }

      const message =
        error.response?.data?.error?.message ??
        "Login failed. Please try again.";

      toast.error(message);
      form.setFocus("password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
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
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-10"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel
                      htmlFor="password"
                      className="text-sm font-medium"
                    >
                      Password
                    </FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="Your password"
                    className="h-10"
                  />
                  {fieldState.invalid && (
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
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline">
                Register
              </Link>
            </p>
            <OAuthButtons />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
