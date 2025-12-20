import { SUPPORT_EMAIL } from "@/lib/constants";

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <article className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BetterU Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8 font-semibold">Last updated: November 27, 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                BetterU ("BetterU", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your information when you use our services, including the BetterU web application and related features (the "Service").
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using BetterU, you agree to the terms of this Privacy Policy. If you do not agree, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Who We Are</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                BetterU is a digital product aimed at helping you improve your life through features like:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Diary and journaling tools</li>
                <li>Calendar and goal planning</li>
                <li>Financial tracking (manual income/expense tracking)</li>
                <li>Lists and task management</li>
                <li>Referral and affiliate system</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                BetterU LLC is based in the United States. References to "you" or "user" mean any individual using the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect the following categories of information:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Account and Identification Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>Name or display name (if you provide it)</li>
                <li>Email address (used for login and communication)</li>
                <li>Authentication identifiers and security tokens (managed through our auth provider, such as Clerk)</li>
                <li>Referral or affiliate codes associated with your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Usage and Content You Enter</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Because BetterU is a self-improvement and tracking tool, you may enter personal information into the app, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
                <li>Diary entries and journal content</li>
                <li>Calendar events and reminders</li>
                <li>Goals, milestones, and related notes</li>
                <li>Financial entries you manually add (income, expenses, categories, notes)</li>
                <li>Lists and tasks (to-dos, shopping lists, planning lists, etc.)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-6">
                This content can be highly personal. You are in full control of what you choose to store in BetterU.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Device, Log, and Technical Data</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may automatically collect technical information when you use the Service, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type and operating system</li>
                <li>Referring URLs</li>
                <li>Dates and times of access</li>
                <li>Basic analytics and usage patterns (e.g., which features are used and how often)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Payment and Billing Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Payments for BetterU subscriptions are processed by third-party payment processors such as Stripe. We do not store your full payment card details on our servers. Stripe or other processors handle that information directly.
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">We may store:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>Partial card details (e.g., last 4 digits, expiration month/year) as provided by the payment processor</li>
                <li>Billing status (active, canceled, past due)</li>
                <li>Transaction metadata (amount, currency, Stripe customer ID, Stripe subscription ID)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.5 Referral and Affiliate Information</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                If you join or participate in BetterU's affiliate/referral program, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>Your affiliate code or referral link</li>
                <li>Information about users who sign up using your code (limited to what is necessary to track the referral, such as an internal user ID or email)</li>
                <li>Commission calculations and payout status</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.6 Cookies and Similar Technologies</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                We may use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
                <li>Keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Improve site performance and security</li>
                <li>Understand how the Service is used</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You can control cookies through your browser settings, but disabling certain cookies may affect your ability to use some parts of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use the information we collect for purposes including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Providing, maintaining, and improving the Service</li>
                <li>Creating and managing your account</li>
                <li>Syncing and displaying your diary entries, goals, calendar events, financial entries, and lists</li>
                <li>Processing payments and managing subscriptions</li>
                <li>Operating the referral and affiliate program (tracking referrals, calculating commissions, managing payouts)</li>
                <li>Responding to your questions and support requests</li>
                <li>Sending you important service-related emails (e.g., billing, security, feature updates)</li>
                <li>Monitoring for abuse, fraud, and security issues</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Legal Bases for Processing (if applicable)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Depending on your location, we may rely on one or more of the following legal bases to process your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Your consent (e.g., when you sign up or choose to enter certain data)</li>
                <li>Performance of a contract (providing the Service you signed up for)</li>
                <li>Legitimate interests (e.g., improving the Service, preventing fraud)</li>
                <li>Compliance with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. How We Share Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4 font-semibold">
                We do not sell your personal data.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">We may share your information with:</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Service Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                We use trusted third-party providers to help run the Service, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
                <li>Authentication providers (e.g., Clerk) to manage login and identity</li>
                <li>Payment processors (e.g., Stripe) to handle payments securely</li>
                <li>Hosting and infrastructure providers</li>
                <li>Analytics and monitoring tools</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-6">
                These providers are only given the information necessary to perform their services.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Affiliates and Referral Partners</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                If you are part of the affiliate/referral program, we may share limited information necessary to track referrals and calculate commissions (such as internal IDs, anonymized identifiers, or aggregated metrics).
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                We do not share your diary entries, journal content, goals, or similar sensitive content with affiliates.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Legal and Compliance</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                We may disclose information if required to do so by law or in good faith belief that such action is necessary to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>Comply with legal obligations or respond to lawful requests</li>
                <li>Protect and defend the rights, property, or safety of BetterU, our users, or others</li>
                <li>Investigate and prevent abuse, security incidents, or fraud</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.4 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                If BetterU is involved in a merger, acquisition, financing, or sale of assets, your information may be transferred as part of that transaction, in compliance with applicable law. We will use reasonable efforts to notify you if this happens.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We retain your information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Provide the Service to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-2">In practice:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Account data is retained while your account is active.</li>
                <li>Content you add (diary entries, goals, financial data, lists, etc.) is retained until you delete it or delete your account, subject to any backup and archival policies.</li>
                <li>Billing and transaction records may be retained as required by tax and accounting laws.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You may request deletion of your account and associated personal data, subject to certain limitations described below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Depending on your location, you may have rights over your personal data, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Access:</strong> You can request a copy of the personal information we hold about you.</li>
                <li><strong>Correction:</strong> You can update or correct inaccurate information.</li>
                <li><strong>Deletion:</strong> You can request deletion of your account and personal data, subject to legal and operational requirements.</li>
                <li><strong>Restriction or objection:</strong> You may be able to restrict or object to certain forms of processing.</li>
                <li><strong>Portability:</strong> You may be able to request your data in a portable format.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                Many of these actions can be taken directly in the app (e.g., editing your profile or deleting entries). For anything else, you can contact us using the information in the "Contact Us" section.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We may need to verify your identity before honoring certain requests.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Security</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We take reasonable technical and organizational measures to help protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Using modern hosting and infrastructure providers</li>
                <li>Relying on secure authentication and payment providers</li>
                <li>Applying access controls and safeguards internally</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                BetterU is not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Users</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you access the Service from outside the United States, you understand that your information may be processed and stored in the United States or other countries where our service providers are located. Data protection laws in these countries may be different from those in your country.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using the Service, you consent to the transfer of your information to these locations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Third-Party Links and Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Service may contain links to third-party websites, tools, or services. We are not responsible for the privacy practices or content of those third parties. We encourage you to review the privacy policies of any third-party services you use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. In some cases, we may provide additional notice (such as by email or in-app).
              </p>
              <p className="text-gray-700 leading-relaxed">
                Your continued use of the Service after any changes to this Privacy Policy constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions or concerns about this Privacy Policy or how we handle your data, you can contact us at:
              </p>
              <div className="text-gray-700 space-y-1">
                <p><strong>Email:</strong> <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 hover:underline">{SUPPORT_EMAIL}</a></p>
              </div>
            </section>
          </div>
        </article>
        </div>
      </div>
    </>
  );
}
