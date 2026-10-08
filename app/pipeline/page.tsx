import { prisma } from '@/app/lib/db';
import PipelineClient from './PipelineClient';
import { Sponsor, Email } from '@prisma/client';

export type PipelineSponsor = Omit<Sponsor, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  emails: (Omit<Email, 'createdAt' | 'updatedAt' | 'sentAt'> & {
    createdAt: string;
    updatedAt: string;
    sentAt: string | null;
  })[];
};

export const dynamic = 'force-dynamic';

export default async function PipelinePage() {
  const rawSponsors = await prisma.sponsor.findMany({
    include: {
      emails: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Serialize dates for Client Component
  const sponsors = JSON.parse(JSON.stringify(rawSponsors)) as PipelineSponsor[];

  return <PipelineClient initialSponsors={sponsors} />;
}
