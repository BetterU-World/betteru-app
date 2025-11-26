import Header from "@/components/Header";
import ManageBillingButton from "@/components/ManageBillingButton";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-slate-600 text-sm">
            Manage your account, billing, and preferences.
          </p>
        </div>

        <div className="border rounded-xl border-slate-200 bg-white p-6 space-y-3">
          <h2 className="font-semibold text-lg">Billing & Subscription</h2>
          <p className="text-sm text-slate-600">
            Update your payment method, view invoices, or cancel your subscription.
          </p>
          <ManageBillingButton />
        </div>

        <div className="border rounded-xl border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-lg mb-2">More Settings</h2>
          <p className="text-sm text-slate-600">
            Additional settings coming soon: profile, preferences, notifications, etc.
          </p>
        </div>
      </div>
    </div>
  );
}
