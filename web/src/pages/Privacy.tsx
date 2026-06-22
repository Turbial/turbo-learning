import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Privacy() {
  usePageTitle('Privacy Policy')

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-6">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/"
            className="text-green-600 font-semibold hover:text-green-700 text-sm mb-8 inline-block"
          >
            ← Back to Turbo Learning
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Privacy Policy</h1>
          <p className="mt-2 text-gray-500 text-sm">Last updated: June 2026</p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            At Turbo Learning, we take your privacy seriously. This Privacy Policy explains what
            information we collect, how we use it, and the choices you have about that information.
            By using the Service, you agree to the practices described in this policy.
          </p>
        </div>

        <div className="space-y-10">

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              1. Information We Collect
            </h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1 Account Information</h3>
            <p className="text-gray-700 leading-relaxed">
              When you register, we collect your email address, display name, and password
              (stored as a cryptographic hash). If you sign in via a third-party provider
              (e.g. Google), we receive only the profile information that provider shares with
              us under your authorisation.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">1.2 Usage Data</h3>
            <p className="text-gray-700 leading-relaxed">
              We automatically collect information about how you interact with the Service,
              including lessons completed, quiz scores, streak data, session timestamps, and
              feature engagement. This data is used to personalise your experience and improve
              the product.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
              1.3 Payment Information
            </h3>
            <p className="text-gray-700 leading-relaxed">
              All payment processing is handled by Stripe, Inc. We do not store your full card
              number, CVV, or other sensitive payment credentials on our servers. We receive a
              Stripe customer ID and the last four digits of your card for display purposes only.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              2. How We Use Information
            </h2>
            <p className="text-gray-700 leading-relaxed">We use the information we collect to:</p>
            <ul className="mt-3 list-disc list-inside space-y-2 text-gray-700">
              <li>Provide, operate, and maintain the Service</li>
              <li>
                Personalise your learning experience, including adaptive lesson ordering and
                spaced-repetition scheduling
              </li>
              <li>
                Send you transactional emails (e.g. account verification, password reset,
                subscription receipts)
              </li>
              <li>
                Send you product update and streak reminder notifications, which you may
                opt out of at any time from your account settings
              </li>
              <li>Diagnose technical issues and monitor Service health</li>
              <li>
                Conduct aggregate analysis to understand how users engage with the platform
                and to guide product decisions
              </li>
              <li>Comply with applicable legal obligations</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell, rent, or trade your personal information to third parties. We share
              data only in the following limited circumstances:
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.1 Service Providers</h3>
            <p className="text-gray-700 leading-relaxed">
              We use a small number of trusted third-party service providers to help operate the
              Service:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-2 text-gray-700">
              <li>
                <span className="font-medium">Stripe</span> — payment processing and subscription
                management
              </li>
              <li>
                <span className="font-medium">Supabase</span> — cloud database and authentication
                infrastructure
              </li>
            </ul>
            <p className="mt-3 text-gray-700 leading-relaxed">
              These providers are contractually obligated to handle data only as directed by us and
              in accordance with this policy.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.2 Legal Requirements</h3>
            <p className="text-gray-700 leading-relaxed">
              We may disclose your information if required by law, court order, or governmental
              authority, or if we believe disclosure is necessary to protect our rights, your
              safety, or the safety of others.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              4. Cookies and Tracking
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use browser <span className="font-medium">localStorage</span> to persist your
              session state, learning progress, and preferences. We do not use tracking cookies
              for advertising.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We use <span className="font-medium">Plausible Analytics</span> to understand
              aggregate traffic patterns (e.g. which pages are visited, referral sources,
              approximate geographic regions). Plausible is privacy-preserving by design: it
              does not collect personally identifiable information, does not use cookies, and
              does not track individuals across websites.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal data for as long as your account remains active. If you
              delete your account, we will permanently delete your personal data within
              30 days of your deletion request, except where we are required to retain certain
              records to comply with legal obligations (e.g. financial records required by
              tax law).
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Aggregated, anonymised usage statistics may be retained indefinitely as they
              cannot be linked back to any individual.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Your Rights</h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">6.1 GDPR (EEA and UK Users)</h3>
            <p className="text-gray-700 leading-relaxed">
              If you are located in the European Economic Area or the United Kingdom, you have the
              following rights regarding your personal data:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-2 text-gray-700">
              <li>
                <span className="font-medium">Access</span> — request a copy of the data we hold
                about you
              </li>
              <li>
                <span className="font-medium">Rectification</span> — request correction of
                inaccurate data
              </li>
              <li>
                <span className="font-medium">Erasure</span> — request deletion of your data
                ("right to be forgotten")
              </li>
              <li>
                <span className="font-medium">Portability</span> — receive your data in a
                machine-readable format
              </li>
              <li>
                <span className="font-medium">Objection</span> — object to processing based on
                legitimate interests
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
              6.2 CCPA (California Users)
            </h3>
            <p className="text-gray-700 leading-relaxed">
              California residents have the right to know what personal information we collect,
              the right to opt out of the sale of personal information (we do not sell personal
              information), and the right to non-discrimination for exercising their privacy rights.
            </p>

            <p className="mt-4 text-gray-700 leading-relaxed">
              To exercise any of these rights, please contact us at{' '}
              <a
                href="mailto:privacy@turbolearning.ai"
                className="text-green-600 hover:text-green-700"
              >
                privacy@turbolearning.ai
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service is not directed to children under the age of 16. We do not knowingly
              collect personal information from anyone under 16. If we become aware that a user
              is under 16, we will promptly delete their account and associated data. If you
              believe a child under 16 has provided us with personal information, please contact
              us at privacy@turbolearning.ai.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. When we make material changes,
              we will notify you by email or by displaying a prominent notice in the Service at
              least 14 days before the changes take effect. Your continued use of the Service
              after the effective date constitutes acceptance of the revised policy.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              For any privacy-related questions, requests, or concerns, please contact our
              Privacy Team at:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700">
              <p className="font-semibold">Turbo Learning — Privacy Team</p>
              <p className="mt-1">
                Email:{' '}
                <a
                  href="mailto:privacy@turbolearning.ai"
                  className="text-green-600 hover:text-green-700"
                >
                  privacy@turbolearning.ai
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
          <Link to="/" className="text-green-600 hover:text-green-700 font-medium">
            ← Back to Turbo Learning
          </Link>
          <span className="mx-3 text-gray-300">|</span>
          <Link to="/terms" className="text-green-600 hover:text-green-700 font-medium">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  )
}
