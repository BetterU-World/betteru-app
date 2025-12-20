"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import ProfilePictureUpload from "./ProfilePictureUpload";
import { useState, useEffect } from "react";

export default function Header() {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user profile image from database
    const fetchProfileImage = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setProfileImageUrl(data.profileImageUrl);
        }
      } catch (error) {
        console.error("Failed to fetch profile image:", error);
      }
    };

    fetchProfileImage();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left side: Hamburger (mobile) + BetterU Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger - mobile only */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
            onClick={() => {
              try {
                window.dispatchEvent(new CustomEvent("betteru:openSidebar"));
              } catch {}
            }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link
            href="/dashboard"
            className="font-bold text-xl tracking-wide cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="text-black">Better</span>
            <span className="text-blue-500 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]">U</span>
          </Link>
        </div>

        {/* Middle: Navigation */}
        <nav className="hidden md:flex items-center gap-3">
          <Link
            href="/moments"
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
          >
            Moments
          </Link>
        </nav>

        {/* Mobile quick actions */}
        <div className="md:hidden flex items-center gap-3">
          <Link
            href="/moments"
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
          >
            Moments
          </Link>
          {/* Simple notification icon (placeholder) */}
          <button aria-label="Notifications" className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>

        {/* Right side: Auth buttons or profile */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <ProfilePictureUpload
              currentImageUrl={profileImageUrl}
              onUploadComplete={(url) => setProfileImageUrl(url)}
            />
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
