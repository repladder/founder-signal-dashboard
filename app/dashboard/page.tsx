

'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { isAuthenticated } from '@/lib/auth';
import { fetchProfiles, fetchEvents } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatsCard from '@/components/StatsCard';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
    enabled: mounted && isAuthenticated(),
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => fetchEvents({ limit: 100 }),
    enabled: mounted && isAuthenticated(),
  });

  if (!mounted || !isAuthenticated()) {
    return null;
  }

  // Calculate signals from last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSignals = eventsData?.events?.filter((e: any) => 
    new Date(e.detected_at) > sevenDaysAgo
  ) || [];

  const planName = profilesData?.plan_limit === 200 ? 'Free' : 
                  profilesData?.plan_limit === 1000 ? 'Basic' : 'Business';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <Topbar title="Dashboard" plan={planName} />

        {profilesLoading || eventsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                label="Profiles Monitored"
                value={`${profilesData?.count || 0} / ${profilesData?.plan_limit || 200}`}
              />
              <StatsCard
                label="Signals (Last 7 Days)"
                value={recentSignals.length}
              />
              <StatsCard
                label="Current Plan"
                value={planName}
              />
            </div>

            {profilesData?.plan_limit === 200 && (
              <Link
                href="/billing"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade Plan
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
