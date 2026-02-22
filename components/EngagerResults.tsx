'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface EngagerResultsProps {
  scanId: string;
  onNewScan: () => void;
}

// Helper to safely convert any value to string
const safeString = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    // If it's an object with a 'name' property, use that
    if ('name' in value && typeof value.name === 'string') return value.name;
    // If it's an object with a 'title' property, use that
    if ('title' in value && typeof value.title === 'string') return value.title;
    // Otherwise, stringify it
    return JSON.stringify(value);
  }
  return String(value);
};

export default function EngagerResults({ scanId, onNewScan }: EngagerResultsProps) {
  const [filterReaction, setFilterReaction] = useState('all');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterEmployeeSize, setFilterEmployeeSize] = useState('all');
  const [filterCompanyLocation, setFilterCompanyLocation] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: resultsData, isLoading, error } = useQuery({
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
    enabled: mounted,
    retry: 1,
  });

  if (!mounted || isLoading) {
    return (
      <div className="bg-white p-12 rounded-lg border text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading results...</p>
      </div>
    );
  }

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
  
  // Safe filter extraction - convert all to strings
  const reactionTypes = Array.from(new Set(
    engagers.flatMap((e: any) => {
      const reaction = safeString(e.reaction_type);
      return reaction.split(', ').filter(Boolean);
    })
  ));
  
  const industries = Array.from(new Set(
    engagers.map((e: any) => safeString(e.industry)).filter((v: string) => v !== '-')
  ));
  
  const employeeSizes = Array.from(new Set(
    engagers.map((e: any) => safeString(e.employee_size)).filter((v: string) => v !== '-')
  ));

  const companyLocations = Array.from(new Set(
    engagers.map((e: any) => safeString(e.company_location)).filter((v: string) => v !== '-')
  ));

  const filteredEngagers = engagers.filter((engager: any) => {
    const reactionStr = safeString(engager.reaction_type).toLowerCase();
    const industryStr = safeString(engager.industry);
    const sizeStr = safeString(engager.employee_size);
    const locationStr = safeString(engager.company_location);
    
    const matchesReaction = filterReaction === 'all' || reactionStr.includes(filterReaction.toLowerCase());
    const matchesIndustry = filterIndustry === 'all' || industryStr === filterIndustry;
    const matchesEmployeeSize = filterEmployeeSize === 'all' || sizeStr === filterEmployeeSize;
    const matchesCompanyLocation = filterCompanyLocation === 'all' || locationStr === filterCompanyLocation;
    
    const search = searchTerm.toLowerCase();
    const matchesSearch = !search ||
      safeString(engager.name).toLowerCase().includes(search) ||
      safeString(engager.job_title).toLowerCase().includes(search) ||
      safeString(engager.company_name).toLowerCase().includes(search) ||
      safeString(engager.location).toLowerCase().includes(search);
    
    return matchesReaction && matchesIndustry && matchesEmployeeSize && 
           matchesCompanyLocation && matchesSearch;
  });

  const handleDownload = () => {
    const apiKey = localStorage.getItem('api_key');
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scanId}/download?api_key=${apiKey}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-2">✅ Enrichment Complete!</h2>
        <p className="text-sm text-gray-600 mb-3 break-all">{safeString(resultsData.post_url)}</p>
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

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold mb-4">🎯 Filter by ICP</h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={filterReaction} onChange={(e) => setFilterReaction(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Reactions</option>
            {reactionTypes.map((r: string) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Industries</option>
            {industries.map((i: string) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={filterEmployeeSize} onChange={(e) => setFilterEmployeeSize(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Sizes</option>
            {employeeSizes.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterCompanyLocation} onChange={(e) => setFilterCompanyLocation(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Locations</option>
            {companyLocations.map((l: string) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-4">Showing {filteredEngagers.length} of {engagers.length}</p>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reaction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEngagers.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No results</td></tr>
              ) : (
                filteredEngagers.map((e: any, i: number) => (
                  <tr key={`engager-${i}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{safeString(e.name)}</td>
                    <td className="px-4 py-3 text-xs">{safeString(e.job_title)}</td>
                    <td className="px-4 py-3 text-xs">
                      {e.company_name && e.company_profile_url ? (
                        <a href={safeString(e.company_profile_url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {safeString(e.company_name)}
                        </a>
                      ) : safeString(e.company_name)}
                    </td>
                    <td className="px-4 py-3 text-xs">{safeString(e.industry)}</td>
                    <td className="px-4 py-3 text-xs">{safeString(e.employee_size)}</td>
                    <td className="px-4 py-3 text-xs">{safeString(e.company_location || e.location)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {safeString(e.reaction_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={safeString(e.linkedin_url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
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
