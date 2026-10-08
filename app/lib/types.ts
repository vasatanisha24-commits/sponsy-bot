export type SponsorStatus =
  | 'researched'
  | 'outreach_pending'
  | 'contacted'
  | 'follow_up'
  | 'interested'
  | 'approved'
  | 'declined'
  | 'new'
  | 'replied'
  | 'follow_up_exhausted';

export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export type SponsorPriority = 'high' | 'medium' | 'low';

export interface SponsorUI {
  id: string;
  company: string;
  website: string;
  industry: string;
  description: string;
  logo: string;
  contact: string;
  email: string;
  tier: SponsorTier;
  priority: SponsorPriority;
  status: SponsorStatus;
  assignedTo: string;
  score: number;
  lastActivity: string;
  notes: string;
  createdAt: string;
}

export type EmailReviewStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'sent';

export interface EmailReview {
  id: string;
  sponsorId: string;
  company: string;
  logo: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  generatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  status: EmailReviewStatus;
  rejectionReason?: string;
  aiConfidence: number;
}

// ── Full DB-shaped email returned by GET /api/emails ─────────────────────────
// Matches prisma.email.findMany({ include: { sponsor: { include: { research } }, contact } })

export interface ResearchRecord {
  id: string;
  aiScore: number | null;
  summary: string | null;
  createdAt: string;
}

export interface SponsorRecord {
  id: string;
  companyName: string;
  tier: string | null;
  priority: string;
  research: ResearchRecord[];
}

export interface ContactRecord {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

export interface FollowUpRecord {
  id: string;
  emailId: string;
  scheduledFor: string;
  status: string;
  createdAt: string;
}

export interface EmailWithDetails {
  id: string;
  sponsorId: string;
  contactId: string;
  subject: string;
  body: string;
  status: EmailReviewStatus;
  confidenceScore: number | null;
  reviewerId: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  sponsor: SponsorRecord;
  contact: ContactRecord;
  followUps?: FollowUpRecord[];
}

// ── Incoming sponsor reply ─────────────────────────────────────────────────
export interface ReplySponsorRecord {
  id: string;
  companyName: string;
}

export interface ReplyEmailRecord {
  id: string;
  subject: string;
}

export interface ReplyWithDetails {
  id: string;
  emailId: string;
  sponsorId: string;
  messageId: string;
  subject: string;
  body: string;
  senderEmail: string;
  receivedAt: string;
  outcome: string | null;
  createdAt: string;
  sponsor: ReplySponsorRecord;
  email: ReplyEmailRecord;
}
