# SkillPilot - Project Evolution Changelog

Complete step-by-step record of how the project was built from initial concept to production-ready state.

---

## Phase 1: Initial Planning
**Commit:** `4847421` - Initial plan

- Defined project concept: AI-powered educational platform for engineering students
- Identified 4 core tools: Resume Builder, Project Generator, English Improver, Interview Coach
- Chose tech stack: React frontend, FastAPI backend, Supabase for auth/DB, Google Gemini for AI

---

## Phase 2: Production Rewrite
**Commit:** `d8876c2` - Production rewrite: Supabase auth, modular backend, LLM abstraction, new credit system

### Backend
- Set up FastAPI with modular router structure (`auth.py`, `generate.py`, `history.py`, `payments.py`, `download.py`)
- Integrated Supabase as primary database with PostgreSQL
- Built JWT-based authentication middleware using Supabase Auth
- Implemented Google Gemini integration for AI text generation
- Created credit system: Resume=5, Project=8, English=2, Interview=3
- Atomic credit deduction via PostgreSQL RPC function (`deduct_credits`)
- Added Razorpay payment integration (INR packages)
- Added Stripe payment integration (USD packages)
- Built PDF generation with ReportLab (custom templates per tool type)
- Built DOCX generation with python-docx (styled documents)
- Set up Supabase Row-Level Security (RLS) on all tables

### Frontend
- React 19 with CRACO build system
- Tailwind CSS dark theme with glass-effect design
- Supabase JS SDK for auth session management
- Google OAuth integration
- 10 page components + Layout component with sidebar navigation
- shadcn/ui component library (button, input, label, select, textarea, switch, sonner)
- Credit display in sidebar
- Generation pages with result rendering and download buttons

### Database Schema
- `profiles` table: id, name, email, credits, picture, referral_code
- `generation_history` table: id, user_id, type, title, content (JSONB), credits_used
- `payment_transactions` table: id, user_id, amount, currency, status, provider
- `referral_codes` table: code, user_id, uses
- `handle_new_user()` trigger: auto-creates profile on auth signup with 100 free credits

---

## Phase 3: Code Refactoring
**Commit:** `1d15ac1` - Refactor duplicated code: extract shared hooks, component, and backend helpers

- Extracted `useAIGeneration` hook (shared across 4 generation pages)
- Extracted `useDownload` hook (shared download logic)
- Extracted `EmergentModeCard` component
- Removed code duplication across generation pages
- Backend helper consolidation

---

## Phase 4: Scaffolding Cleanup
**Commit:** `115394e` - Remove leftover Emergent scaffolding files

- Removed unused service files from initial scaffolding
- Cleaned up dead imports and references

---

## Phase 5: Bug Fixes
**Commit:** `54f5f0e` - Fix RLS errors, async Gemini, and JSON parsing reliability

- Fixed Supabase RLS policy errors that blocked data access
- Converted Gemini calls to async for better performance
- Improved JSON parsing reliability from AI responses (handling markdown code blocks, malformed JSON)

---

## Phase 6: Domain & Infrastructure Setup
- Purchased domain: `skillspilot.xyz`
- Configured Cloudflare DNS (Zone: `08568819ae392773707cc2170607bdbd`)
- Set up DNS records:
  - `A` record for root domain
  - `CNAME` for `www` -> `skillspilot.xyz`
  - `CNAME` for `api` subdomain (pending Railway deployment)
- Configured Resend SMTP for transactional emails
- Updated Supabase email templates with SkillPilot branding
- Set up DKIM authentication for `skillspilot.xyz`

---

## Phase 7: Feature Gap Audit & Fixes (9 Tasks)

### 7.1 Atomic Credits
- Verified atomic credit deduction via PostgreSQL RPC
- Prevents race conditions on concurrent generation requests

### 7.2 Project Generator Sections
- Fixed module rendering to handle both string and object entries
- Fixed tech_stack rendering for polymorphic data
- Removed `.slice(0, 5)` truncation on viva questions (all questions now display)

### 7.3 Download Buttons
- Verified PDF and DOCX downloads work for all 4 tool types
- Fixed memory leak: added `URL.revokeObjectURL()` after download
- Added toast error when historyId is missing

### 7.4 History Page
- Enhanced history listing with pagination
- Added type filters and search

### 7.5 Stripe Confirmation
- Fixed Stripe webhook error handler to return 400 (not 200) on failure
- Enables Stripe retry on webhook delivery failures

### 7.6 Profile Editing
- Fixed stale name bug: added `updateUser` callback to propagate name changes to sidebar
- Allowed `picture` field in PATCH /api/auth/me (was only `name`)

### 7.7 PDF/DOCX Templates
- Customized templates per document type (resume, project, english, interview)
- Added proper formatting, headers, and styling

### 7.8 Dead Code Cleanup
- Removed security middleware file that was no longer needed
- Cleaned up unused imports

### 7.9 Rebranding
- Updated from "SkillMate" to "SkillPilot" across all pages
- Updated HTML title, meta tags, landing page
- Updated DB trigger prefix from `SK-` to `SKILLPILOT-`

---

## Phase 8: User Interaction Features (7 Features)

### 8.1 Pre-made Avatar Picker
- Created 12 preset avatars: 6 gradient colors + 6 emoji characters
- Avatar picker grid with hover "Change" overlay
- Stored as string ID in `picture` column
- Shared `UserAvatar` component and `getAvatarInfo()` helper

### 8.2 Google Profile Picture Auto-Pull
- Reads `avatar_url` from Supabase auth user metadata
- Auto-saves Google profile picture if user has no picture set

### 8.3 Stale Name Bug Fix
- Added `updateUser` callback in App.js
- ProfilePage calls `updateUser({ name })` after save
- Sidebar avatar now uses shared `UserAvatar` component

### 8.4 Change Password
- Uses `supabase.auth.updateUser({ password })`
- Hidden for OAuth users
- Real-time validation (8+ chars, passwords match)

### 8.5 Change Email
- Uses `supabase.auth.updateUser({ email })`
- Hidden for OAuth users
- Sends verification email via Supabase

### 8.6 Usage Stats on Profile
- New `GET /api/history/stats` endpoint
- Returns total_generations, total_credits_used, breakdown by tool, most_used_tool
- Profile shows 3 stat cards + bar chart breakdown

### 8.7 Credit Usage Chart on Dashboard
- Recharts PieChart (donut) showing credit usage breakdown
- Color-coded: Resume (violet), Project (pink), English (blue), Interview (green)

---

## Phase 9: Comprehensive UI/Data Audit (11 Fixes)

### 9.1 Tailwind Dynamic Classes (CRITICAL)
- `border-${color}-500` template literals purged in production
- Fixed with static `ACCENT_STYLES` object lookup

### 9.2 Null Credit Guards
- All 4 generation pages: `user.credits` -> `(user?.credits || 0)`

### 9.3 Stale Result Persistence
- `useAIGeneration` now calls `setResult(null); setHistoryId(null)` at start

### 9.4 Resume Null Checks
- Experience: `.filter(Boolean).join(' . ')` instead of direct template literals
- Education: same pattern

### 9.5 Project Null Checks
- Modules/tech_stack handle both string and object entries

### 9.6 Viva Questions Truncation
- Removed `.slice(0, 5)` - all questions now display

### 9.7 Clipboard Error Handling
- English and Interview pages: async/await with try/catch

### 9.8 Download Memory Leak
- Added `URL.revokeObjectURL(url)` after download completes

### 9.9 Forgot Password
- New `step='forgot'` screen in AuthPage
- Uses `supabase.auth.resetPasswordForEmail`
- "Forgot password?" link on login form

### 9.10 404 Catch-All Route
- `<Route path="*">` with styled 404 page
- "Go back home" link to dashboard or landing

### 9.11 Overflow Scroll
- All 4 generation pages: `max-h-[85vh] overflow-y-auto` on output panel

---

## Phase 10: Payment Consolidation

### 10.1 Razorpay as Sole Gateway
- Removed `currency != "INR"` restriction from Razorpay create-order
- Razorpay now handles both INR and USD packages
- Dynamic currency from package definition

### 10.2 Stripe Disabled in UI
- Removed tab switcher (India/Global) from PurchaseCreditsPage
- Both INR and USD sections show on one page
- All packages route through single `handlePurchase` -> Razorpay
- Stripe backend code kept intact but dormant
- Removed unused imports (useMemo, useEffect, detectRegion)

### 10.3 Cloudflare WWW Redirect
- `www.skillspilot.xyz` CNAME already existed
- Created Page Rule: `www.skillspilot.xyz/*` -> `https://skillspilot.xyz/$1` (301)

---

## Phase 11: QA Audit & Code Cleanup

### 11.1 Frontend Code Audit
- Added `.env` to `.gitignore` (was missing)
- Removed 35 unused npm packages from package.json
- Deleted 39 unused UI component files from components/ui/
- Fixed `.env.example` branding (SkillMate -> SkillPilot)
- Removed stale `REACT_APP_STRIPE_PUBLISHABLE_KEY` from .env.example
- Added route-level ErrorBoundary wrappers in App.js
- Added aria-labels to icon-only buttons (hamburger menu, close sidebar)

### 11.2 Full QA Test Suite
- 61 total tests across 9 categories
- 61/61 PASS (100% pass rate)
- Tested: auth, profiles, generation, credits, history, downloads, payments, security
- Security tests: XSS, SQL injection, path traversal, credential injection, CORS
- All test data cleaned up after testing

### 11.3 Project Documentation
- Created `docs/` folder with comprehensive documentation
- Architecture diagrams, API reference, QA report, changelog, setup guide, database schema, payment docs

---

## Phase 12: Dashboard Redesign & UI Polish

### 12.1 Credit Usage Chart Redesign
- Replaced recharts PieChart/donut with custom color-coded horizontal bar charts
- Each tool type has unique icon, color, and gradient bar:
  - Resume: violet, Project: pink, English: blue, Interview: green
- Added per-tool use count, percentage, and "Most used" summary
- Removed `recharts` dependency entirely — JS bundle reduced by ~90 KB (296 KB → 207 KB)

### 12.2 Clickable Recent Activity
- Dashboard recent activity items now navigate to `/history?open={item_id}` on click
- Items show per-type colored icons (not all violet), color-coded type labels
- ChevronRight indicator shows items are interactive
- Cursor changes to pointer on hover

### 12.3 History Auto-Expand from URL
- HistoryPage reads `?open=` URL parameter via `useSearchParams`
- Auto-expands the matching history item on page load
- Scrolls the item smoothly into view
- Per-type color coding added to history items (icon backgrounds + type labels)

### 12.4 Removed recharts Dependency
- Removed `recharts` from package.json (no longer imported anywhere)
- Custom CSS bar charts replace all recharts usage

---

## Phase 13: Bug Fixes & Security Patches

### 13.1 CORS PATCH Method Missing (CRITICAL)
- **Bug:** `PATCH` was missing from CORS `allow_methods` in `backend/app/main.py`
- **Impact:** All profile updates (name, avatar) were blocked by browser CORS preflight
- **Fix:** Added `"PATCH"` to the allowed methods list

### 13.2 Credit Usage Chart Showing Zero After Refresh
- **Bug:** Stats API returns breakdown keys as capitalized (`"Resume"`, `"Project"`) but DashboardPage accessed them via `key.toLowerCase()` → `"resume"` — never matched
- **Fix:** Changed `breakdown[key.toLowerCase()]` to `breakdown[key]` in DashboardPage.js

### 13.3 Email Change Dual Confirmation
- **Issue:** Supabase has `mailer_secure_email_change_enabled: True`, meaning email changes require confirmation from BOTH old and new email addresses
- **Fix:** Updated success toast to explain dual-confirmation requirement, added same-email validation, added helper text below email input

### 13.4 Signup Race Condition & Duplicate Fetch
- **Bug (frontend):** `onAuthStateChange` fires `SIGNED_IN` and `INITIAL_SESSION` simultaneously with AuthPage's manual login handler, causing duplicate `fetchProfile` calls
- **Fix:** Skip `INITIAL_SESSION` event (handled by `initAuth`), added `fetchingRef` mutex to prevent concurrent duplicate fetches, handle `TOKEN_REFRESHED` event
- **Bug (backend):** Signup endpoint tried to read profile immediately after auth creation without waiting for the DB trigger
- **Fix:** Added retry loop (5 attempts, 0.5s delay) to wait for trigger-created profile. Used `maybe_single()` for referrer lookup. Cleaned up unused imports.

### 13.5 Supabase Email Template Branding
- **Bug:** Confirmation email subject and body still said "SkillMate AI"
- **Fix:** Updated via Supabase Management API to "SkillPilot"

---

## Phase 14: Pre-Deployment Bug Scan & Final Cleanup

### 14.1 Branding Fixes
- Health endpoint `main.py` returned `"skillmate-ai"` → changed to `"skillpilot"`
- `backend/.env.example` header said "SkillMate AI" → "SkillPilot"
- `README.md` title said "SkillMate AI" → "SkillPilot"
- `docs/api-reference.md` health example said `"skillmate-ai"` → `"skillpilot"`
- README Payments row updated: "Razorpay (India) + Stripe (global) with geo-detection" → "Razorpay (INR + USD) — Stripe dormant"

### 14.2 Dead Code & Unused Imports Removed
- Deleted `frontend/src/hooks/use-toast.js` — dead shadcn toast hook (project uses sonner)
- `auth.py`: Removed unused `JSONResponse`, `Profile`, `ReferralStats`, `settings` imports
- `payments.py`: Removed unused `uuid`, `datetime`, `timezone` imports
- `referrals.py`: Removed unused `ReferralStats` import

### 14.3 Production Config Safety
- `backend/.env.example`: Added "REQUIRED for production" labels to `CORS_ORIGINS` and `FRONTEND_URL`
- README: Stripe env var labeled "Dormant (Stripe disabled in UI)" instead of "Optional"

### 14.4 Landing Page Credit
- Added "Crafted by Hanvith Reddy B" with LinkedIn hyperlink to landing page footer
