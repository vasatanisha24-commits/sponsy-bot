'use client';

import { useState } from 'react';
import { EmailReview } from '@/app/lib/mock-data';
import EditEmailModal from './EditEmailModal';
import RejectModal from './RejectModal';

interface Props {
  email: EmailReview;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onEdit: (id: string, updated: Partial<EmailReview>) => void;
}

const STATUS_CONFIG = {
  pending_review: {
    pill: 'bg-amber-100 text-amber-700 border border-amber-200',
    label: '⏳ Pending Review',
    dot: 'bg-amber-400',
  },
  approved: {
    pill: 'bg-green-100 text-green-700 border border-green-200',
    label: '✅ Approved',
    dot: 'bg-green-400',
  },
  rejected: {
    pill: 'bg-red-100 text-red-700 border border-red-200',
    label: '✕ Rejected',
    dot: 'bg-red-400',
  },
  sent: {
    pill: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    label: '📤 Sent',
    dot: 'bg-indigo-400',
  },
};

function ConfidenceBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? 'text-green-600' : score >= 75 ? 'text-indigo-600' : 'text-amber-600';
  const bar =
    score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-indigo-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">AI Confidence</span>
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold ${color}`}>{score}%</span>
    </div>
  );
}

export default function EmailReviewCard({ email, onApprove, onReject, onEdit }: Props) {
  const [expanded, setExpanded] = useState(email.status === 'pending_review');
  const [showEdit, setShowEdit] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const cfg = STATUS_CONFIG[email.status];
  const isPending = email.status === 'pending_review';

  return (
    <>
      <div className={`bg-white rounded-xl border transition-shadow hover:shadow-md ${
        isPending ? 'border-amber-200 shadow-sm' : 'border-gray-200'
      }`}>
        {/* Card header */}
        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            {/* Company + recipient */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0">
                {email.logo}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{email.company}</p>
                <p className="text-xs text-gray-500 truncate">
                  To: {email.recipientName} &lt;{email.recipientEmail}&gt;
                </p>
              </div>
            </div>

            {/* Right: status + toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.pill}`}>
                {cfg.label}
              </span>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-gray-400 hover:text-gray-600 text-sm transition-transform"
                style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                aria-label={expanded ? 'Collapse' : 'Expand'}
              >
                ▾
              </button>
            </div>
          </div>

          {/* Subject + meta */}
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-800 truncate">
              📧 {email.subject}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <span className="text-xs text-gray-400">🤖 Generated {email.generatedAt}</span>
              {email.reviewedAt && (
                <span className="text-xs text-gray-400">
                  👤 Reviewed by {email.reviewedBy} · {email.reviewedAt}
                </span>
              )}
              <ConfidenceBadge score={email.aiConfidence} />
            </div>
          </div>

          {/* Rejection reason banner */}
          {email.status === 'rejected' && email.rejectionReason && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
              <span className="font-semibold">Rejection note: </span>
              {email.rejectionReason}
            </div>
          )}

          {/* Approved send-ready banner */}
          {email.status === 'approved' && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
              ✅ Approved — this email is ready to send once the send feature is enabled.
            </div>
          )}
        </div>

        {/* Expanded: email body + actions */}
        {expanded && (
          <div className="border-t border-gray-100">
            {/* Email preview */}
            <div className="px-5 py-4 bg-gray-50">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Email header strip */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 space-y-1">
                  <div className="flex gap-2 text-xs">
                    <span className="text-gray-400 w-16 shrink-0">To:</span>
                    <span className="font-medium text-gray-700">
                      {email.recipientName} &lt;{email.recipientEmail}&gt;
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-gray-400 w-16 shrink-0">Subject:</span>
                    <span className="font-medium text-gray-700">{email.subject}</span>
                  </div>
                </div>
                {/* Body */}
                <div className="px-4 py-4">
                  <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                    {email.body}
                  </pre>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
              {isPending ? (
                <>
                  {/* Edit */}
                  <button
                    onClick={() => setShowEdit(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    ✏️ Edit Draft
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    {/* Reject */}
                    <button
                      onClick={() => setShowReject(true)}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                    >
                      ✕ Reject
                    </button>
                    {/* Approve */}
                    <button
                      onClick={() => onApprove(email.id)}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
                    >
                      ✅ Approve
                    </button>
                  </div>
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  {email.status === 'approved'
                    ? 'This email has been approved. No further action required.'
                    : 'This email was rejected and will not be sent.'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEdit && (
        <EditEmailModal
          email={email}
          onSave={(updated) => { onEdit(email.id, updated); setShowEdit(false); }}
          onClose={() => setShowEdit(false)}
        />
      )}
      {showReject && (
        <RejectModal
          company={email.company}
          onConfirm={(reason) => { onReject(email.id, reason); setShowReject(false); }}
          onClose={() => setShowReject(false)}
        />
      )}
    </>
  );
}
