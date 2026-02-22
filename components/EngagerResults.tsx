'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface EngagerResultsProps {
  scanId: string;
  onNewScan: () => void;
}

const safeString = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    if ('name' in value && typeof value.name === 'string') return value.name;
    if ('title' in value && typeof value.title === 'string') return value.title;
    return JSON.stringify(value);
  }
  return String(value);
};

export default function EngagerResults({ scanId, onNewScan }: EngagerResultsProps) {
  // Filters
  const [filterReactionTags, setFilterReactionTags] = useState<string[]>([]);
  const [filterIndustryTags, setFilterIndustryTags] = useState<string[]>([]);
  const [filterSizeTags, setFilterSizeTags] = useState<string[]>([]);
  const [filterLocationTags, setFilterLocationTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Tag inputs
  const [reactionInput, setReactionInput] = useState<string>('');
  const [industryInput, setIndustryInput] = useState<string>('');
  const [sizeInput, setSizeInput] = useState<string>('');
  const [locationInput, setLocationInput] = useState<string>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(50);
  
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch results with polling for real-time updates
  const { data: resultsData, isLoading } = useQuery({
    queryKey: ['engager-results', scanId],
    queryFn: async () => {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('api_key') : null;
      if (!apiKey) throw new Error('No API key');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scanId}/results`,
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: mounted,
    refetchInterval: 3000, // Poll every 3 seconds for live updates
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

  if (!resultsData?.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 mb-4">Failed to load results</p>
        <button onClick={onNewScan} className="px-4 py-2 bg-blue-600 text-white rounded">Back to Scans</button>
      </div>
    );
  }

  const engagers = Array.isArray(resultsData.engagers) ? resultsData.engagers : [];

  // Tag handlers
  const addTag = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    const trimmed = value.trim();
    if (trimmed) {
      setter(prev => [...prev, trimmed]);
      inputSetter('');
    }
  };

  const removeTag = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(value, setter, inputSetter);
    }
  };

  // Filtering logic
  const filteredEngagers = engagers.filter((engager: any) => {
    const reactionStr = safeString(engager.reaction_type).toLowerCase();
    const industryStr = safeString(engager.industry).toLowerCase();
    const sizeStr = safeString(engager.employee_size).toLowerCase();
    const locationStr = safeString(engager.company_location).toLowerCase();
    
    const matchesReaction = filterReactionTags.length === 0 || 
      filterReactionTags.some(tag => reactionStr.includes(tag.toLowerCase()));
    
    const matchesIndustry = filterIndustryTags.length === 0 || 
      filterIndustryTags.some(tag => industryStr.includes(tag.toLowerCase()));
    
    const matchesSize = filterSizeTags.length === 0 || 
      filterSizeTags.some(tag => sizeStr.includes(tag.toLowerCase()));
    
    const matchesLocation = filterLocationTags.length === 0 || 
      filterLocationTags.some(tag => locationStr.includes(tag.toLowerCase()));
    
    const search = searchTerm.toLowerCase();
    const matchesSearch = !search ||
      safeString(engager.name).toLowerCase().includes(search) ||
      safeString(engager.job_title).toLowerCase().includes(search) ||
      safeString(engager.company_name).toLowerCase().includes(search);
    
    return matchesReaction && matchesIndustry && matchesSize && matchesLocation && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEngagers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEngagers = filteredEngagers.slice(startIndex, startIndex + itemsPerPage);

  const handleDownload = () => {
    const apiKey = localStorage.getItem('api_key');
    window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scanId}/download?api_key=${apiKey}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Stats Header */}
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

      {/* Multi-tag Filters */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold mb-4">🎯 Filter by ICP</h3>
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search names, titles, companies..."
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reaction Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Reaction Type</label>
            <div className="border rounded-lg p-2 min-h-[44px] flex flex-wrap gap-2 items-center">
              {filterReactionTags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeTag(i, setFilterReactionTags)} className="hover:text-blue-600">×</button>
                </span>
              ))}
              <input
                type="text"
                value={reactionInput}
                onChange={(e) => setReactionInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, reactionInput, setFilterReactionTags, setReactionInput)}
                onBlur={() => reactionInput && addTag(reactionInput, setFilterReactionTags, setReactionInput)}
                placeholder="Type and press Enter..."
                className="flex-1 min-w-[150px] outline-none text-sm"
              />
            </div>
          </div>

          {/* Industry Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <div className="border rounded-lg p-2 min-h-[44px] flex flex-wrap gap-2 items-center">
              {filterIndustryTags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeTag(i, setFilterIndustryTags)} className="hover:text-purple-600">×</button>
                </span>
              ))}
              <input
                type="text"
                value={industryInput}
                onChange={(e) => setIndustryInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, industryInput, setFilterIndustryTags, setIndustryInput)}
                onBlur={() => industryInput && addTag(industryInput, setFilterIndustryTags, setIndustryInput)}
                placeholder="Type and press Enter..."
                className="flex-1 min-w-[150px] outline-none text-sm"
              />
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Company Size</label>
            <div className="border rounded-lg p-2 min-h-[44px] flex flex-wrap gap-2 items-center">
              {filterSizeTags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeTag(i, setFilterSizeTags)} className="hover:text-green-600">×</button>
                </span>
              ))}
              <input
                type="text"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, sizeInput, setFilterSizeTags, setSizeInput)}
                onBlur={() => sizeInput && addTag(sizeInput, setFilterSizeTags, setSizeInput)}
                placeholder="Type and press Enter..."
                className="flex-1 min-w-[150px] outline-none text-sm"
              />
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <div className="border rounded-lg p-2 min-h-[44px] flex flex-wrap gap-2 items-center">
              {filterLocationTags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeTag(i, setFilterLocationTags)} className="hover:text-orange-600">×</button>
                </span>
              ))}
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, locationInput, setFilterLocationTags, setLocationInput)}
                onBlur={() => locationInput && addTag(locationInput, setFilterLocationTags, setLocationInput)}
                placeholder="Type and press Enter..."
                className="flex-1 min-w-[150px] outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Showing {paginatedEngagers.length} of {filteredEngagers.length} results (page {currentPage} of {totalPages})
        </p>
      </div>

      {/* Table */}
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
              {paginatedEngagers.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No results</td></tr>
              ) : (
                paginatedEngagers.map((e: any, i: number) => (
                  <tr key={`engager-${startIndex + i}`} className="hover:bg-gray-50">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg border flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 border rounded-lg ${
                    currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
