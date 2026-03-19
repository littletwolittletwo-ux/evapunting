import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProfitHistoryPoint } from '../services/analyticsService';
import { useTheme } from '../contexts/ThemeContext';

interface ProfitHistoryChartProps {
  data: ProfitHistoryPoint[];
}

export function ProfitHistoryChart({ data }: ProfitHistoryChartProps) {
  const { isDarkMode } = useTheme();

  const formattedData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    profit: point.profit,
  }));

  const minProfit = Math.min(...data.map((d) => d.profit));
  const maxProfit = Math.max(...data.map((d) => d.profit));

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isDarkMode ? '#10b981' : '#3b82f6'}
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor={isDarkMode ? '#10b981' : '#3b82f6'}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? '#374151' : '#e5e7eb'}
            opacity={0.01}
          />
          <XAxis
            dataKey="date"
            stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 12 }}
            tickLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
          />
          <YAxis
            stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 12 }}
            tickLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
            domain={[minProfit < 0 ? minProfit - 10 : 0, maxProfit + 10]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDarkMode ? '#e5e7eb' : '#111827',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{
              color: isDarkMode ? '#10b981' : '#3b82f6',
              fontWeight: '600',
            }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Profit']}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke={isDarkMode ? '#10b981' : '#3b82f6'}
            strokeWidth={2}
            fill="url(#profitGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
