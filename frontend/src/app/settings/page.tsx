import Header from "@/components/Header";
import ManageBillingButton from "@/components/ManageBillingButton";
import LegalEligibilitySection from "@/components/settings/LegalEligibilitySection";
import SettingsAccountClient from "@/components/settings/SettingsAccountClient";
import SettingsPreferencesClient from "@/components/settings/SettingsPreferencesClient";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = userId ? await prisma.user.findUnique({ where: { clerkId: userId } }) : null;
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account, billing, and preferences.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 space-y-3">
          <h2 className="font-semibold text-lg">Billing & Subscription</h2>
          <p className="text-sm text-slate-600">
            Update your payment method, view invoices, or cancel your subscription.
          </p>
          <ManageBillingButton />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 space-y-3">
          <h2 className="font-semibold text-lg">Account</h2>
          <p className="text-sm text-slate-600 mb-3">Read-only account details for now.</p>
          <SettingsAccountClient />
        </div>

        {user && (
          <LegalEligibilitySection
            user={{
              isAdultConfirmed: user.isAdultConfirmed,
              adultConfirmedAt: user.adultConfirmedAt ? user.adultConfirmedAt.toISOString() : null,
              acceptedTermsVersion: user.acceptedTermsVersion || null,
              acceptedTermsAt: user.acceptedTermsAt ? user.acceptedTermsAt.toISOString() : null,
              acceptedPrivacyVersion: user.acceptedPrivacyVersion || null,
              acceptedPrivacyAt: user.acceptedPrivacyAt ? user.acceptedPrivacyAt.toISOString() : null,
            }}
          />
        )}

        <SettingsPreferencesClient />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <h2 className="font-semibold text-lg mb-2">More Settings</h2>
          <p className="text-sm text-slate-600">Additional settings coming soon.</p>
        </div>
      </div>
    </div>
  );
}
