import { SUPPORT_EMAIL } from "@/lib/constants";
import Header from "@/components/Header";

export default function EarningsDisclaimerPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <article className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Earnings Disclaimer</h1>

          <div className="space-y-8">
            <section>
              <p className="text-gray-700 leading-relaxed">
                BetterU LLC ("BetterU", "we", "us", or "our") provides tools, resources, and software intended to support personal development, goal tracking, and general life improvement. 
                While some users may experience positive financial outcomes as a result of improved habits or decision-making, we do not promise, guarantee, or imply that any financial success will occur as a result of using BetterU.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. No Financial Guarantees</h2>
              <p className="text-gray-700 leading-relaxed">
                BetterU does not guarantee any level of income, results, or financial improvement. Any examples, past successes, testimonials, or case studies are only illustrations of what may be possible. 
                They should not be interpreted as typical, guaranteed, or expected outcomes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Responsibility</h2>
              <p className="text-gray-700 leading-relaxed">
                Your financial decisions, business activities, personal habits, and results are entirely your responsibility. 
                BetterU is not liable for any actions you take or fail to take based on the information, tools, or recommendations provided through the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Affiliate Earnings</h2>
              <p className="text-gray-700 leading-relaxed">
                BetterU offers an affiliate program that provides commissions for referrals. 
                While the commission structure is clearly defined within our platform, we do not guarantee that any user will earn income through the affiliate program. 
                Actual results depend on individual effort, marketing ability, audience, and other external factors beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. No Professional Advice</h2>
              <p className="text-gray-700 leading-relaxed">
                BetterU does not provide financial, investment, legal, medical, or tax advice. 
                Content and information on the platform are for informational and educational purposes only. 
                You should consult with qualified professionals before making decisions in these areas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Forward-Looking Statements</h2>
              <p className="text-gray-700 leading-relaxed">
                Any statements regarding future earnings, financial growth, or potential results are not guarantees. 
                Such statements are expressions of opinion only and should not be relied upon as factual predictions of outcomes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Acceptance of This Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                By using BetterU, you acknowledge that you are fully responsible for your own financial decisions and results. 
                If you do not agree with this disclaimer, you should not use the platform.
              </p>
            </section>

            <section className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-2">If you have questions about this disclaimer, you may contact us at:</p>
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
