'use client';

import { useState } from 'react';
import { Sponsor } from '@/app/lib/mock-data';
import SponsorTable from './SponsorTable';
import AddSponsorModal from './AddSponsorModal';

interface Props {
  initialSponsors: Sponsor[];
}

export default function SponsorsPageClient({ initialSponsors }: Props) {
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors);
  const [showModal, setShowModal] = useState(false);

  function handleAdd(sponsor: Sponsor) {
    setSponsors((prev) => [sponsor, ...prev]);
    setShowModal(false);
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sponsors</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {sponsors.length} sponsor{sponsors.length !== 1 ? 's' : ''} in your outreach list
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <span className="text-base leading-none">+</span> Add Sponsor
        </button>
      </div>

      {/* Table / Cards */}
      <SponsorTable initialSponsors={sponsors} />

      {/* Modal */}
      {showModal && (
        <AddSponsorModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
