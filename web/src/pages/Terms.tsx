import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Terms() {
  usePageTitle('Terms of Service')

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
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Terms of Service</h1>
          <p className="mt-2 text-gray-500 text-sm">Last updated: June 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10">

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using Turbo Learning (the "Service"), you agree to be bound by these
              Terms of Service ("Terms"). These Terms constitute a legally binding agreement between
              you and Turbo Learning, Inc. ("Turbo Learning", "we", "us", or "our"). If you do not
              agree to these Terms, please do not access or use the Service.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material
              changes by posting the updated Terms on this page and updating the "Last updated" date.
              Your continued use of the Service after such changes constitutes acceptance of the
              revised Terms.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed">
              Turbo Learning is an AI-powered skills learning platform that delivers structured
              28-day programs designed to help individuals acquire practical, career-relevant
              competencies. Our programs combine curated lessons, interactive exercises, spaced
              repetition reviews, and progress tracking to accelerate skill acquisition.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              The Service is provided on an "as is" basis and is subject to change without notice.
              We may add, modify, or remove features at our discretion. Access to certain features
              may require a paid subscription.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. User Accounts</h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1 Eligibility</h3>
            <p className="text-gray-700 leading-relaxed">
              You must be at least 16 years of age to create an account and use the Service. By
              creating an account, you represent and warrant that you meet this age requirement. If
              you are under 18, you represent that your parent or guardian has reviewed and agreed to
              these Terms.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.2 Account Information</h3>
            <p className="text-gray-700 leading-relaxed">
              You agree to provide accurate, current, and complete information when creating your
              account, and to keep that information up to date. Providing false or misleading
              information is grounds for immediate account termination.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.3 Account Security</h3>
            <p className="text-gray-700 leading-relaxed">
              You are solely responsible for maintaining the confidentiality of your account
              credentials and for all activities that occur under your account. You agree to notify
              us immediately at support@turbolearning.ai if you suspect any unauthorized use of your
              account. Turbo Learning is not liable for any loss resulting from unauthorized use of
              your account.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to use the Service only for lawful purposes and in accordance with these
              Terms. You must not:
            </p>
            <ul className="mt-3 list-disc list-inside space-y-2 text-gray-700">
              <li>
                Scrape, crawl, spider, or otherwise systematically extract content from the
                Service using automated tools or methods
              </li>
              <li>
                Share, sell, or transfer your account credentials or grant access to your account
                to any third party
              </li>
              <li>
                Use the Service to transmit spam, malware, or any harmful or disruptive content
              </li>
              <li>
                Attempt to circumvent, disable, or interfere with security features of the Service
              </li>
              <li>
                Reverse-engineer, decompile, or disassemble any portion of the Service
              </li>
              <li>
                Use the Service in any manner that could damage, overburden, or impair our
                infrastructure or interfere with other users' experience
              </li>
              <li>
                Violate any applicable local, national, or international law or regulation
              </li>
            </ul>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We reserve the right to investigate and take appropriate action, including suspending
              or terminating your account, if we reasonably believe you have violated these provisions.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on the Service — including but not limited to lesson text, exercises,
              audio, graphics, logos, course programs, and software — is owned by or licensed to
              Turbo Learning and is protected by copyright, trademark, and other intellectual
              property laws. You may not reproduce, distribute, modify, create derivative works of,
              or publicly display any content without our prior written consent.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We grant you a limited, non-exclusive, non-transferable, revocable licence to access
              and use the Service solely for your personal, non-commercial learning purposes in
              accordance with these Terms.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              6. Subscriptions and Payments
            </h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">6.1 Subscription Plans</h3>
            <p className="text-gray-700 leading-relaxed">
              Turbo Learning offers monthly and annual subscription plans. Prices are displayed at
              checkout and may be subject to applicable taxes. We reserve the right to change
              subscription pricing with at least 30 days' notice to existing subscribers.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">6.2 Auto-Renewal</h3>
            <p className="text-gray-700 leading-relaxed">
              Subscriptions automatically renew at the end of each billing period unless you cancel
              before the renewal date. You authorise us to charge your payment method on file for
              each renewal. You may cancel at any time from your account settings.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">6.3 Refunds</h3>
            <p className="text-gray-700 leading-relaxed">
              We offer a full refund within 7 days of your initial purchase or renewal if you are
              not satisfied with the Service. To request a refund, contact support@turbolearning.ai
              within the 7-day window. Refunds are not available after this period, and we do not
              provide pro-rated refunds for partial subscription periods.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              You may terminate your account at any time by contacting us at
              support@turbolearning.ai or using the account deletion option in your settings.
              Upon termination, your right to access the Service ceases immediately.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We may suspend or terminate your account at our sole discretion, without prior notice,
              if we believe you have violated these Terms or for any other reason. Termination does
              not entitle you to a refund except as described in Section 6.3.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT
              WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR
              OTHER HARMFUL COMPONENTS.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We make no guarantees regarding the accuracy, completeness, or suitability of any
              content on the Service for any particular purpose. Results from using the Service will
              vary by individual effort and circumstance.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              TO THE FULLEST EXTENT PERMITTED BY LAW, TURBO LEARNING, INC. AND ITS OFFICERS,
              DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF
              OR INABILITY TO USE THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF
              SUCH DAMAGES.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY CLAIMS ARISING OUT OF OR RELATED TO
              THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID
              US IN THE 12 MONTHS PRECEDING THE CLAIM OR (B) $100 USD.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700">
              <p className="font-semibold">Turbo Learning, Inc.</p>
              <p className="mt-1">
                Email:{' '}
                <a
                  href="mailto:support@turbolearning.ai"
                  className="text-green-600 hover:text-green-700"
                >
                  support@turbolearning.ai
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
          <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}
