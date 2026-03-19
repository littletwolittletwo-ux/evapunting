import { TrendingUp, DollarSign, Percent } from 'lucide-react';
import { ProfitTicker } from '../components/ProfitTicker';
import { useState, useEffect } from 'react';

export function PastPerformance() {
  const sampleData = [
    { month: 'January 2025', profit: 4250, roi: 8.2 },
    { month: 'December 2024', profit: 3890, roi: 7.5 },
    { month: 'November 2024', profit: 5120, roi: 9.8 },
    { month: 'October 2024', profit: 4650, roi: 8.9 },
    { month: 'September 2024', profit: 3720, roi: 7.1 },
    { month: 'August 2024', profit: 4980, roi: 9.5 },
  ];

  const avgMonthlyProfit = sampleData.reduce((sum, d) => sum + d.profit, 0) / sampleData.length;
  const avgROI = sampleData.reduce((sum, d) => sum + d.roi, 0) / sampleData.length;
  const totalProfit = sampleData.reduce((sum, d) => sum + d.profit, 0);

  const [displayAvgProfit, setDisplayAvgProfit] = useState(avgMonthlyProfit - 200);
  const [displayAvgROI, setDisplayAvgROI] = useState(avgROI - 1);
  const [displayTotalProfit, setDisplayTotalProfit] = useState(totalProfit - 1000);

  useEffect(() => {
    const profitInterval = setInterval(() => {
      setDisplayAvgProfit(prev => {
        if (prev >= avgMonthlyProfit) return prev + (Math.random() * 3 - 1.5);
        return prev + Math.random() * 8 + 2;
      });
    }, 1500);

    const roiInterval = setInterval(() => {
      setDisplayAvgROI(prev => {
        if (prev >= avgROI) return prev + (Math.random() * 0.05 - 0.025);
        return prev + Math.random() * 0.15 + 0.05;
      });
    }, 1500);

    const totalInterval = setInterval(() => {
      setDisplayTotalProfit(prev => {
        if (prev >= totalProfit) return prev + (Math.random() * 15 - 7.5);
        return prev + Math.random() * 40 + 15;
      });
    }, 1500);

    return () => {
      clearInterval(profitInterval);
      clearInterval(roiInterval);
      clearInterval(totalInterval);
    };
  }, [avgMonthlyProfit, avgROI, totalProfit]);

  return (
    <div className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:from-blue-300 dark:via-blue-200 dark:to-blue-100 bg-clip-text text-transparent mb-4">
            Past Performance
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Historical results from our automated betting system. Remember: past performance does not
            guarantee future returns.
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-gray-800 backdrop-blur-xl border border-yellow-200 dark:border-gray-700 rounded-xl p-6 mb-8 shadow-lg shadow-yellow-500/10 dark:shadow-none">
          <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 dark:bg-yellow-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500 dark:bg-yellow-400"></span>
            </span>
            Important Disclaimer
          </h3>
          <p className="text-yellow-700/80 dark:text-yellow-300/80 text-sm">
            The performance data shown below is for informational purposes only and represents historical
            results. Past performance does not guarantee future returns. All betting carries risk, and you
            could lose money. These results do not constitute financial or betting advice.
          </p>
        </div>

        <div className="mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 backdrop-blur-xl rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-300 dark:to-blue-200 bg-clip-text text-transparent mb-6">
              Live Community Performance
            </h2>
            <div className="max-w-md mx-auto">
              <ProfitTicker />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
              Real-time cumulative profit across all EVA AI users
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="group relative bg-gray-100 dark:bg-gray-800 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-500/50 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 dark:from-green-500/20 to-green-300/20 dark:to-green-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Monthly Profit</h3>
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 dark:from-green-300 dark:to-green-200 bg-clip-text text-transparent">
                ${displayAvgProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <div className="group relative bg-gray-100 dark:bg-gray-800 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500/50 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 dark:from-blue-500/20 to-blue-300/20 dark:to-blue-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Average ROI</h3>
                <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-300 dark:to-blue-200 bg-clip-text text-transparent">
                {displayAvgROI.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="group relative bg-gray-100 dark:bg-gray-800 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-500/50 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 dark:from-green-500/20 to-green-300/20 dark:to-green-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total 6-Month Profit</h3>
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 dark:from-green-300 dark:to-green-200 bg-clip-text text-transparent">
                ${displayTotalProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 backdrop-blur-xl rounded-xl shadow-xl p-6 mb-12 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-300 dark:to-blue-200 bg-clip-text text-transparent mb-6">
            Monthly Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-semibold text-blue-600 dark:text-blue-400 uppercase text-xs tracking-wider">Month</th>
                  <th className="text-right py-4 px-4 font-semibold text-blue-600 dark:text-blue-400 uppercase text-xs tracking-wider">Profit</th>
                  <th className="text-right py-4 px-4 font-semibold text-blue-600 dark:text-blue-400 uppercase text-xs tracking-wider">ROI</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-200/30 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100">{row.month}</td>
                    <td className="py-4 px-4 text-right font-semibold">
                      <span className="bg-gradient-to-r from-green-600 to-green-500 dark:from-green-300 dark:to-green-200 bg-clip-text text-transparent">
                        ${row.profit.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold">
                      <span className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-300 dark:to-blue-200 bg-clip-text text-transparent">
                        {row.roi}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-100/50 via-gray-100/30 to-gray-100/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 backdrop-blur-xl rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-300 dark:to-blue-200 bg-clip-text text-transparent mb-4">
            Performance Notes
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-300 dark:to-blue-200 rounded-full mt-2 flex-shrink-0 shadow-lg shadow-blue-500/50 dark:shadow-blue-300/50"></div>
              <p>Results are based on recommended deposit amounts across all 7 bookmakers.</p>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-300 dark:to-blue-200 rounded-full mt-2 flex-shrink-0 shadow-lg shadow-blue-500/50 dark:shadow-blue-300/50"></div>
              <p>Profits shown are before the 30% EVA AI performance fee.</p>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-300 dark:to-blue-200 rounded-full mt-2 flex-shrink-0 shadow-lg shadow-blue-500/50 dark:shadow-blue-300/50"></div>
              <p>Individual results may vary based on market conditions and account configurations.</p>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-300 dark:to-blue-200 rounded-full mt-2 flex-shrink-0 shadow-lg shadow-blue-500/50 dark:shadow-blue-300/50"></div>
              <p>ROI is calculated relative to total bankroll across all connected bookmakers.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}