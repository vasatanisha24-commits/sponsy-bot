import { MOCK_SPONSORS } from '@/app/lib/mock-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  STATUS_LABEL,
  STATUS_PILL,
  TIER_PILL,
  PRIORITY_LABEL,
  PRIORITY_PILL,
  scoreColor,
} from '@/app/lib/sponsor-styles';

export function generateStaticParams() {
  return MOCK_SPONSORS.map((s) => ({ id: s.id }));
}

export default async function SponsorDetailPage(props: PageProps<'/sponsors/[id]'>) {
  const { id } = await props.params;
  const sponsor = MOCK_SPONSORS.find((s) => s.id === id);
  if (!sponsor) notFound();

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/sponsors" className="hover:text-indigo-600 transition-colors">
          Sponsors
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">{sponsor.company}</span>
      </nav>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-indigo-100 text-indigo-700 text-xl font-bold flex items-center justify-center shrink-0">
              {sponsor.logo}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sponsor.company}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{sponsor.industry}</p>
              {sponsor.website && (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 hover:underline mt-1 block"
                >
                  🔗 {sponsor.website}
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_PILL[sponsor.status]}`}>
              {STATUS_LABEL[sponsor.status]}
            </span>
            <span className={`text-sm font-semibold px-3 py-1 rounded capitalize ${TIER_PILL[sponsor.tier]}`}>
              {sponsor.tier}
            </span>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${PRIORITY_PILL[sponsor.priority]}`}>
              {PRIORITY_LABEL[sponsor.priority]} Priority
            </span>
          </div>
        </div>

        {sponsor.description && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
            {sponsor.description}
          </p>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact */}
        <InfoCard title="Contact Information">
          <InfoRow icon="👤" label="Name" value={sponsor.contact} />
          <InfoRow icon="✉️" label="Email" value={sponsor.email} />
          {sponsor.website && (
            <InfoRow icon="🔗" label="Website" value={
              <a href={sponsor.website} target="_blank" rel="noopener noreferrer"
                className="text-indigo-500 hover:underline">{sponsor.website}</a>
            } />
          )}
        </InfoCard>

        {/* Classification */}
        <InfoCard title="Classification">
          <InfoRow icon="🏆" label="Tier" value={
            <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${TIER_PILL[sponsor.tier]}`}>
              {sponsor.tier}
            </span>
          } />
          <InfoRow icon="⚡" label="Priority" value={
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_PILL[sponsor.priority]}`}>
              {PRIORITY_LABEL[sponsor.priority]}
            </span>
          } />
          <InfoRow icon="📊" label="Status" value={
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_PILL[sponsor.status]}`}>
              {STATUS_LABEL[sponsor.status]}
            </span>
          } />
          <InfoRow icon="👥" label="Assigned To" value={sponsor.assignedTo} />
        </InfoCard>

        {/* AI Score */}
        <InfoCard title="AI Score">
          <div className="flex items-end gap-3 mt-1">
            <span className={`text-5xl font-black ${scoreColor(sponsor.score)}`}>
              {sponsor.score}
            </span>
            <span className="text-gray-400 text-lg mb-1">/ 100</span>
          </div>
          <ScoreBar score={sponsor.score} />
          <p className="text-xs text-gray-400 mt-2">
            {sponsor.score >= 90
              ? '🟢 Excellent fit — top outreach priority.'
              : sponsor.score >= 75
              ? '🔵 Good fit — recommended for outreach.'
              : '🟡 Moderate fit — review before contacting.'}
          </p>
        </InfoCard>

        {/* Activity */}
        <InfoCard title="Activity">
          <InfoRow icon="🕐" label="Last Activity" value={sponsor.lastActivity} />
          <InfoRow icon="📅" label="Added" value={sponsor.createdAt} />
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-600 mb-1">Notes</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              {sponsor.notes || '—'}
            </p>
          </div>
        </InfoCard>
      </div>

      {/* Action bar */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex flex-wrap gap-3">
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
          ✉️ Draft Outreach Email
        </button>
        <button className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
          ✅ Mark as Approved
        </button>
        <button className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
          ✏️ Edit Details
        </button>
        <Link
          href="/sponsors"
          className="ml-auto px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          ← Back to Sponsors
        </Link>
      </div>

      <p className="text-xs text-center text-gray-300">
        Actions above are UI placeholders — backend integration coming soon.
      </p>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm shrink-0 mt-0.5">{icon}</span>
      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
      <span className="text-xs text-gray-800 font-medium">{value}</span>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-indigo-500' : 'bg-amber-500';
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
      <div
        className={`h-2 rounded-full transition-all ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}
