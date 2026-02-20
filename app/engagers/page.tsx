'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAuthenticated } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import EngagerScanModal from '@/components/EngagerScanModal';
import EngagerResults from '@/components/EngagerResults';

export default function EngagersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Fetch recent scans
  const { data: scansData } = useQuery({
    queryKey: ['engager-scans'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scans`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('api_key')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch scans');
      return res.json();
    },
    enabled: mounted && isAuthenticated(),
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const handleScanComplete = (scanId: string) => {
    setShowScanModal(false);
    setActiveScanId(scanId);
    queryClient.invalidateQueries({ queryKey: ['engager-scans'] });
  };

  const handleNewScan = () => {
    setActiveScanId(null);
    setShowScanModal(true);
  };

  if (!mounted || !isAuthenticated()) return null;

  const recentScans = scansData?.scans || [];
  const completedScans = recentScans.filter((s: any) => s.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <Topbar title="Engagers" />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">LinkedIn Post Engagers</h1>
              <p className="text-gray-600">
                Extract engaged prospects from any LinkedIn post
              </p>
            </div>
            <button
              onClick={handleNewScan}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <span>+</span>
              New Scan
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
              <p className="text-sm text-blue-800">
                Paste a LinkedIn post URL, select engagement types (likes, comments, etc.), 
                and we'll extract all engaged users with their profile information. 
                Download as CSV for outreach.
              </p>
            </div>
          </div>
        </div>

        {/* Active Scan Results */}
        {activeScanId && (
          <div className="mb-6">
            <EngagerResults scanId={activeScanId} onNewScan={handleNewScan} />
          </div>
        )}

        {/* Recent Scans */}
        {completedScans.length > 0 && !activeScanId && (
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Scans (Last Hour)</h2>
            <div className="grid gap-4">
              {completedScans.map((scan: any) => (
                <div
                  key={scan.scan_id}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setActiveScanId(scan.scan_id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          Completed
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(scan.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 truncate">
                        {scan.post_url}
                      </p>
                      <div className="flex gap-6 text-sm text-gray-600">
                        <span>📊 {scan.total_engagers} engagers</span>
                        <span>👤 {scan.unique_profiles} unique profiles</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scan.scan_id}/download`,
                          '_blank'
                        );
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Download CSV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {completedScans.length === 0 && !activeScanId && (
          <div className="bg-white p-12 rounded-lg border text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">No scans yet</h3>
            <p className="text-gray-600 mb-6">
              Start your first scan to extract engaged prospects from LinkedIn posts
            </p>
            <button
              onClick={handleNewScan}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Your First Scan
            </button>
          </div>
        )}
      </div>

      {/* Scan Modal */}
      {showScanModal && (
        <EngagerScanModal
          onClose={() => setShowScanModal(false)}
          onScanComplete={handleScanComplete}
        />
      )}
    </div>
  );
}
