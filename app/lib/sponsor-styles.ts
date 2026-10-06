import { SponsorStatus, SponsorTier, SponsorPriority } from '@/app/lib/mock-data';

// ── Status ─────────────────────────────────────────────────────────────────
export const STATUS_LABEL: Record<SponsorStatus, string> = {
  researched: 'Researched',
  outreach_pending: 'Pending Approval',
  contacted: 'Contacted',
  follow_up: 'Follow-up',
  approved: 'Approved',
  declined: 'Declined',
};

export const STATUS_PILL: Record<SponsorStatus, string> = {
  researched: 'bg-blue-100 text-blue-700',
  outreach_pending: 'bg-amber-100 text-amber-700',
  contacted: 'bg-indigo-100 text-indigo-700',
  follow_up: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

// ── Tier ──────────────────────────────────────────────────────────────────
export const TIER_PILL: Record<SponsorTier, string> = {
  platinum: 'bg-violet-100 text-violet-700 border border-violet-200',
  gold: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  silver: 'bg-gray-100 text-gray-600 border border-gray-200',
  bronze: 'bg-orange-100 text-orange-700 border border-orange-200',
};

// ── Priority ──────────────────────────────────────────────────────────────
export const PRIORITY_LABEL: Record<SponsorPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PRIORITY_PILL: Record<SponsorPriority, string> = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-sky-100 text-sky-700',
  low: 'bg-gray-100 text-gray-500',
};

// ── Score colour ──────────────────────────────────────────────────────────
export function scoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-indigo-600';
  return 'text-amber-600';
}
