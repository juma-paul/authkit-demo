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
import { changeEmail } from "@/app/api/user.api";
import { useAuth } from "@/providers/AuthProvider";

const changeEmailSchema = z.object({
  newEmail: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type ChangeEmailForm = z.infer<typeof changeEmailSchema>;

export default function ChangeEmailForm() {
  const { user, refetchUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChangeEmailForm>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values: ChangeEmailForm) => {
    // Check if new email is same as current
    if (
      user?.email &&
      values.newEmail.toLowerCase() === user.email.toLowerCase()
    ) {
      toast.error("New email must be different from your current email");
      return;
    }

    setIsLoading(true);
    try {
      await changeEmail(values.newEmail, values.password);
      toast.success("Verification email sent to your new address");
      form.reset();
      await refetchUser();
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const message =
        error.response?.data?.error?.message ?? "Failed to change email.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="p-6 space-y-5"
      noValidate
    >
      <div>
        <h2 className="text-base font-semibold">Change Email</h2>
        <p className="text-sm text-muted-foreground">
          A verification link will be sent to your new email address. You will
          be logged out after verifying.
        </p>
      </div>

      <Controller
        name="newEmail"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="newEmail">New Email Address</FieldLabel>
            <Input
              {...field}
              id="newEmail"
              type="text"
              placeholder="you@example.com"
              className="h-11"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="password">Current Password</FieldLabel>
            <Input
              {...field}
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11"
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
        {isLoading ? "Sending..." : "Update Email"}
      </Button>
    </form>
  );
}
