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

// ── Email Review / Human Approval ─────────────────────────────────────────

export type EmailReviewStatus =
  | 'pending_review'  // AI-drafted, waiting for human review
  | 'approved'        // Human approved — ready to send
  | 'rejected'        // Human rejected — will not be sent
  | 'sent';           // Sent (future state — not implemented yet)

export interface EmailReview {
  id: string;
  sponsorId: string;
  company: string;
  logo: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;               // AI-generated email body
  generatedAt: string;        // when the AI drafted it
  reviewedAt?: string;        // when the human acted
  reviewedBy?: string;        // which team member reviewed
  status: EmailReviewStatus;
  rejectionReason?: string;   // optional note when rejecting
  aiConfidence: number;       // 0–100 how confident the AI was
}

export const MOCK_EMAILS: EmailReview[] = [
  {
    id: 'email-1',
    sponsorId: '3',
    company: 'Vertex Solutions',
    logo: 'VS',
    recipientName: 'Emily Rodriguez',
    recipientEmail: 'emily@vertexsol.com',
    subject: 'Partnership Opportunity — HackFest 2026 Sponsorship',
    body: `Hi Emily,

I hope this message finds you well! I'm reaching out from the HackFest 2026 organizing team because we believe Vertex Solutions would be a fantastic partner for our upcoming hackathon.

HackFest 2026 is a 48-hour hackathon bringing together 500+ student developers, engineers, and designers from across India, focused on building solutions in fintech, AI, and open-source infrastructure — areas we know Vertex Solutions is deeply invested in.

Here's why we think this is a great fit:
• Your open banking APIs are already popular among our attendee community
• Sponsoring gives your team direct access to top engineering talent for recruiting
• Your brand would be featured across all event materials, social media, and the main stage

We're offering a Gold Sponsorship tier at ₹2,50,000, which includes a dedicated booth, logo placement, and a 5-minute brand pitch slot.

Would you be open to a 20-minute call this week to discuss the partnership details?

Looking forward to hearing from you!

Warm regards,
Tanisha Vasa
HackFest 2026 Organizing Team`,
    generatedAt: '3 hours ago',
    status: 'pending_review',
    aiConfidence: 88,
  },
  {
    id: 'email-2',
    sponsorId: '4',
    company: 'CloudBase Inc',
    logo: 'CB',
    recipientName: 'Michael Kim',
    recipientEmail: 'mkim@cloudbase.io',
    subject: 'HackFest 2026 — Silver Sponsorship Invitation',
    body: `Dear Michael,

Greetings from the HackFest 2026 team!

We've been following CloudBase Inc's impressive work in enterprise cloud storage and data sovereignty, and we'd love to explore a sponsorship partnership for our upcoming hackathon.

HackFest 2026 at the end of November will host 500+ participants across two days of hacking, workshops, and networking. Based on our attendee data, 68% of participants have expressed interest in cloud infrastructure and DevOps tooling — a perfect match for CloudBase's audience.

As a Silver Sponsor, you would receive:
✓ Branded booth space in our Expo Hall
✓ Logo on website, t-shirts, and event banners
✓ Access to our talent pool for internship/hiring leads
✓ 3 VIP passes for your team to attend

Investment: ₹1,50,000

We'd be thrilled to have CloudBase Inc as part of HackFest 2026. Can we schedule a brief call to walk you through our sponsorship deck?

Best,
Aarav Singh
HackFest 2026 Partnerships`,
    generatedAt: '5 hours ago',
    status: 'pending_review',
    aiConfidence: 82,
  },
  {
    id: 'email-3',
    sponsorId: '1',
    company: 'TechNova Corp',
    logo: 'TC',
    recipientName: 'Sarah Chen',
    recipientEmail: 'sarah@technova.io',
    subject: 'Follow-up: HackFest 2026 Platinum Sponsorship — Partnership Deck Inside',
    body: `Hi Sarah,

Thank you so much for your enthusiasm during our call last week! As promised, I'm following up with our full Platinum Sponsorship package for HackFest 2026.

TechNova Corp's cloud infrastructure expertise makes you our ideal Platinum Partner. Here's a quick summary of what's included:

🏆 PLATINUM PACKAGE — ₹5,00,000
• Presenting sponsor title: "HackFest 2026 powered by TechNova"
• Main stage keynote slot (15 mins)
• Premium booth (largest footprint in the venue)
• Logo on all digital and physical assets
• 10 VIP passes + unlimited judge seats
• Dedicated track: "TechNova Cloud Challenge" — your own mini-hackathon within HackFest
• Direct access to all participant resumes

We have 2 Platinum slots available and one is already committed. I'd love to reserve the second one for TechNova.

Can we move forward? Happy to set up a contract call this week.

Excited to work with you!

Tanisha Vasa
HackFest 2026 Organizing Team`,
    generatedAt: '30 minutes ago',
    status: 'pending_review',
    aiConfidence: 95,
  },
  {
    id: 'email-4',
    sponsorId: '8',
    company: 'OpenForge Labs',
    logo: 'OF',
    recipientName: 'Alex Torres',
    recipientEmail: 'alex@openforge.dev',
    subject: 'HackFest 2026 — Community Sponsor Opportunity for OpenForge Labs',
    body: `Hey Alex,

Big fan of OpenForge Labs and everything you're doing for the open source community!

We're organizing HackFest 2026 this November and we'd love to have OpenForge Labs as a Community Sponsor. Given your focus on developer grants and open source tooling, we think a community-tier sponsorship could be a great mutual fit — even at a modest investment.

Community Sponsor (Bronze) — ₹75,000:
• Logo on website and digital assets
• Shoutout in opening/closing ceremony
• 2 passes for your team
• Inclusion in our "Tools We Love" developer resource page

We know budgets for open source companies can be tight, so we're also open to an in-kind sponsorship (e.g., API credits, subscriptions, or swag for prizes) in lieu of cash.

Would love to explore what works best for you!

Cheers,
Rohan Mehta
HackFest 2026 Community Partnerships`,
    generatedAt: '1 day ago',
    status: 'approved',
    reviewedAt: '18 hours ago',
    reviewedBy: 'Tanisha Vasa',
    aiConfidence: 74,
  },
  {
    id: 'email-5',
    sponsorId: '7',
    company: 'SwiftEdge Tech',
    logo: 'SE',
    recipientName: 'Linda Zhao',
    recipientEmail: 'lzhao@swiftedge.io',
    subject: 'Re-engagement: HackFest 2026 Sponsorship',
    body: `Hi Linda,

Hope you're doing well! We spoke briefly last quarter about sponsorship opportunities and I know the timing wasn't right then.

I wanted to loop back as we're now finalising our sponsor roster for HackFest 2026 (November 28–29). We have a few Bronze and Silver slots remaining and I thought of SwiftEdge Tech given your work in zero-trust security — a topic that resonates deeply with our engineering-focused audience.

Would it be worth a quick 15-minute chat to see if the timing is better this quarter?

No pressure at all — just wanted to reach out before we close our sponsor list.

Best,
Aarav Singh`,
    generatedAt: '2 days ago',
    status: 'rejected',
    reviewedAt: '1 day ago',
    reviewedBy: 'Tanisha Vasa',
    rejectionReason: 'Company has already declined this quarter. Do not contact until Q1 2027.',
    aiConfidence: 61,
  },
];

