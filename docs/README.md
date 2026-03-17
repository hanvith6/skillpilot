# SkillPilot Documentation

## Project Overview

SkillPilot is an AI-powered career toolkit for engineering students. It provides four specialized AI tools — Resume Builder, Project Generator, English Improver, and Interview Coach — under a credit-based system with dual payment gateways, geo-based pricing, and a multi-provider LLM backend with automatic failover.

**Live:** [skillspilot.xyz](https://skillspilot.xyz) | **API:** [api.skillspilot.xyz](https://api.skillspilot.xyz/docs)

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | System architecture, tech stack, data flow diagrams, security model |
| [API Reference](./api-reference.md) | Complete backend API endpoint documentation (20 endpoints) |
| [Database Schema](./database-schema.md) | Supabase tables (4), RLS policies, triggers, RPC functions |
| [Payment Integration](./payment-integration.md) | Razorpay (live) and Stripe (dormant) payment flow documentation |
| [Setup Guide](./setup-guide.md) | Local development setup, Supabase config, and production deployment |
| [QA Test Report](./qa-test-report.md) | Full QA test suite results (48 tests) |
| [Project Changelog](./project-changelog.md) | Step-by-step project evolution from start to current state |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Tailwind CSS 3.4, Radix UI (shadcn/ui), React Router 7, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | Supabase PostgreSQL with Row Level Security |
| **Authentication** | Supabase Auth — Google OAuth + Email/Password (PKCE flow) |
| **AI Models** | Google Gemini 2.5 Flash (primary), OpenAI GPT-4o-mini (fallback) |
| **Payments** | Razorpay (India / INR — live), Stripe (Global / USD — dormant) |
| **Document Gen** | ReportLab (PDF), python-docx (DOCX) |
| **Deployment** | Vercel (frontend), Railway (backend), Cloudflare DNS |

---

## Key Features

- **4 AI Tools** — Resume Builder, Project Generator, English Improver, Interview Coach
- **Premium Mode** — Focused output at 1.3x credit cost (lower LLM temperature)
- **PDF & DOCX Export** — Download any generation as a professionally styled document
- **Geo-Based Pricing** — IP detection via ip-api.com; INR for India, USD for others; VPN blocked
- **LLM Failover** — Gemini primary with automatic OpenAI fallback + retry with exponential backoff
- **Referral System** — Unique codes per user; referrer +50 credits, referred +20 credits
- **Rate Limiting** — Token-bucket middleware (30 req/min general, 10 req/min generation)
- **Prompt Injection Protection** — XML-delimited user input, security preamble, output filtering

---

## Credit System

| Tool | Standard | Premium (1.3x) |
|------|----------|-----------------|
| Resume Builder | 5 | 7 |
| Project Generator | 8 | 10 |
| English Improver | 2 | 3 |
| Interview Coach | 3 | 4 |

- **100 free credits** on signup
- **Packages:** 100 / 300 / 600 credits
- **India:** ₹99 / ₹249 / ₹299 (Razorpay)
- **Global:** $4 / $5 / $6 (Stripe)

---

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env    # Fill in your keys
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install --legacy-peer-deps
cp .env.example .env    # Fill in Supabase URL + anon key + backend URL
npm start
```

See [Setup Guide](./setup-guide.md) for detailed instructions including Supabase configuration.

---

## Project Structure

```
skillpilot/
├── frontend/
│   ├── public/                 # Static assets, favicon, policy HTML pages
│   ├── src/
│   │   ├── pages/              # 14 pages (Landing, Auth, Dashboard, 4 AI tools,
│   │   │                       #   History, Profile, Purchase, 4 policy pages)
│   │   ├── components/         # Layout, AuthCallback, ErrorBoundary, ReferralSection
│   │   │   └── ui/             # shadcn/ui primitives (Button, Input, Select, etc.)
│   │   ├── lib/                # Supabase client, utility functions
│   │   └── App.js              # Routes + auth state management
│   ├── vercel.json             # SPA rewrites + static policy page routes
│   └── package.json            # 16 dependencies
│
├── backend/
│   ├── app/
│   │   ├── routers/            # 7 routers (auth, generation, download,
│   │   │                       #   history, payments, referrals, geo)
│   │   ├── services/
│   │   │   ├── llm/            # LLMRouter, Gemini provider, OpenAI provider
│   │   │   ├── prompts.py      # Prompt templates + injection protection
│   │   │   ├── credits.py      # Credit calculation + atomic deduction
│   │   │   └── documents.py    # PDF/DOCX generation
│   │   ├── models/             # Pydantic schemas (user, generation, payment)
│   │   ├── middleware/         # Token-bucket rate limiter
│   │   ├── db/schema.sql       # PostgreSQL schema + RLS + triggers
│   │   └── main.py             # FastAPI app + CORS + middleware
│   ├── railway.toml            # Railway deployment config
│   ├── Dockerfile              # Python 3.11-slim container
│   └── requirements.txt        # 77 Python packages
│
└── docs/                       # This documentation folder
```
