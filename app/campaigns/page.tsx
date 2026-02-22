'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAuthenticated } from '@/lib/auth';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import SignalBadge from '@/components/SignalBadge';

export default function CampaignsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [selectedSignals, setSelectedSignals] = useState<string[]>(['track_all']);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/campaigns`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('api_key')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      return res.json();
    },
    enabled: mounted && isAuthenticated()
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; signal_types: string[] }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('api_key')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create campaign');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowCreateModal(false);
      // ✅ REDIRECT TO ADD PROFILES PAGE
      router.push(`/campaigns/${data.campaign.id}/add-profiles`);
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
  });

  const handleCreateCampaign = () => {
    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    if (selectedSignals.length === 0) {
      alert('Please select at least one signal type');
      return;
    }

    createCampaignMutation.mutate({
      name: campaignName,
      description: campaignDescription,
      signal_types: selectedSignals
    });
  };

  const toggleSignal = (signal: string) => {
    setSelectedSignals(prev =>
      prev.includes(signal)
        ? prev.filter(s => s !== signal)
        : [...prev, signal]
    );
  };

  if (!mounted || !isAuthenticated()) return null;

  const signalOptions = [
    { value: 'track_all', icon: '🔥', label: 'Track All Signals' },
    { value: 'funding', icon: '💰', label: 'Funding' },
    { value: 'hiring_sales', icon: '👔', label: 'Sales Hiring' },
    { value: 'hiring', icon: '🎯', label: 'Hiring (General)' },
    { value: 'new_role', icon: '🆕', label: 'New Role' },
    { value: 'launch', icon: '🚀', label: 'Launch' },
    { value: 'expansion', icon: '🌍', label: 'Expansion' }
  ];

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
        <Topbar title="Campaigns" />

        <button
          onClick={() => setShowCreateModal(true)}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          Create Campaign
        </button>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : campaignsData?.campaigns?.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border text-center">
            <p className="text-gray-600 mb-4">No campaigns yet. Create your first campaign to start monitoring LinkedIn signals!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
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
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                  <span>🎯 {campaign.signals_detected} signals detected</span>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Campaign</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., SaaS Founders Hiring Sales"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={createCampaignMutation.isPending}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
                placeholder="Brief description of this campaign..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={createCampaignMutation.isPending}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Select Signal Types *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {signalOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleSignal(option.value)}
                    disabled={createCampaignMutation.isPending}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      selectedSignals.includes(option.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateCampaign}
                disabled={createCampaignMutation.isPending}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCampaignName('');
                  setCampaignDescription('');
                  setSelectedSignals(['track_all']);
                }}
                disabled={createCampaignMutation.isPending}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
