export function Privacy() {
  return (
    <div className="bg-white dark:bg-gray-900 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
            <p className="text-gray-800 dark:text-gray-300">We collect the following information:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-800 dark:text-gray-300">
              <li>Account information (name, email address)</li>
              <li>Bookmaker account credentials (username, account IDs)</li>
              <li>Betting activity and performance data</li>
              <li>Payment and subscription information</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-800 dark:text-gray-300">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-800 dark:text-gray-300">
              <li>Provide and operate the EVA AI service</li>
              <li>Place automated bets on your behalf</li>
              <li>Track and display your performance statistics</li>
              <li>Process payments and manage subscriptions</li>
              <li>Communicate with you about the service</li>
              <li>Improve and optimize our system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Data Security</h2>
            <p className="text-gray-800 dark:text-gray-300">
              We implement industry-standard security measures to protect your data, including encryption of
              sensitive credentials and secure storage. However, no method of transmission over the internet is
              100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Data Sharing</h2>
            <p className="text-gray-800 dark:text-gray-300">
              We do not sell or share your personal information with third parties, except as necessary to
              provide the service (e.g., interacting with bookmaker platforms) or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Data Retention</h2>
            <p className="text-gray-800 dark:text-gray-300">
              We retain your data for as long as your account is active and for a reasonable period thereafter
              for legal and operational purposes. You may request deletion of your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Your Rights</h2>
            <p className="text-gray-800 dark:text-gray-300">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-800 dark:text-gray-300">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of communications</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Cookies and Tracking</h2>
            <p className="text-gray-800 dark:text-gray-300">
              We use cookies and similar technologies to enhance your experience, analyze usage, and improve
              our service. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Changes to Privacy Policy</h2>
            <p className="text-gray-800 dark:text-gray-300">
              We may update this privacy policy from time to time. We will notify you of significant changes
              via email or through the platform.
            </p>
          </section>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              If you have questions about this privacy policy, please contact us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}