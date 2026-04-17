import { useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/providers/AuthProvider";
import { AxiosError } from "axios";
import { ApiError } from "@/types/auth";
import { toast } from "sonner";
import { disable2FA, setup2FA, verify2FA } from "@/app/api/user.api";
import { Button } from "../ui/button";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

const verifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, "The code must be exactly 6 digits.")
    .regex(/^\d+$/, "Code must contain numbers only."),
});

type CodeForm = z.infer<typeof verifyCodeSchema>;

export type TwoFactorStep = "idle" | "setup" | "disable";

export default function TwoFAForm() {
  const { user, refetchUser } = useAuth();
  const isEnabled = user?.two_factor_enabled ?? false;

  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [step, setStep] = useState<TwoFactorStep>("idle");
  const [isLoading, setIsLoading] = useState(false);

  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const form = useForm<CodeForm>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
    mode: "onSubmit",
  });

  const handleSetup = async () => {
    setIsLoading(true);
    try {
      const { data } = await setup2FA();
      setQrCode(data.data.qrCode);
      setSecret(data.data.secret);
      setShowManual(false);
      setStep("setup");
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const message =
        error.response?.data?.error?.message ?? "Failed to start 2FA setup.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (values: CodeForm) => {
    setIsLoading(true);
    try {
      const { data } = await verify2FA(values.code);
      setBackupCodes(data.data.backupCodes);
      setShowBackupCodes(true);
      setStep("idle");
      form.reset();
      await refetchUser();
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const message =
        error.response?.data?.error?.message ?? "Failed to verify 2FA.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async (values: CodeForm) => {
    setIsLoading(true);
    try {
      const { data } = await disable2FA(values.code);
      form.reset();
      setStep("idle");
      await refetchUser();
      toast.success(data.data?.message);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const message =
        error.response?.data?.error?.message ?? "Failed to disable 2FA.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Two-Factor Authentication</h2>
        <p className="text-sm text-muted-foreground">
          {isEnabled
            ? "Your account is protected with 2FA."
            : "Add an extra layer of security to your account."}
        </p>
      </div>

      {step === "idle" && (
        <Button
          type="button"
          variant={isEnabled ? "destructive" : "default"}
          onClick={isEnabled ? () => setStep("disable") : handleSetup}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : isEnabled ? "Disable 2FA" : "Enable 2FA"}
        </Button>
      )}

      {step === "setup" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {showManual
              ? "Enter this secret key in your authenticator app, then enter the 6-digit code below."
              : "Scan this QR code with your authenticator app, then enter the 6-digit code below."}
          </p>

          {showManual ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-4 py-3 rounded-lg font-mono text-sm break-all select-all">
                  {secret}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(secret);
                    toast.success("Secret copied!");
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                In your authenticator app, select &quot;Enter key manually&quot;
                or &quot;Enter setup key&quot; and paste this code.
              </p>
            </div>
          ) : (
            qrCode && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qrCode}
                alt="2FA QR Code"
                className="w-40 h-40 rounded-lg"
              />
            )
          )}

          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            onClick={() => setShowManual(!showManual)}
          >
            {showManual ? "Show QR code instead" : "Can't scan? Enter manually"}
          </button>

          <form
            onSubmit={form.handleSubmit(handleVerify)}
            className="space-y-4"
            noValidate
          >
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="code">Authentication Code</FieldLabel>
                  <Input
                    {...field}
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="h-12 text-center tracking-[0.3em] sm:tracking-[0.5em] text-xl sm:text-2xl font-mono"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify & Enable"}
            </Button>
          </form>
        </div>
      )}

      {step === "disable" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app to disable 2FA.
          </p>

          <form
            onSubmit={form.handleSubmit(handleDisable)}
            className="space-y-4"
            noValidate
          >
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="code">Authentication Code</FieldLabel>
                  <Input
                    {...field}
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="h-12 text-center tracking-[0.3em] sm:tracking-[0.5em] text-xl sm:text-2xl font-mono"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("idle")}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading ? "Disabling..." : "Confirm Disable"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {showBackupCodes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-2xl p-8 w-full max-w-md space-y-6 shadow-xl">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold">Save Your Backup Codes</h2>
              <p className="text-sm text-muted-foreground">
                Store these somewhere safe. Each code can only be used once.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code) => (
                <div
                  key={code}
                  className="bg-muted rounded-lg px-4 py-2 text-center font-mono text-sm"
                >
                  {code}
                </div>
              ))}
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(backupCodes.join("\n"));
                toast.success("Backup codes copied!");
              }}
            >
              Copy All Codes
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowBackupCodes(false)}
            >
              I&apos;ve saved my codes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
