# SkillPilot - Setup & Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Supabase account (https://supabase.com)
- Google AI Studio account (https://aistudio.google.com)
- Razorpay account (https://razorpay.com)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

**Required .env variables:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
GEMINI_API_KEY=your-google-gemini-key
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
STRIPE_SECRET_KEY=sk_test_xxx (optional, dormant)
STRIPE_PUBLISHABLE_KEY=pk_test_xxx (optional, dormant)
STRIPE_WEBHOOK_SECRET=whsec_xxx (optional, dormant)
```

**Start the server:**
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

**Required .env variables:**
```
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

**Start the dev server:**
```bash
npm start
```

The app opens at http://localhost:3000.

---

## Supabase Setup

### 1. Create Tables

Run the SQL in `backend/app/db/schema.sql` in the Supabase SQL Editor.

### 2. Create RPC Function

```sql
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INT)
RETURNS INT AS $$
DECLARE
  current_credits INT;
BEGIN
  SELECT credits INTO current_credits FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  UPDATE profiles SET credits = credits - p_amount WHERE id = p_user_id;
  RETURN current_credits - p_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Create User Trigger

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'SKILLPILOT-' || UPPER(SUBSTR(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4. Enable RLS

Enable Row Level Security on all tables and create policies:
- profiles: Users can read/update their own row
- generation_history: Users can read their own rows
- payment_transactions: Users can read their own rows

### 5. Configure Auth

- Enable Email/Password provider
- Enable Google OAuth provider (with Client ID and Secret)
- Set site URL to your frontend domain
- Add redirect URLs: `http://localhost:3000/auth/callback`, `https://skillspilot.xyz/auth/callback`

---

## Production Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

**Environment variables in Vercel dashboard:**
```
REACT_APP_BACKEND_URL=https://api.skillspilot.xyz
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

**Custom domain:** Add `skillspilot.xyz` and `www.skillspilot.xyz` in Vercel settings.

### Backend (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Important:** Set the service root directory to `backend` in Railway dashboard → Service Settings → Root Directory. Without this, Railway will fail to build when triggered from the monorepo root.

**Environment variables in Railway dashboard:** Same as `.env` file.

**Custom domain:** Add `api.skillspilot.xyz` in Railway settings.

### Cloudflare DNS

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | @ | `76.76.21.21` (Vercel) | DNS only |
| CNAME | www | `cname.vercel-dns.com` | DNS only |
| CNAME | api | `<railway-domain>.up.railway.app` | **DNS only** (must NOT be proxied) |

> **Important:** The `api` subdomain must be set to **DNS only** (grey cloud in Cloudflare). Enabling Cloudflare proxy on the API causes "Application not found" errors from Railway.

### Post-Deployment Checklist

1. Update Supabase site URL to `https://skillspilot.xyz`
2. Add `https://skillspilot.xyz/auth/callback` to Supabase redirect URLs
3. Update Google OAuth redirect URIs in Google Cloud Console
4. Verify Razorpay webhook URL (if using)
5. Test all 4 generation tools
6. Test payment flow end-to-end
7. Verify PDF/DOCX downloads
8. Check www redirect works
9. Verify SSL certificate is active
