'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { removeApiKey } from '@/lib/auth';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/campaigns', label: 'Campaigns' },
    { href: '/prospects', label: 'Prospects' },
    { href: '/engagers', label: 'Engagers' },
    { href: '/signals', label: 'Signals' },
    { href: '/billing', label: 'Billing' },
    { href: '/settings', label: 'Settings' },
  ];

  const handleLogout = () => {
    removeApiKey();
    router.push('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Founder Signals</h2>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
