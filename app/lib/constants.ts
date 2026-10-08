import { SponsorStatus } from './types';

export const PIPELINE_STAGES: { key: SponsorStatus; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'researched', label: 'Researched' },
  { key: 'outreach_pending', label: 'Pending Approval' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'follow_up', label: 'Follow-up' },
  { key: 'interested', label: 'Interested' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Declined' },
];

export const INDUSTRIES = [
  'AI/ML',
  'Cloud Infrastructure',
  'Cloud Storage',
  'Cybersecurity',
  'Data Analytics',
  'Developer Tools',
  'Fintech',
  'Open Source',
  'SaaS',
  'Web3',
  'Other',
];

export const TEAM_MEMBERS = [
  'Tanisha Vasa',
  'Rohan Mehta',
  'Aarav Singh',
  'Meera Nair',
];
