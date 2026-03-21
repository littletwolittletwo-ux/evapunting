import { useState } from 'react';
import { Users, Receipt, Settings, Wallet } from 'lucide-react';
import type { TabKey } from './admin/types';
import { UsersTab } from './admin/UsersTab';
import { BillingTab } from './admin/BillingTab';
import { ApiConfigTab } from './admin/ApiConfigTab';
import { BalancesTab } from './admin/BalancesTab';

const TABS: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'billing', label: 'Billing', icon: Receipt },
  { key: 'apiconfig', label: 'API Config', icon: Settings },
  { key: 'balances', label: 'Balances', icon: Wallet },
];

export function Admin() {
  const [activeTab, setActiveTab] = useState<TabKey>('users');

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-300 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6">
          Admin Panel
        </h1>

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-300 dark:border-gray-700/50 pb-4">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg shadow-blue-500/50 dark:shadow-blue-600/50'
                  : 'bg-gray-200 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'billing' && <BillingTab />}
        {activeTab === 'apiconfig' && <ApiConfigTab />}
        {activeTab === 'balances' && <BalancesTab />}
      </div>
    </div>
  );
}
