import { prisma } from '@/app/lib/db';
import { mapSponsorToUI } from '@/app/lib/mappers';
import StatCard from '@/app/components/StatCard';
import SponsorCard from '@/app/components/SponsorCard';
import PipelineBoard from '@/app/components/PipelineBoard';
import RecentSponsors from '@/app/components/RecentSponsors';
import Link from 'next/link';

export default async function DashboardPage() {
  const totalSponsors = await prisma.sponsor.count();
  
  const contactedData = await prisma.email.findMany({
    where: { status: 'sent' },
    select: { sponsorId: true },
    distinct: ['sponsorId']
  });
  const contacted = contactedData.length;
  
  const pendingApproval = await prisma.email.count({
    where: { status: 'pending_review' },
  });
  
  const approved = await prisma.email.count({
    where: { status: { in: ['approved', 'sent'] } },
  });
  
  const avgScoreData = await prisma.research.aggregate({
    _avg: { aiScore: true },
  });
  
  const avgScore = avgScoreData._avg.aiScore ? Math.round(avgScoreData._avg.aiScore) : 0;

  const DASHBOARD_STATS = {
    totalSponsors,
    contacted,
    pendingApproval,
    approved,
    avgScore,
  };

  const topSponsorsResearch = await prisma.research.findMany({
    where: { aiScore: { not: null } },
    orderBy: { aiScore: 'desc' },
    take: 3,
    include: {
      sponsor: {
        include: {
          contacts: true,
          research: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  const topSponsors = topSponsorsResearch.map((r) => mapSponsorToUI(r.sponsor));

  // Get recent sponsors
  const recentSponsorsData = await prisma.sponsor.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: {
      contacts: true,
      research: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  
  const recentSponsors = recentSponsorsData.map(mapSponsorToUI);

  // Get all sponsors for pipeline
  const allSponsorsData = await prisma.sponsor.findMany({
    include: {
      contacts: true,
      research: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  const allSponsors = allSponsorsData.map(mapSponsorToUI);

  return (
    <div className="px-6 py-6 space-y-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Hackathon sponsor outreach overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full font-medium">
            🤖 AI Agent: Active
          </span>
          <Link
            href="/approvals"
            className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full font-medium hover:bg-amber-100 transition-colors"
          >
            ⏳ {pendingApproval} Email{pendingApproval !== 1 ? 's' : ''} to Review
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Sponsors"
            value={DASHBOARD_STATS.totalSponsors}
            subtitle="In pipeline"
            accent="indigo"
            href="/sponsors"
          />
          <StatCard
            title="Contacted"
            value={DASHBOARD_STATS.contacted}
            subtitle="Emails sent"
            accent="slate"
            href="/outreach"
          />
          <StatCard
            title="Pending Approval"
            value={DASHBOARD_STATS.pendingApproval}
            subtitle="Awaiting your review"
            accent="amber"
            href="/approvals"
          />
          <StatCard
            title="Approved/Sent"
            value={DASHBOARD_STATS.approved}
            subtitle="Emails approved or sent"
            accent="green"
            href="/outreach"
          />
          <StatCard
            title="Avg AI Score"
            value={`${DASHBOARD_STATS.avgScore}/100`}
            subtitle="Relevance rating"
            accent="indigo"
            href="/research"
          />
        </div>
      </section>

      {/* Top sponsors + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top sponsor cards */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">
              Top Sponsors by Score
            </h2>
            <span className="text-xs text-gray-400">AI-ranked</span>
          </div>
          {topSponsors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topSponsors.map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-sm">
              No scored sponsors yet.
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">
              Recent Activity
            </h2>
            <span className="text-xs text-gray-400">Last 5</span>
          </div>
          <RecentSponsors recentSponsors={recentSponsors} />
        </section>
      </div>

      {/* Pipeline */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">
            Sponsor Pipeline
          </h2>
          <span className="text-xs text-gray-400">
            {DASHBOARD_STATS.totalSponsors} sponsors across all stages
          </span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <PipelineBoard pipelineSponsors={allSponsors} />
        </div>
      </section>

      {/* Human-in-the-loop reminder */}
      {DASHBOARD_STATS.pendingApproval > 0 && (
        <section>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-4">
            <div className="text-amber-500 text-xl mt-0.5">⚠️</div>
            <div>
              <p className="font-semibold text-amber-800 text-sm">
                {DASHBOARD_STATS.pendingApproval} sponsor
                {DASHBOARD_STATS.pendingApproval > 1 ? 's' : ''} awaiting your
                approval
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                The AI agent has drafted outreach emails. Review and approve
                before they are sent.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
