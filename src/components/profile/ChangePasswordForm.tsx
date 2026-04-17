"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ApiError } from "@/types/auth";
import { toast } from "sonner";
import { changePassword } from "@/app/api/user.api";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: ChangePasswordForm) => {
    if (values.currentPassword === values.newPassword) {
      toast.error("New password must be different from current password");
      form.setFocus("newPassword")
      return;
    }
    setIsLoading(true);
    try {
      await changePassword(
        values.currentPassword,
        values.newPassword,
        values.confirmPassword,
      );
      toast.success("Password changed successfully. Redirecting to login...", {
        duration: 3000,
      });

      // Delay to let user read the message
      // Note: Don't call logout() here as it clears user state and causes UI glitch
      // The server already revoked tokens, and window.location.replace does full reload
      await new Promise((resolve) => setTimeout(resolve, 3000));
      window.location.replace("/login");
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const message =
        error.response?.data?.error?.message ?? "Failed to change password.";
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <div>
        <h2 className="text-base font-semibold">Change Password</h2>
        <p className="text-sm text-muted-foreground">
          Make sure your new password is at least 8 characters.
        </p>
      </div>

      <Controller
        name="currentPassword"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              htmlFor="currentPassword"
              className="text-sm font-medium"
            >
              Current Password
            </FieldLabel>
            <Input
              {...field}
              id="currentPassword"
              type="password"
              placeholder="••••••••"
              className="h-10"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="newPassword"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </FieldLabel>
            <Input
              {...field}
              id="newPassword"
              type="password"
              placeholder="••••••••"
              className="h-10"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="confirmPassword"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              htmlFor="confirmPassword"
              className="text-sm font-medium"
            >
              Confirm New Password
            </FieldLabel>
            <Input
              {...field}
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="h-10"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button
        type="submit"
        className="w-full font-semibold"
        disabled={isLoading}
      >
        {isLoading ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
