'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import EngagerScanModal from '@/components/EngagerScanModal';
import EngagerResults from '@/components/EngagerResults';

export default function EngagersPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Fix: Only access localStorage after mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch recent scans
  const { data: scansData, refetch: refetchScans } = useQuery({
    queryKey: ['engager-scans'],
    queryFn: async () => {
      // Only fetch if we're on client and have API key
      if (!isClient) return { success: true, scans: [] };

      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('api_key') : null;
      if (!apiKey) return { success: true, scans: [] };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scans`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      if (!res.ok) return { success: true, scans: [] };
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: isClient // Only run query on client
  });

  const handleScanComplete = (scanId: string) => {
    setShowModal(false);
    setSelectedScanId(scanId);
    refetchScans();
  };

  const handleNewScan = () => {
    setSelectedScanId(null);
    setShowModal(true);
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">LinkedIn Post Engagers</h1>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const scans = scansData?.scans || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-64 p-8">
        <Topbar title="Engagers" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">LinkedIn Post Engagers</h1>
            <p className="text-gray-600">
              Extract engaged prospects from any LinkedIn post
            </p>
          </div>
          <button
            onClick={handleNewScan}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Scan
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <p className="text-sm text-blue-800">
            Paste a LinkedIn post URL, select engagement types (likes, comments, etc.),
            and we'll extract all engaged users with their complete profile information
            as a CSV file for your outbound campaigns.
          </p>
        </div>

        {/* Content */}
        {selectedScanId ? (
          <EngagerResults
            scanId={selectedScanId}
            onNewScan={handleNewScan}
          />
        ) : scans.length > 0 ? (
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Recent Scans</h2>
            </div>
            <div className="divide-y">
              {scans.map((scan: any) => (
                <div
                  key={scan.scan_id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => setSelectedScanId(scan.scan_id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2 break-all">
                        {scan.post_url}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-500">
                          {scan.total_engagers || 0} engagers
                        </span>
                        <span className="text-gray-500">
                          {new Date(scan.created_at).toLocaleString()}
                        </span>
                        {scan.status === 'completed' && (
                          <span className="text-green-600 font-medium">
                            ✓ Complete
                          </span>
                        )}
                        {scan.status === 'processing' && (
                          <span className="text-blue-600 font-medium">
                            ⏳ Processing...
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800">
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">No scans yet</h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first scan to extract engaged prospects from LinkedIn posts
              </p>
              <button
                onClick={handleNewScan}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Start Your First Scan
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <EngagerScanModal
            onClose={() => setShowModal(false)}
            onScanComplete={handleScanComplete}
          />
        )}
      </div>
    </div>
  );
}
