'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface EngagerResultsProps {
  scanId: string;
  onNewScan: () => void;
}

export default function EngagerResults({ scanId, onNewScan }: EngagerResultsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // First, check scan status
  const { data: statusData } = useQuery({
    queryKey: ['engager-status', scanId],
    queryFn: async () => {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('api_key') : null;
      if (!apiKey) throw new Error('No API key');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scanId}/status`,
        {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        }
      );
      if (!res.ok) throw new Error('Failed to fetch status');
      return res.json();
    },
    enabled: mounted,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  const isCompleted = statusData?.status === 'completed';

  // Only fetch results when scan is completed
  const { data: resultsData, isLoading: resultsLoading, error } = useQuery({
    queryKey: ['engager-results', scanId],
    queryFn: async () => {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('api_key') : null;
      if (!apiKey) throw new Error('No API key');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scanId}/results`,
        {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        }
      );
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: mounted && isCompleted, // Only fetch when completed
    retry: 1,
  });

  // Show loading state while processing
  if (!mounted || !statusData) {
    return (
      <div className="bg-white p-12 rounded-lg border text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Show processing state
  if (statusData.status === 'processing') {
    return (
      <div className="bg-white p-12 rounded-lg border text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-900 font-semibold mb-2">Processing scan...</p>
        {statusData.progress && (
          <div className="max-w-md mx-auto">
            <div className="text-sm text-gray-600 mb-4">
              <div>Reactions: {statusData.progress.reactions_scraped || 0}</div>
              <div>Profiles enriched: {statusData.progress.profiles_enriched || 0}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, ((statusData.progress.profiles_enriched || 0) / (statusData.progress.total || 1)) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show failed state
  if (statusData.status === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 mb-4">Scan failed</p>
        <button onClick={onNewScan} className="px-4 py-2 bg-blue-600 text-white rounded">
          Back to Scans
        </button>
      </div>
    );
  }

  // Show error state
  if (error || !resultsData?.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 mb-4">Failed to load results</p>
        <button onClick={onNewScan} className="px-4 py-2 bg-blue-600 text-white rounded">
          Back to Scans
        </button>
      </div>
    );
  }

  const engagers = Array.isArray(resultsData.engagers) ? resultsData.engagers : [];

  const handleDownload = () => {
    const apiKey = localStorage.getItem('api_key');
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scanId}/download?api_key=${apiKey}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-2">✅ Enrichment Complete!</h2>
        <p className="text-sm text-gray-600 mb-3 break-all">{resultsData.post_url || 'LinkedIn Post'}</p>
        <div className="flex gap-6 text-sm flex-wrap mb-4">
          <span className="text-gray-600">📊 <strong>{resultsData.total_engagers || 0}</strong> total</span>
          <span className="text-gray-600">👤 <strong>{resultsData.unique_profiles || 0}</strong> unique</span>
          <span className="text-gray-600">✅ <strong>{resultsData.profiles_enriched || 0}</strong> enriched</span>
          <span className="text-gray-600">🏢 <strong>{resultsData.companies_enriched || 0}</strong> companies</span>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownload} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            ⬇️ Download CSV
          </button>
          <button onClick={onNewScan} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            New Scan
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reaction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {engagers.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No results</td></tr>
              ) : (
                engagers.map((e: any, i: number) => (
                  <tr key={`engager-${i}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{e.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-xs">{e.job_title || '-'}</td>
                    <td className="px-4 py-3 text-xs">
                      {e.company_name ? (
                        e.company_profile_url ? (
                          <a href={e.company_profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {e.company_name}
                          </a>
                        ) : e.company_name
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs">{e.industry || '-'}</td>
                    <td className="px-4 py-3 text-xs">{e.employee_size || '-'}</td>
                    <td className="px-4 py-3 text-xs">{e.company_location || e.location || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {e.reaction_type || 'Like'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={e.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                        View →
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
