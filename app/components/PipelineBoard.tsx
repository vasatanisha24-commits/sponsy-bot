import { MOCK_SPONSORS, PIPELINE_STAGES, SponsorStatus } from '@/app/lib/mock-data';

const stageColors: Record<SponsorStatus, { bg: string; text: string; dot: string }> = {
  researched: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  outreach_pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  contacted: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  follow_up: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  approved: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
  declined: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
};

export default function PipelineBoard() {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {PIPELINE_STAGES.map((stage) => {
          const sponsors = MOCK_SPONSORS.filter((s) => s.status === stage.key);
          const colors = stageColors[stage.key];

          return (
            <div key={stage.key} className="w-44 shrink-0">
              {/* Stage header */}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${colors.bg}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className={`text-xs font-semibold ${colors.text}`}>
                    {stage.label}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold ${colors.text} bg-white rounded-full px-1.5 py-0.5`}
                >
                  {sponsors.length}
                </span>
              </div>

              {/* Cards */}
              <div
                className={`space-y-2 p-2 rounded-b-lg border border-t-0 border-gray-200 min-h-24 ${colors.bg}`}
              >
                {sponsors.length === 0 && (
                  <p className="text-xs text-center text-gray-400 py-3">
                    No sponsors
                  </p>
                )}
                {sponsors.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {sponsor.logo}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {sponsor.company}
                        </p>
                        <p className="text-xs text-gray-400">
                          Score: {sponsor.score}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
