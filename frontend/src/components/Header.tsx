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
        {/* Left side: BetterU Logo */}
        <Link 
          href="/dashboard" 
          className="font-bold text-xl tracking-wide cursor-pointer hover:opacity-90 transition-opacity"
        >
          <span className="text-black">Better</span>
          <span className="text-blue-500 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]">U</span>
        </Link>

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
