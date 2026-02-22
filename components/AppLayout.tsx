'use client';

import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed on desktop, sticky on mobile */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Content wrapper with max-width and padding */}
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
