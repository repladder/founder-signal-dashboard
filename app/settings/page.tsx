

'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { isAuthenticated, getApiKey } from '@/lib/auth';
import { configureWebhook } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const webhookMutation = useMutation({
    mutationFn: configureWebhook,
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleSaveWebhook = () => {
    if (!webhookUrl.trim()) {
      alert('Please enter a webhook URL');
      return;
    }
    webhookMutation.mutate(webhookUrl);
  };

  const handleCopyApiKey = () => {
    const key = getApiKey();
    if (key) {
      navigator.clipboard.writeText(key);
      alert('API key copied to clipboard!');
    }
  };

  if (!mounted || !isAuthenticated()) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Topbar title="Settings" />

          <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Settings</h2>

            {showSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">
                Webhook saved successfully!
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Webhook URL (Optional)
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-app.com/webhook"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <button
                onClick={handleSaveWebhook}
                disabled={webhookMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {webhookMutation.isPending ? 'Saving...' : 'Save Webhook'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your API Key
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={getApiKey() || ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50"
                />
                <button
                  onClick={handleCopyApiKey}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
