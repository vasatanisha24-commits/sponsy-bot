'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '⬡' },
  { href: '/sponsors', label: 'Sponsors', icon: '🏢' },
  { href: '/pipeline', label: 'Pipeline', icon: '⚡' },
  { href: '/research', label: 'Research', icon: '🔍' },
  { href: '/outreach', label: 'Outreach', icon: '✉️' },
  { href: '/replies', label: 'Replies', icon: '📬' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

const APPROVALS_ITEM = { href: '/approvals', label: 'Approvals', icon: '✅' };

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-sm font-bold">
            SB
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">Sponsy Bot</p>
            <p className="text-xs text-gray-400">Outreach Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Approvals (Bottom) */}
      <div className="px-3 pb-3">
        <Link
          href={APPROVALS_ITEM.href}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === APPROVALS_ITEM.href
              ? 'bg-indigo-600 text-white'
              : 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
          }`}
        >
          <span className="text-base">{APPROVALS_ITEM.icon}</span>
          {APPROVALS_ITEM.label}
        </Link>
      </div>

      {/* Footer */}
      <Link href="/settings" className="px-4 py-4 border-t border-gray-700 hover:bg-gray-800 transition-colors block">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-indigo-400 flex items-center justify-center text-xs font-bold">
            H
          </div>
          <div>
            <p className="text-xs font-medium text-white">Human Operator</p>
            <p className="text-xs text-gray-400">Settings</p>
          </div>
        </div>
      </Link>
    </aside>
  );
}
