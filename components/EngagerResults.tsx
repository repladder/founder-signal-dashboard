'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface EngagerResultsProps {
  scanId: string;
  onNewScan: () => void;
}

export default function EngagerResults({ scanId, onNewScan }: EngagerResultsProps) {
  const [filterReaction, setFilterReaction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: resultsData, isLoading } = useQuery({
    queryKey: ['engager-results', scanId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scanId}/results`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('api_key')}`
          }
        }
      );
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-lg border text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading results...</p>
      </div>
    );
  }

  if (!resultsData?.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">Failed to load results</p>
      </div>
    );
  }

  const engagers = resultsData.engagers || [];
  
  // Get unique reaction types for filter
  const reactionTypes = [...new Set(engagers.flatMap((e: any) =>
    e.reaction_type.split(', ') as string[]
  ))];

  // Filter engagers
  const filteredEngagers = engagers.filter((engager: any) => {
    const matchesReaction = filterReaction === 'all' || 
      engager.reaction_type.toLowerCase().includes(filterReaction.toLowerCase());
    
    const matchesSearch = searchTerm === '' ||
      engager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engager.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engager.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesReaction && matchesSearch;
  });

  const handleDownloadCSV = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scanId}/download`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">✅ Scan Complete!</h2>
            <p className="text-sm text-gray-600 mb-3 break-all">
              {resultsData.post_url}
            </p>
            <div className="flex gap-6 text-sm">
              <span className="text-gray-600">
                📊 <strong>{resultsData.total_engagers}</strong> total engagers
              </span>
              <span className="text-gray-600">
                👤 <strong>{resultsData.unique_profiles}</strong> unique profiles
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownloadCSV}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <span>⬇️</span>
            Download CSV
          </button>
          <button
            onClick={onNewScan}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Start New Scan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, title, or company..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterReaction('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterReaction === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {reactionTypes.map((reaction) => (
              <button
                key={reaction}
                onClick={() => setFilterReaction(reaction)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterReaction === reaction
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {reaction}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Showing {filteredEngagers.length} of {engagers.length} engagers
        </p>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEngagers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No engagers match your filters
                  </td>
                </tr>
              ) : (
                filteredEngagers.map((engager: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {engager.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {engager.reaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {engager.title || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {engager.company || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {engager.location || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={engager.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
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
