import "./globals.css";
import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "BetterU Frontend",
  description: "Next.js App Router + Clerk integration"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header className="p-4 border-b">
            <nav className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="text-lg font-semibold">BetterU</div>
              <div className="flex items-center space-x-3">
                <SignedOut>
                  <SignInButton>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded">Sign in</button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="px-3 py-1 border rounded">Sign up</button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </nav>
          </header>
          <main className="max-w-4xl mx-auto p-6">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}