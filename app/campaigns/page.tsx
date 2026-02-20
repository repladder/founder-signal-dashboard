'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAuthenticated } from '@/lib/auth';
import { fetchCampaigns, createCampaign } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import SignalBadge from '@/components/SignalBadge';
import { SIGNAL_CONFIG } from '@/lib/signal-config';

const SIGNAL_OPTIONS = Object.entries(SIGNAL_CONFIG).map(([value, config]) => ({
  value,
  label: `${config.icon} ${config.label}`
}));

export default function CampaignsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', description: '', signal_types: [] as string[] });

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
    enabled: mounted && isAuthenticated()
  });

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowCreateModal(false);
      setNewCampaign({ name: '', description: '', signal_types: [] });
    }
  });

  const toggleSignalType = (type: string) => {
    setNewCampaign(prev => ({
      ...prev,
      signal_types: prev.signal_types.includes(type)
        ? prev.signal_types.filter(t => t !== type)
        : [...prev.signal_types, type]
    }));
  };

  if (!mounted || !isAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-64 p-8">
        <Topbar title="Campaigns" />

        <button
          onClick={() => setShowCreateModal(true)}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Campaign
        </button>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {campaignsData?.campaigns?.length === 0 && (
              <div className="bg-white p-12 rounded-lg border text-center">
                <p className="text-gray-600">No campaigns yet. Create your first one!</p>
              </div>
            )}
            {campaignsData?.campaigns?.map((campaign: any) => (
              <div
                key={campaign.id}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{campaign.name}</h3>
                    {campaign.description && (
                      <p className="text-gray-600 text-sm">{campaign.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      campaign.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {campaign.signal_types.map((signal: string) => (
                    <SignalBadge key={signal} type={signal} size="sm" />
                  ))}
                </div>

                <div className="flex gap-6 text-sm text-gray-600">
                  <span>📊 {campaign.profile_count} profiles</span>
                  <span>🎯 {campaign.signals_detected} signals</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Create Campaign</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={newCampaign.name}
                onChange={e => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Series A Founders"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newCampaign.description}
                onChange={e => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Optional description"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Signal Types *</label>
              <div className="flex flex-wrap gap-2">
                {SIGNAL_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleSignalType(option.value)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      newCampaign.signal_types.includes(option.value)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(newCampaign)}
                disabled={!newCampaign.name || newCampaign.signal_types.length === 0 || createMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
