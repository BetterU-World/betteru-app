import { SUPPORT_EMAIL } from "@/lib/constants";
import Header from "@/components/Header";

export default function RefundPolicyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <article className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund Policy</h1>
          <p className="text-sm text-gray-600 mb-8 font-semibold">Effective Date: November 27, 2025</p>

          <div className="space-y-8">
            <div>
              <p className="text-gray-700 leading-relaxed">
                Thank you for using BetterU. We want every user to have an excellent experience. Because BetterU is a digital subscription product with immediate access to tools, dashboards, and features, our refund policy is designed to be fair, transparent, and easy to understand.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Subscription Payments</h2>
              <p className="text-gray-700 leading-relaxed">
                BetterU subscriptions are billed in advance on a monthly basis. All payments are processed securely through our third-party payment provider (Stripe).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. No Automatic Refunds</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Because BetterU provides immediate access to premium features, dashboards, tracking tools, and other digital content, subscription payments are <strong>non-refundable</strong> once the billing cycle begins.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Users are responsible for managing their subscription status, including upgrading, downgrading, or canceling.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Canceling Your Subscription</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You may cancel your subscription at any time. When canceled:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You will continue to have access until the end of your current billing period.</li>
                <li>You will not be billed again unless you choose to resubscribe.</li>
                <li>Canceling <strong>does not</strong> trigger a refund for the current billing month.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Billing Errors or Duplicate Charges</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                If you are within the 7-day refund window for a new subscription and believe you qualify for a refund:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Email us at: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 hover:underline">{SUPPORT_EMAIL}</a></li>
                <li>Include:
                  <ul className="list-circle pl-6 mt-2 space-y-1">
                    <li>The email address associated with your account</li>
                    <li>The date of the charge</li>
                    <li>The amount charged</li>
                    <li>A brief explanation of why you're requesting a refund</li>
                  </ul>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We may request additional information to verify your identity and account. Approved refunds will generally be processed back to the original payment method. Processing times can vary depending on your bank or payment provider.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. No Pro-Rated or Partial Period Refunds</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Outside of the 7-day initial refund window or specific billing error situations, we do not provide:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Partial refunds for unused time in a billing period</li>
                <li>Pro-rated refunds if you stop using the service before the end of your current billing cycle</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                When you cancel, you will retain access to BetterU until the end of your current paid period, and no further renewals will be charged.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cancellations</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You can cancel your BetterU subscription at any time. Generally, you can:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Use the in-app account/billing settings, or</li>
                <li>Use the Stripe Customer Portal if available, or</li>
                <li>Contact us at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 hover:underline">{SUPPORT_EMAIL}</a> for assistance.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-2 font-semibold">Effects of cancellation:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Your subscription remains active until the end of the current billing period.</li>
                <li>You will not be charged for subsequent periods.</li>
                <li>No refunds are provided for the remaining days in the current period, unless you are within the initial 7-day refund window for your very first payment.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Billing Errors and Duplicate Charges</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                If you believe you have been incorrectly charged, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Duplicate charges</li>
                <li>Charges for the wrong plan</li>
                <li>Charges when your subscription should have been canceled</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">
                Please contact us as soon as possible at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 hover:underline">{SUPPORT_EMAIL}</a> with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>The email associated with your account</li>
                <li>The date and amount of the charge</li>
                <li>Any relevant screenshots or bank/Stripe details (with sensitive information masked)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                If we confirm a billing error, we will issue a refund or credit as appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Chargebacks</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We strongly encourage you to contact us before initiating a chargeback with your bank or card issuer.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Many issues can be resolved quickly through our support team.</li>
                <li>Unresolved or unjustified chargebacks may result in the suspension or termination of your account.</li>
                <li>If a chargeback is initiated on a legitimate subscription charge, we reserve the right to dispute the chargeback and provide evidence of your subscription and usage.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Promotional Pricing, Discounts, and Trials</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                From time to time, BetterU may offer:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Free trials</li>
                <li>Discounted introductory periods</li>
                <li>Promotional pricing</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">Unless expressly stated otherwise:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>The same 7-day refund policy applies to the first paid charge following any free trial.</li>
                <li>If you do not cancel before the end of a free trial or promotional period, you may be charged the regular subscription price, and those charges will be subject to the standard refund rules in this policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Affiliates and Referrals</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may offer commissions or rewards to affiliates and referrers who promote BetterU. Refunds can affect commissions as follows:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>If a user's subscription is refunded, any associated affiliate commission for that billing period may be reversed or voided.</li>
                <li>Our decisions regarding affiliate commission adjustments in the event of refunds are final.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                This section is for clarity only and does not create any rights for affiliates beyond the terms of our separate affiliate or referral agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Charity Contributions (10% of Revenue)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                BetterU is committed to giving back. We intend to donate 10% of subscription revenue to charitable causes. However:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Charitable contributions are made by BetterU LLC at the founder's discretion.</li>
                <li>These donations are not tied to specific individual transactions or users.</li>
                <li>Refunds of your subscription do not entitle you to any portion of past or future charitable contributions, nor do they change how or when BetterU donates.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Account Termination by BetterU</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We reserve the right to terminate or suspend your access to BetterU if you violate our Terms of Service or misuse the platform. In such cases:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Refunds may or may not be provided, at our sole discretion, based on the circumstances.</li>
                <li>Serious abuses (e.g., fraud, harassment, illegal activity) will typically not be eligible for refunds.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may update this Refund & Cancellation Policy from time to time to reflect changes in our business, product, pricing, or legal requirements.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>When we make changes, we will update the "Last updated" date at the top of this page.</li>
                <li>Significant changes may also be communicated via email or in-app notification.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Your continued use of BetterU after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Refund & Cancellation Policy, or if you believe a refund or billing correction may be appropriate in your case, please contact us at:
              </p>
              <div className="text-gray-700 space-y-1 mb-4">
                <p><strong>Email:</strong> <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 hover:underline">{SUPPORT_EMAIL}</a></p>
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                We want every BetterU user to feel treated fairly and respectfully. If something doesn't feel right with your billing, please reach out and we'll do our best to help.
              </p>
            </section>
          </div>
        </article>
        </div>
      </div>
    </>
  );
}
