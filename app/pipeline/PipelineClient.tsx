'use client';

import { useState } from 'react';
import { PipelineSponsor } from './page';

type StageKey = 'research' | 'approval' | 'approved' | 'sent' | 'follow_up' | 'closed';

interface StageDef {
  key: StageKey;
  label: string;
  color: string;
  bgColor: string;
}

const STAGES: StageDef[] = [
  { key: 'research', label: 'Research & Analysis', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  { key: 'approval', label: 'Draft & Approval', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  { key: 'approved', label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100' },
  { key: 'sent', label: 'Sent', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  { key: 'follow_up', label: 'Follow-up', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { key: 'closed', label: 'Closed', color: 'text-slate-700', bgColor: 'bg-slate-200' },
];

function getStage(sponsor: PipelineSponsor): StageKey {
  if (sponsor.status === 'approved' || sponsor.status === 'declined') return 'closed';
  if (sponsor.status === 'follow_up') return 'follow_up';

  const latestEmail = sponsor.emails?.[0];
  if (latestEmail) {
    if (latestEmail.status === 'sent') return 'sent';
    if (latestEmail.status === 'approved') return 'approved';
    if (latestEmail.status === 'pending_review' || latestEmail.status === 'draft') return 'approval';
  }
  return 'research';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export default function PipelineClient({ initialSponsors }: { initialSponsors: PipelineSponsor[] }) {
  const [activeStage, setActiveStage] = useState<StageKey | null>(null);

  // Group sponsors by stage
  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage.key] = [];
    return acc;
  }, {} as Record<StageKey, PipelineSponsor[]>);

  initialSponsors.forEach(s => {
    const stage = getStage(s);
    if (grouped[stage]) {
      grouped[stage].push(s);
    }
  });

  return (
    <div className="px-6 py-6 h-full flex flex-col">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track sponsors through the outreach lifecycle.</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto min-h-0">
        <div className="flex gap-4 min-w-max pb-4 h-full">
          {STAGES.map(stage => {
            const stageSponsors = grouped[stage.key];
            const isFaded = activeStage !== null && activeStage !== stage.key;

            return (
              <div 
                key={stage.key} 
                className={`w-72 flex flex-col bg-gray-50/50 rounded-xl border border-gray-200 transition-opacity flex-shrink-0 ${isFaded ? 'opacity-40' : 'opacity-100'}`}
              >
                {/* Stage Header */}
                <div 
                  className="px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 rounded-t-xl transition-colors flex items-center justify-between"
                  onClick={() => setActiveStage(activeStage === stage.key ? null : stage.key)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.bgColor} border border-black/10`} />
                    <h3 className="font-semibold text-sm text-gray-800">{stage.label}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.bgColor} ${stage.color}`}>
                    {stageSponsors.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[150px]">
                  {stageSponsors.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                      <p className="text-sm">0</p>
                    </div>
                  ) : (
                    stageSponsors.map(sponsor => {
                      const latestEmail = sponsor.emails?.[0];
                      const initials = sponsor.companyName.substring(0, 2).toUpperCase();

                      return (
                        <div key={sponsor.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {initials}
                              </div>
                              <span className="font-semibold text-sm text-gray-900 truncate max-w-[170px]" title={sponsor.companyName}>
                                {sponsor.companyName}
                              </span>
                            </div>
                          </div>
                          
                          {sponsor.industry && (
                            <p className="text-xs text-gray-500 mb-2 truncate">{sponsor.industry}</p>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span>{formatDate(sponsor.updatedAt)}</span>
                            {latestEmail && (
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 truncate max-w-[100px]" title={latestEmail.status}>
                                {latestEmail.status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
