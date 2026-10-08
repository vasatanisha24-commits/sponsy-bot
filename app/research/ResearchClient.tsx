'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { scoreColor } from '@/app/lib/sponsor-styles';
import { CampaignRequirements } from '@/app/lib/types';
import EmailRequirementsModal from './EmailRequirementsModal';

type SponsorWithResearch = {
  id: string;
  companyName: string;
  priority: string;
  status: string;
  research: {
    id: string;
    aiScore: number | null;
    summary: string | null;
    data: any;
    createdAt: Date;
  }[];
  emails: {
    id: string;
    status: string;
  }[];
};

interface Props {
  initialSponsors: SponsorWithResearch[];
}

export default function ResearchClient({ initialSponsors }: Props) {
  const router = useRouter();
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Modal state: null = closed, string = sponsorId waiting for requirements
  const [pendingSponsorId, setPendingSponsorId] = useState<string | null>(null);

  /** Open the requirements modal for the given sponsor. */
  const handleOpenModal = (sponsorId: string) => {
    setPendingSponsorId(sponsorId);
  };

  /** Called when the user submits the requirements form. */
  const handleRequirementsSubmit = async (requirements: CampaignRequirements) => {
    if (!pendingSponsorId) return;
    const sponsorId = pendingSponsorId;
    setPendingSponsorId(null);
    await runResearch(sponsorId, requirements);
  };

  /** Run research + email generation with validated campaign requirements. */
  const runResearch = async (sponsorId: string, campaignRequirements: CampaignRequirements) => {
    setRunning((prev) => ({ ...prev, [sponsorId]: true }));
    setErrors((prev) => ({ ...prev, [sponsorId]: '' }));

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsorId, campaignRequirements }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to run research');
      }

      // Success
      router.refresh();
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, [sponsorId]: err.message }));
    } finally {
      setRunning((prev) => ({ ...prev, [sponsorId]: false }));
    }
  };

  const pendingSponsor = pendingSponsorId
    ? initialSponsors.find((s) => s.id === pendingSponsorId)
    : null;

  if (initialSponsors.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No sponsors yet</h3>
        <p className="text-sm text-gray-500 mb-4">
          Add a sponsor to automatically generate AI intelligence and research.
        </p>
        <Link
          href="/sponsors"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Go to Sponsors
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Email Requirements Modal */}
      {pendingSponsorId && pendingSponsor && (
        <EmailRequirementsModal
          sponsorName={pendingSponsor.companyName}
          onSubmit={handleRequirementsSubmit}
          onCancel={() => setPendingSponsorId(null)}
        />
      )}

      <div className="space-y-4">
        {initialSponsors.map((sponsor) => {
          const hasResearch = sponsor.research.length > 0;
          const research = hasResearch ? sponsor.research[0] : null;
          const intelligenceData = research?.data as any;
          const csrFocus = intelligenceData?.csrFocus || '—';
          const fitReasoning = intelligenceData?.fitReasoning || '—';
          const email = sponsor.emails.length > 0 ? sponsor.emails[0] : null;

          const isRunning = running[sponsor.id];
          const error = errors[sponsor.id];

          return (
            <div key={sponsor.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{sponsor.companyName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      hasResearch ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {hasResearch ? 'Research Available' : 'No Research'}
                    </span>
                    {hasResearch && research?.aiScore != null && (
                      <span className="text-xs font-medium text-gray-500">
                        Score: <strong className={scoreColor(research.aiScore)}>{research.aiScore}/100</strong>
                      </span>
                    )}
                    {hasResearch && sponsor.priority && (
                      <span className="text-xs font-medium text-gray-500 capitalize">
                        Priority: <strong>{sponsor.priority}</strong>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link
                    href={`/sponsors/${sponsor.id}`}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                  >
                    View Sponsor
                  </Link>
                  {email && (
                    <Link
                      href={`/approvals`}
                      className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded transition-colors"
                    >
                      View Draft
                    </Link>
                  )}
                  <button
                    onClick={() => handleOpenModal(sponsor.id)}
                    disabled={isRunning}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-800 hover:bg-gray-900 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isRunning ? (
                      <>
                        <span className="animate-spin text-white">⚙️</span> Running...
                      </>
                    ) : (
                      <>
                        {hasResearch ? 'Re-run Research' : 'Run Research'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                  <strong>Error running research:</strong> {error}
                </div>
              )}

              {/* Details */}
              {hasResearch ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 border-t border-gray-100 pt-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company Summary</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{research?.summary || '—'}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Researched on: {research?.createdAt ? new Date(research.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CSR &amp; Community Focus</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{csrFocus}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Why They&apos;re a Fit</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{fitReasoning}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-4 text-sm text-gray-500 italic">
                  {isRunning ? 'Research in progress, this usually takes 15-30 seconds...' : 'Click "Run Research" to provide your campaign details and generate AI-powered, personalized research and email for this sponsor.'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
