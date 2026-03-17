# SkillPilot - System Architecture

## High-Level Architecture

```
                         +---------------------------+
                         |     skillspilot.xyz        |
                         |    (Cloudflare DNS/CDN)    |
                         +----------+--------+-------+
                                    |        |
                      +-------------+        +---------------+
                      v                                      v
           skillspilot.xyz                       api.skillspilot.xyz
           +--------------+                     +-----------------+
           |   Vercel     |                     |    Railway      |
           |   (Frontend) |--- API calls ------>|    (Backend)    |
           |   React SPA  |<-- JSON responses --|    FastAPI      |
           +--------------+                     +------+----------+
                  |                                    |
                  |                          +---------+-----------+
                  |                          v         v           v
                  |                    +---------+ +--------+ +---------+
                  |                    |Supabase | |Razorpay| | Google  |
                  |                    | (DB +   | |Payment | | Gemini  |
                  |                    |  Auth)  | |Gateway | |  (AI)   |
                  |                    +---------+ +--------+ +---------+
                  |                         ^
                  +--- Auth (Supabase JS) --+
```

## Component Details

### Frontend (Vercel)
- **Framework:** React 19 with CRACO build system
- **Styling:** Tailwind CSS 3.4 with custom glass-effect theme
- **Routing:** React Router v7 (14 routes — 10 protected, 4 public policy pages)
- **State:** React hooks (useState, useEffect) — no external state library
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Payments:** react-razorpay v3.0.1 SDK for payment popup
- **Auth:** Supabase JS SDK v2 with PKCE flow, auto token refresh, persistent sessions
- **Icons:** Lucide React (500+ icons)
- **Build:** CRACO with `@` path alias, `--legacy-peer-deps` required

### Backend (Railway)
- **Framework:** FastAPI 0.110.1 (Python 3.11)
- **ASGI Server:** Uvicorn 0.25.0
- **AI Engine:** LLMRouter with Gemini 2.5 Flash (primary) + GPT-4o-mini (fallback), retry + exponential backoff
- **Document Generation:** ReportLab 4.4.9 (PDF) + python-docx 1.2.0 (DOCX)
- **Payment Processing:** Razorpay Python SDK 2.0.0 (live), Stripe 14.3.0 (dormant)
- **Geo Detection:** httpx async calls to ip-api.com for country/VPN detection
- **Auth Middleware:** JWT validation via Supabase `auth.get_user()`
- **Database Client:** Supabase Python SDK (dual clients — service role + anon)
- **Rate Limiting:** Custom token-bucket middleware (30/min general, 10/min generation)
- **Routers:** 7 routers — auth, generation, download, history, payments, referrals, geo

### Database (Supabase PostgreSQL)
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Tables:** profiles, generation_history, payment_transactions, referrals
- **RLS:** Row-Level Security on all 4 tables
- **Triggers:** `handle_new_user()` auto-creates profile with unique referral code on signup
- **RPC:** `deduct_credits()` — atomic credit deduction with row-locking

### External Services
| Service | Purpose | Config |
|---------|---------|--------|
| Supabase | Database + Auth | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` |
| Google Gemini 2.5 Flash | AI text generation (primary) | `GEMINI_API_KEY` |
| OpenAI GPT-4o-mini | AI text generation (fallback) | `OPENAI_API_KEY` |
| Razorpay | INR payments (live) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| Stripe | USD payments (dormant) | `STRIPE_SECRET_KEY` |
| ip-api.com | IP geolocation for pricing | No key required |
| Cloudflare | DNS (DNS-only mode) | Zone: `skillspilot.xyz` |

## Data Flow Diagrams

### Authentication Flow
```
User -> Browser -> skillspilot.xyz
  |
  +-- Email/Password:
  |     1. Frontend calls Supabase Auth signUp/signIn
  |     2. Supabase returns JWT access token
  |     3. Frontend stores session (Supabase handles refresh)
  |     4. JWT sent as Bearer token on all API calls
  |     5. Backend validates JWT with Supabase
  |
  +-- Google OAuth:
  |     1. Frontend redirects to Supabase OAuth URL
  |     2. User authenticates with Google
  |     3. Supabase redirects to /auth/callback
  |     4. AuthCallback component extracts session
  |     5. Same JWT flow as above
  |
  +-- Forgot Password:
        1. Frontend calls supabase.auth.resetPasswordForEmail
        2. Resend delivers password reset email
        3. User clicks link, Supabase handles reset
```

### AI Generation Flow
```
User fills form -> Frontend
  |
  1. POST api.skillspilot.xyz/api/generate/{type}
     Headers: Authorization: Bearer <jwt>
     Body: { tool-specific fields, emergent_mode }
  |
  2. Backend validates JWT (get_current_user middleware)
  |
  3. Backend checks credit balance
     - Calculates cost: Resume=5, Project=8, English=2, Interview=3
     - If emergent_mode: cost *= 1.3
     - If insufficient: returns 402
  |
  4. Backend calls Google Gemini API
     - Constructs prompt from user input
     - Parses JSON response from Gemini
  |
  5. Backend atomically deducts credits (RPC: deduct_credits)
  |
  6. Backend saves to generation_history table
  |
  7. Returns { result: {...}, history_id: "uuid" }
  |
  8. Frontend renders result + enables PDF/DOCX download
```

### Payment Flow (Razorpay)
```
User clicks "Buy Now" on a package
  |
  1. POST api.skillspilot.xyz/api/payments/razorpay/create-order
     Body: { package_id: "pro_inr" }
  |
  2. Backend creates Razorpay order via API
     - Records pending transaction in payment_transactions
     - Returns: { order_id, amount, currency, key_id }
  |
  3. Frontend opens Razorpay checkout popup
     - User completes payment (card/UPI/netbanking)
  |
  4. On success, Razorpay calls handler callback
  |
  5. POST api.skillspilot.xyz/api/payments/razorpay/verify
     Body: { order_id, payment_id, signature }
  |
  6. Backend verifies HMAC signature with Razorpay secret
     - Updates transaction status to "paid"
     - Adds credits to user profile
  |
  7. Frontend refreshes credit display
```

### Download Flow
```
User clicks "Download PDF" or "Download DOCX"
  |
  1. GET api.skillspilot.xyz/api/download/{history_id}/{format}
  |
  2. Backend fetches generation from history (with RLS user check)
  |
  3. Backend generates document:
     - PDF: ReportLab with custom templates per type
     - DOCX: python-docx with styled sections
  |
  4. Returns StreamingResponse with file bytes
  |
  5. Browser triggers download
```

## Folder Structure

```
aiwrapper/
+-- backend/
|   +-- app/
|   |   +-- main.py              # FastAPI app, CORS, router mounting
|   |   +-- config.py            # Settings from env vars
|   |   +-- db.py                # Supabase client init
|   |   +-- routers/
|   |   |   +-- auth.py          # /api/auth/me, PATCH profile
|   |   |   +-- generate.py      # /api/generate/{type}
|   |   |   +-- history.py       # /api/history, /api/history/stats
|   |   |   +-- payments.py      # /api/payments/razorpay/*, stripe/*
|   |   |   +-- download.py      # /api/download/{id}/{format}
|   |   +-- services/
|   |   |   +-- auth.py          # JWT validation middleware
|   |   |   +-- credits.py       # Credit costs, deduction, save_generation
|   |   |   +-- gemini.py        # Google Gemini API wrapper
|   |   |   +-- prompts.py       # AI prompt templates per tool
|   |   |   +-- documents.py     # PDF/DOCX generation
|   |   |   +-- stripe_native.py # Stripe SDK wrapper (dormant)
|   |   +-- models/
|   |       +-- generation.py    # Pydantic request/response models
|   |       +-- payment.py       # Credit packages, payment models
|   +-- server.py                # Uvicorn entry point
|   +-- requirements.txt
|   +-- .env.example
|
+-- frontend/
|   +-- public/
|   |   +-- index.html
|   +-- src/
|   |   +-- App.js               # Router, auth state, ErrorBoundary
|   |   +-- index.js             # Entry point with global ErrorBoundary
|   |   +-- lib/
|   |   |   +-- supabase.js      # Supabase client init
|   |   |   +-- utils.js         # clsx/tailwind-merge helper
|   |   +-- components/
|   |   |   +-- Layout.js        # Sidebar, navigation, credits display
|   |   |   +-- ErrorBoundary.js # React error boundary
|   |   |   +-- AuthCallback.js  # OAuth callback handler
|   |   |   +-- ReferralSection.js
|   |   |   +-- EmergentModeCard.js
|   |   |   +-- ui/              # 7 shadcn/ui primitives
|   |   +-- hooks/
|   |   |   +-- useAIGeneration.js  # Shared AI generation hook
|   |   |   +-- useDownload.js      # Shared download hook
|   |   +-- pages/
|   |       +-- LandingPage.js
|   |       +-- AuthPage.js         # Login, signup, OTP, forgot password
|   |       +-- DashboardPage.js    # Stats, chart, tool cards
|   |       +-- ResumeBuilderPage.js
|   |       +-- ProjectGeneratorPage.js
|   |       +-- EnglishImproverPage.js
|   |       +-- InterviewCoachPage.js
|   |       +-- PurchaseCreditsPage.js
|   |       +-- HistoryPage.js
|   |       +-- ProfilePage.js      # Avatar, name, password, email, stats
|   +-- package.json
|   +-- craco.config.js
|   +-- tailwind.config.js
|
+-- docs/                        # Project documentation
```

## Security Architecture

| Layer | Protection |
|-------|-----------|
| Auth | Supabase JWT validation on every API call |
| Database | Row-Level Security (RLS) on all tables |
| Credits | Atomic RPC deduction (prevents race conditions) |
| Payments | HMAC signature verification (Razorpay) |
| Profile | Allowlist fields (only `name`, `picture` editable) |
| CORS | Origin-restricted, all methods (GET/POST/PUT/PATCH/DELETE) |
| Rate Limiting | Token-bucket rate limiter (30 req/60s general, 10 req/60s generation) |
| SSL | Cloudflare Full (Strict) SSL |
| Input | Pydantic validation on all request bodies |
