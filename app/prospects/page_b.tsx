

'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAuthenticated } from '@/lib/auth';
import { fetchProfiles, addProfile, deleteProfile, testScan } from '@/lib/api';
import { SIGNAL_TEMPLATES } from '@/types';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function ProspectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [linkedinUrls, setLinkedinUrls] = useState('');
  const [signalTemplate, setSignalTemplate] = useState<'funding' | 'hiring' | 'launch' | 'expansion' | 'custom'>('funding');
  const [customKeywords, setCustomKeywords] = useState('');
  const [previewResults, setPreviewResults] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data: profilesData, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
    enabled: mounted && isAuthenticated(),
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { urls: string[]; keywords: string[] }) => {
      // Test scan first 5 profiles
      const scanPromises = data.urls.slice(0, 5).map((url) =>
        testScan({ linkedin_url: url, keywords: data.keywords }).catch((err) => ({
          url,
          error: err.message,
        }))
      );

      const scanResults = await Promise.all(scanPromises);

      // Add all profiles for monitoring
      const addPromises = data.urls.map((url) =>
        addProfile({ linkedin_url: url, keywords: data.keywords }).catch((err) => 
          console.error('Failed to add profile:', url, err)
        )
      );

      await Promise.all(addPromises);

      return scanResults;
    },
    onSuccess: (results) => {
      setPreviewResults(results);
      setShowPreview(true);
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setLinkedinUrls('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  const handleUpload = () => {
    const urls = linkedinUrls
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u && u.includes('linkedin.com/in/'));

    if (urls.length === 0) {
      alert('Please enter at least one LinkedIn URL');
      return;
    }

    let keywords: string[] = [];
    if (signalTemplate === 'custom') {
      keywords = customKeywords.split(',').map((k) => k.trim()).filter((k) => k);
    } else {
      keywords = [...SIGNAL_TEMPLATES[signalTemplate]];
    }

    if (keywords.length === 0) {
      alert('Please specify keywords');
      return;
    }

    uploadMutation.mutate({ urls, keywords });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this profile?')) {
      deleteMutation.mutate(id);
    }
  };

  if (!mounted || !isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <Topbar title="Prospects" />

        {/* Upload Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-xl font-bold mb-4">Add Prospects</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              LinkedIn URLs (one per line)
            </label>
            <textarea
              value={linkedinUrls}
              onChange={(e) => setLinkedinUrls(e.target.value)}
              rows={6}
              placeholder="https://www.linkedin.com/in/username1&#10;https://www.linkedin.com/in/username2&#10;https://www.linkedin.com/in/username3"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploadMutation.isPending}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Signal Template
            </label>
            <select
              value={signalTemplate}
              onChange={(e: any) => setSignalTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploadMutation.isPending}
            >
              <option value="funding">Funding Signals</option>
              <option value="hiring">Hiring Sales Team</option>
              <option value="launch">Product Launch</option>
              <option value="expansion">Expansion</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {signalTemplate === 'custom' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Custom Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                placeholder="hiring, funding, launch, expansion"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={uploadMutation.isPending}
              />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center"
          >
            {uploadMutation.isPending ? (
              <>
                <div className="spinner mr-2"></div>
                Scanning...
              </>
            ) : (
              'Scan & Add Prospects'
            )}
          </button>

          {/* Preview Results */}
          {showPreview && previewResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-3">
                Preview Results (First 5 Profiles)
              </h3>
              {previewResults.some((r) => r.matches_found > 0) ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Profile</th>
                        <th className="text-left py-2">Matched</th>
                        <th className="text-left py-2">Snippet</th>
                        <th className="text-left py-2">Post</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewResults.map((result, idx) =>
                        result.matches?.map((match: any, midx: number) => (
                          <tr key={`${idx}-${midx}`} className="border-b">
                            <td className="py-2">
                              <a
                                href={result.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {result.linkedin_url.split('/in/')[1]}
                              </a>
                            </td>
                            <td className="py-2">{match.matched_keywords.join(', ')}</td>
                            <td className="py-2 text-gray-600">
                              {match.snippet.substring(0, 100)}...
                            </td>
                            <td className="py-2">
                              <a
                                href={match.post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="font-medium mb-2">
                    No Founder Growth Signals Found (Last 30 Days)
                  </p>
                  <p className="text-sm text-gray-600">
                    We scanned for: {signalTemplate} signals
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    All profiles have been added for continuous monitoring.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profiles Table */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Monitored Profiles</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : profilesData?.count === 0 ? (
            <p className="text-gray-600">No profiles yet. Add some above!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">LinkedIn URL</th>
                    <th className="text-left py-2">Keywords</th>
                    <th className="text-left py-2">Last Scanned</th>
                    <th className="text-left py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {profilesData?.profiles?.map((profile: any) => (
                    <tr key={profile.id} className="border-b">
                      <td className="py-2">
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profile.linkedin_url.split('/in/')[1]}
                        </a>
                      </td>
                      <td className="py-2 text-gray-600">
                        {profile.keywords.join(', ')}
                      </td>
                      <td className="py-2 text-gray-600">
                        {profile.last_post_timestamp
                          ? new Date(profile.last_post_timestamp).toLocaleDateString()
                          : 'Not yet'}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => handleDelete(profile.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:underline disabled:text-gray-400"
                        >
                          Delete
                        </button>
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
