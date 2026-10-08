import { prisma } from '@/app/lib/db';
import { mapSponsorToUI } from '@/app/lib/mappers';
import SponsorsPageClient from './SponsorsPageClient';

export default async function SponsorsPage() {
  const dbSponsors = await prisma.sponsor.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      contacts: true,
      research: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const sponsors = dbSponsors.map(mapSponsorToUI);

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <SponsorsPageClient initialSponsors={sponsors} />
    </div>
  );
}
