import { SUPPORT_EMAIL } from "@/lib/constants";

export default function AffiliateTermsPage() {
  return (
    <>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <article className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Affiliate Program Terms</h1>
          <p className="text-sm text-gray-600 mb-8 font-semibold">Last Updated: February 2025</p>

          <div className="space-y-8">
            <section>
              <p className="text-gray-700 leading-relaxed">
                These Affiliate Program Terms ("Terms") govern your participation in the BetterU LLC ("BetterU") Affiliate Program. By enrolling as an affiliate, you agree to these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Eligibility</h2>
              <p className="text-gray-700 leading-relaxed mb-3">To participate, you must:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Be at least 18 years old</li>
                <li>Have a valid Clerk account in the BetterU system</li>
                <li>Use your real identity and provide accurate information</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                BetterU reserves the right to approve or reject any affiliate application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Affiliate Commissions (30%)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Affiliates earn <strong>30% of the subscription revenue</strong> generated from users they refer.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">Commissions are paid on:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Active, paying monthly subscribers</li>
                <li>Successful Stripe payments only</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">Commissions are <strong>not</strong> paid on:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Failed or refunded payments</li>
                <li>Canceled or inactive subscriptions</li>
                <li>Fraudulent or self-referrals</li>
                <li>Promotional free trials</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                All commissions are calculated from the <strong>gross subscription amount</strong> (before fees).
              </p>
              <p className="text-gray-700 leading-relaxed">
                BetterU reserves the right to adjust commission rates in the future with notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Referral Link Usage</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You will be provided a unique referral URL. You may share this link through:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Social media</li>
                <li>Content platforms</li>
                <li>Personal websites</li>
                <li>Direct messages</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">Prohibited uses include:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Spam, mass unsolicited messaging, or misleading marketing</li>
                <li>Creating fake accounts</li>
                <li>Using paid ads targeting "BetterU" or brand terms</li>
                <li>Pretending to be BetterU or claiming partnership/ownership</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Violation may result in termination of your affiliate account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payout Schedule</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Payouts occur once per month.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Minimum payout threshold: <strong>$25 USD</strong>
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">Affiliates must ensure:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>A valid payout method is on file</li>
                <li>Accurate tax information if required</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Payouts may be delayed for fraud review or manual verification.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Chargebacks, Refunds, and Reversals</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                If a user requests a refund, disputes a charge, or the payment fails:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>The commission for that payment will be reversed</li>
                <li>Future commission from that user stops if they cancel</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                BetterU reserves the right to correct overpayments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                BetterU may terminate affiliate accounts at any time for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Fraud or suspicious behavior</li>
                <li>Misrepresenting BetterU</li>
                <li>Abusive conduct</li>
                <li>Violating the Terms</li>
                <li>Legal compliance concerns</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may also voluntarily end your participation at any time.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">Upon termination:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Outstanding unpaid legitimate commissions will be paid out</li>
                <li>Invalid, fraudulent, or disputed commissions will not</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Independent Contractor Status</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Affiliates are <strong>independent contractors</strong>, not employees. 
                Nothing in this program creates a partnership, agency, or employment relationship.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Affiliates are responsible for any taxes related to earnings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Program Modifications</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                BetterU may update, modify, or discontinue the Affiliate Program at any time.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Notice will be provided for major changes (commission rate, payout structure).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-3">BetterU is not responsible for:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Technical issues with referral tracking</li>
                <li>Delays in payouts caused by Stripe or banks</li>
                <li>Lost earnings due to misconduct or policy violations</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Maximum liability is limited to unpaid eligible commissions.
              </p>
            </section>

            <section className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about these Affiliate Program Terms, contact:
              </p>
              <div className="text-gray-700">
                <p className="font-semibold mb-1">BetterU LLC</p>
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
