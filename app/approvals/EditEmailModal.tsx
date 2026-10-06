'use client';

import { useState } from 'react';
import { EmailReview } from '@/app/lib/mock-data';

interface Props {
  email: EmailReview;
  onSave: (updated: Partial<EmailReview>) => void;
  onClose: () => void;
}

export default function EditEmailModal({ email, onSave, onClose }: Props) {
  const [subject, setSubject] = useState(email.subject);
  const [body, setBody] = useState(email.body);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    onSave({ subject: subject.trim(), body: body.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Draft Email</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Editing AI-generated draft for{' '}
              <span className="font-medium text-gray-700">{email.company}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto flex-1">
            {/* Meta strip */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
              <span>
                <span className="font-medium text-gray-600">To: </span>
                {email.recipientName} &lt;{email.recipientEmail}&gt;
              </span>
              <span>
                <span className="font-medium text-gray-600">Company: </span>
                {email.company}
              </span>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-semibold text-gray-600">Email Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={16}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none font-mono leading-relaxed"
              />
            </div>

            {/* AI notice */}
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚠️ You are editing an AI-generated draft. Changes are saved locally only. No email will be sent.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
