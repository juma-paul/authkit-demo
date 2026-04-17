export default function ChatWindow() {
  return (
    <div className="flex flex-col h-full items-center justify-center text-muted-foreground px-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome to AuthKit Demo
        </h1>
        <p className="text-base leading-relaxed">
          Experience a complete authentication system with OAuth, 2FA, and
          secure session management.
        </p>
        <div className="text-sm space-y-2 pt-2">
          <p>
            <strong>Settings</strong> — Manage your profile, security, and
            account
          </p>
          <p>
            <strong>Explore Features</strong> — Return to this screen anytime
          </p>
        </div>
      </div>
    </div>
  );
}
