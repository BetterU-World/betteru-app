import { SignOutButton } from "@clerk/nextjs";

export default function SignOutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Sign Out</h1>
        <p className="text-slate-600 mb-6">
          Are you sure you want to sign out?
        </p>
        <SignOutButton>
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
            Yes, Sign Out
          </button>
        </SignOutButton>
        <a
          href="/dashboard"
          className="mt-3 inline-block text-sm text-slate-600 hover:text-slate-900"
        >
          Cancel
        </a>
      </div>
    </div>
  );
}
