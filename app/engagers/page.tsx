'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { EngagerErrorBoundary } from '@/components/EngagerErrorBoundary';

const EngagerScanModal = dynamic(() => import('@/components/EngagerScanModal'), { ssr: false });
const EngagerResults = dynamic(() => import('@/components/EngagerResults'), { ssr: false });

export default function EngagersPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: scansData, refetch: refetchScans } = useQuery({
    queryKey: ['engager-scans'],
    queryFn: async () => {
      if (!isClient) return { success: true, scans: [] };
      
      const apiKey = localStorage.getItem('api_key');
      if (!apiKey) return { success: true, scans: [] };

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scans`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        if (!res.ok) return { success: true, scans: [] };
        return res.json();
      } catch {
        return { success: true, scans: [] };
      }
    },
    refetchInterval: 5000,
    enabled: isClient,
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

  if (!isClient) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-12 rounded-lg border text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const scans = scansData?.scans || [];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">LinkedIn Post Engagers</h1>
            <p className="text-gray-600">Extract engaged prospects from any LinkedIn post</p>
          </div>
          <button
            onClick={handleNewScan}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Scan
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <p className="text-sm text-blue-800">
            Paste a LinkedIn post URL, select engagement types (likes, comments, etc.), 
            and we'll extract all engaged users with complete profile information as CSV.
          </p>
        </div>

        {selectedScanId ? (
          <EngagerErrorBoundary
            fallback={
              <div className="bg-white p-12 rounded-lg border text-center">
                <p className="text-red-600 mb-4">Failed to load results</p>
                <button onClick={handleNewScan} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                  Back to Scans
                </button>
              </div>
            }
          >
            <EngagerResults scanId={selectedScanId} onNewScan={handleNewScan} />
          </EngagerErrorBoundary>
        ) : scans.length > 0 ? (
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Recent Scans</h2>
            </div>
            <div className="divide-y">
              {scans.map((scan: any) => (
                <div
                  key={scan.scan_id}
                  className="p-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedScanId(scan.scan_id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2 break-all">{scan.post_url}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-500">{scan.total_engagers || 0} engagers</span>
                        <span className="text-gray-500">
                          {new Date(scan.created_at).toLocaleDateString()}
                        </span>
                        {scan.status === 'completed' && <span className="text-green-600">✓ Complete</span>}
                        {scan.status === 'processing' && <span className="text-blue-600">⏳ Processing</span>}
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800">View →</button>
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
                Start by creating your first scan to extract engaged prospects
              </p>
              <button
                onClick={handleNewScan}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Your First Scan
              </button>
            </div>
          </div>
        )}

        {showModal && (
          <EngagerScanModal onClose={() => setShowModal(false)} onScanComplete={handleScanComplete} />
        )}
      </div>
    </div>
  );
}
