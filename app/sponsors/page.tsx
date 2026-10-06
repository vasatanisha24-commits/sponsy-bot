import { MOCK_SPONSORS } from '@/app/lib/mock-data';
import SponsorsPageClient from './SponsorsPageClient';

export default function SponsorsPage() {
  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <SponsorsPageClient initialSponsors={MOCK_SPONSORS} />
    </div>
  );
}
