import { MOCK_SPONSORS, SponsorStatus } from '@/app/lib/mock-data';

const statusColors: Record<SponsorStatus, string> = {
  researched: 'bg-blue-100 text-blue-700',
  outreach_pending: 'bg-amber-100 text-amber-700',
  contacted: 'bg-indigo-100 text-indigo-700',
  follow_up: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

const statusLabels: Record<SponsorStatus, string> = {
  researched: 'Researched',
  outreach_pending: 'Pending Approval',
  contacted: 'Contacted',
  follow_up: 'Follow-up',
  approved: 'Approved',
  declined: 'Declined',
};

// Sort by lastActivity — show the 5 most recently active
const recentSponsors = [...MOCK_SPONSORS]
  .sort((a, b) => {
    // Simple heuristic: put "minutes ago" and "hours ago" first
    const order = ['minutes ago', 'hours ago', 'day ago', 'days ago', 'week ago'];
    const rank = (s: string) =>
      order.findIndex((o) => s.includes(o.split(' ').pop()!));
    return rank(a.lastActivity) - rank(b.lastActivity);
  })
  .slice(0, 5);

export default function RecentSponsors() {
  return (
    <div className="space-y-3">
      {recentSponsors.map((sponsor) => (
        <div
          key={sponsor.id}
          className="flex items-center justify-between gap-3 bg-white rounded-lg px-4 py-3 border border-gray-100 hover:shadow-sm transition-shadow"
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
                statusColors[sponsor.status]
              }`}
            >
              {statusLabels[sponsor.status]}
            </span>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-700">
                Score: {sponsor.score}
              </p>
              <p className="text-xs text-gray-400">{sponsor.lastActivity}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
