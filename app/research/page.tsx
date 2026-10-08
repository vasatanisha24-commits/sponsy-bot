import { prisma } from '@/app/lib/db';
import ResearchClient from './ResearchClient';

export default async function ResearchPage() {
  const sponsors = await prisma.sponsor.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      research: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      emails: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Research & Intelligence</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            AI-generated insights and prioritization for your sponsors
          </p>
        </div>
      </div>
      
      <ResearchClient initialSponsors={sponsors} />
    </div>
  );
}
