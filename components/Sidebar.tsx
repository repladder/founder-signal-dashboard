'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: '📊',
      description: 'Overview & analytics'
    },
    { 
      path: '/campaigns', 
      label: 'Campaigns', 
      icon: '📢',
      description: 'Manage campaigns'
    },
    { 
      path: '/prospects', 
      label: 'Prospects', 
      icon: '👥',
      description: 'View all prospects'
    },
    { 
      path: '/engagers', 
      label: 'Engagers', 
      icon: '🎯',
      description: 'Post engagement analysis'
    },
    { 
      path: '/signals', 
      label: 'Signals', 
      icon: '⚡',
      description: 'Signal monitoring'
    },
    { 
      path: '/billing', 
      label: 'Billing', 
      icon: '💳',
      description: 'Subscription & usage'
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: '⚙️',
      description: 'Account settings'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('api_key');
    router.push('/login');
  };

  return (
    <aside
      className={`
        flex flex-col
        bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        h-screen
        sticky top-0
        z-40
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
            Founder Signals
          </h1>
        )}
        {isCollapsed && (
          <div className="text-2xl mx-auto">📊</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`
                w-full flex items-center gap-3
                px-4 py-3 rounded-lg
                text-left font-medium
                transition-all duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.label}</div>
                  {!isActive && (
                    <div className="text-xs text-gray-500 truncate">
                      {item.description}
                    </div>
                  )}
                </div>
              )}
              {!isCollapsed && isActive && (
                <div className="w-1.5 h-8 bg-blue-600 rounded-full -mr-2"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-lg">{isCollapsed ? '→' : '←'}</span>
          {!isCollapsed && <span>Collapse</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3
            px-4 py-3 rounded-lg
            text-red-600 hover:bg-red-50
            font-medium transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Logout' : ''}
        >
          <span className="text-xl">🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
