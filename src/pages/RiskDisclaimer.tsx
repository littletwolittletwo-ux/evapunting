export function RiskDisclaimer() {
  return (
    <div className="bg-white dark:bg-gray-900 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Risk Disclaimer</h1>

        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">Important: Read Carefully</h2>
          <p className="text-red-800 dark:text-red-300">
            Betting carries significant financial risk. You could lose money. This disclaimer outlines the
            risks associated with using EVA AI.
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. No Guarantees</h2>
            <p className="text-gray-800 dark:text-gray-300">
              EVA AI makes no guarantees, warranties, or representations about profits, returns, or outcomes.
              Past performance does not guarantee future results. You may lose some or all of your invested
              capital.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Not Financial Advice</h2>
            <p className="text-gray-800 dark:text-gray-300">
              EVA AI does not provide financial, investment, or betting advice. Our service is an automation
              tool only. You are solely responsible for your betting decisions and financial outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Market Risks</h2>
            <p className="text-gray-800 dark:text-gray-300">Betting markets are subject to various risks including:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-800 dark:text-gray-300">
              <li>Unpredictable sporting outcomes</li>
              <li>Market volatility and odds changes</li>
              <li>Bookmaker limitations or account restrictions</li>
              <li>Technical failures or system downtime</li>
              <li>Regulatory changes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Losing Streaks</h2>
            <p className="text-gray-800 dark:text-gray-300">
              Even with positive expected value strategies, losing streaks can and will occur. These may be
              prolonged and result in significant losses. You should only bet with money you can afford to
              lose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Your Responsibility</h2>
            <p className="text-gray-800 dark:text-gray-300">
              You are solely responsible for understanding and accepting these risks. By using EVA AI, you
              acknowledge that you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-800 dark:text-gray-300">
              <li>Understand betting carries financial risk</li>
              <li>Can afford potential losses</li>
              <li>Are not relying on betting income for essential expenses</li>
              <li>Have read and understood all risk disclosures</li>
              <li>Are legally permitted to bet in your jurisdiction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Not Insider Information</h2>
            <p className="text-gray-800 dark:text-gray-300">
              EVA AI does not use or provide insider information, fixed matches, or guaranteed outcomes. Our
              system uses mathematical analysis of publicly available odds.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Funds Not Held</h2>
            <p className="text-gray-800 dark:text-gray-300">
              EVA AI does not hold, custody, or control your funds. All money remains in your own bookmaker
              accounts. We cannot protect you from losses or bookmaker insolvency.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. System Limitations</h2>
            <p className="text-gray-800 dark:text-gray-300">
              Our automated system may experience technical issues, errors, or downtime. We are not liable for
              any losses resulting from system failures, bugs, or technical problems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Responsible Gambling</h2>
            <p className="text-gray-800 dark:text-gray-300">
              If you have a gambling problem or think you might, please seek help immediately. Resources are
              available through organizations like Gambling Help Online (1800 858 858) in Australia.
            </p>
          </section>

          <div className="bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-300 dark:border-yellow-800 rounded-lg p-6 mt-8">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">Final Warning</h3>
            <p className="text-yellow-800 dark:text-yellow-300">
              Only use EVA AI if you fully understand and accept these risks. Never bet more than you can
              afford to lose. Betting should be for entertainment purposes only, not a source of income.
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              By using EVA AI, you acknowledge that you have read, understood, and accept all risks outlined in
              this disclaimer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}