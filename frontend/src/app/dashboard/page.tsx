import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <SignedIn>
        <p className="mt-2">You are signed in. Show user-specific content here.</p>
      </SignedIn>
      <SignedOut>
        <p className="mt-2">You must sign in to view the dashboard.</p>
        <SignInButton>
          <button className="mt-3 px-3 py-1 bg-blue-600 text-white rounded">Sign in</button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}