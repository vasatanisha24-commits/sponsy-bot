'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EmailWithDetails, EmailReviewStatus } from '@/app/lib/types';
import EmailReviewCard from './EmailReviewCard';

interface Props {
  initialEmails: EmailWithDetails[];
  fetchError: string | null;
}

type FilterTab = EmailReviewStatus | 'all';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending_review', label: '⏳ Pending' },
  { key: 'approved', label: '✅ Approved' },
  { key: 'sent', label: '📤 Sent' },
  { key: 'rejected', label: '✕ Rejected' },
];

export default function ApprovalsPageClient({ initialEmails, fetchError }: Props) {
  const router = useRouter();
  const [emails, setEmails] = useState<EmailWithDetails[]>(initialEmails);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const pendingCount = emails.filter((e) => e.status === 'pending_review').length;

  // Called by EmailReviewCard after a successful PATCH /approve
  function handleApproved(id: string, updatedSubject: string, updatedBody: string) {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: 'approved', subject: updatedSubject, body: updatedBody }
          : e
      )
    );
  }

  // Called by EmailReviewCard after a successful PATCH /send
  function handleSent(id: string) {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'sent' } : e))
    );
  }

  // Called by EmailReviewCard after a successful PATCH /reject
  function handleRejected(id: string) {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'rejected' } : e))
    );
  }

  // Called by EmailReviewCard when edits are saved (but not yet approved)
  function handleEdited(id: string, subject: string, body: string) {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, subject, body } : e))
    );
  }

  // Filter
  const filtered = useMemo(
    () => (activeTab === 'all' ? emails : emails.filter((e) => e.status === activeTab)),
    [emails, activeTab]
  );

  // Sort: pending first, then approved, sent, others
  const STATUS_ORDER: Record<string, number> = {
    pending_review: 0,
    approved: 1,
    sent: 2,
    draft: 3,
    rejected: 4,
  };
  const sorted = [...filtered].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
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
        <div className="flex items-center gap-2 flex-wrap">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {pendingCount} email{pendingCount !== 1 ? 's' : ''} awaiting your review
            </div>
          )}
          {pendingCount === 0 && emails.length > 0 && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-2 rounded-full">
              ✅ All emails reviewed
            </div>
          )}
          <button
            onClick={() => router.refresh()}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* DB fetch error */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <span className="font-semibold">Database error: </span>{fetchError}
        </div>
      )}

      {/* Global action error (e.g. approve/save failed) */}
      {globalError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{globalError}</span>
          <button onClick={() => setGlobalError(null)} className="text-red-400 hover:text-red-600 text-xs shrink-0">✕ Dismiss</button>
        </div>
      )}

      {/* Human-in-the-loop banner */}
      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
        <span className="text-indigo-500 text-xl mt-0.5 shrink-0">🤖</span>
        <div className="text-xs text-indigo-800 leading-relaxed">
          <span className="font-semibold">How it works: </span>
          The AI agent researches each sponsor and drafts a personalised outreach email.
          You review, optionally edit, then <span className="font-semibold">approve</span> it
          (marks it ready to send).{' '}
          <span className="font-semibold text-indigo-600">
            Approval and sending are two separate actions — no email is sent automatically.
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: emails.length, color: 'text-gray-800' },
          { label: 'Pending', value: emails.filter((e) => e.status === 'pending_review').length, color: 'text-amber-600' },
          { label: 'Approved', value: emails.filter((e) => e.status === 'approved').length, color: 'text-green-600' },
          { label: 'Sent', value: emails.filter((e) => e.status === 'sent').length, color: 'text-indigo-600' },
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
          const count = tab.key === 'all' ? emails.length : emails.filter((e) => e.status === tab.key).length;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
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
        {!fetchError && sorted.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm font-medium text-gray-500">
              {activeTab === 'all'
                ? 'No emails yet. Run research on a sponsor to generate an AI draft.'
                : `No emails with status "${activeTab}".`}
            </p>
          </div>
        )}

        {sorted.map((email) => (
          <EmailReviewCard
            key={email.id}
            email={email}
            onApproved={handleApproved}
            onSent={handleSent}
            onEdited={handleEdited}
            onError={setGlobalError}
            onRejected={handleRejected}
          />
        ))}
      </div>
    </div>
  );
}
