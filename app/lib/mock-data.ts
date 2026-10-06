// Mock data for the Sponsy Bot dashboard
export type SponsorStatus =
  | 'researched'
  | 'outreach_pending'
  | 'contacted'
  | 'follow_up'
  | 'approved'
  | 'declined';

export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export interface Sponsor {
  id: string;
  company: string;
  contact: string;
  email: string;
  industry: string;
  tier: SponsorTier;
  status: SponsorStatus;
  score: number; // AI relevance score 0–100
  lastActivity: string;
  notes: string;
  logo: string; // initials placeholder
}

export const MOCK_SPONSORS: Sponsor[] = [
  {
    id: '1',
    company: 'TechNova Corp',
    contact: 'Sarah Chen',
    email: 'sarah@technova.io',
    industry: 'Cloud Infrastructure',
    tier: 'platinum',
    status: 'contacted',
    score: 94,
    lastActivity: '2 hours ago',
    notes: 'Very interested in AI hackathons. Follow up on partnership deck.',
    logo: 'TC',
  },
  {
    id: '2',
    company: 'DevStream AI',
    contact: 'James Patel',
    email: 'james@devstream.ai',
    industry: 'Developer Tools',
    tier: 'gold',
    status: 'follow_up',
    score: 88,
    lastActivity: '1 day ago',
    notes: 'Requested more details on attendee demographics.',
    logo: 'DA',
  },
  {
    id: '3',
    company: 'Vertex Solutions',
    contact: 'Emily Rodriguez',
    email: 'emily@vertexsol.com',
    industry: 'Fintech',
    tier: 'gold',
    status: 'outreach_pending',
    score: 81,
    lastActivity: '3 days ago',
    notes: 'Pending human approval before sending initial outreach.',
    logo: 'VS',
  },
  {
    id: '4',
    company: 'CloudBase Inc',
    contact: 'Michael Kim',
    email: 'mkim@cloudbase.io',
    industry: 'Cloud Storage',
    tier: 'silver',
    status: 'researched',
    score: 76,
    lastActivity: '4 days ago',
    notes: 'AI research completed. Strong alignment with hackathon themes.',
    logo: 'CB',
  },
  {
    id: '5',
    company: 'DataBridge Labs',
    contact: 'Priya Sharma',
    email: 'priya@databridgelabs.com',
    industry: 'Data Analytics',
    tier: 'silver',
    status: 'approved',
    score: 90,
    lastActivity: '5 hours ago',
    notes: 'Sponsorship confirmed. Awaiting contract signature.',
    logo: 'DL',
  },
  {
    id: '6',
    company: 'NeuralPath Systems',
    contact: 'Tom Hayes',
    email: 'thayes@neuralpath.com',
    industry: 'AI/ML',
    tier: 'platinum',
    status: 'contacted',
    score: 97,
    lastActivity: '30 minutes ago',
    notes: 'Top priority sponsor. CEO personally interested.',
    logo: 'NP',
  },
  {
    id: '7',
    company: 'SwiftEdge Tech',
    contact: 'Linda Zhao',
    email: 'lzhao@swiftedge.io',
    industry: 'Cybersecurity',
    tier: 'bronze',
    status: 'declined',
    score: 62,
    lastActivity: '1 week ago',
    notes: 'Budget constraints this quarter. Re-approach next cycle.',
    logo: 'SE',
  },
  {
    id: '8',
    company: 'OpenForge Labs',
    contact: 'Alex Torres',
    email: 'alex@openforge.dev',
    industry: 'Open Source',
    tier: 'bronze',
    status: 'researched',
    score: 70,
    lastActivity: '2 days ago',
    notes: 'Active in developer communities. Good brand fit.',
    logo: 'OF',
  },
];

export const PIPELINE_STAGES: { key: SponsorStatus; label: string }[] = [
  { key: 'researched', label: 'Researched' },
  { key: 'outreach_pending', label: 'Pending Approval' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'follow_up', label: 'Follow-up' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Declined' },
];

export const DASHBOARD_STATS = {
  totalSponsors: MOCK_SPONSORS.length,
  contacted: MOCK_SPONSORS.filter((s) => s.status === 'contacted').length,
  pendingApproval: MOCK_SPONSORS.filter((s) => s.status === 'outreach_pending').length,
  approved: MOCK_SPONSORS.filter((s) => s.status === 'approved').length,
  avgScore: Math.round(
    MOCK_SPONSORS.reduce((sum, s) => sum + s.score, 0) / MOCK_SPONSORS.length
  ),
  potentialRevenue: '$48,500',
};
