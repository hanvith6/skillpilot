# SkillPilot Documentation

## Project Overview
SkillPilot is an AI-powered educational SaaS platform for engineering students, providing tools for resume building, project report generation, English improvement, and interview coaching.

## Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | System architecture, tech stack, data flow diagrams |
| [API Reference](./api-reference.md) | Complete backend API endpoint documentation |
| [QA Test Report](./qa-test-report.md) | Full QA test suite results (48 tests) |
| [Project Changelog](./project-changelog.md) | Step-by-step project evolution from start to end |
| [Setup Guide](./setup-guide.md) | Local development setup and deployment guide |
| [Database Schema](./database-schema.md) | Supabase database tables, RLS policies, triggers |
| [Payment Integration](./payment-integration.md) | Razorpay and Stripe payment flow documentation |

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # Fill in values
python -m uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
cp .env.example .env  # Fill in values
npm start
```

## Tech Stack

- **Frontend:** React 19, Tailwind CSS, Recharts, React Router
- **Backend:** Python FastAPI, Google Gemini AI
- **Database:** Supabase (PostgreSQL + Auth)
- **Payments:** Razorpay (INR + USD)
- **DNS/CDN:** Cloudflare
- **Deployment:** Vercel (frontend) + Railway (backend)
