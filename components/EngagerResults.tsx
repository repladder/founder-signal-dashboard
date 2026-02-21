'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

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
  
  // Get unique values for filters
  const reactionTypes: string[] = [...new Set<string>(engagers.flatMap((e: any) =>
    e.reaction_type.split(', ')
  ))];

  const industries: string[] = [...new Set<string>(engagers
    .map((e: any) => e.industry)
    .filter((i: string) => i)
  )];

  const employeeSizes: string[] = [...new Set<string>(engagers
    .map((e: any) => e.employee_size)
    .filter((s: string) => s)
  )];

  const companyLocations: string[] = [...new Set<string>(engagers
    .map((e: any) => e.company_location)
    .filter((l: string) => l)
  )];

  // Filter engagers based on ICP criteria
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
    window.open(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scanId}/download`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">✅ Full Enrichment Complete!</h2>
            <p className="text-sm text-gray-600 mb-3 break-all">
              {resultsData.post_url}
            </p>
            <div className="flex gap-6 text-sm flex-wrap">
              <span className="text-gray-600">
                📊 <strong>{resultsData.total_engagers}</strong> total engagers
              </span>
              <span className="text-gray-600">
                👤 <strong>{resultsData.unique_profiles}</strong> unique profiles
              </span>
              <span className="text-gray-600">
                ✅ <strong>{resultsData.profiles_enriched}</strong> profiles enriched
              </span>
              <span className="text-gray-600">
                🏢 <strong>{resultsData.companies_enriched}</strong> companies enriched
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
            Download Complete CSV
          </button>
          <button
            onClick={onNewScan}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Start New Scan
          </button>
        </div>
      </div>

      {/* ICP Filters */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold mb-4">🎯 Filter by ICP Criteria</h3>
        
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, title, company, or location..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Reaction Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Reaction Type</label>
            <select
              value={filterReaction}
              onChange={(e) => setFilterReaction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Reactions</option>
              {reactionTypes.map((reaction) => (
                <option key={reaction} value={reaction}>{reaction}</option>
              ))}
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Employee Size Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Company Size</label>
            <select
              value={filterEmployeeSize}
              onChange={(e) => setFilterEmployeeSize(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sizes</option>
              {employeeSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Company Location Filter - NEW! */}
          <div>
            <label className="block text-sm font-medium mb-2">Company Location</label>
            <select
              value={filterCompanyLocation}
              onChange={(e) => setFilterCompanyLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              {companyLocations.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Showing {filteredEngagers.length} of {engagers.length} engagers
        </p>
      </div>

      {/* Results Table - WITH COMPANY LOCATION */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Co. Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Person Loc.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Connections</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reaction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEngagers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    No engagers match your ICP filters
                  </td>
                </tr>
              ) : (
                filteredEngagers.map((engager: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{engager.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{engager.job_title || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">
                        {engager.company_name ? (
                          engager.company_profile_url ? (
                            <a
                              href={engager.company_profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {engager.company_name}
                            </a>
                          ) : (
                            engager.company_name
                          )
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-600">{engager.industry || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-600 text-xs">{engager.employee_size || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-600 text-xs">{engager.company_location || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-600 text-xs">{engager.location || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-600 text-xs">
                        {engager.total_connections > 0 ? `${engager.total_connections}` : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                        {engager.reaction_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={engager.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
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

      {/* Export Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <span className="text-xl">💡</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Complete Outbound-Ready Data (11 Fields)
            </p>
            <p className="text-xs text-blue-800">
              CSV includes: Name, Title, Person Location, Industry, LinkedIn URL, Connections, Followers,
              Company Name, Employee Size, <strong>Company Location (NEW!)</strong>, and Company URL.
              Import directly into your CRM!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
