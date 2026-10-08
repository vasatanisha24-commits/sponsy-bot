import Link from 'next/link';
import { SponsorUI, SponsorTier, SponsorStatus } from '@/app/lib/types';

interface SponsorCardProps {
  sponsor: SponsorUI;
}

const tierColors: Record<SponsorTier, string> = {
  platinum: 'bg-violet-100 text-violet-700 border-violet-200',
  gold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  silver: 'bg-gray-100 text-gray-600 border-gray-200',
  bronze: 'bg-orange-100 text-orange-700 border-orange-200',
};

const statusColors: Record<SponsorStatus, string> = {
  researched: 'bg-blue-100 text-blue-700',
  outreach_pending: 'bg-amber-100 text-amber-700',
  contacted: 'bg-indigo-100 text-indigo-700',
  follow_up: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  new: 'bg-gray-100 text-gray-700',
  interested: 'bg-emerald-100 text-emerald-700',
  replied: 'bg-gray-100 text-gray-700',
  follow_up_exhausted: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<SponsorStatus, string> = {
  researched: 'Researched',
  outreach_pending: 'Pending Approval',
  contacted: 'Contacted',
  follow_up: 'Follow-up',
  approved: 'Approved',
  declined: 'Declined',
  new: 'New',
  interested: 'Interested',
  replied: 'Replied',
  follow_up_exhausted: 'Exhausted',
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? 'text-green-600'
      : score >= 75
      ? 'text-indigo-600'
      : 'text-amber-600';
  return (
    <span className={`text-sm font-bold ${color}`}>{score}</span>
  );
}

export default function SponsorCard({ sponsor }: SponsorCardProps) {
  return (
    <Link
      href={`/sponsors/${sponsor.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow hover:border-indigo-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
            {sponsor.logo}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">
              {sponsor.company}
            </p>
            <p className="text-xs text-gray-500">{sponsor.industry}</p>
          </div>
        </div>
        {/* Tier badge */}
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded border capitalize ${
            tierColors[sponsor.tier]
          }`}
        >
          {sponsor.tier}
        </span>
      </div>

      {/* Contact */}
      <div className="mt-3 text-xs text-gray-500 space-y-0.5">
        <p>👤 {sponsor.contact}</p>
        <p>✉️ {sponsor.email}</p>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            statusColors[sponsor.status]
          }`}
        >
          {statusLabels[sponsor.status]}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>Score:</span>
          <ScoreBadge score={sponsor.score} />
        </div>
      </div>

      {/* Last activity */}
      <p className="mt-2 text-xs text-gray-400">🕐 {sponsor.lastActivity}</p>
    </Link>
  );
}
