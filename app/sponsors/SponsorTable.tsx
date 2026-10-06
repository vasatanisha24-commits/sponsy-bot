'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sponsor, SponsorStatus, SponsorPriority } from '@/app/lib/mock-data';
import {
  STATUS_LABEL,
  STATUS_PILL,
  TIER_PILL,
  PRIORITY_LABEL,
  PRIORITY_PILL,
  scoreColor,
} from '@/app/lib/sponsor-styles';

interface Props {
  initialSponsors: Sponsor[];
}

const ALL = 'all';

export default function SponsorTable({ initialSponsors }: Props) {
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SponsorStatus | 'all'>(ALL);
  const [priorityFilter, setPriorityFilter] = useState<SponsorPriority | 'all'>(ALL);
  const [view, setView] = useState<'table' | 'cards'>('table');

  const filtered = useMemo(() => {
    return sponsors.filter((s) => {
      const matchSearch =
        s.company.toLowerCase().includes(search.toLowerCase()) ||
        s.industry.toLowerCase().includes(search.toLowerCase()) ||
        s.contact.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === ALL || s.status === statusFilter;
      const matchPriority = priorityFilter === ALL || s.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [sponsors, search, statusFilter, priorityFilter]);

  // Remove from local state (mock "delete")
  const handleDelete = (id: string) => {
    if (!confirm('Remove this sponsor from the list?')) return;
    setSponsors((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search sponsors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-52"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SponsorStatus | 'all')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value={ALL}>All Statuses</option>
            {(Object.keys(STATUS_LABEL) as SponsorStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as SponsorPriority | 'all')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value={ALL}>All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <span className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('table')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${view === 'table' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ☰ Table
          </button>
          <button
            onClick={() => setView('cards')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${view === 'cards' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ⊞ Cards
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">No sponsors match your filters.</p>
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {view === 'table' && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Industry</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Tier</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Score</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Assigned</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {s.logo}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{s.company}</p>
                        <p className="text-xs text-gray-400">{s.contact}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.industry}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_PILL[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_PILL[s.priority]}`}>
                      {PRIORITY_LABEL[s.priority]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${TIER_PILL[s.tier]}`}>
                      {s.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-sm ${scoreColor(s.score)}`}>{s.score}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{s.assignedTo}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/sponsors/${s.id}`}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-xs text-red-400 hover:text-red-600 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── CARD VIEW ── */}
      {view === 'cards' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {s.logo}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{s.company}</p>
                    <p className="text-xs text-gray-400">{s.industry}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${TIER_PILL[s.tier]}`}>
                  {s.tier}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 line-clamp-2">{s.description}</p>

              {/* Contact */}
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>👤 {s.contact}</p>
                <p>✉️ {s.email}</p>
                {s.website && (
                  <a href={s.website} target="_blank" rel="noopener noreferrer"
                    className="block text-indigo-500 hover:underline truncate">
                    🔗 {s.website.replace('https://', '')}
                  </a>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_PILL[s.status]}`}>
                  {STATUS_LABEL[s.status]}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_PILL[s.priority]}`}>
                  {PRIORITY_LABEL[s.priority]}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
                <div className="text-xs text-gray-400">
                  Score: <span className={`font-bold ${scoreColor(s.score)}`}>{s.score}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/sponsors/${s.id}`}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View →
                  </Link>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
