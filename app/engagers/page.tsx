'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the actual page with no SSR
const EngagersContent = dynamic(() => import('./EngagersContent'), {
  ssr: false,
  loading: () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-12 rounded-lg border text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  ),
});

export default function EngagersPage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-12 rounded-lg border text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <EngagersContent />
    </Suspense>
  );
}
