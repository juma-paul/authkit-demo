import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const capitalize = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

/**
 * Generate a deterministic display name from an email address.
 * Format: emailPrefix + hash-based digits (e.g., "John4821")
 * Same email always produces the same display name.
 */
export function generateDisplayName(email?: string | null): string {
  if (!email) return "User";

  const prefix = email.split("@")[0] || "user";
  // Clean prefix: remove dots, plus signs, numbers, and special chars
  const cleanPrefix = prefix.replace(/[^a-zA-Z]/g, "").toLowerCase() || "user";
  // Capitalize first letter
  const capitalizedPrefix = cleanPrefix.charAt(0).toUpperCase() + cleanPrefix.slice(1);

  // Generate deterministic digits from email hash (same email = same digits)
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash + email.charCodeAt(i)) | 0;
  }
  const digits = Math.abs(hash % 9000) + 1000; // 1000-9999

  return `${capitalizedPrefix}${digits}`;
}
