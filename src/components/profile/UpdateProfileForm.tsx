"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ApiError } from "@/types/auth";
import { toast } from "sonner";
import { updateProfile } from "@/app/api/user.api";
import { useAuth } from "@/providers/AuthProvider";
import { CldUploadWidget } from "next-cloudinary";
import { User } from "lucide-react";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const updateProfileSchema = z.object({
  first_name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters")
    .optional()
    .or(z.literal("")),
  last_name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters")
    .optional()
    .or(z.literal("")),
  avatar_url: z.string().optional().or(z.literal("")),
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

export default function UpdateProfileForm() {
  const { user, refetchUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url ?? "");

  // Sync avatar preview when user data changes
  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarPreview(user.avatar_url);
    }
  }, [user?.avatar_url]);

  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      avatar_url: user?.avatar_url ?? "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: UpdateProfileForm) => {
    setIsLoading(true);
    try {
      await updateProfile({
        first_name: values.first_name?.toLowerCase() || undefined,
        last_name: values.last_name?.toLowerCase() || undefined,
        avatar_url: values.avatar_url || undefined,
      });

      toast.success("Profile updated successfully");
      form.reset({ first_name: "", last_name: "", avatar_url: "" });
      await refetchUser();
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const message =
        error.response?.data?.error?.message ?? "Failed to update profile.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Build optimized Cloudinary URL with transformations and cache busting
  const buildOptimizedUrl = (publicId: string, version?: number) => {
    const versionStr = version ? `v${version}/` : "";
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_512,h_512,q_auto,f_auto/${versionStr}${publicId}`;
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <div>
        <h2 className="text-base font-semibold">Update Profile</h2>
        <p className="text-sm text-muted-foreground">
          Update your personal information.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted overflow-hidden flex items-center justify-center text-muted-foreground">
          {avatarPreview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarPreview}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : user?.first_name ? (
            <span className="text-2xl font-semibold">
              {user.first_name[0].toUpperCase()}
            </span>
          ) : (
            <User className="w-8 h-8" />
          )}
        </div>

        <CldUploadWidget
          signatureEndpoint="/api/cloudinary-sign"
          options={{
            sources: ["local"],
            cropping: true,
            croppingAspectRatio: 1,
            croppingShowDimensions: true,
            maxFileSize: 10485760,
            clientAllowedFormats: ["jpg", "png", "webp", "gif"],
            resourceType: "image",
            publicId: `avatars/user_${user?.id}`,
          }}
          onSuccess={(result) => {
            const info = result?.info;
            if (typeof info === "object" && info?.public_id) {
              // Include version for cache busting when image is replaced
              const optimizedUrl = buildOptimizedUrl(
                info.public_id,
                info.version,
              );
              setAvatarPreview(optimizedUrl);
              form.setValue("avatar_url", optimizedUrl);
              toast.success("Photo uploaded successfully");
            }
          }}
          onError={(error) => {
            console.error("Upload error:", error);
            toast.error("Failed to upload photo");
          }}
        >
          {({ open }) => (
            <Button type="button" variant="outline" onClick={() => open()}>
              Upload Photo
            </Button>
          )}
        </CldUploadWidget>
      </div>

      <Controller
        name="first_name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="first_name" className="text-sm font-medium">
              First Name
            </FieldLabel>
            <Input
              {...field}
              id="first_name"
              type="text"
              placeholder="John"
              className="h-10"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="last_name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="last_name" className="text-sm font-medium">
              Last Name
            </FieldLabel>
            <Input
              {...field}
              id="last_name"
              type="text"
              placeholder="Doe"
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
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
