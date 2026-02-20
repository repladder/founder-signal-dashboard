'use client';

import { useState } from 'react';
import SignalBadge from './SignalBadge';
import { detectSignalType } from '@/lib/signal-config';

interface Post {
  id: string;
  keyword: string;
  post_url: string;
  post_date: string;
  snippet: string;
}

interface SignalCardProps {
  profile: {
    profile_id: string;
    linkedin_url: string;
    profile_name: string;
    profile_title?: string;
    signals: Record<string, { count: number; latest_date: string }>;
    total_posts: number;
    detected_at: string;
  };
  posts: Post[];
}

function timeAgo(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export default function SignalCard({ profile, posts }: SignalCardProps) {
  const [expanded, setExpanded] = useState(false);

  const signalTypes = Object.keys(profile.signals).map(keyword => detectSignalType(keyword));
  const uniqueSignals = [...new Set(signalTypes)];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-blue-600 hover:underline"
          >
            {profile.profile_name}
          </a>
          {profile.profile_title && (
            <p className="text-sm text-gray-600 mt-1">{profile.profile_title}</p>
          )}
        </div>
        <span className="text-sm text-gray-500">📅 {timeAgo(profile.detected_at)}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {uniqueSignals.map(signal => (
          <SignalBadge key={signal} type={signal} />
        ))}
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {profile.total_posts} {profile.total_posts === 1 ? 'post' : 'posts'} detected
      </p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
      >
        {expanded ? '▲ Hide Posts' : '▼ View Posts'}
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 border-t pt-4">
          {posts.map((post, idx) => (
            <div key={post.id || idx} className="bg-gray-50 p-4 rounded">
              <div className="flex items-center gap-2 mb-2">
                <SignalBadge type={detectSignalType(post.keyword)} size="sm" />
                <span className="text-xs text-gray-500">
                  {new Date(post.post_date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{post.snippet}</p>
              <a
                href={post.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View on LinkedIn →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
