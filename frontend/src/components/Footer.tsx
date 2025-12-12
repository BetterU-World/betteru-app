export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50 mt-10">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6 text-sm text-gray-600">
        {/* App name & tagline */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">BetterU</h3>
          <p className="text-gray-600">Tools to build a better you.</p>
        </div>

        {/* Legal & Impact links */}
        <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
          <a
            href="/terms"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="/privacy"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/refund"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Refund Policy
          </a>
          <a
            href="/data-deletion"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Data Deletion
          </a>
          <a
            href="/cookies"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cookie Policy
          </a>
          <a
            href="/affiliate-terms"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Affiliate Program Terms
          </a>
          <a
            href="/earnings-disclaimer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Earnings Disclaimer
          </a>
          <a
            href="/charity-disclosure"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Charity / Impact
          </a>
        </nav>

        {/* Copyright & disclaimer */}
        <div className="text-center space-y-2 pt-4 border-t border-gray-200">
          <p className="text-gray-600">
            © {currentYear} BetterU LLC. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            BetterU does not provide medical, legal, or financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
