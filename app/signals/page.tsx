'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { isAuthenticated } from '@/lib/auth';
import { fetchEvents } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function SignalsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'7' | '30' | 'all'>('7');

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => fetchEvents({ limit: 100 }),
    enabled: mounted && isAuthenticated(),
  });

  if (!mounted || !isAuthenticated()) {
    return null;
  }

  let filteredEvents = eventsData?.events || [];
  if (filter !== 'all') {
    const daysAgo = new Date(Date.now() - parseInt(filter) * 24 * 60 * 60 * 1000);
    filteredEvents = filteredEvents.filter((e: any) => 
      new Date(e.detected_at) > daysAgo
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <Topbar title="Signals" />

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Detected Signals</h2>
            <select
              value={filter}
              onChange={(e: any) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <p className="text-gray-600">No signals detected yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Profile</th>
                    <th className="text-left py-2">Keyword</th>
                    <th className="text-left py-2">Snippet</th>
                    <th className="text-left py-2">Post</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event: any) => (
                    <tr key={event.id} className="border-b">
                      <td className="py-2">
                        <a
                          href={event.profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {event.profile.linkedin_url.split('/in/')[1]}
                        </a>
                      </td>
                      <td className="py-2">{event.keyword}</td>
                      <td className="py-2 text-gray-600 max-w-md truncate">
                        {event.snippet}
                      </td>
                      <td className="py-2">
                        <a
                          href={event.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      </td>
                      <td className="py-2 text-gray-600">
                        {new Date(event.detected_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
