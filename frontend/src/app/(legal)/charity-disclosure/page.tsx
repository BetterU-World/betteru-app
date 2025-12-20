import { SUPPORT_EMAIL } from "@/lib/constants";

export default function CharityDisclosurePage() {
  return (
    <>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <article className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Charity Impact & Donations Disclosure</h1>

          <div className="space-y-8">
            <section>
              <p className="text-gray-700 leading-relaxed">
                BetterU LLC ("BetterU", "we", "us", or "our") is committed to giving back. 
                As part of our mission, we donate <strong>10% of all subscription revenue</strong> to charitable causes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Founder's Choice Contributions</h2>
              <p className="text-gray-700 leading-relaxed">
                At this time, all charitable contributions are allocated at the discretion of BetterU's founder ("Founder's Choice"). 
                This ensures funds can be directed to organizations that align with current needs, opportunities, or impactful initiatives.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. No User-Directed Donations Yet</h2>
              <p className="text-gray-700 leading-relaxed">
                While users may eventually be able to select preferred charities or track contributions directly within the app, 
                this functionality is not currently available. 
                Donations are managed internally until broader charity partnerships and infrastructure are implemented.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Not a Charity or Nonprofit</h2>
              <p className="text-gray-700 leading-relaxed">
                BetterU is a for-profit company. 
                Purchases, subscriptions, and payments made to BetterU are <strong>not</strong> tax-deductible charitable contributions. 
                Users do not receive tax receipts or donation acknowledgments for their payments to BetterU.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Donation Timing & Method</h2>
              <p className="text-gray-700 leading-relaxed">
                Donations may be made monthly, quarterly, or on another schedule chosen by BetterU. 
                The timing of contributions may vary depending on business operations, subscription cycles, and internal accounting.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Transparency Commitment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                As BetterU grows, we are committed to increasing transparency around charitable impact. 
                In the future, this page may include information such as:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Total contributions made</li>
                <li>Charities supported</li>
                <li>Impact summaries</li>
                <li>Official receipts or confirmations (when appropriate)</li>
              </ul>

              <p className="text-gray-700 leading-relaxed">
                Until such features are launched, this page serves as a clear disclosure of our current practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. No Guarantees or Obligations</h2>
              <p className="text-gray-700 leading-relaxed">
                The 10% donation policy reflects our current intention but does not create a legal or contractual obligation. 
                BetterU may modify or discontinue donation practices at any time based on business needs, financial conditions, or other factors.
              </p>
            </section>

            <section className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                For questions about our donation practices or impact initiatives, please contact:
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong>{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </section>
          </div>
        </article>
        </div>
      </div>
    </>
  );
}
