import { User } from "@/types/auth";

export function isOAuthUser(user: User | null | undefined): boolean {
  return !!user && user.auth_provider !== "local";
}
