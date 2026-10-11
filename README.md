# Sponsy Bot

> **Autonomous Sponsor Intelligence, Relevance Scoring, and Human-in-the-Loop Outreach Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.8-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B_/_GPT_OSS_120B-F55036?style=for-the-badge)](https://groq.com/)
[![Tavily](https://img.shields.io/badge/Tavily-Web_Intelligence-008080?style=for-the-badge)](https://tavily.com/)

---

## Table of Contents

- [Overview](#overview)
- [The Problem & The Solution](#the-problem--the-solution)
- [System Architecture](#system-architecture)
- [End-to-End Workflow](#end-to-end-workflow)
- [AI Research & Scoring Pipeline](#ai-research--scoring-pipeline)
- [Human-in-the-Loop Email Lifecycle](#human-in-the-loop-email-lifecycle)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [API Reference](#api-reference)
- [Database Schema & Data Models](#database-schema--data-models)
- [Local Setup & Installation](#local-setup--installation)
- [Environment Variables](#environment-variables)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Deployment on Vercel](#deployment-on-vercel)
- [Security & Responsible Usage](#security--responsible-usage)
- [Known Limitations & Roadmap](#known-limitations--roadmap)

---

## Overview

**Sponsy Bot** is an end-to-end sponsorship management and outreach platform built for hackathon organizers, student clubs, and tech event managers. It replaces generic cold emailing and spreadsheet tracking with real-time web research, multi-criteria alignment scoring, campaign-constrained AI email generation, and a mandatory human review safeguard.

By connecting web intelligence via **Tavily**, ultra-fast inference via **Groq** (`openai/gpt-oss-120b`), relational persistence through **Prisma ORM** with **PostgreSQL**, and verified email dispatch via **Nodemailer (Gmail)** and **ImapFlow**, Sponsy Bot streamlines the entire sponsorship lifecycle from prospective discovery to closed sponsorship.

---

## The Problem & The Solution

### The Problem
* **Generic, Ignored Pitches:** Organizers blast companies with one-size-fits-all emails that fail to address corporate social responsibility (CSR) programs, developer initiatives, or budget cycles.
* **Manual Research Overhead:** Finding whether a company sponsors hackathons or student initiatives requires hours of manual Google searching across blog posts, career pages, and press releases.
* **Fragmented Spreadsheets:** Statuses, contact details, emails, and follow-ups are scattered across multiple tools, leading to dropped leads or unintended duplicate messages.
* **Autonomous Hallucination Risk:** Fully automated AI outreach bots risk emailing corporate executives with fabricated event dates, hallucinated perks, or wrong sender details.

### The Solution
* **Verified Web Intelligence:** Searches corporate social responsibility, developer community, and event sponsorship data using Tavily before drafting outreach.
* **Objective Relevance Scoring:** Evaluates companies on 5 weighted criteria with deterministic math to calculate a 1–100 match score and priority tier (`HIGH`, `MEDIUM`, `LOW`).
* **Campaign-Constrained Generation:** Requires explicit event and campaign details (event name, dates, asks, benefits, sender contact) via the `EmailRequirementsModal`. The AI model is strictly instructed never to fabricate dates, tiers, or contacts.
* **Strict Human-in-the-Loop Gate:** All generated emails enter database storage as `pending_review`. The dispatch engine physically rejects any attempt to send an email unless an operator explicitly approves it in the UI.
* **Built-in Lifecycle Management:** Tracks initial outreach, automated Gmail reply parsing via IMAP, status classification (`interested` / `declined`), and follow-up limits.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 16 App Router)"]
        UI["Dashboard & Pipeline UI"]
        SponsorModal["Add Sponsor Modal"]
        ReqModal["Email Requirements Modal"]
        ApprovalUI["Review & Approval Workbench"]
    end

    subgraph Server["Next.js Server-Side APIs"]
        SponsorsAPI["/api/sponsors"]
        ResearchAPI["/api/research"]
        ApprovalAPI["/api/emails/[id]/approve"]
        SendAPI["/api/emails/[id]/send"]
        SyncAPI["/api/replies/sync"]
        ClassifyAPI["/api/replies/[id]/classify"]
    end

    subgraph AI_Services["AI & Search Services"]
        Tavily["Tavily Search API<br/>(Real-Time Web Intelligence)"]
        Groq["Groq Cloud API<br/>(openai/gpt-oss-120b)"]
    end

    subgraph Integrations["Communication Services"]
        GmailSMTP["Nodemailer (Gmail SMTP)<br/>(Outreach Delivery)"]
        GmailIMAP["ImapFlow + Mailparser<br/>(Inbox Reply Tracking)"]
    end

    subgraph Storage["Database Layer"]
        Prisma["Prisma ORM (v6.19.3)"]
        Postgres[("PostgreSQL (Neon)<br/>Connection Pooler + Direct")]
    end

    UI --> SponsorsAPI
    SponsorModal --> SponsorsAPI
    ReqModal --> ResearchAPI
    ApprovalUI --> ApprovalAPI
    ApprovalUI --> SendAPI
    UI --> SyncAPI
    UI --> ClassifyAPI

    SponsorsAPI --> Prisma
    ApprovalAPI --> Prisma
    ClassifyAPI --> Prisma
    ResearchAPI --> Tavily
    ResearchAPI --> Groq
    ResearchAPI --> Prisma

    SendAPI --> Prisma
    SendAPI --> GmailSMTP
    SyncAPI --> GmailIMAP
    GmailIMAP --> Prisma

    Prisma --> Postgres
```

---

## End-to-End Workflow

```mermaid
flowchart TD
    Start([Add Sponsor]) --> AddForm[Fill Sponsor Details in AddSponsorModal]
    AddForm --> APISponsor[POST /api/sponsors]
    APISponsor --> SaveSponsor[(Sponsor Created in DB)]
    SaveSponsor --> ViewSponsors[View in Sponsors List / Dashboard]

    ViewSponsors --> ClickResearch[Navigate to Research Page & Click 'Run Research']
    ClickResearch --> OpenModal[Open EmailRequirementsModal]

    OpenModal --> FillRequirements[Enter Event, Ask, Benefits & Sender Details]
    FillRequirements --> ValidateReq{All 8 Required Fields Valid?}
    ValidateReq -- No --> ShowFormErrors[Display Validation Errors in Modal]
    ShowFormErrors --> FillRequirements

    ValidateReq -- Yes --> PostResearch[POST /api/research with campaignRequirements]
    PostResearch --> TavilySearch[Tavily Searches Web for CSR & Tech Sponsorships]
    TavilySearch --> GroqIntel[Groq Synthesizes Intelligence Profile]
    GroqIntel --> GroqScore[Groq Rates 5 Criteria + Deterministic Math Formula]
    GroqScore --> GroqEmail[Groq Generates Personalized Draft]

    GroqEmail --> SaveDraft[(Save to DB: Email status = 'pending_review')]
    SaveDraft --> ReviewInbox[Display in Approvals Page]

    ReviewInbox --> HumanAction{Human Review Action}
    HumanAction -- Edit & Approve --> PatchApprove[PATCH /api/emails/:id/approve]
    HumanAction -- Reject --> PatchReject[PATCH /api/emails/:id/reject]
    PatchReject --> Rejected[(Email status = 'rejected')]

    PatchApprove --> Approved[(Email status = 'approved')]
    Approved --> SendTrigger[Click 'Send' in Outreach / Approvals]
    SendTrigger --> VerifyApproved{Email status == 'approved'?}
    VerifyApproved -- No --> BlockSend[HTTP 400: Send Blocked]
    VerifyApproved -- Yes --> SendGmail[Dispatch via Nodemailer / Gmail SMTP]
    SendGmail --> MarkSent[(Email status = 'sent', Sponsor status = 'contacted')]

    MarkSent --> SyncReplies[Periodic Inbox Sync via IMAP]
    SyncReplies --> ReplyFound{Reply Received?}
    ReplyFound -- Yes --> MatchReply[(Record Reply & Halt Follow-ups)]
    ReplyFound -- No --> FollowUpCheck{3 Days Elapsed & Count < 2?}
    FollowUpCheck -- Yes --> DraftFollowUp[(Create FollowUp in 'pending_review')]
    FollowUpCheck -- No --> EndDone([Outreach Concluded])
```

---

## AI Research & Scoring Pipeline

```mermaid
flowchart LR
    subgraph Step1["1. Web Discovery"]
        Input["Company Name + Website"] --> TavilyEngine["Tavily Search API"]
        TavilyEngine --> RawContext["CSR, Hackathons, Developer Programs & URLs"]
    end

    subgraph Step2["2. Intelligence Extraction"]
        RawContext --> GroqIntel["Groq LLM (openai/gpt-oss-120b)"]
        GroqIntel --> IntelJSON["Structured Intelligence JSON<br/>- Summary<br/>- CSR Focus<br/>- Past Sponsorships<br/>- Fit Reasoning<br/>- Recommended Ask"]
    end

    subgraph Step3["3. Relevance Scoring"]
        IntelJSON --> CriteriaEval["Groq Evaluates 5 Dimensions (1-10)"]
        CriteriaEval --> MathFormula["Deterministic Formula:<br/>• Industry Relevance (25%)<br/>• Past Sponsorships (20%)<br/>• CSR Alignment (20%)<br/>• Audience Fit (20%)<br/>• Ask Realism (15%)"]
        MathFormula --> ScoreResult["Score: 0-100<br/>Priority: HIGH / MEDIUM / LOW"]
    end

    subgraph Step4["4. Targeted Generation"]
        CampaignInput["Campaign Requirements<br/>(Event, Ask, Benefits, Sender)"] --> GroqDraft["Groq Draft Generator"]
        IntelJSON --> GroqDraft
        ScoreResult --> GroqDraft
        GroqDraft --> FinalDraft["Tailored Subject & Body<br/>+ Confidence Score (1-100)"]
    end
```

### Deterministic Scoring Formula
Rather than letting an LLM generate an arbitrary final score, Sponsy Bot uses the LLM solely to evaluate individual dimensions from search evidence, then applies deterministic mathematics (`app/lib/ai/sponsor-scoring.ts`):

$$\text{Score} = \text{round}\Big(2.5 \times \text{Industry} + 2.0 \times \text{Previous} + 2.0 \times \text{CSR} + 2.0 \times \text{Audience} + 1.5 \times \text{AskFit}\Big)$$

* **Score $\ge 75$**: `HIGH` Priority
* **Score $50 - 74$**: `MEDIUM` Priority
* **Score $< 50$**: `LOW` Priority

---

## Human-in-the-Loop Email Lifecycle

```mermaid
stateDiagram-v2
    [*] --> draft: Created without review trigger
    [*] --> pending_review: Generated via /api/research

    draft --> pending_review: Submitted for review

    pending_review --> approved: Operator approves (PATCH /api/emails/:id/approve)
    pending_review --> rejected: Operator rejects (PATCH /api/emails/:id/reject)

    approved --> sent: Operator dispatches (POST /api/emails/:id/send)

    rejected --> [*]
    sent --> [*]

    note right of approved
        Safety rule: POST /api/emails/:id/send
        physically rejects any email unless
        its status is strictly 'approved'.
    end note
```

---

## Technology Stack

| Category | Technology | Version | Purpose in Sponsy Bot |
|---|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) | `16.3.8` | React framework with App Router, server components, and Turbopack |
| **UI Library** | [React](https://react.dev/) | `19.2.8` | Core UI component model and client state management |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.x` | End-to-end static typing across UI, API, and database schemas |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `v4` | Utility-first responsive styling and component layout |
| **ORM** | [Prisma](https://www.prisma.io/) | `6.19.3` | Type-safe PostgreSQL client and schema modeling |
| **Database** | [PostgreSQL (Neon)](https://neon.tech/) | Cloud | Serverless relational database with pooled and direct connection strings |
| **LLM Inference** | [Groq SDK](https://groq.com/) | `1.6.0` | Ultra-fast LLM inference using model `openai/gpt-oss-120b` |
| **Search Engine** | [Tavily Core](https://tavily.com/) | `0.7.13` | Targeted web search for corporate CSR, developer relations, and events |
| **Email Delivery** | [Nodemailer](https://nodemailer.com/) | `10.0.15` | SMTP client configured for authenticated Gmail delivery |
| **Inbox Sync** | [ImapFlow](https://imapflow.com/) | `2.2.11` | IMAP client connecting to Gmail inbox to detect incoming sponsor replies |
| **Email Parsing** | [mailparser](https://nodemailer.com/docs/mailparser/) | `3.9.37` | MIME stream parsing to extract RFC-822 headers and body text |
| **Deployment** | [Vercel](https://vercel.com/) | Cloud | Production hosting with serverless functions and dynamic request routing |

---

## Repository Structure

```text
sponsy-bot/
├── app/
│   ├── api/                              # Next.js Server-Side Route Handlers
│   │   ├── emails/
│   │   │   ├── route.ts                  # GET: List outreach emails with relations
│   │   │   └── [id]/
│   │   │       ├── approve/route.ts      # PATCH: Transition email to 'approved'
│   │   │       ├── reject/route.ts       # PATCH: Transition email to 'rejected'
│   │   │       └── send/route.ts         # POST: Verified delivery via Gmail SMTP
│   │   ├── replies/
│   │   │   ├── sync/route.ts             # POST: Trigger IMAP inbox check for replies
│   │   │   └── [id]/classify/route.ts    # PATCH: Classify reply outcome (interested/declined)
│   │   ├── research/
│   │   │   └── route.ts                  # POST: Tavily discovery + Groq scoring & email generation
│   │   ├── settings/user/route.ts        # PATCH: Update account settings
│   │   └── sponsors/
│   │       ├── route.ts                  # GET: List all sponsors | POST: Create sponsor & contact
│   │       └── [id]/route.ts             # PATCH: Update sponsor fields | DELETE: Cascading deletion
│   ├── approvals/                        # Human-in-the-Loop Email Review Workbench
│   │   ├── page.tsx                      # Server component with force-dynamic
│   │   ├── ApprovalsPageClient.tsx       # Filtering tabs and state management
│   │   ├── EmailReviewCard.tsx           # Full card with score breakdown, inline edit & send
│   │   ├── EditEmailModal.tsx            # Modal for operator text revisions
│   │   └── RejectModal.tsx               # Modal to record rejection reason
│   ├── components/                       # Shared UI Components
│   │   ├── PipelineBoard.tsx             # Kanban-style multi-stage pipeline board
│   │   ├── RecentSponsors.tsx            # Recent activity list
│   │   ├── Sidebar.tsx                   # Main platform navigation
│   │   ├── SponsorCard.tsx               # Grid card display for sponsors
│   │   └── StatCard.tsx                  # Dashboard metric card
│   ├── lib/                              # Core Utilities, Types, and Services
│   │   ├── ai/
│   │   │   ├── groq-utils.ts             # Exponential backoff and JSON repair for Groq
│   │   │   ├── gemini-utils.ts           # Backoff and retry utilities for Google Gemini
│   │   │   ├── sponsor-intelligence.ts   # Tavily search + Groq corporate synthesis
│   │   │   ├── sponsor-scoring.ts        # 5-criteria evaluation + deterministic math
│   │   │   └── sponsor-email-generator.ts# Personalized outreach generation with campaign constraints
│   │   ├── integrations/
│   │   │   ├── gmail.ts                  # Authenticated SMTP transporter and status validation
│   │   │   ├── imap.ts                   # IMAP inbox fetcher for In-Reply-To matching
│   │   │   ├── follow-up.ts              # Follow-up eligibility engine (max 2 rule, 3-day wait)
│   │   │   └── sponsor-workflow.ts       # State transition rules and human approval checks
│   │   ├── constants.ts                  # Pipeline stages, industry taxonomy, team lists
│   │   ├── db.ts                         # PrismaClient serverless singleton instance
│   │   ├── mappers.ts                    # Database entity to frontend SponsorUI mapper
│   │   ├── sponsor-styles.ts             # Color maps and badge styles
│   │   └── types.ts                      # Core TypeScript interfaces (CampaignRequirements, etc.)
│   ├── outreach/                         # Campaigns & Sent Outreach Monitoring
│   ├── pipeline/                         # Pipeline Kanban Overview
│   ├── replies/                          # Received Sponsor Replies Workbench
│   ├── research/                         # Sponsor Research & Intelligence Hub
│   │   ├── page.tsx                      # Server component with force-dynamic
│   │   ├── ResearchClient.tsx            # Sponsor cards with "Run Research" modal triggers
│   │   └── EmailRequirementsModal.tsx    # 8-field required campaign parameters form
│   ├── settings/                         # User profile and operator settings
│   ├── sponsors/                         # Sponsor Management
│   │   ├── page.tsx                      # Server component with force-dynamic
│   │   ├── SponsorsPageClient.tsx        # Sponsor table state and Add Sponsor modal trigger
│   │   ├── SponsorTable.tsx              # Searchable, filterable table/card view
│   │   ├── AddSponsorModal.tsx           # Form to create sponsor and primary contact
│   │   └── [id]/page.tsx                 # Deep-dive sponsor profile page
│   ├── layout.tsx                        # Global application layout with sidebar
│   └── page.tsx                          # Live Dashboard (forces dynamic rendering)
├── prisma/
│   ├── schema.prisma                     # Prisma models: User, Sponsor, Contact, Research, Email, etc.
│   └── seed.ts                           # Database seeder script
├── public/                               # Static SVG icons and image assets
├── next.config.ts                        # Next.js application configuration
├── package.json                          # Dependencies, scripts, and package metadata
├── tsconfig.json                         # TypeScript compiler configuration
└── test-workflow.ts                      # Unit test script for communication state machine
```

---

## API Reference

All API routes run server-side and return standardized JSON responses.

| Method | Endpoint | Description | Request Body / Parameters | Key Validation Rules |
|---|---|---|---|---|
| `GET` | `/api/sponsors` | List all sponsors with primary contacts | None | Returns sorted by `createdAt: desc` |
| `POST` | `/api/sponsors` | Create a sponsor and primary contact | `{ companyName, industry, website, tier, priority, status, assignedTo, contacts }` | `companyName` is mandatory; allowlists valid fields |
| `PATCH` | `/api/sponsors/:id` | Update sponsor metadata | `{ status?, priority?, tier?, description?, ... }` | Rejects unallowlisted fields; validates status/priority enums |
| `DELETE` | `/api/sponsors/:id` | Cascading delete of sponsor & records | None | Deletes FollowUps $\rightarrow$ Emails $\rightarrow$ Contacts $\rightarrow$ Research $\rightarrow$ Sponsor |
| `POST` | `/api/research` | Run research & draft outreach email | `{ sponsorId, campaignRequirements }` | **HTTP 400** if `campaignRequirements` is omitted or missing any of the 8 required fields |
| `GET` | `/api/emails` | List all emails with sponsor relations | Query param: `?status=pending_review` | Filters by status if specified; includes sponsor research |
| `PATCH` | `/api/emails/:id/approve` | Human approval of draft email | `{ subject?, body? }` (optional overrides) | Only emails in `pending_review` can transition to `approved` |
| `PATCH` | `/api/emails/:id/reject` | Rejection of draft email | None | Only un-sent emails can be rejected |
| `POST` | `/api/emails/:id/send` | Deliver email via Gmail SMTP | None | **Strict safety gate:** Rejects send unless `status === 'approved'` |
| `POST` | `/api/replies/sync` | Sync Gmail inbox for sponsor replies | None | Inspects inbox for headers matching `messageId` of sent emails |
| `PATCH` | `/api/replies/:id/classify` | Human classification of reply | `{ outcome: 'interested' \| 'declined' \| 'needs_review' }` | Conclusive outcomes automatically update the sponsor status |
| `PATCH` | `/api/settings/user` | Update operator account info | `{ userId, name, email }` | Requires all three fields |

---

## Database Schema & Data Models

Sponsy Bot uses a relational architecture modeled in `prisma/schema.prisma`:

```mermaid
erDiagram
    USER ||--o{ SPONSOR : "assigned to"
    SPONSOR ||--o{ CONTACT : "has"
    SPONSOR ||--o{ RESEARCH : "has"
    SPONSOR ||--o{ EMAIL : "receives"
    SPONSOR ||--o{ REPLY : "sends"
    CONTACT ||--o{ EMAIL : "addressed to"
    CAMPAIGN ||--o{ EMAIL : "belongs to"
    EMAIL ||--o{ FOLLOWUP : "schedules"
    EMAIL ||--o{ REPLY : "receives"

    USER {
        string id PK
        string name
        string email UK
        string role
        datetime createdAt
    }

    SPONSOR {
        string id PK
        string companyName
        string website
        string industry
        string tier
        string priority
        string status
        string assignedTo FK
    }

    CONTACT {
        string id PK
        string sponsorId FK
        string name
        string email
        string role
    }

    RESEARCH {
        string id PK
        string sponsorId FK
        json data
        string summary
        int aiScore
    }

    EMAIL {
        string id PK
        string sponsorId FK
        string contactId FK
        string subject
        string body
        string status
        int confidenceScore
        string messageId
        datetime sentAt
    }

    FOLLOWUP {
        string id PK
        string emailId FK
        datetime scheduledFor
        string status
        string subject
        string body
    }

    REPLY {
        string id PK
        string emailId FK
        string sponsorId FK
        string messageId UK
        string subject
        string outcome
        datetime receivedAt
    }
```

---

## Local Setup & Installation

Follow these instructions to run Sponsy Bot locally from a fresh clone.

### 1. Prerequisites
* **Node.js**: `v20.x` or higher
* **npm**: `v10.x` or higher
* **PostgreSQL**: A running instance (or a free cloud database on [Neon](https://neon.tech/))

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/vasatanisha24-commits/sponsy-bot.git
cd sponsy-bot
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:

```env
# PostgreSQL Database Connection Strings (e.g., from Neon)
DATABASE_URL="postgresql://user:password@ep-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-direct.us-east-2.aws.neon.tech/neondb?sslmode=require"

# AI Inference & Search Keys
GROQ_API_KEY="gsk_your_groq_api_key_here"
TAVILY_API_KEY="tvly-your_tavily_api_key_here"

# (Optional) Google Gemini Alternative Utility
GEMINI_API_KEY="your_gemini_api_key_here"

# (Optional) Gmail Integration for Live Email Sending & Reply Tracking
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-app-password"
```

> **Note on Neon connection strings:** `DATABASE_URL` connects through PgBouncer (pooled port 6543 or `-pooler` domain) for serverless query scalability. `DIRECT_URL` connects directly to PostgreSQL (port 5432) for schema synchronization via `prisma db push`.

### 4. Initialize Database Schema
Sponsy Bot uses Prisma's direct schema-push workflow:

```bash
# Push the Prisma schema directly to your PostgreSQL database
npx prisma db push

# Generate the Prisma Client
npx prisma generate

# (Optional) Seed the database with a default user and sample sponsor
npm run seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable Name | Purpose | Required for Startup? | Where It Is Used |
|---|---|---|---|
| `DATABASE_URL` | Pooled connection string to PostgreSQL | **Yes** | `prisma/schema.prisma`, `app/lib/db.ts` |
| `DIRECT_URL` | Direct connection string to PostgreSQL | **Yes** (for Prisma CLI) | `prisma/schema.prisma` (used by `prisma db push`) |
| `GROQ_API_KEY` | Authenticates requests to Groq Cloud | **Yes** (for Research & Scoring) | `app/lib/ai/sponsor-intelligence.ts`, `sponsor-scoring.ts`, `sponsor-email-generator.ts` |
| `TAVILY_API_KEY` | Authenticates web discovery searches | **Yes** (for Research) | `app/lib/ai/sponsor-intelligence.ts` |
| `GMAIL_USER` | Gmail account address for SMTP/IMAP | Optional (required to send/sync) | `app/lib/integrations/gmail.ts`, `app/lib/integrations/imap.ts` |
| `GMAIL_APP_PASSWORD`| 16-character Google App Password | Optional (required to send/sync) | `app/lib/integrations/gmail.ts`, `app/lib/integrations/imap.ts` |
| `GEMINI_API_KEY` | Google Gemini API key | Optional (utility fallback) | `app/lib/ai/gemini-utils.ts` |

---

## Testing & Quality Assurance

Sponsy Bot includes static analysis, production compilation verification, and state machine unit tests:

```bash
# 1. Type check without emitting code
npx tsc --noEmit

# 2. Production build verification (runs Prisma Client generation + Next.js Turbopack)
npm run build

# 3. Test the state machine communication rules
npx tsx test-workflow.ts

# 4. (Optional) Run an end-to-end AI intelligence & scoring dry-run for a sample company
npx tsx test-ai.ts "Vercel" "https://vercel.com"
```

---

## Deployment on Vercel

Sponsy Bot is optimized for deployment on the [Vercel Platform](https://vercel.com/):

1. **Push your code to GitHub** on the `main` branch.
2. **Import the repository** into Vercel.
3. **Configure Environment Variables** in the Vercel Project Settings:
   * Add `DATABASE_URL`, `DIRECT_URL`, `GROQ_API_KEY`, `TAVILY_API_KEY`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD`.
4. **Build Settings:**
   * Build Command: `prisma generate && next build` (configured in `package.json`)
   * Output Directory: `.next`
5. **Database Initialization:** Run `npx prisma db push` once against your production database prior to serving live traffic.
6. **Dynamic Routing:** All primary pages (`/`, `/sponsors`, `/approvals`, `/outreach`) specify `export const dynamic = 'force-dynamic'`, guaranteeing live request-time queries without static build-time caching.

---

## Security & Responsible Usage

* **Mandatory Human Approval Gate:** Automated AI agents can easily hallucinate terms or event names. Sponsy Bot enforces that every drafted email is stored in `pending_review` status. The email delivery handler (`/api/emails/:id/send`) throws an error if an email is not in `approved` status.
* **Server-Side API Keys:** All API keys (`GROQ_API_KEY`, `TAVILY_API_KEY`, `GMAIL_APP_PASSWORD`, `DATABASE_URL`) are stored server-side and never exposed to the client bundle.
* **Zero Autonomous Outreach:** Creating a sponsor never triggers an outreach email. Emails are only drafted when an operator provides campaign details, and only sent when explicitly commanded by a human.
* **Bounded Follow-Ups:** The follow-up engine strictly caps communications at **two follow-ups maximum** per email thread, enforces a minimum 3-day quiet period between contacts, and halts outreach immediately if a reply or decline is received.
* **Mass-Assignment Protection:** Sponsor and email API routes use explicit field allowlists (`ALLOWED_CREATE_FIELDS`, `PATCHABLE_FIELDS`), preventing unauthorized modification of internal relational fields.

---

## Known Limitations & Roadmap

### Current Limitations
* **Single Tenant Account:** The current schema supports one organization at a time (role: `operator`). Multi-organization tenancy with workspace isolation is planned.
* **Gmail Specific:** Email sending and inbox tracking currently target Gmail SMTP and IMAP. Support for generic custom SMTP/IMAP servers and Microsoft 365 Exchange is in progress.
* **Rate Limits:** AI research speed is bound to standard Groq and Tavily API rate tiers.

### Roadmap
- [ ] **Multi-Event Support:** Link multiple concurrent hackathons or campaigns to separate sponsorship tier structures.
- [ ] **OAuth2 Integration:** Transition from Gmail App Passwords to Google OAuth2 authentication.
- [ ] **CRM Export:** Export sponsor pipelines directly to HubSpot, Notion, and CSV formats.
- [ ] **Automated Cron Sync:** Convert manual reply sync to scheduled Vercel Cron jobs.

---

*Built for hackathons, community events, and tech conferences worldwide.*
