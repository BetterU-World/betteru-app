"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <SignUp
        unsafeMetadata={{ referredBy: ref ?? null }}
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
