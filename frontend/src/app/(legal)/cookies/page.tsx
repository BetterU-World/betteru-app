import { SUPPORT_EMAIL } from "@/lib/constants";

export default function CookiePolicyPage() {
  return (
    <>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <article className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-sm text-gray-600 mb-8 font-semibold">Last updated: November 27, 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                This Cookie Policy explains how BetterU LLC ("BetterU", "we", "us", or "our") uses cookies and similar technologies when you visit or use our website, web application, and related services (collectively, the "Service").
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using the Service, you agree that we can use cookies and similar technologies as described in this Cookie Policy, subject to any preferences you set in your browser or device.
              </p>
              <p className="text-gray-700 leading-relaxed">
                This Cookie Policy should be read together with our Privacy Policy and Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. What Are Cookies?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Cookies are small text files that are placed on your device (computer, tablet, smartphone) when you visit a website. They are widely used to make websites work, improve performance, and provide information to website owners.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">There are different types of cookies:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Session cookies:</strong> stored only while your browser is open and deleted when you close it.</li>
                <li><strong>Persistent cookies:</strong> remain on your device for a set period or until you delete them.</li>
                <li><strong>First-party cookies:</strong> set by the website you are visiting.</li>
                <li><strong>Third-party cookies:</strong> set by domains other than the one you are visiting (for example, analytics providers or embedded services).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-3">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Operate and secure the BetterU platform</li>
                <li>Remember your preferences and settings</li>
                <li>Authenticate you and keep you logged in</li>
                <li>Improve performance and reliability</li>
                <li>Understand how the Service is being used (in aggregate)</li>
                <li>Support basic marketing and communication (without tracking you across unrelated sites)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We aim to use cookies in a privacy-respecting way and avoid unnecessary or invasive tracking.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Types of Cookies We Use</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">a) Strictly Necessary Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                These cookies are essential for the Service to function properly and cannot be switched off in our systems. They are usually set only in response to actions you take, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
                <li>Logging in to your account</li>
                <li>Maintaining your session</li>
                <li>Ensuring security and fraud prevention</li>
                <li>Enabling basic navigation and core features</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-6">
                Without these cookies, the Service may not work correctly.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">b) Performance and Analytics Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                These cookies help us understand how users interact with the Service so we can improve it over time. They may collect information such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
                <li>Which pages are visited</li>
                <li>How long users stay on certain pages</li>
                <li>General usage patterns (in aggregate)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">We use this information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Diagnose performance issues</li>
                <li>Improve user experience and navigation</li>
                <li>Prioritize new features and enhancements</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-6">
                Where possible, analytics data is aggregated and/or pseudonymized. We do not use analytics cookies to build individual behavior profiles for advertising on third-party sites.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">c) Functional Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                These cookies allow the Service to remember choices you make and provide enhanced functionality, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Remembering your settings or preferences</li>
                <li>Saving certain UI state or feature toggles</li>
                <li>Improving personalization within the app</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-6">
                If you disable these cookies, some features may not remember your preferences, but the Service will still be usable.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">d) Authentication and Security Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                These cookies are used by our authentication and security systems to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Log you in and keep you logged in</li>
                <li>Protect your account from unauthorized access</li>
                <li>Help detect and prevent abuse or misuse of the Service</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-6">
                These cookies are typically set by our authentication provider and are required for secure access to your BetterU account.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">e) Marketing / Communication Cookies (Limited Use)</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may use limited marketing or communication-related cookies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Measure the effectiveness of our own campaigns</li>
                <li>Understand how new users find BetterU</li>
                <li>Support basic remarketing to people who have already visited our site</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We do not sell your personal information, and we do not use cookies to track you across unrelated third-party websites for behavioral advertising.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Some cookies on the Service are placed by third parties, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Authentication provider(s)</li>
                <li>Payment processor(s)</li>
                <li>Basic analytics or performance tools</li>
                <li>Embedded content or widgets (if any)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                These third parties may collect information about your use of the Service in accordance with their own privacy policies.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We encourage you to review the privacy and cookie practices of any third parties whose services we integrate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Managing Cookies and Your Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-3">You have control over cookies through:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Your browser settings (to block, restrict, or delete cookies)</li>
                <li>Device-level settings (especially for mobile devices)</li>
                <li>Optional in-app settings or banners (if made available)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">Most web browsers allow you to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>View which cookies are stored and delete them</li>
                <li>Block cookies from specific sites</li>
                <li>Block all cookies</li>
                <li>Clear all cookies when you close your browser</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">Please note:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>If you block or delete certain cookies, parts of the Service may not function properly.</li>
                <li>Strictly necessary cookies are required for core functionality and cannot be fully disabled via our interface.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                For more detailed information, you can consult the help pages of your browser (e.g., Chrome, Safari, Firefox, Edge).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Do Not Track (DNT) Signals</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Some browsers offer a "Do Not Track" (DNT) setting. There is currently no universally accepted standard for how to respond to DNT signals, and we do not currently respond to them.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We will continue to monitor industry practices and standards and may update this policy if that changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. How Long Cookies Are Stored</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The duration for which a cookie remains on your device depends on whether it is a session or persistent cookie and the specific settings of your browser and device.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Session cookies are deleted when you close your browser.</li>
                <li>Persistent cookies may remain for a defined period (for example, days, months, or years) unless you delete them earlier.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We aim to use reasonable retention periods and limit cookies to what is necessary for the purposes described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Cookie Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Cookie Policy from time to time to reflect changes to our practices, technologies, or legal requirements.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">When we make material changes, we will:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Update the "Last updated" date at the top of this page; and</li>
                <li>Take additional steps where required by applicable law (such as providing a more prominent notice or obtaining consent).</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies and similar technologies.
              </p>
            </section>

            <section className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions or concerns about this Cookie Policy or our use of cookies, you can contact us at:
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
