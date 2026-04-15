// export default function ChatWindow() {
//   return (
//     <div className="flex flex-col h-full items-center justify-center text-muted-foreground">
//       <p className="text-lg font-medium">What habit are we building today?</p>
//       <p className="text-sm">Start a new chat to begin.</p>
//     </div>
//   );
// }

export default function ChatWindow() {
  return (
    <div className="flex flex-col h-full items-center justify-center text-muted-foreground space-y-2">
      <p className="text-2xl font-medium">Welcome to AuthKit Demo</p>
      <p className="text-lg text-center max-w-sm">
        This is a demo of the AuthKit authentication service. Click the{" "}
        <strong>settings icon</strong> in the bottom left to explore your
        profile. And to come back to this screen click the <strong>Explore Features </strong> 
        button on top of teh sidebar.
      </p>
    </div>
  );
}
