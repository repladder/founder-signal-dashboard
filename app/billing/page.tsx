'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { isAuthenticated } from '@/lib/auth';
import { fetchProfiles, createSubscription } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function BillingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data: profilesData } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
    enabled: mounted && isAuthenticated(),
  });

  const upgradeMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: (data) => {
      if (data.short_url) {
        window.open(data.short_url, '_blank');
        alert('Complete payment in the new window, then refresh this page.');
      }
    },
    onError: (error: any) => {
      alert('Error: ' + (error.response?.data?.error || error.message));
    },
  });

  if (!mounted || !isAuthenticated()) {
    return null;
  }

  const planName = profilesData?.plan_limit === 200 ? 'Free' : 
                  profilesData?.plan_limit === 1000 ? 'Basic' : 'Business';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <Topbar title="Billing" plan={planName} />

        <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-2xl">
          <h2 className="text-xl font-bold mb-6">Billing & Plans</h2>

          <div className="mb-6 p-4 bg-blue-50 rounded">
            <div className="text-sm text-gray-600">Current Plan</div>
            <div className="text-2xl font-bold">{planName}</div>
            <div className="text-sm text-gray-600 mt-2">
              {profilesData?.count || 0} / {profilesData?.plan_limit || 200} profiles used
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded p-4">
              <div className="font-bold text-lg">Basic Plan</div>
              <div className="text-gray-600">₹1,999/month</div>
              <div className="text-sm text-gray-600 mt-2">
                1,000 profiles • 24hr scans
              </div>
              <button
                onClick={() => upgradeMutation.mutate('basic')}
                disabled={upgradeMutation.isPending}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {upgradeMutation.isPending ? 'Processing...' : 'Upgrade to Basic'}
              </button>
            </div>

            <div className="border rounded p-4">
              <div className="font-bold text-lg">Business Plan</div>
              <div className="text-gray-600">₹6,999/month</div>
              <div className="text-sm text-gray-600 mt-2">
                10,000 profiles • 24hr scans
              </div>
              <button
                onClick={() => upgradeMutation.mutate('business')}
                disabled={upgradeMutation.isPending}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {upgradeMutation.isPending ? 'Processing...' : 'Upgrade to Business'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
