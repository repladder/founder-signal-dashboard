'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

interface EngagerScanModalProps {
  onClose: () => void;
  onScanComplete: (scanId: string) => void;
}

export default function EngagerScanModal({ onClose, onScanComplete }: EngagerScanModalProps) {
  const [postUrl, setPostUrl] = useState('');
  const [selectedEngagements, setSelectedEngagements] = useState<string[]>(['like']);
  const [limitPerType, setLimitPerType] = useState(100);
  const [scanningStatus, setScanningStatus] = useState<any>(null);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);

  const engagementOptions = [
    { value: 'like', icon: '👍', label: 'Like', description: 'Standard thumbs up' },
    { value: 'love', icon: '❤️', label: 'Love (Praise)', description: 'Heart reaction' },
    { value: 'insightful', icon: '💡', label: 'Insightful (Empathy)', description: 'Light bulb' },
    { value: 'celebrate', icon: '🎉', label: 'Celebrate (Appreciation)', description: 'Party popper' },
    { value: 'curious', icon: '🤔', label: 'Curious (Interest)', description: 'Thinking face' },
    { value: 'comment', icon: '💬', label: 'Comments', description: 'Text comments' }
  ];

  const startScanMutation = useMutation({
    mutationFn: async (data: { post_url: string; engagement_types: string[]; limit_per_type: number }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('api_key')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to start scan');
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentScanId(data.scan_id);
      pollScanStatus(data.scan_id);
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
  });

  const pollScanStatus = (scanId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan/${scanId}/status`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('api_key')}`
            }
          }
        );
        const data = await res.json();

        setScanningStatus(data);

        if (data.status === 'completed') {
          clearInterval(interval);
          setTimeout(() => {
            onScanComplete(scanId);
          }, 1000);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          alert(`Scan failed: ${data.error}`);
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 2000); // Poll every 2 seconds
  };

  const toggleEngagement = (value: string) => {
    setSelectedEngagements(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleStartScan = () => {
    if (!postUrl.trim()) {
      alert('Please enter a post URL');
      return;
    }
    if (!postUrl.includes('linkedin.com/posts/')) {
      alert('Please enter a valid LinkedIn post URL');
      return;
    }
    if (selectedEngagements.length === 0) {
      alert('Please select at least one engagement type');
      return;
    }

    startScanMutation.mutate({
      post_url: postUrl,
      engagement_types: selectedEngagements,
      limit_per_type: limitPerType
    });
  };

  const estimatedCost = (selectedEngagements.length * limitPerType * 0.02).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {!scanningStatus ? (
          <>
            <h2 className="text-2xl font-bold mb-6">Extract Post Engagers</h2>

            {/* Post URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                LinkedIn Post URL *
              </label>
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://www.linkedin.com/posts/username_activity-id-..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={startScanMutation.isPending}
              />
              <p className="text-xs text-gray-500 mt-1">
                Copy the URL from any LinkedIn post you want to analyze
              </p>
            </div>

            {/* Engagement Types */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Engagement Types * (Select at least one)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {engagementOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleEngagement(option.value)}
                    disabled={startScanMutation.isPending}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      selectedEngagements.includes(option.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Limit */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Max Engagers Per Type *
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={limitPerType}
                  onChange={(e) => setLimitPerType(parseInt(e.target.value) || 100)}
                  min="1"
                  max="500"
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={startScanMutation.isPending}
                />
                <input
                  type="range"
                  value={limitPerType}
                  onChange={(e) => setLimitPerType(parseInt(e.target.value))}
                  min="10"
                  max="500"
                  step="10"
                  className="flex-1"
                  disabled={startScanMutation.isPending}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Limit the number of profiles to scrape per engagement type (1-500)
              </p>
            </div>

            {/* Cost Estimate */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Estimated Cost: ${estimatedCost}
                  </p>
                  <p className="text-xs text-yellow-800">
                    Based on {selectedEngagements.length} engagement type(s) × {limitPerType} profiles
                    <br />
                    Includes reaction scraping + profile enrichment
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleStartScan}
                disabled={startScanMutation.isPending}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {startScanMutation.isPending ? 'Starting Scan...' : 'Start Scan →'}
              </button>
              <button
                onClick={onClose}
                disabled={startScanMutation.isPending}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Scanning Progress */}
            <h2 className="text-2xl font-bold mb-6">Scanning Post Engagers...</h2>

            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      scanningStatus.progress?.total > 0
                        ? Math.min(
                            ((scanningStatus.progress.profiles_enriched || 0) /
                              scanningStatus.progress.total) *
                              100,
                            100
                          )
                        : 0
                    }%`
                  }}
                ></div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={scanningStatus.progress?.reactions_scraped > 0 ? 'text-green-600' : 'text-gray-400'}>
                    {scanningStatus.progress?.reactions_scraped > 0 ? '✅' : '⏳'}
                  </span>
                  <span className="text-sm">
                    Scraped reactions ({scanningStatus.progress?.reactions_scraped || 0} found)
                  </span>
                </div>

                {selectedEngagements.includes('comment') && (
                  <div className="flex items-center gap-3">
                    <span className={scanningStatus.progress?.comments_scraped > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {scanningStatus.progress?.comments_scraped > 0 ? '✅' : '⏳'}
                    </span>
                    <span className="text-sm">
                      Scraped comments ({scanningStatus.progress?.comments_scraped || 0} found)
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-blue-600">🔄</span>
                  <span className="text-sm">
                    Enriching profiles... ({scanningStatus.progress?.profiles_enriched || 0}/
                    {scanningStatus.progress?.total || 0})
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>This may take 2-5 minutes depending on the number of engagers...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
