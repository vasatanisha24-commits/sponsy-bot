import Link from 'next/link';
import { SponsorUI, SponsorStatus } from '@/app/lib/types';

interface Props {
  recentSponsors: SponsorUI[];
}

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

export default function RecentSponsors({ recentSponsors }: Props) {
  if (recentSponsors.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-sm h-full flex items-center justify-center">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentSponsors.map((sponsor) => (
        <Link
          key={sponsor.id}
          href={`/sponsors/${sponsor.id}`}
          className="flex items-center justify-between gap-3 bg-white rounded-lg px-4 py-3 border border-gray-100 hover:shadow-sm hover:border-indigo-200 transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
              {sponsor.logo}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {sponsor.company}
              </p>
              <p className="text-xs text-gray-500 truncate">{sponsor.contact}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`hidden sm:inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                statusColors[sponsor.status] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {statusLabels[sponsor.status] || sponsor.status}
            </span>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-700">
                Score: {sponsor.score}
              </p>
              <p className="text-xs text-gray-400">{sponsor.lastActivity}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
