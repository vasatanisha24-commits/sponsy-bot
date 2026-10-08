import { Sponsor as PrismaSponsor, Contact, Research } from '@prisma/client';
import { SponsorStatus, SponsorTier, SponsorPriority, SponsorUI } from '@/app/lib/types';

type DbSponsor = PrismaSponsor & {
  contacts?: Contact[];
  research?: Research[];
};

export function mapSponsorToUI(s: DbSponsor): SponsorUI {
  return {
    id: s.id,
    company: s.companyName,
    website: s.website || '',
    industry: s.industry || 'Other',
    description: s.description || '',
    logo: s.companyName.substring(0, 2).toUpperCase(),
    contact: s.contacts && s.contacts.length > 0 ? s.contacts[0].name : 'No Contact',
    email: s.contacts && s.contacts.length > 0 ? s.contacts[0].email : 'N/A',
    tier: (s.tier || 'bronze') as SponsorTier,
    priority: (s.priority || 'medium') as SponsorPriority,
    status: (s.status || 'researched') as SponsorStatus,
    assignedTo: s.assignedTo || 'Unassigned',
    score: s.research && s.research.length > 0 ? s.research[0].aiScore || 0 : 0,
    lastActivity: s.updatedAt.toLocaleDateString(),
    notes: '',
    createdAt: s.createdAt.toISOString()
  };
}
