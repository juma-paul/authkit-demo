import { getOAuthUrl } from "@/app/api/auth.api";
import { Button } from "../ui/button";

export default function OAuthButtons() {
  const handleOAuth = async (provider: "google" | "github") => {
    const { data } = await getOAuthUrl(provider);
    window.location.href = data.data.url;
  };

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleOAuth("google")}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleOAuth("github")}
        >
          GitHub
        </Button>
      </div>
    </>
  );
}
