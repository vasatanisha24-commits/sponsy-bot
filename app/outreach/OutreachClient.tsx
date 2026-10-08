'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmailWithDetails, EmailReviewStatus } from '@/app/lib/types';

interface Props {
  initialEmails: EmailWithDetails[];
  fetchError: string | null;
}

// ── Shared UI: Confirm Send Dialog ──
function ConfirmSendDialog({ recipientName, recipientEmail, subject, onConfirm, onCancel, sending }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg shrink-0">📤</div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Send This Email?</h2>
            <p className="text-xs text-gray-500 mt-0.5">This will be sent immediately via Gmail.</p>
          </div>
        </div>
        <div className="px-6 py-4 space-y-2">
          <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 space-y-1.5 text-xs">
            <div className="flex gap-2">
              <span className="text-gray-400 w-16 shrink-0">To:</span>
              <span className="font-medium text-gray-700">{recipientName} &lt;{recipientEmail}&gt;</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-16 shrink-0">Subject:</span>
              <span className="font-medium text-gray-700 truncate">{subject}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-5">
          <button type="button" onClick={onCancel} disabled={sending} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={sending} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">
            {sending ? 'Sending…' : '📤 Yes, Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared UI: View Email Modal ──
function ViewEmailModal({ email, onClose }: { email: EmailWithDetails; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">View Email</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 text-sm space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2 shadow-sm">
            <p><span className="text-gray-400 w-16 inline-block">To:</span> <span className="font-medium">{email.contact.name} &lt;{email.contact.email}&gt;</span></p>
            <p><span className="text-gray-400 w-16 inline-block">Subject:</span> <span className="font-medium">{email.subject}</span></p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">{email.body}</pre>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function OutreachClient({ initialEmails, fetchError }: Props) {
  const router = useRouter();
  const [emails, setEmails] = useState<EmailWithDetails[]>(initialEmails);
  const [filter, setFilter] = useState<EmailReviewStatus | 'all'>('all');
  
  // Modals state
  const [viewEmail, setViewEmail] = useState<EmailWithDetails | null>(null);
  const [confirmSend, setConfirmSend] = useState<EmailWithDetails | null>(null);
  const [sending, setSending] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return filter === 'all' ? emails : emails.filter((e) => e.status === filter);
  }, [emails, filter]);

  const handleSendConfirmed = async () => {
    if (!confirmSend) return;
    setSending(true);
    setGlobalError(null);
    try {
      const res = await fetch(`/api/emails/${confirmSend.id}/send`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Server error (HTTP ${res.status})`);
      
      setEmails((prev) => prev.map((e) => e.id === confirmSend.id ? { ...e, status: 'sent', sentAt: data.sentAt || new Date().toISOString() } : e));
      setConfirmSend(null);
      router.refresh();
    } catch (err: any) {
      setGlobalError(`Send failed: ${err.message}`);
      setConfirmSend(null);
    } finally {
      setSending(false);
    }
  };

  const getStatusPill = (status: string) => {
    const config: Record<string, string> = {
      pending_review: 'bg-amber-100 text-amber-700 border-amber-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      sent: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      draft: 'bg-gray-100 text-gray-600 border-gray-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return `px-2 py-0.5 rounded text-xs font-medium border ${config[status] || config.draft}`;
  };

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outreach Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all outreach emails across stages.</p>
        </div>
        <button onClick={() => router.refresh()} className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200">
          🔄 Refresh
        </button>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <span className="font-semibold">Database error: </span>{fetchError}
        </div>
      )}

      {globalError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex justify-between">
          <span>{globalError}</span>
          <button onClick={() => setGlobalError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {['all', 'draft', 'pending_review', 'approved', 'sent', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === tab ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {tab.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Sponsor &amp; Contact</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created / Sent</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No emails found in this status.</td></tr>
            ) : (
              filtered.map(email => {
                const isSent = email.status === 'sent';
                const isApproved = email.status === 'approved';
                const needsReview = email.status === 'pending_review' || email.status === 'draft';
                const followUp = email.followUps?.[0];

                return (
                  <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {email.sponsor.companyName}
                        <Link href={`/sponsors/${email.sponsorId}`} className="text-[10px] text-indigo-500 hover:underline">↗ View</Link>
                      </div>
                      <div className="text-xs text-gray-500">{email.contact.name} &lt;{email.contact.email}&gt;</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[200px] truncate text-gray-800" title={email.subject}>{email.subject}</div>
                      {email.sponsor.research?.[0] && (
                        <Link href="/research" className="text-[10px] text-blue-500 hover:underline inline-flex mt-1">🔬 View AI Research</Link>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusPill(email.status)}>
                        {email.status.replace('_', ' ')}
                      </span>
                      {followUp && (
                        <div className="mt-1 text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded inline-block border border-purple-100">
                          Follow-up: {followUp.status}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <div>Created: {new Date(email.createdAt).toLocaleDateString('en-IN')}</div>
                      {email.sentAt && <div className="text-indigo-600">Sent: {new Date(email.sentAt).toLocaleDateString('en-IN')}</div>}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => setViewEmail(email)} className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded transition-colors">
                        View
                      </button>

                      {needsReview && (
                        <Link href="/approvals" className="inline-block text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded transition-colors">
                          Review
                        </Link>
                      )}

                      {isApproved && (
                        <button onClick={() => setConfirmSend(email)} className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 rounded shadow-sm transition-colors">
                          📤 Send
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {viewEmail && <ViewEmailModal email={viewEmail} onClose={() => setViewEmail(null)} />}
      {confirmSend && (
        <ConfirmSendDialog
          recipientName={confirmSend.contact.name}
          recipientEmail={confirmSend.contact.email}
          subject={confirmSend.subject}
          onConfirm={handleSendConfirmed}
          onCancel={() => setConfirmSend(null)}
          sending={sending}
        />
      )}
    </div>
  );
}
