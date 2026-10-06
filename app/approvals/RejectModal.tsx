'use client';

import { useState } from 'react';

interface Props {
  company: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

const QUICK_REASONS = [
  'Timing is not right for this sponsor.',
  'Email tone needs significant rework.',
  'Sponsor has already declined — do not contact.',
  'Budget tier is incorrect.',
  'Missing key personalisation.',
];

export default function RejectModal({ company, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(reason.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-lg shrink-0">
            ✕
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Reject Email Draft</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Rejecting AI-drafted email for{' '}
              <span className="font-semibold text-gray-700">{company}</span>. This
              email will NOT be sent.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Quick-pick reasons */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Quick Reasons</p>
            <div className="flex flex-col gap-1.5">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                    reason === r
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Custom reason */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Or write a custom reason <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add a note for your team…"
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Reject Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
