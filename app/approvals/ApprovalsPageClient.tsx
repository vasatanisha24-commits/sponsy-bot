'use client';

import { useState, useMemo } from 'react';
import { EmailReview, EmailReviewStatus } from '@/app/lib/mock-data';
import EmailReviewCard from './EmailReviewCard';

interface Props {
  initialEmails: EmailReview[];
}

type FilterTab = EmailReviewStatus | 'all';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending_review', label: '⏳ Pending' },
  { key: 'approved', label: '✅ Approved' },
  { key: 'rejected', label: '✕ Rejected' },
];

export default function ApprovalsPageClient({ initialEmails }: Props) {
  const [emails, setEmails] = useState<EmailReview[]>(initialEmails);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const pendingCount = emails.filter((e) => e.status === 'pending_review').length;

  // Handlers
  function handleApprove(id: string) {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: 'approved', reviewedAt: 'Just now', reviewedBy: 'Tanisha Vasa' }
          : e
      )
    );
  }

  function handleReject(id: string, reason: string) {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'rejected',
              reviewedAt: 'Just now',
              reviewedBy: 'Tanisha Vasa',
              rejectionReason: reason || undefined,
            }
          : e
      )
    );
  }

  function handleEdit(id: string, updated: Partial<EmailReview>) {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
  }

  // Filter
  const filtered = useMemo(() =>
    activeTab === 'all' ? emails : emails.filter((e) => e.status === activeTab),
    [emails, activeTab]
  );

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Approvals</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review AI-drafted outreach emails before they can be sent.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {pendingCount} email{pendingCount !== 1 ? 's' : ''} awaiting your review
          </div>
        )}
        {pendingCount === 0 && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-2 rounded-full">
            ✅ All emails reviewed
          </div>
        )}
      </div>

      {/* Human-in-the-loop info banner */}
      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
        <span className="text-indigo-500 text-xl mt-0.5 shrink-0">🤖</span>
        <div className="text-xs text-indigo-800 leading-relaxed">
          <span className="font-semibold">How it works: </span>
          The AI agent researches each sponsor and drafts a personalised outreach email.
          You review and either <span className="font-semibold">approve</span> (marks it ready to send) or{' '}
          <span className="font-semibold">reject</span> it with a reason.
          You can also <span className="font-semibold">edit</span> the draft before approving.{' '}
          <span className="font-semibold text-indigo-600">No email is sent without your explicit approval.</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: emails.length, color: 'text-gray-800' },
          { label: 'Pending', value: emails.filter(e => e.status === 'pending_review').length, color: 'text-amber-600' },
          { label: 'Approved', value: emails.filter(e => e.status === 'approved').length, color: 'text-green-600' },
          { label: 'Rejected', value: emails.filter(e => e.status === 'rejected').length, color: 'text-red-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-center">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => {
          const count = tab.key === 'all'
            ? emails.length
            : emails.filter(e => e.status === tab.key).length;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                active ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Email cards */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">No emails in this category.</p>
          </div>
        )}

        {/* Pending first, then others */}
        {[...filtered]
          .sort((a, b) => {
            const order: Record<EmailReviewStatus, number> = {
              pending_review: 0, approved: 1, sent: 2, rejected: 3,
            };
            return order[a.status] - order[b.status];
          })
          .map((email) => (
            <EmailReviewCard
              key={email.id}
              email={email}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={handleEdit}
            />
          ))}
      </div>
    </div>
  );
}
