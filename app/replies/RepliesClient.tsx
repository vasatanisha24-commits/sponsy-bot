'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReplyWithDetails } from '@/app/lib/types';

interface Props {
  initialReplies: ReplyWithDetails[];
  fetchError: string | null;
}

function ReplyCard({ reply, onClassify }: { reply: ReplyWithDetails; onClassify: (id: string, outcome: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const receivedDate = new Date(reply.receivedAt);
  const companyInitials = reply.sponsor.companyName.slice(0, 2).toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
          {companyInitials}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{reply.sponsor.companyName}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500 truncate">{reply.senderEmail}</span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5 truncate">{reply.subject}</p>
        </div>

        {/* Date + expand indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-400">
            {receivedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className={`text-gray-400 transition-transform text-xs ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Metadata row */}
          <div className="px-5 py-3 bg-gray-50 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
            <span><span className="text-gray-400">From: </span>{reply.senderEmail}</span>
            <span><span className="text-gray-400">Received: </span>
              {receivedDate.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>
              <span className="text-gray-400">In reply to: </span>
              <span className="italic">{reply.email.subject}</span>
            </span>
          </div>

          {/* Subject */}
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Subject</p>
            <p className="text-sm font-medium text-gray-800">{reply.subject}</p>
          </div>

          {/* Body */}
          <div className="px-5 pb-5 pt-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Message</p>
            <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans bg-gray-50 rounded-lg border border-gray-200 px-4 py-3">
              {reply.body || '(Empty body)'}
            </pre>
          </div>

          {/* Classification Action Bar */}
          <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap items-center gap-3 bg-gray-50">
            <span className="text-xs font-semibold text-gray-600 mr-2">Classification:</span>
            
            {reply.outcome === 'interested' && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium">✅ Interested (Follow-ups stopped)</span>
            )}
            
            {reply.outcome === 'declined' && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-red-100 text-red-700 font-medium">❌ Declined (Follow-ups stopped)</span>
            )}
            
            {(reply.outcome === 'needs_review' || !reply.outcome) && (
              <>
                <button
                  onClick={() => onClassify(reply.id, 'interested')}
                  className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                >
                  ✅ Mark Interested
                </button>
                <button
                  onClick={() => onClassify(reply.id, 'declined')}
                  className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                >
                  ❌ Mark Declined
                </button>
                {!reply.outcome && (
                  <button
                    onClick={() => onClassify(reply.id, 'needs_review')}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    Needs Review
                  </button>
                )}
                {reply.outcome === 'needs_review' && (
                  <span className="text-xs text-gray-500 italic ml-2">Currently marked for review</span>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RepliesClient({ initialReplies, fetchError }: Props) {
  const router = useRouter();
  const [replies, setReplies] = useState<ReplyWithDetails[]>(initialReplies);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ checkedCount: number; storedCount: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const res = await fetch('/api/replies/sync', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSyncError(data.error ?? `Sync failed (HTTP ${res.status})`);
      } else {
        setSyncResult({ checkedCount: data.checkedCount, storedCount: data.storedCount });
        // Refresh server data if new replies were stored
        if (data.storedCount > 0) {
          router.refresh();
        }
      }
    } catch (err: any) {
      setSyncError(err.message ?? 'Unknown error');
    } finally {
      setSyncing(false);
    }
  }

  async function handleClassify(id: string, outcome: string) {
    try {
      const res = await fetch(`/api/replies/${id}/classify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome })
      });
      if (res.ok) {
        setReplies((prev) =>
          prev.map((r) => (r.id === id ? { ...r, outcome } : r))
        );
        router.refresh(); // Refresh to update pipeline/outreach views
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? 'Failed to classify');
      }
    } catch (err: any) {
      alert('Error classifying reply: ' + err.message);
    }
  }

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sponsor Replies</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Incoming Gmail replies matched to your sent outreach emails.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {replies.length > 0 && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-3 py-2 rounded-full">
              📬 {replies.length} {replies.length === 1 ? 'reply' : 'replies'} received
            </div>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            {syncing ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Syncing…
              </>
            ) : '🔄 Sync Inbox'}
          </button>
          <button
            onClick={() => router.refresh()}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Sync result banner */}
      {syncResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-800">
          ✅ Sync complete — checked <strong>{syncResult.checkedCount}</strong> messages,{' '}
          stored <strong>{syncResult.storedCount}</strong> new {syncResult.storedCount === 1 ? 'reply' : 'replies'}.
        </div>
      )}
      {syncError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-800">
          ❌ Sync error: {syncError}
        </div>
      )}

      {/* DB fetch error */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-800">
          ❌ Failed to load replies: {fetchError}
        </div>
      )}

      {/* Reply list */}
      {!fetchError && replies.length === 0 && (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm font-medium text-gray-500">No sponsor replies yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Click <strong>Sync Inbox</strong> to check your Gmail for replies to sent outreach emails.
          </p>
        </div>
      )}

      {replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply) => (
            <ReplyCard key={reply.id} reply={reply} onClassify={handleClassify} />
          ))}
        </div>
      )}
    </div>
  );
}
