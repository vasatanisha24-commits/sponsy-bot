'use client';

import { useState } from 'react';
import {
  SponsorUI,
  SponsorStatus,
  SponsorTier,
  SponsorPriority,
} from '@/app/lib/types';
import { INDUSTRIES, TEAM_MEMBERS } from '@/app/lib/constants';

interface Props {
  onAdd: (sponsor: SponsorUI) => void;
  onClose: () => void;
}

type FormValues = {
  company: string;
  website: string;
  industry: string;
  description: string;
  contact: string;
  email: string;
  tier: SponsorTier;
  priority: SponsorPriority;
  status: SponsorStatus;
  assignedTo: string;
  notes: string;
};

const EMPTY: FormValues = {
  company: '',
  website: '',
  industry: '',
  description: '',
  contact: '',
  email: '',
  tier: 'silver',
  priority: 'medium',
  status: 'researched',
  assignedTo: TEAM_MEMBERS[0],
  notes: '',
};

function initials(company: string) {
  return company
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function AddSponsorModal({ onAdd, onClose }: Props) {
  const [form, setForm] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormValues, string>> = {};
    if (!form.company.trim()) e.company = 'Company name is required.';
    if (!form.industry) e.industry = 'Please select an industry.';
    if (!form.contact.trim()) e.contact = 'Contact name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address.';
    if (
      form.website &&
      !/^https?:\/\/.+/.test(form.website)
    )
      e.website = 'Website must start with http:// or https://';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        companyName: form.company.trim(),
        website: form.website.trim() || null,
        industry: form.industry || null,
        description: form.description.trim() || null,
        tier: form.tier,
        priority: form.priority,
        status: form.status,
        assignedTo: form.assignedTo || null,
        contacts: {
          create: [
            {
              name: form.contact.trim(),
              email: form.email.trim(),
            }
          ]
        }
      };

      const res = await fetch('/api/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to add sponsor');
      }

      const dbSponsor = await res.json();
      
      // We pass the payload back out so the UI can update optimistically
      onAdd({
        id: dbSponsor.id,
        company: dbSponsor.companyName,
        website: dbSponsor.website || '',
        industry: dbSponsor.industry || 'Other',
        description: dbSponsor.description || '',
        logo: initials(dbSponsor.companyName),
        contact: form.contact.trim(),
        email: form.email.trim(),
        tier: form.tier,
        priority: form.priority,
        status: form.status,
        assignedTo: form.assignedTo,
        score: 0,
        lastActivity: 'Just now',
        notes: form.notes.trim(),
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Failed to save sponsor');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add Sponsor</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the details. AI score will be assigned later.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {submitError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              {submitError}
            </div>
          )}
          {/* Company + Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name *" error={errors.company}>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                className={inputCls(!!errors.company)}
              />
            </Field>
            <Field label="Website" error={errors.website}>
              <input
                type="url"
                placeholder="https://example.com"
                value={form.website}
                onChange={(e) => set('website', e.target.value)}
                className={inputCls(!!errors.website)}
              />
            </Field>
          </div>

          {/* Industry + Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Industry *" error={errors.industry}>
              <select
                value={form.industry}
                onChange={(e) => set('industry', e.target.value)}
                className={inputCls(!!errors.industry)}
              >
                <option value="">Select industry…</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </Field>
            <Field label="Assigned To">
              <select
                value={form.assignedTo}
                onChange={(e) => set('assignedTo', e.target.value)}
                className={inputCls(false)}
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <textarea
              placeholder="Brief description of the company…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              className={`${inputCls(false)} resize-none`}
            />
          </Field>

          {/* Contact + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Name *" error={errors.contact}>
              <input
                type="text"
                placeholder="e.g. Jane Smith"
                value={form.contact}
                onChange={(e) => set('contact', e.target.value)}
                className={inputCls(!!errors.contact)}
              />
            </Field>
            <Field label="Contact Email *" error={errors.email}>
              <input
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className={inputCls(!!errors.email)}
              />
            </Field>
          </div>

          {/* Tier + Priority + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Tier">
              <select
                value={form.tier}
                onChange={(e) => set('tier', e.target.value as SponsorTier)}
                className={inputCls(false)}
              >
                <option value="platinum">Platinum</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
              </select>
            </Field>
            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) => set('priority', e.target.value as SponsorPriority)}
                className={inputCls(false)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as SponsorStatus)}
                className={inputCls(false)}
              >
                <option value="researched">Researched</option>
                <option value="outreach_pending">Pending Approval</option>
                <option value="contacted">Contacted</option>
                <option value="follow_up">Follow-up</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
            </Field>
          </div>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              placeholder="Any internal notes about this sponsor…"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
              className={`${inputCls(false)} resize-none`}
            />
          </Field>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Sponsor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
    hasError
      ? 'border-red-300 focus:ring-red-200'
      : 'border-gray-200 focus:ring-indigo-200'
  }`;
}
