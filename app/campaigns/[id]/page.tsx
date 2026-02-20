'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { isAuthenticated, getApiKey } from '@/lib/auth';
import { fetchCampaign, fetchCampaignSignals, addProfilesToCampaign } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import SignalCard from '@/components/SignalCard';
import SignalBadge from '@/components/SignalBadge';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://linkedin-signal-monitor-egerrg.up.railway.app';

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  const [mounted, setMounted] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);
  const [liveStatus, setLiveStatus] = useState('Connecting...');
  const [showAddProfiles, setShowAddProfiles] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => fetchCampaign(campaignId),
    enabled: mounted && isAuthenticated()
  });

  const { data: signalsData } = useQuery({
    queryKey: ['campaign-signals', campaignId],
    queryFn: () => fetchCampaignSignals(campaignId),
    enabled: mounted && isAuthenticated()
  });

  useEffect(() => {
    if (signalsData?.signals) {
      setSignals(signalsData.signals);
    }
  }, [signalsData]);

  // Real-time SSE connection
  useEffect(() => {
    if (!campaignId || !mounted || !isAuthenticated()) return;

    const apiKey = getApiKey();
    const eventSource = new EventSource(
      `${API_BASE_URL}/campaigns/${campaignId}/stream?token=${apiKey}`
    );

    eventSource.onopen = () => {
      setLiveStatus('● Live');
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'signal_detected') {
        setSignals(prev => [data.data, ...prev]);
      }
    };

    eventSource.onerror = () => {
      setLiveStatus('Reconnecting...');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [campaignId, mounted]);

  const handleAddProfiles = async () => {
    const urls = urlInput
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (urls.length === 0) return;

    setAdding(true);
    try {
      await addProfilesToCampaign(campaignId, urls);
      setUrlInput('');
      setShowAddProfiles(false);
    } catch (err) {
      console.error('Failed to add profiles:', err);
    } finally {
      setAdding(false);
    }
  };

  if (!mounted || !isAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-64 p-8">
        <Topbar title={campaign?.campaign?.name || 'Campaign'} />

        {campaign?.campaign && (
          <div className="bg-white p-6 rounded-lg border mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">{campaign.campaign.name}</h2>
                <span className="text-green-600 text-sm font-medium">{liveStatus}</span>
              </div>
              <button
                onClick={() => setShowAddProfiles(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
              >
                + Add Profiles
              </button>
            </div>

            {campaign.campaign.description && (
              <p className="text-gray-600 mb-4">{campaign.campaign.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {campaign.campaign.signal_types.map((signal: string) => (
                <SignalBadge key={signal} type={signal} />
              ))}
            </div>

            <div className="flex gap-6 text-sm text-gray-600">
              <span>📊 {campaign.campaign.profile_count} profiles</span>
              <span>🎯 {campaign.campaign.signals_detected} signals detected</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {signals.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border text-center">
              <p className="text-gray-600">No signals detected yet. Scanning in progress...</p>
            </div>
          ) : (
            signals.map(signal => (
              <SignalCard
                key={signal.profile_id}
                profile={signal}
                posts={signal.posts || []}
              />
            ))
          )}
        </div>
      </div>

      {showAddProfiles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add LinkedIn Profiles</h2>
            <p className="text-sm text-gray-600 mb-4">One URL per line</p>
            <textarea
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={6}
              placeholder="https://linkedin.com/in/john-doe&#10;https://linkedin.com/in/jane-smith"
            />
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setShowAddProfiles(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProfiles}
                disabled={adding || !urlInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : 'Add Profiles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
