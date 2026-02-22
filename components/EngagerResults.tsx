'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface EngagerResultsProps {
  scanId: string;
  onNewScan: () => void;
}

export default function EngagerResults({ scanId, onNewScan }: EngagerResultsProps) {
  const [filterReaction, setFilterReaction] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [filterEmployeeSize, setFilterEmployeeSize] = useState<string>('all');
  const [filterCompanyLocation, setFilterCompanyLocation] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: resultsData, isLoading } = useQuery({
    queryKey: ['engager-results', scanId],
    queryFn: async () => {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('api_key') : null;
      if (!apiKey) throw new Error('No API key');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scanId}/results`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json();
    },
    enabled: mounted
  });

  if (!mounted || isLoading) {
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
  
  const reactionTypes = [...new Set(engagers.flatMap((e: any) => 
    e.reaction_type.split(', ')
  ))];
  
  const industries = [...new Set(engagers
    .map((e: any) => e.industry)
    .filter((i: string) => i)
  )];
  
  const employeeSizes = [...new Set(engagers
    .map((e: any) => e.employee_size)
    .filter((s: string) => s)
  )];

  const companyLocations = [...new Set(engagers
    .map((e: any) => e.company_location)
    .filter((l: string) => l)
  )];

  const filteredEngagers = engagers.filter((engager: any) => {
    const matchesReaction = filterReaction === 'all' || 
      engager.reaction_type.toLowerCase().includes(filterReaction.toLowerCase());
    
    const matchesIndustry = filterIndustry === 'all' ||
      engager.industry === filterIndustry;
    
    const matchesEmployeeSize = filterEmployeeSize === 'all' ||
      engager.employee_size === filterEmployeeSize;

    const matchesCompanyLocation = filterCompanyLocation === 'all' ||
      engager.company_location === filterCompanyLocation;
    
    const matchesSearch = searchTerm === '' ||
      engager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engager.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engager.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engager.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesReaction && matchesIndustry && matchesEmployeeSize && 
           matchesCompanyLocation && matchesSearch;
  });

  const handleDownloadCSV = () => {
    const apiKey = localStorage.getItem('api_key');
    window.open(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scanId}/download?api_key=${apiKey}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">✅ Enrichment Complete!</h2>
            <p className="text-sm text-gray-600 mb-3 break-all">
              {resultsData.post_url}
            </p>
            <div className="flex gap-6 text-sm flex-wrap">
              <span className="text-gray-600">
                📊 <strong>{resultsData.total_engagers || 0}</strong> total
              </span>
              <span className="text-gray-600">
                👤 <strong>{resultsData.unique_profiles || 0}</strong> unique
              </span>
              <span className="text-gray-600">
                ✅ <strong>{resultsData.profiles_enriched || 0}</strong> enriched
              </span>
              <span className="text-gray-600">
                🏢 <strong>{resultsData.companies_enriched || 0}</strong> companies
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
            New Scan
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold mb-4">🎯 Filter by ICP</h3>
        
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Reaction</label>
            <select
              value={filterReaction}
              onChange={(e) => setFilterReaction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All</option>
              {reactionTypes.map((r: any) => (
                <option key={String(r)} value={String(r)}>{String(r)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All</option>
              {industries.map((i: any) => (
                <option key={String(i)} value={String(i)}>{String(i)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Size</label>
            <select
              value={filterEmployeeSize}
              onChange={(e) => setFilterEmployeeSize(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All</option>
              {employeeSizes.map((s: any) => (
                <option key={String(s)} value={String(s)}>{String(s)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Co. Location</label>
            <select
              value={filterCompanyLocation}
              onChange={(e) => setFilterCompanyLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All</option>
              {companyLocations.map((l: any) => (
                <option key={String(l)} value={String(l)}>{String(l)}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Showing {filteredEngagers.length} of {engagers.length}
        </p>
      </div>

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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Co. Loc</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Person</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conns</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reaction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEngagers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    No results
                  </td>
                </tr>
              ) : (
                filteredEngagers.map((e: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{e.name}</td>
                    <td className="px-4 py-3">{e.job_title || '-'}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-xs">{e.company_location || '-'}</td>
                    <td className="px-4 py-3 text-xs">{e.location || '-'}</td>
                    <td className="px-4 py-3 text-xs">{e.total_connections > 0 ? e.total_connections : '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {e.reaction_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={e.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
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
