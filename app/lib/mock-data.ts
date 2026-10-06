// Mock data for the Sponsy Bot dashboard
export type SponsorStatus =
  | 'researched'
  | 'outreach_pending'
  | 'contacted'
  | 'follow_up'
  | 'approved'
  | 'declined';

export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export type SponsorPriority = 'high' | 'medium' | 'low';

export interface Sponsor {
  id: string;
  // Core identity
  company: string;
  website: string;
  industry: string;
  description: string;
  logo: string; // initials placeholder
  // Contact
  contact: string;
  email: string;
  // Classification
  tier: SponsorTier;
  priority: SponsorPriority;
  status: SponsorStatus;
  assignedTo: string; // team member name
  // AI
  score: number; // AI relevance score 0–100
  // Activity
  lastActivity: string;
  notes: string;
  createdAt: string; // ISO date string
}

export const MOCK_SPONSORS: Sponsor[] = [
  {
    id: '1',
    company: 'TechNova Corp',
    website: 'https://technova.io',
    industry: 'Cloud Infrastructure',
    description:
      'Leading cloud infrastructure provider specializing in developer-first tooling, edge computing, and AI-accelerated deployment pipelines.',
    logo: 'TC',
    contact: 'Sarah Chen',
    email: 'sarah@technova.io',
    tier: 'platinum',
    priority: 'high',
    status: 'contacted',
    assignedTo: 'Tanisha Vasa',
    score: 94,
    lastActivity: '2 hours ago',
    notes: 'Very interested in AI hackathons. Follow up on partnership deck.',
    createdAt: '2026-09-20',
  },
  {
    id: '2',
    company: 'DevStream AI',
    website: 'https://devstream.ai',
    industry: 'Developer Tools',
    description:
      'AI-powered developer productivity platform offering code review automation, CI/CD intelligence, and real-time collaboration tools.',
    logo: 'DA',
    contact: 'James Patel',
    email: 'james@devstream.ai',
    tier: 'gold',
    priority: 'high',
    status: 'follow_up',
    assignedTo: 'Rohan Mehta',
    score: 88,
    lastActivity: '1 day ago',
    notes: 'Requested more details on attendee demographics.',
    createdAt: '2026-09-22',
  },
  {
    id: '3',
    company: 'Vertex Solutions',
    website: 'https://vertexsol.com',
    industry: 'Fintech',
    description:
      'Fintech innovator building next-gen payment infrastructure and open banking APIs for emerging market startups.',
    logo: 'VS',
    contact: 'Emily Rodriguez',
    email: 'emily@vertexsol.com',
    tier: 'gold',
    priority: 'medium',
    status: 'outreach_pending',
    assignedTo: 'Tanisha Vasa',
    score: 81,
    lastActivity: '3 days ago',
    notes: 'Pending human approval before sending initial outreach.',
    createdAt: '2026-09-25',
  },
  {
    id: '4',
    company: 'CloudBase Inc',
    website: 'https://cloudbase.io',
    industry: 'Cloud Storage',
    description:
      'Enterprise cloud storage and data management platform with strong focus on compliance and data sovereignty.',
    logo: 'CB',
    contact: 'Michael Kim',
    email: 'mkim@cloudbase.io',
    tier: 'silver',
    priority: 'medium',
    status: 'researched',
    assignedTo: 'Aarav Singh',
    score: 76,
    lastActivity: '4 days ago',
    notes: 'AI research completed. Strong alignment with hackathon themes.',
    createdAt: '2026-09-26',
  },
  {
    id: '5',
    company: 'DataBridge Labs',
    website: 'https://databridgelabs.com',
    industry: 'Data Analytics',
    description:
      'Real-time data pipeline and analytics company helping teams unify data from 100+ sources with zero-ETL integrations.',
    logo: 'DL',
    contact: 'Priya Sharma',
    email: 'priya@databridgelabs.com',
    tier: 'silver',
    priority: 'high',
    status: 'approved',
    assignedTo: 'Rohan Mehta',
    score: 90,
    lastActivity: '5 hours ago',
    notes: 'Sponsorship confirmed. Awaiting contract signature.',
    createdAt: '2026-09-18',
  },
  {
    id: '6',
    company: 'NeuralPath Systems',
    website: 'https://neuralpath.com',
    industry: 'AI/ML',
    description:
      'Foundation model company building open-source LLMs and inference infrastructure for production AI applications.',
    logo: 'NP',
    contact: 'Tom Hayes',
    email: 'thayes@neuralpath.com',
    tier: 'platinum',
    priority: 'high',
    status: 'contacted',
    assignedTo: 'Tanisha Vasa',
    score: 97,
    lastActivity: '30 minutes ago',
    notes: 'Top priority sponsor. CEO personally interested.',
    createdAt: '2026-09-15',
  },
  {
    id: '7',
    company: 'SwiftEdge Tech',
    website: 'https://swiftedge.io',
    industry: 'Cybersecurity',
    description:
      'Zero-trust security platform providing identity-aware proxies, threat detection, and automated compliance reporting.',
    logo: 'SE',
    contact: 'Linda Zhao',
    email: 'lzhao@swiftedge.io',
    tier: 'bronze',
    priority: 'low',
    status: 'declined',
    assignedTo: 'Aarav Singh',
    score: 62,
    lastActivity: '1 week ago',
    notes: 'Budget constraints this quarter. Re-approach next cycle.',
    createdAt: '2026-09-28',
  },
  {
    id: '8',
    company: 'OpenForge Labs',
    website: 'https://openforge.dev',
    industry: 'Open Source',
    description:
      'Open source tooling company backing developer communities with grants, infrastructure, and event sponsorships.',
    logo: 'OF',
    contact: 'Alex Torres',
    email: 'alex@openforge.dev',
    tier: 'bronze',
    priority: 'medium',
    status: 'researched',
    assignedTo: 'Rohan Mehta',
    score: 70,
    lastActivity: '2 days ago',
    notes: 'Active in developer communities. Good brand fit.',
    createdAt: '2026-09-30',
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

export const DASHBOARD_STATS = {
  totalSponsors: MOCK_SPONSORS.length,
  contacted: MOCK_SPONSORS.filter((s) => s.status === 'contacted').length,
  pendingApproval: MOCK_SPONSORS.filter(
    (s) => s.status === 'outreach_pending'
  ).length,
  approved: MOCK_SPONSORS.filter((s) => s.status === 'approved').length,
  avgScore: Math.round(
    MOCK_SPONSORS.reduce((sum, s) => sum + s.score, 0) / MOCK_SPONSORS.length
  ),
  potentialRevenue: '$48,500',
};
