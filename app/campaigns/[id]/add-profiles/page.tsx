'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAuthenticated } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import SignalBadge from '@/components/SignalBadge';

export default function AddProfilesPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const campaignId = params.id as string;
  const [mounted, setMounted] = useState(false);
  const [linkedinUrls, setLinkedinUrls] = useState('');

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Fetch campaign details
  const { data: campaignData, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('api_key')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch campaign');
      return res.json();
    },
    enabled: mounted && isAuthenticated()
  });

  const addProfilesMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/campaigns/${campaignId}/profiles`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('api_key')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ linkedin_urls: urls })
        }
      );
      if (!res.ok) throw new Error('Failed to add profiles');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      // Navigate to campaign detail page to see real-time results
      router.push(`/campaigns/${campaignId}`);
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
  });

  const handleAddProfiles = () => {
    const urls = linkedinUrls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u && u.includes('linkedin.com/in/'));

    if (urls.length === 0) {
      alert('Please enter at least one valid LinkedIn URL');
      return;
    }

    addProfilesMutation.mutate(urls);
  };

  if (!mounted || !isAuthenticated()) return null;

  const campaign = campaignData?.campaign;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-64 p-8">
        <Topbar title="Add Profiles to Campaign" />

        {/* Campaign Info */}
        {isLoading ? (
          <div className="bg-white p-6 rounded-lg border mb-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ) : campaign ? (
          <div className="bg-white p-6 rounded-lg border mb-6">
            <h2 className="text-xl font-bold mb-2">{campaign.name}</h2>
            {campaign.description && (
              <p className="text-gray-600 mb-4">{campaign.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {campaign.signal_types.map((signal: string) => (
                <SignalBadge key={signal} type={signal} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Add Profiles Form */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-2">Add LinkedIn Profiles</h3>
          <p className="text-sm text-gray-600 mb-4">
            Paste LinkedIn profile URLs (one per line). Scanning will start automatically.
          </p>

          <textarea
            value={linkedinUrls}
            onChange={(e) => setLinkedinUrls(e.target.value)}
            rows={12}
            placeholder={`https://www.linkedin.com/in/profile1\nhttps://www.linkedin.com/in/profile2\nhttps://www.linkedin.com/in/profile3`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm mb-4"
            disabled={addProfilesMutation.isPending}
          />

          <div className="flex items-center gap-4">
            <button
              onClick={handleAddProfiles}
              disabled={addProfilesMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {addProfilesMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding Profiles...
                </>
              ) : (
                <>
                  <span>📊</span>
                  Add Profiles & Start Scanning
                </>
              )}
            </button>

            <button
              onClick={() => router.push('/campaigns')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={addProfilesMutation.isPending}
            >
              Cancel
            </button>
          </div>

          {addProfilesMutation.isPending && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ⏳ Adding profiles and starting background scan...
                You'll be redirected to view results in real-time.
              </p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-2">💡 Tips:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• URLs must be in format: https://www.linkedin.com/in/username</li>
            <li>• You can add multiple profiles at once (one per line)</li>
            <li>• Scanning happens in the background (takes 1-2 minutes per profile)</li>
            <li>• Results will appear in real-time on the campaign page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
