'use client';

import { useState } from 'react';

interface EngagerScanModalProps {
  onClose: () => void;
  onScanComplete: (scanId: string) => void;
}

export default function EngagerScanModal({ onClose, onScanComplete }: EngagerScanModalProps) {
  const [postUrl, setPostUrl] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['like']);
  const [limit, setLimit] = useState(10); // Changed from 5 to 10 (minimum)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const engagementTypes = [
    { id: 'like', label: 'Like', emoji: '👍', description: 'Standard thumbs up' },
    { id: 'love', label: 'Love (Praise)', emoji: '❤️', description: 'Heart reaction' },
    { id: 'insightful', label: 'Insightful (Empathy)', emoji: '💡', description: 'Light bulb' },
    { id: 'celebrate', label: 'Celebrate (Appreciation)', emoji: '🎉', description: 'Party popper' },
    { id: 'curious', label: 'Curious (Interest)', emoji: '🤔', description: 'Thinking face' },
    { id: 'comment', label: 'Comments', emoji: '💬', description: 'Text comments' }
  ];

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSubmit = async () => {
    if (!postUrl.trim()) {
      setError('Please enter a LinkedIn post URL');
      return;
    }

    if (selectedTypes.length === 0) {
      setError('Please select at least one engagement type');
      return;
    }

    if (limit < 10) {
      setError('Minimum 10 engagers required (Apify actor limitation)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiKey = localStorage.getItem('api_key');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/engagers/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          post_url: postUrl.trim(),
          engagement_types: selectedTypes,
          limit_per_type: limit
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Scan failed');
      }

      onScanComplete(data.scan_id);
    } catch (err: any) {
      setError(err.message || 'Failed to start scan');
      setLoading(false);
    }
  };

  const estimatedCost = (selectedTypes.length * limit * 0.008).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Extract Post Engagers</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* LinkedIn Post URL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                LinkedIn Post URL *
              </label>
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://www.linkedin.com/posts/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Copy the URL from any LinkedIn post
              </p>
            </div>

            {/* Engagement Types */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Engagement Types * (Select at least one)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {engagementTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleType(type.id)}
                    disabled={loading}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedTypes.includes(type.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.emoji}</span>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                      {selectedTypes.includes(type.id) && (
                        <div className="ml-auto text-blue-500">✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Max Engagers Per Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Engagers Per Type * (Min: 10, Max: 500)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(Math.max(10, Math.min(500, parseInt(e.target.value) || 10)))}
                  min={10}
                  max={500}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
                  disabled={loading}
                />
                <input
                  type="range"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  min={10}
                  max={500}
                  step={10}
                  className="flex-1"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Limit the number of profiles to scrape per engagement type (1-500)
              </p>
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Minimum 10 required by Apify actor
              </p>
            </div>

            {/* Cost Estimate */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <div className="font-semibold text-yellow-900 mb-1">
                    Estimated Cost: ${estimatedCost}
                  </div>
                  <div className="text-sm text-yellow-800">
                    Based on {selectedTypes.length} engagement type(s) × {limit} profiles
                    <br />
                    Includes reaction scraping + profile enrichment
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading || selectedTypes.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Starting Scan...' : 'Start Scan →'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
