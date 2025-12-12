import { SUPPORT_EMAIL } from "@/lib/constants";
import Header from "@/components/Header";

export default function DataDeletionPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <article className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Data Deletion Policy</h1>
          <p className="text-sm text-gray-600 mb-8 font-semibold">Last Updated: November 27, 2025</p>

          <div className="space-y-8">
            <section>
              <p className="text-gray-700 leading-relaxed mb-4">
                At BetterU LLC ("BetterU", "we", "our", or "us"), we respect your privacy and believe you should have full control over your personal data. This Data Deletion Policy explains how users can request the deletion of their personal information and what happens to that data once deleted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Your Right to Request Data Deletion</h2>
              <p className="text-gray-700 leading-relaxed">
                You may request the permanent deletion of your personal data at any time. Once deleted, your information cannot be recovered. This includes data stored in our application, databases, analytics systems, and authentication provider (Clerk).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How to Request Data Deletion</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To request deletion of your account and all associated data, email us at:
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 hover:underline font-semibold">
                  {SUPPORT_EMAIL}
                </a>
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                Your request must include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>The email associated with your BetterU account</li>
                <li>A clear statement that you want your data permanently deleted</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                For security, we may ask you to verify your identity before processing the request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. What Data Will Be Deleted</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Once verified, we will permanently delete the following:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Your BetterU account and profile information</li>
                <li>Diary entries</li>
                <li>Calendar data and events</li>
                <li>Financial tracking data</li>
                <li>Goals and progress data</li>
                <li>Lists and personal notes</li>
                <li>Referral and affiliate records tied to your identity</li>
                <li>Any stored analytics or metadata that can be linked back to you</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. What Data May Be Retained</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                In certain cases, we may retain minimal information as required by law, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Financial transaction records (for tax and accounting purposes)</li>
                <li>Fraud prevention logs</li>
                <li>Anonymous, non-identifying analytics data</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Any retained data will be stripped of personal identifiers and cannot be traced back to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Timeframe for Deletion</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Data deletion requests are typically processed within:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>3–7 business days for account data</li>
                <li>Up to 30 days for logs, backups, and linked systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Deletion of Authentication Data (Clerk)</h2>
              <p className="text-gray-700 leading-relaxed">
                Our authentication provider, Clerk, stores your login credentials and basic identity data. Once your request is processed, your Clerk user account will also be permanently deleted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Irreversible Process</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Once your account is deleted:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>You will lose access to BetterU immediately.</li>
                <li>Your data cannot be restored.</li>
                <li>Any active subscriptions will be canceled automatically.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Please be sure before requesting deletion.
              </p>
            </section>

            <section className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about this policy or need help with a deletion request, contact us at:
              </p>
              <div className="text-gray-700">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                </p>
              </div>
            </section>
          </div>
        </article>
        </div>
      </div>
    </>
  );
}
