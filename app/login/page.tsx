

'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setApiKey } from '@/lib/auth';
import { fetchProfiles } from '@/lib/api';

export default function LoginPage() {
  const [apiKey, setApiKeyInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!apiKey.trim()) {
      setError('Please enter your API key');
      setLoading(false);
      return;
    }

    try {
      // Set the API key temporarily
      setApiKey(apiKey.trim());
      
      // Test the API key
      await fetchProfiles();
      
      // If successful, redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid API key. Please check and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Founder Signal Dashboard</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
              API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="lsm_your_api_key_here"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600 mb-2">Get your API key from Supabase:</p>
          <code className="text-xs bg-white p-2 rounded block">
            SELECT api_key FROM users WHERE email='your@email.com';
          </code>
        </div>
      </div>
    </div>
  );
}
