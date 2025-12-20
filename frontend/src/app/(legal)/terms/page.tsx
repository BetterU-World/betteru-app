import { SUPPORT_EMAIL } from "@/lib/constants";

export default function TermsOfServicePage() {
  return (
    <>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <article className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TERMS OF SERVICE — BetterU</h1>
          <p className="text-sm text-gray-600 mb-8">Last Updated: November 27, 2025</p>

          <div className="space-y-8">
            <div>
              <p className="text-gray-700 leading-relaxed">
                Welcome to BetterU, operated by BetterU LLC ("Company," "we," "our," "us").
                By accessing or using BetterU, you agree to these Terms of Service.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                If you do not agree, please discontinue use immediately.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Services Provided</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                BetterU is a self-improvement platform offering features including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Habit & goal tracking</li>
                <li>Journaling and diary entries</li>
                <li>Calendar and scheduling tools</li>
                <li>Financial logging</li>
                <li>Personal development analytics</li>
                <li>Affiliate program features</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                The platform may evolve over time with new features and updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You must be at least 18 years old to use BetterU.</li>
                <li>You must provide accurate and complete information when creating your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-3">You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Maintaining the confidentiality of your login credentials</li>
                <li>Any activity under your account</li>
                <li>Immediately notifying us of unauthorized access</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                We reserve the right to suspend or terminate accounts for violations of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Billing</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                BetterU operates on a monthly subscription model processed through Stripe.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>By subscribing, you authorize recurring monthly charges until cancellation.</li>
                <li>All prices posted on the platform are subject to change.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Affiliate Program</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                If you participate in the BetterU affiliate program:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Affiliates earn 30% recurring commission for referred active subscribers</li>
                <li>Commission is calculated from gross subscription revenue, before Stripe fees</li>
                <li>Commissions are paid out according to our payout schedule</li>
                <li>Fraud, self-referrals, or manipulation will result in termination</li>
                <li>We reserve the right to update commission structure at any time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Charitable Contributions</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                BetterU donates 10% of monthly revenue to nonprofit organizations selected by our founder ("Founder's Choice").
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>BetterU retains full discretion over donation timing and recipients</li>
                <li>Donations are voluntary and may change without notice</li>
                <li>Donations do not create obligations or guarantees to users</li>
                <li>This is an expression of our company values, not a contractual promise.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Acceptable Use</h2>
              <p className="text-gray-700 leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Use BetterU for unlawful purposes</li>
                <li>Attempt to access data or accounts not belonging to you</li>
                <li>Upload malware, scripts, or harmful code</li>
                <li>Reverse engineer, scrape, or attempt to bypass security</li>
                <li>Interfere with platform functionality</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Violations may result in account termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                All content, branding, software, and materials on BetterU are owned by BetterU LLC or licensed to us.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Users may not copy, distribute, or reproduce BetterU content without permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Collection & Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of BetterU is also governed by our Privacy Policy, which explains how we collect, store, and use your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimers</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                BetterU is not a medical, mental-health, financial, or legal service.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                The platform is provided "as-is" without warranties of any kind.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                We are not responsible for losses arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Technical issues</li>
                <li>Unavailability</li>
                <li>Data loss</li>
                <li>Unauthorized account access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                To the fullest extent permitted by law, BetterU LLC shall not be liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of data</li>
                <li>Loss of revenue</li>
                <li>Service interruptions</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Maximum liability is limited to the amount paid by the user in the previous 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Account Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may suspend or terminate accounts for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Abuse</li>
                <li>Fraud</li>
                <li>Violation of Terms</li>
                <li>Harmful behavior toward the platform or community</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Users may cancel their own subscription at any time via the billing portal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of the State of Florida, without regard to conflicts of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms at any time. Continued use of BetterU means acceptance of the updated Terms.
              </p>
            </section>

            <section className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <div className="text-gray-700 space-y-1">
                <p className="font-semibold">BetterU LLC</p>
                <p>Email: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 hover:underline">{SUPPORT_EMAIL}</a></p>
              </div>
            </section>
          </div>
        </article>
        </div>
      </div>
    </>
  );
}
