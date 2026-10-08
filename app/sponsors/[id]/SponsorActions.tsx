'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  sponsorId: string;
  currentStatus: string;
}

export default function SponsorActions({ sponsorId, currentStatus }: Props) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);

  async function handleApprove() {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/sponsors/${sponsorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to approve sponsor');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsApproving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex flex-wrap gap-3">
      <Link
        href="/research"
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        ✉️ Generate / View Research
      </Link>
      
      {currentStatus !== 'approved' && (
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isApproving ? '...' : '✅ Mark as Approved'}
        </button>
      )}

      <Link
        href="/sponsors"
        className="ml-auto px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
      >
        ← Back to Sponsors
      </Link>
    </div>
  );
}
