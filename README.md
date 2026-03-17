<p align="center">
  <img src="frontend/public/favicon.svg" alt="SkillPilot Logo" width="80" height="80" />
</p>

<h1 align="center">SkillPilot</h1>
<h3 align="center">AI Career Toolkit for Engineering Students</h3>

<p align="center">
  <strong>Generate ATS-optimized resumes, project reports, polished English, and interview answers — powered by Google Gemini AI.</strong>
</p>

<p align="center">
  <a href="https://skillspilot.xyz">Live Demo</a> &nbsp;&middot;&nbsp;
  <a href="https://api.skillspilot.xyz/docs">API Docs</a> &nbsp;&middot;&nbsp;
  <a href="#installation">Quick Start</a>
</p>

---

## Overview

SkillPilot is a full-stack AI platform built for engineering students and early-career professionals. It combines four specialized AI tools under a single credit-based system with dual payment gateways, geo-based pricing, and a multi-provider LLM backend with automatic failover.

Users sign up, receive 100 free credits, and use them across four AI tools — each generating structured, downloadable output in PDF or DOCX format.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Resume Builder** | Transforms rough notes into ATS-friendly, structured resumes with summary, skills, experience, education, and project sections. Supports country-specific formatting. |
| **Project Generator** | Generates complete final-year project reports including abstract, problem statement, architecture, module breakdown, tech stack, future scope, and 20 viva questions. |
| **English Improver** | Converts mixed or informal English into three polished versions — formal, semi-formal, and simple professional tones. |
| **Interview Coach** | Produces personalized interview answers using the STAR method for both HR and technical questions. |
| **Premium Mode** | Priority processing with more focused output (lower temperature). Costs 1.3x base credits. |
| **PDF & DOCX Export** | Download any past generation as a professionally styled PDF or DOCX document. |
| **Geo-Based Pricing** | Detects user location via IP. Shows INR pricing for India (Razorpay) and USD pricing globally (Stripe). Blocks VPN/proxy users. |
| **Referral System** | Each user gets a unique referral code. Referrer earns +50 credits, referred user earns +20 credits. |
| **LLM Failover** | Google Gemini as primary provider with automatic fallback to OpenAI. Includes retry logic with exponential backoff. |
| **Rate Limiting** | Token-bucket rate limiter — 30 req/min general, 10 req/min for AI generation endpoints. |

---

## System Architecture

```
                    ┌──────────────────┐
                    │   User Browser   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  React Frontend  │
                    │  (Vercel)        │
                    └────────┬─────────┘
                             │ HTTPS
                    ┌────────▼─────────┐
                    │  FastAPI Backend  │
                    │  (Railway)        │
                    └──┬─────┬──────┬──┘
                       │     │      │
              ┌────────▼┐ ┌──▼───┐ ┌▼──────────┐
              │ Supabase │ │ LLM  │ │ Payments  │
              │ Auth + DB│ │Router│ │Razorpay/  │
              │ (Postgres)│ │      │ │Stripe     │
              └──────────┘ └──┬───┘ └───────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Gemini 2.5 Flash  │
                    │ (primary)         │
                    │ GPT-4o-mini       │
                    │ (fallback)        │
                    └───────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Tailwind CSS, Radix UI (shadcn/ui), React Router 7, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | Supabase PostgreSQL with Row Level Security |
| **Authentication** | Supabase Auth — Google OAuth + Email/Password (PKCE flow) |
| **AI Models** | Google Gemini 2.5 Flash (primary), OpenAI GPT-4o-mini (fallback) |
| **Payments** | Razorpay (India / INR), Stripe (Global / USD) |
| **Document Generation** | ReportLab (PDF), python-docx (DOCX) |
| **Deployment** | Vercel (frontend), Railway (backend), Cloudflare DNS |

---

## Project Structure

```
skillpilot/
├── frontend/
│   ├── public/                     # Static assets, favicon, policy HTML pages
│   ├── src/
│   │   ├── pages/                  # 14 pages — Landing, Auth, Dashboard, 4 AI tools,
│   │   │                           #   History, Profile, Purchase, 4 policy pages
│   │   ├── components/             # Layout, AuthCallback, ErrorBoundary,
│   │   │   └── ui/                 #   shadcn/ui primitives (Button, Input, Select, etc.)
│   │   ├── lib/                    # Supabase client init, utility functions
│   │   └── App.js                  # Route definitions, auth state management
│   ├── vercel.json                 # SPA rewrites + static policy page routes
│   ├── tailwind.config.js          # Theme tokens, animations, dark mode
│   └── package.json                # 16 dependencies
│
├── backend/
│   ├── app/
│   │   ├── routers/                # 7 routers — auth, generation, download,
│   │   │                           #   history, payments, referrals, geo
│   │   ├── services/
│   │   │   ├── llm/                # LLMRouter, Gemini provider, OpenAI provider
│   │   │   ├── prompts.py          # Prompt templates + injection protection
│   │   │   ├── credits.py          # Credit calculation + atomic deduction
│   │   │   └── documents.py        # PDF/DOCX generation (ReportLab, python-docx)
│   │   ├── models/                 # Pydantic schemas — user, generation, payment
│   │   ├── middleware/             # Token-bucket rate limiter
│   │   ├── db/
│   │   │   └── schema.sql          # Full PostgreSQL schema + RLS + triggers
│   │   ├── config.py               # Pydantic Settings (environment config)
│   │   └── main.py                 # FastAPI app, CORS, middleware, router registration
│   ├── railway.toml                # Railway deployment config
│   ├── Dockerfile                  # Python 3.11-slim container
│   ├── Procfile                    # Process entry point
│   └── requirements.txt            # 77 Python packages
│
└── docs/                           # API reference, architecture, DB schema,
                                    #   payment integration, QA test report
```

---

## Credit System

| Tool | Standard | Premium (1.3x) |
|------|----------|-----------------|
| Resume Builder | 5 credits | 7 credits |
| Project Generator | 8 credits | 10 credits |
| English Improver | 2 credits | 3 credits |
| Interview Coach | 3 credits | 4 credits |

- **100 free credits** on signup
- **Referral bonus**: Referrer +50, referred user +20
- **Packages**: 100 / 300 / 600 credits

| Region | Packages |
|--------|----------|
| India (INR) | ₹99 / ₹249 / ₹299 |
| Global (USD) | $4 / $5 / $6 |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | Health check |
| `POST` | `/api/auth/signup` | No | Register new user |
| `POST` | `/api/auth/login` | No | Login with email/password |
| `GET` | `/api/auth/me` | Yes | Get current user profile |
| `PATCH` | `/api/auth/me` | Yes | Update profile (name, picture) |
| `POST` | `/api/auth/apply-referral` | Yes | Apply referral code |
| `POST` | `/api/generate/resume` | Yes | Generate ATS resume |
| `POST` | `/api/generate/project` | Yes | Generate project report |
| `POST` | `/api/generate/english` | Yes | Improve English text |
| `POST` | `/api/generate/interview` | Yes | Generate interview answer |
| `GET` | `/api/download/{id}/{format}` | Yes | Download generation as PDF/DOCX |
| `GET` | `/api/history` | Yes | Get generation history |
| `GET` | `/api/history/stats` | Yes | Get usage statistics |
| `POST` | `/api/payments/razorpay/create-order` | Yes | Create Razorpay order |
| `POST` | `/api/payments/razorpay/verify` | Yes | Verify Razorpay payment |
| `POST` | `/api/payments/stripe/create-checkout` | Yes | Create Stripe checkout session |
| `GET` | `/api/payments/stripe/status/{id}` | Yes | Check Stripe payment status |
| `POST` | `/api/webhook/stripe` | No | Stripe webhook |
| `GET` | `/api/referrals/stats` | Yes | Get referral statistics |
| `GET` | `/api/geo/detect` | No | IP-based geo-detection |

Full interactive API documentation available at [`/docs`](https://api.skillspilot.xyz/docs) (Swagger UI).

---

## Database Schema

Four tables in Supabase PostgreSQL, all with Row Level Security enabled:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User accounts | id, name, email, credits (default 100), referral_code, picture |
| `generation_history` | AI generation records | user_id, type, title, content (JSONB), credits_used |
| `payment_transactions` | Payment records | user_id, provider, amount, currency, status, package_id |
| `referrals` | Referral tracking | referrer_id, referred_user_id, credits_awarded |

A database trigger (`handle_new_user`) auto-creates a profile row with a unique referral code (`SKILLPILOT-XXXXXXXX`) when a new user signs up through Supabase Auth.

---

## Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase project ([free tier](https://supabase.com))
- Google Gemini API key ([AI Studio](https://aistudio.google.com))

### Database Setup

Run the schema file in Supabase SQL Editor using the `postgres` role:

```
backend/app/db/schema.sql
```

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env    # Fill in your keys
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
cp .env.example .env    # Fill in Supabase URL + anon key + backend URL
npm start
```

---

## Environment Variables

### Backend

```
SUPABASE_URL=               # Supabase project URL
SUPABASE_SERVICE_KEY=       # Service role key (secret)
SUPABASE_ANON_KEY=          # Anon/public key
GEMINI_API_KEY=             # Google AI Studio API key
OPENAI_API_KEY=             # Optional — fallback provider
RAZORPAY_KEY_ID=            # Razorpay key ID
RAZORPAY_KEY_SECRET=        # Razorpay secret
STRIPE_SECRET_KEY=          # Stripe secret key
STRIPE_WEBHOOK_SECRET=      # Stripe webhook signing secret
CORS_ORIGINS=               # Allowed origins (comma-separated)
FRONTEND_URL=               # Frontend URL for payment redirects
```

### Frontend

```
REACT_APP_BACKEND_URL=          # Backend API URL
REACT_APP_SUPABASE_URL=         # Supabase project URL
REACT_APP_SUPABASE_ANON_KEY=    # Supabase anon key
```

---

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | Root directory: `frontend`, Framework: Create React App |
| Backend | Railway | Root directory: `backend`, Builder: Nixpacks, Health check: `/health` |
| Database | Supabase | Hosted PostgreSQL — no deployment needed |
| DNS | Cloudflare | `skillspilot.xyz` → Vercel, `api.skillspilot.xyz` → Railway |

---

## Security

- **Input validation** — Pydantic models with length constraints and control character stripping on all AI generation inputs
- **Prompt injection protection** — User input wrapped in XML delimiters, explicit system rules instructing LLM to treat input as untrusted
- **Output filtering** — Regex-based detection removes leaked API keys, bearer tokens, and credentials from LLM output
- **Rate limiting** — Token-bucket middleware (30 req/min general, 10 req/min generation)
- **Row Level Security** — All database tables enforce user-scoped access at the PostgreSQL level
- **CORS** — Restricted to configured frontend origins
- **Dual client keys** — Service role key (backend only, bypasses RLS), anon key (frontend, respects RLS)

---

## Documentation

Detailed technical documentation is in the [`docs/`](./docs/) folder.

| Document | Description |
|----------|-------------|
| [docs/architecture.md](./docs/architecture.md) | System architecture, data flow diagrams, security model |
| [docs/api-reference.md](./docs/api-reference.md) | All 20 API endpoints with request/response examples |
| [docs/database-schema.md](./docs/database-schema.md) | Table definitions, RLS policies, triggers, RPC functions |
| [docs/payment-integration.md](./docs/payment-integration.md) | Razorpay + Stripe integration guide |
| [docs/setup-guide.md](./docs/setup-guide.md) | Local setup, Supabase config, production deployment |
| [docs/qa-test-report.md](./docs/qa-test-report.md) | QA test suite results (48 tests) |
| [docs/project-changelog.md](./docs/project-changelog.md) | Full project evolution changelog |

---

## Roadmap

### SkillArena — Interactive Skill Learning Games *(Upcoming Main Feature)*

> **Our next big selling point.** An interactive, gamified learning experience built into SkillPilot — where users don't just read about skills, they *play* their way to mastering them.

- [ ] **SkillArena** — game-based learning sessions for Python, DSA, and SQL
  - Play through coding challenges, quizzes, and puzzles in a game-like flow
  - Track XP, streaks, and progress for each skill track
  - Compete on leaderboards with other learners
  - AI-powered hints and explanations powered by the existing LLM backend

### SkillPilot v2 — Redesigned Experience *(In Planning)*

> A ground-up rethink of how users interact with every existing feature — new UI, new user flows, and a new session-based interaction model across the entire platform.

- [ ] **New UI** — redesigned interface with a modern, cohesive visual language
- [ ] **New user flows** — streamlined journeys for resume building, mock interviews, and all AI tools
- [ ] **Interactive session model** — users engage with tools in a guided, step-by-step session rather than single-shot generation
- [ ] **Conversation-style interaction** — iterative back-and-forth with AI for refinement (e.g., tweak your resume in real time)
- [ ] **Unified dashboard** — all tools, history, and progress accessible from one place

### Other Planned Improvements

- [ ] Stripe live mode activation (currently test keys)
- [ ] Email notifications for payment receipts
- [ ] Generation history search and filtering
- [ ] Additional AI tools (cover letter writer, LinkedIn optimizer)
- [ ] Multi-language support

---

## License

This project is licensed under the [MIT License](./LICENSE).

Copyright (c) 2026 Hanvith Reddy B

---

<p align="center">
  Built by <a href="https://www.linkedin.com/in/hanvith-reddy-a67857252/">Hanvith Reddy B</a>
</p>
