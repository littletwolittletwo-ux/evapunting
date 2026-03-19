export function Terms() {
  return (
    <div className="bg-white dark:bg-gray-900 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms & Conditions</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Service Description</h2>
            <p className="text-gray-800 dark:text-gray-300">
              EVA AI provides an automated betting automation tool. We do not act as a bookmaker, hold funds,
              or provide betting or financial advice. All funds remain in your own bookmaker accounts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. User Responsibilities</h2>
            <p className="text-gray-800 dark:text-gray-300">You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-800 dark:text-gray-300">
              <li>Creating and funding your own bookmaker accounts</li>
              <li>Providing accurate account credentials</li>
              <li>Compliance with all local laws and regulations</li>
              <li>Understanding the risks associated with betting</li>
              <li>Maintaining adequate funds in your bookmaker accounts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. No Guarantees</h2>
            <p className="text-gray-800 dark:text-gray-300">
              EVA AI makes no guarantees about profits or returns. Past performance does not guarantee future
              results. All betting carries risk, and you could lose money.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Fees and Pricing</h2>
            <p className="text-gray-800 dark:text-gray-300">
              Users pay a monthly subscription fee plus 30% of profits generated. EVA AI retains 30% of all
              profits; users keep 70%. Fees are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Account Security</h2>
            <p className="text-gray-800 dark:text-gray-300">
              You are responsible for maintaining the confidentiality of your account credentials. EVA AI
              stores credentials securely but cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Termination</h2>
            <p className="text-gray-800 dark:text-gray-300">
              Either party may terminate service at any time. Upon termination, EVA AI will cease automated
              betting operations within 24 hours.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-800 dark:text-gray-300">
              EVA AI is not liable for any losses, damages, or consequences arising from use of the service.
              Users accept all risks associated with automated betting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Changes to Terms</h2>
            <p className="text-gray-800 dark:text-gray-300">
              EVA AI reserves the right to modify these terms at any time. Continued use of the service
              constitutes acceptance of modified terms.
            </p>
          </section>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              By using EVA AI, you acknowledge that you have read, understood, and agree to be bound by these
              Terms & Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}