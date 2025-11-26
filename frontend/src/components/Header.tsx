"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
      <Link href="/dashboard">
        <div className="cursor-pointer">
          <h1 className="text-2xl font-bold tracking-tight">BetterU</h1>
          <p className="text-sm text-slate-500">Better You, Better World.</p>
        </div>
      </Link>
      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
