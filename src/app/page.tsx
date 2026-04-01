import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-linear-to-br from-muted/40 via-background to-muted/40">
      <div className="text-center space-y-10 max-w-md">
        {/* Logo/Icon */}
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-5xl shadow-sm">
          🔐
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight">
            Authentication,
            <br />
            done right.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground">
            A clean, production-ready auth system with email verification, 2FA,
            and secure sessions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            asChild
            size="lg"
            className="text-base font-semibold px-12 py-7 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <Link href="/register">Create free account</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-base font-semibold px-12 py-7 rounded-2xl"
          >
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-6">
          Demo client • No credit card required • Instant setup
        </p>
      </div>
    </div>
  );
}
