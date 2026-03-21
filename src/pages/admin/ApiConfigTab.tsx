import { useEffect, useState } from 'react';
import { Loader2, Check, Settings, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ApiConfigTab() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['betting_api_url', 'betting_api_key']);

      if (error) throw error;

      data?.forEach((row) => {
        if (row.key === 'betting_api_url') setApiUrl(row.value || '');
        if (row.key === 'betting_api_key') setApiKey(row.value || '');
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }

  function validateUrl(url: string): string | null {
    if (!url.trim()) return 'API Base URL is required.';
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return 'URL must start with http:// or https://';
    } catch {
      return 'Please enter a valid URL (e.g. https://api.example.com).';
    }
    return null;
  }

  function validateApiKey(key: string): string | null {
    if (!key.trim()) return 'API Key is required.';
    if (key.trim().length < 8) return 'API Key seems too short (minimum 8 characters).';
    return null;
  }

  async function saveSettings() {
    setSaving(true);
    setMessage(null);

    const urlErr = validateUrl(apiUrl);
    if (urlErr) {
      setMessage({ type: 'error', text: urlErr });
      setSaving(false);
      return;
    }
    const keyErr = validateApiKey(apiKey);
    if (keyErr) {
      setMessage({ type: 'error', text: keyErr });
      setSaving(false);
      return;
    }

    try {
      const { error: urlError } = await supabase
        .from('admin_settings')
        .upsert({ key: 'betting_api_url', value: apiUrl.trim() }, { onConflict: 'key' });
      if (urlError) throw urlError;

      const { error: keyError } = await supabase
        .from('admin_settings')
        .upsert({ key: 'betting_api_key', value: apiKey.trim() }, { onConflict: 'key' });
      if (keyError) throw keyError;

      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setMessage(null);

    const urlErr = validateUrl(apiUrl);
    if (urlErr) {
      setMessage({ type: 'error', text: `Save a valid API URL before testing. ${urlErr}` });
      setTesting(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('sync-user-balances', {
        body: { test: true },
      });
      if (error) throw error;
      setMessage({ type: 'success', text: `Connection test successful. ${data?.message || ''}` });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Connection test failed: ${msg}` });
    } finally {
      setTesting(false);
    }
  }

  async function syncAllUsers() {
    setSyncing(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke('sync-user-balances');
      if (error) throw error;
      setMessage({ type: 'success', text: `Sync complete. ${data?.message || ''}` });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Sync failed: ${msg}` });
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-gray-100 dark:bg-gray-800/30 rounded-xl shadow-xl border border-gray-300 dark:border-gray-700/50 p-6 space-y-6">
        {/* API Base URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Base URL
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://api.example.com"
            className="bg-gray-100 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-500 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API key..."
            autoComplete="off"
            className="bg-gray-100 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-500 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-blue-600 focus:border-transparent transition-all"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Minimum 8 characters. Stored securely in the database.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 dark:shadow-blue-600/20"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save
          </button>
          <button
            onClick={testConnection}
            disabled={testing}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
            Test Connection
          </button>
          <button
            onClick={syncAllUsers}
            disabled={syncing}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20 dark:shadow-green-600/20"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync All Users Now
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30'
                : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
