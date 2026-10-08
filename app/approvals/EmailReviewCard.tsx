'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmailWithDetails } from '@/app/lib/types';
import RejectModal from './RejectModal';

interface Props {
  email: EmailWithDetails;
  onApproved: (id: string, subject: string, body: string) => void;
  onSent: (id: string) => void;
  onEdited: (id: string, subject: string, body: string) => void;
  onError: (msg: string) => void;
  onRejected?: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { pill: string; label: string }> = {
  pending_review: { pill: 'bg-amber-100 text-amber-700 border border-amber-200', label: '⏳ Pending Review' },
  approved: { pill: 'bg-green-100 text-green-700 border border-green-200', label: '✅ Approved' },
  sent: { pill: 'bg-indigo-100 text-indigo-700 border border-indigo-200', label: '📤 Sent' },
  draft: { pill: 'bg-gray-100 text-gray-600 border border-gray-200', label: '📝 Draft' },
  rejected: { pill: 'bg-red-100 text-red-700 border border-red-200', label: '✕ Rejected' },
};

function ScoreBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className={`text-xs font-bold w-9 text-right ${color.replace('bg-', 'text-')}`}>{value}%</span>
    </div>
  );
}

// ── Inline Send Confirmation Dialog ─────────────────────────────────────────
interface ConfirmSendProps {
  recipientName: string;
  recipientEmail: string;
  subject: string;
  onConfirm: () => void;
  onCancel: () => void;
  sending: boolean;
}

function ConfirmSendDialog({ recipientName, recipientEmail, subject, onConfirm, onCancel, sending }: ConfirmSendProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg shrink-0">
            📤
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Send This Email?</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              This will be sent immediately via Gmail. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Details */}
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
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠️ Double-check the recipient and subject before sending. No recall is possible.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 pb-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={sending}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={sending}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors shadow-sm"
          >
            {sending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending…
              </>
            ) : (
              '📤 Yes, Send Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Card ────────────────────────────────────────────────────────────────

export default function EmailReviewCard({ email, onApproved, onSent, onEdited, onError, onRejected }: Props) {
  const router = useRouter();

  const [expanded, setExpanded] = useState(email.status === 'pending_review');
  const [editing, setEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [subject, setSubject] = useState(email.subject);
  const [body, setBody] = useState(email.body);

  const [approving, setApproving] = useState(false);
  const [sending, setSending] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Per-card inline feedback (not just bubbled to page)
  const [cardError, setCardError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState<{ messageId: string; sentAt: string | null } | null>(null);

  const [localStatus, setLocalStatus] = useState<string>(email.status);

  const cfg = STATUS_CONFIG[localStatus] ?? STATUS_CONFIG['draft'];
  const isPending = localStatus === 'pending_review';
  const isApproved = localStatus === 'approved';
  const isSent = localStatus === 'sent';
  const isRejected = localStatus === 'rejected';

  const latestResearch = email.sponsor.research?.[0] ?? null;
  const aiScore = latestResearch?.aiScore ?? null;
  const researchSummary = latestResearch?.summary ?? null;
  const sponsorInitials = email.sponsor.companyName.slice(0, 2).toUpperCase();

  // ── Save edits locally ───────────────────────────────────────────────────
  function handleSaveEdits(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setEditing(false);
    onEdited(email.id, subject.trim(), body.trim());
  }

  // ── PATCH /api/emails/[id]/reject ───────────────────────────────────────
  async function handleRejectConfirmed(reason: string) {
    setCardError(null);
    setRejecting(true);
    setShowRejectModal(false);
    try {
      const res = await fetch(`/api/emails/${email.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error (HTTP ${res.status})`);
      }
      setLocalStatus('rejected');
      onRejected?.(email.id);
      router.refresh();
    } catch (err: any) {
      const msg = `Reject failed: ${err.message}`;
      setCardError(msg);
      onError(msg);
    } finally {
      setRejecting(false);
    }
  }

  // ── PATCH /api/emails/[id]/approve ──────────────────────────────────────
  async function handleApprove() {
    setCardError(null);
    setApproving(true);
    try {
      const res = await fetch(`/api/emails/${email.id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error (HTTP ${res.status})`);
      }
      setLocalStatus('approved');
      onApproved(email.id, subject.trim(), body.trim());
    } catch (err: any) {
      const msg = `Approve failed: ${err.message}`;
      setCardError(msg);
      onError(msg);
    } finally {
      setApproving(false);
    }
  }

  // ── POST /api/emails/[id]/send ───────────────────────────────────────────
  // Step 1: user clicks Send → show confirmation dialog
  function handleSendClick() {
    setCardError(null);
    setShowConfirm(true);
  }

  // Step 2: user confirms in the dialog → actually call the API
  async function handleSendConfirmed() {
    setSending(true);
    try {
      const res = await fetch(`/api/emails/${email.id}/send`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? `Server error (HTTP ${res.status})`);
      }

      // ── Success ──────────────────────────────────────────────────────────
      setLocalStatus('sent');
      setSentSuccess({ messageId: data.messageId ?? null, sentAt: data.sentAt ?? null });
      setShowConfirm(false);
      onSent(email.id);

      // Sync real DB state back into the page
      router.refresh();
    } catch (err: any) {
      // ── Failure — do NOT change local status ─────────────────────────────
      const msg = `Send failed: ${err.message}`;
      setCardError(msg);
      onError(msg);
      setShowConfirm(false);
    } finally {
      setSending(false);
    }
  }

  function handleSendCancelled() {
    if (!sending) setShowConfirm(false);
  }

  return (
    <>
      {/* Confirmation dialog — rendered at top level so it overlays everything */}
      {showConfirm && (
        <ConfirmSendDialog
          recipientName={email.contact.name}
          recipientEmail={email.contact.email}
          subject={subject}
          onConfirm={handleSendConfirmed}
          onCancel={handleSendCancelled}
          sending={sending}
        />
      )}

      <div className={`bg-white rounded-xl border transition-shadow hover:shadow-md ${
        isPending ? 'border-amber-200 shadow-sm' : isSent ? 'border-indigo-200' : 'border-gray-200'
      }`}>
        {/* ── Card header ── */}
        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            {/* Company + recipient */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0">
                {sponsorInitials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{email.sponsor.companyName}</p>
                <p className="text-xs text-gray-500 truncate">
                  To: {email.contact.name} &lt;{email.contact.email}&gt;
                  {email.contact.role && <span className="ml-1 text-gray-400">· {email.contact.role}</span>}
                </p>
              </div>
            </div>

            {/* Status pill + collapse toggle */}
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

          {/* Subject + created date + tier */}
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-800 truncate">📧 {subject}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <span className="text-xs text-gray-400">
                🕐 Created{' '}
                {new Date(email.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
              {email.sponsor.tier && (
                <span className="text-xs text-gray-400">🏷️ {email.sponsor.tier} tier</span>
              )}
            </div>
          </div>

          {/* Score bars */}
          {(email.confidenceScore !== null || aiScore !== null) && (
            <div className="mt-3 space-y-1.5">
              {email.confidenceScore !== null && (
                <ScoreBar
                  label="AI Confidence"
                  value={email.confidenceScore}
                  color={
                    email.confidenceScore >= 80 ? 'bg-green-500' :
                    email.confidenceScore >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                  }
                />
              )}
              {aiScore !== null && (
                <ScoreBar
                  label="Sponsor Score"
                  value={aiScore}
                  color={aiScore >= 80 ? 'bg-green-500' : aiScore >= 60 ? 'bg-indigo-500' : 'bg-amber-500'}
                />
              )}
            </div>
          )}

          {/* Research summary */}
          {researchSummary && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800 leading-relaxed">
              <span className="font-semibold">🔬 Research: </span>{researchSummary}
            </div>
          )}

          {/* Per-card error */}
          {cardError && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 flex items-start justify-between gap-2">
              <span>⚠️ {cardError}</span>
              <button onClick={() => setCardError(null)} className="text-red-400 hover:text-red-600 shrink-0">✕</button>
            </div>
          )}

          {/* ── Status banners ── */}

          {/* Approved: show a clear Send button (separate from the action bar) */}
          {isApproved && !sentSuccess && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
              <div className="text-xs text-green-700">
                <span className="font-semibold">✅ Approved</span> — ready to send. Use the button to send.
              </div>
              <button
                onClick={handleSendClick}
                disabled={sending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors shadow-sm shrink-0"
              >
                📤 Send Email
              </button>
            </div>
          )}

          {/* Sent: success banner with messageId */}
          {(isSent || sentSuccess) && (
            <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2.5 text-xs text-indigo-700 space-y-1">
              <p className="font-semibold">📤 Email Sent Successfully</p>
              {sentSuccess?.messageId && (
                <p className="text-indigo-500 font-mono text-[10px] break-all">
                  Message ID: {sentSuccess.messageId}
                </p>
              )}
              {sentSuccess?.sentAt && (
                <p>Sent at: {new Date(sentSuccess.sentAt).toLocaleString('en-IN')}</p>
              )}
              {!sentSuccess && email.sentAt && (
                <p>
                  Sent on{' '}
                  {new Date(email.sentAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              )}
            </div>
          )}

          {/* Rejected banner */}
          {isRejected && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700 space-y-1">
              <p className="font-semibold">✕ Email Rejected</p>
              <p>This draft will not be sent and is archived for reference.</p>
            </div>
          )}
        </div>

        {/* ── Expanded body ── */}
        {expanded && (
          <div className="border-t border-gray-100">
            {editing ? (
              /* Inline edit form */
              <form onSubmit={handleSaveEdits} className="px-5 py-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Editing Draft</p>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    rows={14}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none font-mono leading-relaxed"
                  />
                </div>

                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⚠️ Edits are saved locally. Click <strong>Approve</strong> to persist changes to the
                  database and mark the email ready to send.
                </p>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setSubject(email.subject); setBody(email.body); setEditing(false); }}
                    className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    Save Edits
                  </button>
                </div>
              </form>
            ) : (
              /* Email preview */
              <div className="px-5 py-4 bg-gray-50">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 space-y-1">
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-400 w-16 shrink-0">To:</span>
                      <span className="font-medium text-gray-700">
                        {email.contact.name} &lt;{email.contact.email}&gt;
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-400 w-16 shrink-0">Subject:</span>
                      <span className="font-medium text-gray-700">{subject}</span>
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{body}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* ── Action bar ── */}
            {!editing && (
              <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                {isPending && (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      ✏️ Edit Draft
                    </button>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={rejecting || approving}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-60 rounded-lg transition-colors shadow-sm"
                      >
                        {rejecting ? (
                          <>
                            <span className="w-3 h-3 border-2 border-red-700/30 border-t-red-700 rounded-full animate-spin" />
                            Rejecting…
                          </>
                        ) : '✕ Reject'}
                      </button>
                      <button
                        onClick={handleApprove}
                        disabled={approving || rejecting}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 rounded-lg transition-colors shadow-sm"
                      >
                        {approving ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Approving…
                          </>
                        ) : '✅ Approve'}
                      </button>
                    </div>
                  </>
                )}

                {isApproved && (
                  <div className="flex w-full items-center justify-between gap-3">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      ✏️ Edit &amp; Re-approve
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 italic">Approved — not yet sent</span>
                      <button
                        onClick={handleSendClick}
                        disabled={sending}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors shadow-sm"
                      >
                        📤 Send Email
                      </button>
                    </div>
                  </div>
                )}

                {isSent && (
                  <span className="text-xs text-gray-400 italic">This email has been sent.</span>
                )}

                {!isPending && !isApproved && !isSent && (
                  <span className="text-xs text-gray-400 italic">No further action available.</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showRejectModal && (
        <RejectModal
          company={email.sponsor.companyName}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleRejectConfirmed}
        />
      )}
    </>
  );
}
