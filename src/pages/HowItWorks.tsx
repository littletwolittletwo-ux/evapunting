import { Link } from 'react-router-dom';
import { UserPlus, DollarSign, Link as LinkIcon, Bot, LineChart } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: 'Create Your Accounts',
      description:
        'Sign up with the supported Australian bookmakers (Sportsbet, PointsBet, TAB, Neds, Ladbrokes, Betr, Boombet). Each bookmaker offers unique opportunities.',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: DollarSign,
      title: 'Fund Your Accounts',
      description:
        'Deposit the recommended amounts into each bookmaker account. These funds stay in your accounts - we never hold or touch your money.',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: LinkIcon,
      title: 'Connect to EVA AI',
      description:
        'Provide your account credentials through our secure platform. We manually integrate your accounts into our automated system.',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Bot,
      title: 'EVA AI Takes Over',
      description:
        'Our intelligent system monitors markets 24/7, identifies positive expected value bets, and places them automatically on your behalf.',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: LineChart,
      title: 'Track Your Performance',
      description:
        'Monitor your profits in real-time through our dashboard. View per-bookmaker breakdowns, historical charts, and your 70% share after our 30% fee.',
      gradient: 'from-blue-500 to-blue-600',
    },
  ];

  return (
    <div className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-500 dark:to-green-500 bg-clip-text text-transparent mb-4">
            How EVA AI Works
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Get started with automated +EV betting in five simple steps. Our system handles everything while
            you track your results.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-start space-x-6 group">
                <div className="flex-shrink-0">
                  <div className={`relative flex items-center justify-center w-16 h-16 bg-gradient-to-r ${step.gradient} text-white rounded-full text-2xl font-bold shadow-lg`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${step.gradient} rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                    <span className="relative">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-800/30 backdrop-blur-xl p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all group-hover:transform group-hover:scale-[1.02]">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 bg-gradient-to-r ${step.gradient} bg-opacity-10 rounded-lg`}>
                      <Icon className={`h-8 w-8 bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-lg">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-gray-50 dark:bg-gray-800/30 backdrop-blur-xl rounded-xl p-8 border border-gray-200 dark:border-gray-700/50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-500 dark:to-green-500 bg-clip-text text-transparent mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-900/30 backdrop-blur-xl rounded-lg p-5 border border-gray-200 dark:border-gray-700/30 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all">
              <h3 className="font-semibold text-blue-600 dark:text-blue-500 mb-2">Do you hold my funds?</h3>
              <p className="text-gray-700 dark:text-gray-300">
                No. All funds remain in your own bookmaker accounts. We never hold, transfer, or touch your
                money. EVA AI is purely an automation tool.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900/30 backdrop-blur-xl rounded-lg p-5 border border-gray-200 dark:border-gray-700/30 hover:border-green-500/30 dark:hover:border-green-500/30 transition-all">
              <h3 className="font-semibold text-green-600 dark:text-green-500 mb-2">How does the pricing work?</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We charge a monthly subscription fee plus 30% of profits generated. You keep 70% of all
                profits. If there are no profits, you only pay the subscription.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900/30 backdrop-blur-xl rounded-lg p-5 border border-gray-200 dark:border-gray-700/30 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all">
              <h3 className="font-semibold text-blue-600 dark:text-blue-500 mb-2">Is this legal?</h3>
              <p className="text-gray-700 dark:text-gray-300">
                EVA AI is an automation tool that places bets on your behalf based on mathematical analysis. We
                do not act as a bookmaker or provide betting advice. Users remain responsible for compliance
                with local laws.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900/30 backdrop-blur-xl rounded-lg p-5 border border-gray-200 dark:border-gray-700/30 hover:border-green-500/30 dark:hover:border-green-500/30 transition-all">
              <h3 className="font-semibold text-green-600 dark:text-green-500 mb-2">What are the risks?</h3>
              <p className="text-gray-700 dark:text-gray-300">
                All betting carries risk. While our system focuses on +EV opportunities, past performance does
                not guarantee future returns. You could lose money. Never bet more than you can afford to lose.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/signup"
            className="relative inline-block px-8 py-3 rounded-lg text-lg font-semibold text-white overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-500 dark:to-green-500 transition-transform group-hover:scale-105"></div>
            <span className="relative">Get Started with EVA AI</span>
          </Link>
        </div>
      </div>
    </div>
  );
}