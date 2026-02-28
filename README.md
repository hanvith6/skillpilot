# SkillMate AI

AI-powered career toolkit for engineering students. Generate optimized resumes, project ideas, improved English writing, and interview answers using LLM technology.

## Architecture

```
frontend/               React 19 + Tailwind CSS + Radix UI
  src/
    pages/              Landing, Auth, Dashboard, Resume, Project, English, Interview, History, Purchase
    components/         UI components (shadcn/ui), ErrorBoundary, AuthCallback, EmergentModeCard, ReferralSection
    hooks/              useAIGeneration (API calls), useDownload (PDF/text export)
    lib/                supabase.js (client init)

backend/                Python FastAPI
  app/
    routers/            auth.py, generation.py, history.py, credits.py, payments.py
    services/
      auth.py           JWT verification via Supabase
      credits.py        Credit calculation (5/8/2/3 normal, 7/10/3/4 premium)
      prompts.py        LLM prompt templates + input sanitization + output filtering
      llm/
        router.py       Gemini primary + OpenAI fallback with auto-failover
        gemini.py       Google Gemini provider
        openai_llm.py   OpenAI provider
    models/             Pydantic request/response models
    db/
      __init__.py       Supabase client (service role)
      schema.sql        PostgreSQL schema + RLS + triggers
    config.py           Environment config
    main.py             FastAPI app + CORS + rate limiting
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS, Radix UI (shadcn/ui), React Router 7 |
| Backend | Python, FastAPI, Uvicorn |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | Supabase Auth (Google OAuth + email/password) |
| LLM | Google Gemini (primary) + OpenAI (fallback) |
| Payments | Razorpay (India) + Stripe (global) with geo-detection |
| Deployment | Vercel (frontend) + Railway (backend) |

## Database Schema

Four tables in Supabase PostgreSQL:

- **profiles** - User data, credits (default 100), referral codes. Auto-created by DB trigger on signup.
- **generation_history** - All AI generations with type, title, content (JSONB), credits used.
- **payment_transactions** - Razorpay/Stripe payment records with status tracking.
- **referrals** - Referral relationships and credit awards.

All tables have Row Level Security enabled. Backend uses service role key (bypasses RLS). Frontend uses anon key (respects RLS).

## Credit System

| Tool | Normal | Premium |
|---|---|---|
| Resume Builder | 5 | 7 |
| Project Generator | 8 | 10 |
| English Improver | 2 | 3 |
| Interview Coach | 3 | 4 |

- New users start with 100 credits
- Referral bonus: referrer gets 50, referred user gets 20
- Purchase via Razorpay (India) or Stripe (global)

## Auth Flow

1. **Google OAuth**: Supabase `signInWithOAuth` -> Google consent -> Supabase callback -> `/auth/callback` -> fetch profile from backend
2. **Email/Password**: Supabase `signUp` with OTP email verification (when SMTP configured) -> `signInWithPassword` for login
3. **Backend**: All protected endpoints use `get_current_user` dependency which verifies Supabase JWT via `auth.get_user(token)` and returns the profile

## Security

- Input sanitization on all generation requests (Pydantic validators)
- Prompt injection protection: XML-delimited user input, system preamble with security rules, banned word filtering
- Output filtering: strips markdown fences, detects leaked credentials/API keys
- Rate limiting: 30 req/min general, 10 req/min generation
- CORS restricted to frontend origin
- Service role key backend-only, anon key frontend-only

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase project (free tier)
- Gemini API key

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # Fill in your keys
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
cp .env.example .env   # Fill in Supabase URL + anon key
npm start
```

### Database
Run `backend/app/db/schema.sql` in Supabase SQL Editor (use `postgres` role).

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=             # https://xxx.supabase.co
SUPABASE_SERVICE_KEY=     # Service role key (secret)
SUPABASE_ANON_KEY=        # Anon/public key
GEMINI_API_KEY=           # Google AI Studio
OPENAI_API_KEY=           # Optional fallback
CORS_ORIGINS=             # http://localhost:3000
FRONTEND_URL=             # http://localhost:3000
RAZORPAY_KEY_ID=          # Optional
RAZORPAY_KEY_SECRET=      # Optional
STRIPE_SECRET_KEY=        # Optional
STRIPE_WEBHOOK_SECRET=    # Optional
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=          # http://localhost:8000
REACT_APP_SUPABASE_URL=         # https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=    # Anon/public key
REACT_APP_STRIPE_PUBLISHABLE_KEY= # Optional
```

## Deployment

- **Frontend**: Push to GitHub, connect to Vercel. `vercel.json` handles SPA routing.
- **Backend**: Push to GitHub, connect to Railway. Uses `Procfile` or `Dockerfile`.
- **Database**: Supabase hosted PostgreSQL (no deployment needed).

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /health | No | Health check |
| POST | /api/auth/signup | No | Register (backend-side) |
| POST | /api/auth/login | No | Login (backend-side) |
| GET | /api/auth/me | Yes | Get current user profile |
| POST | /api/auth/apply-referral | Yes | Apply referral code |
| POST | /api/generate/resume | Yes | Generate resume |
| POST | /api/generate/project | Yes | Generate project idea |
| POST | /api/generate/english | Yes | Improve English text |
| POST | /api/generate/interview | Yes | Generate interview answer |
| GET | /api/history | Yes | Get generation history |
| POST | /api/payments/create-razorpay | Yes | Create Razorpay order |
| POST | /api/payments/verify-razorpay | Yes | Verify Razorpay payment |
| POST | /api/payments/create-stripe | Yes | Create Stripe session |
| POST | /api/payments/stripe-webhook | No | Stripe webhook |
