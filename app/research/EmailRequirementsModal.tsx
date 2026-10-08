'use client';

import { useState } from 'react';
import { CampaignRequirements } from '@/app/lib/types';

interface Props {
  sponsorName: string;
  onSubmit: (requirements: CampaignRequirements) => void;
  onCancel: () => void;
}

const EMPTY: CampaignRequirements = {
  eventName: '',
  eventDescription: '',
  sponsorshipAsk: '',
  sponsorBenefits: '',
  senderName: '',
  senderRole: '',
  organizationName: '',
  contactInfo: '',
  expectedParticipants: '',
  eventDate: '',
  specificRequest: '',
  additionalInstructions: '',
};

function Field({
  label,
  name,
  value,
  onChange,
  required,
  multiline,
  placeholder,
}: {
  label: string;
  name: keyof CampaignRequirements;
  value: string;
  onChange: (name: keyof CampaignRequirements, val: string) => void;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
}) {
  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none';
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {multiline ? (
        <textarea
          rows={3}
          className={inputClass}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className={inputClass}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function EmailRequirementsModal({ sponsorName, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<CampaignRequirements>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof CampaignRequirements, string>>>({});

  const handleChange = (name: keyof CampaignRequirements, val: string) => {
    setForm((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const requiredFields: (keyof CampaignRequirements)[] = [
      'eventName',
      'eventDescription',
      'sponsorshipAsk',
      'sponsorBenefits',
      'senderName',
      'senderRole',
      'organizationName',
      'contactInfo',
    ];
    const newErrors: Partial<Record<keyof CampaignRequirements, string>> = {};
    for (const field of requiredFields) {
      if (!form[field] || String(form[field]).trim() === '') {
        newErrors[field] = 'This field is required.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // Strip empty optional fields so they read as undefined
    const cleaned: CampaignRequirements = {
      ...form,
      expectedParticipants: form.expectedParticipants?.trim() || undefined,
      eventDate: form.eventDate?.trim() || undefined,
      specificRequest: form.specificRequest?.trim() || undefined,
      additionalInstructions: form.additionalInstructions?.trim() || undefined,
    };
    onSubmit(cleaned);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-auto">
        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg shrink-0">
            ✉️
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Email Campaign Requirements</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Fill in your campaign details for <span className="font-semibold text-gray-700">{sponsorName}</span>.
              These are passed directly to the AI — no details will be invented.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="ml-auto text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Required section */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Required Information
            </p>
            <div className="space-y-4">
              <Field
                label="Event / Hackathon Name"
                name="eventName"
                value={form.eventName}
                onChange={handleChange}
                required
                placeholder="e.g. HackSphere 2025"
              />
              {errors.eventName && <p className="text-xs text-red-500 -mt-3">{errors.eventName}</p>}

              <Field
                label="Event Description"
                name="eventDescription"
                value={form.eventDescription}
                onChange={handleChange}
                required
                multiline
                placeholder="Briefly describe your event, its goals, and audience."
              />
              {errors.eventDescription && <p className="text-xs text-red-500 -mt-3">{errors.eventDescription}</p>}

              <Field
                label="Sponsorship Ask"
                name="sponsorshipAsk"
                value={form.sponsorshipAsk}
                onChange={handleChange}
                required
                multiline
                placeholder="What exactly are you asking from this sponsor? (e.g. ₹50,000 cash sponsorship, API credits, swag)"
              />
              {errors.sponsorshipAsk && <p className="text-xs text-red-500 -mt-3">{errors.sponsorshipAsk}</p>}

              <Field
                label="Sponsor Benefits / What We Offer"
                name="sponsorBenefits"
                value={form.sponsorBenefits}
                onChange={handleChange}
                required
                multiline
                placeholder="What benefits does the sponsor receive? (e.g. Logo on banner, social media shoutout, booth space)"
              />
              {errors.sponsorBenefits && <p className="text-xs text-red-500 -mt-3">{errors.sponsorBenefits}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Field
                    label="Sender Name"
                    name="senderName"
                    value={form.senderName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Priya Sharma"
                  />
                  {errors.senderName && <p className="text-xs text-red-500 mt-1">{errors.senderName}</p>}
                </div>
                <div>
                  <Field
                    label="Sender Role / Title"
                    name="senderRole"
                    value={form.senderRole}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Sponsorship Lead"
                  />
                  {errors.senderRole && <p className="text-xs text-red-500 mt-1">{errors.senderRole}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Field
                    label="Organization / Club Name"
                    name="organizationName"
                    value={form.organizationName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. BITS Pilani Tech Club"
                  />
                  {errors.organizationName && <p className="text-xs text-red-500 mt-1">{errors.organizationName}</p>}
                </div>
                <div>
                  <Field
                    label="Contact Information"
                    name="contactInfo"
                    value={form.contactInfo}
                    onChange={handleChange}
                    required
                    placeholder="e.g. priya@example.com | +91 98765 43210"
                  />
                  {errors.contactInfo && <p className="text-xs text-red-500 mt-1">{errors.contactInfo}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Optional section */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Optional Details <span className="normal-case font-normal text-gray-400">(omitted from email if blank)</span>
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Expected Participants"
                  name="expectedParticipants"
                  value={form.expectedParticipants ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 300+ students"
                />
                <Field
                  label="Event Date"
                  name="eventDate"
                  value={form.eventDate ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. March 15–16, 2025"
                />
              </div>

              <Field
                label="Specific Request / Amount / Resources"
                name="specificRequest"
                value={form.specificRequest ?? ''}
                onChange={handleChange}
                placeholder="e.g. We are specifically requesting AWS credits worth $500."
              />

              <Field
                label="Additional Instructions"
                name="additionalInstructions"
                value={form.additionalInstructions ?? ''}
                onChange={handleChange}
                multiline
                placeholder="Any other guidance for the AI (tone, specific points to mention, etc.)"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-5 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            ✉️ Generate Email
          </button>
        </div>
      </div>
    </div>
  );
}
