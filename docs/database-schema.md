# SkillPilot - Database Schema

## Tables

### profiles
Primary user data table. Created automatically by `handle_new_user()` trigger on auth signup.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID (PK) | auth.uid() | References auth.users ON DELETE CASCADE |
| name | TEXT | extracted from email | Display name |
| email | TEXT | from auth | User email (UNIQUE) |
| credits | INTEGER | 100 | Available generation credits |
| picture | TEXT | NULL | Avatar preset ID or URL |
| referral_code | TEXT | SKILLPILOT-XXXXXXXX | Unique referral code (auto-generated) |
| referred_by | UUID | NULL | References profiles(id) — user who referred this account |
| total_referrals | INTEGER | 0 | Count of successful referrals made |
| referral_credits_earned | INTEGER | 0 | Total credits earned through referrals |
| created_at | TIMESTAMPTZ | now() | Account creation time |

**RLS Policies:**
- SELECT: `auth.uid() = id`
- UPDATE: `auth.uid() = id`

---

### generation_history
Stores all AI generation results.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID (PK) | uuid_generate_v4() | Unique generation ID |
| user_id | UUID (FK) | - | References profiles.id |
| type | TEXT | - | 'Resume', 'Project', 'English', or 'Interview' |
| title | TEXT | - | Display title for history list |
| content | JSONB | - | Full generation result |
| credits_used | INTEGER | - | Credits deducted for this generation |
| created_at | TIMESTAMPTZ | now() | Generation timestamp |

**RLS Policies:**
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`

---

### payment_transactions
Records all payment attempts and completions.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID (PK) | uuid_generate_v4() | Transaction ID |
| user_id | UUID (FK) | - | References profiles.id |
| session_id | TEXT | NULL | Razorpay order_id or Stripe session_id |
| payment_id | TEXT | NULL | Razorpay payment_id |
| amount | NUMERIC | - | Payment amount |
| currency | TEXT | - | 'INR' or 'USD' |
| package_id | TEXT | - | e.g., 'pro_inr', 'starter_usd' |
| credits | INTEGER | - | Credits in the package |
| status | TEXT | 'pending' | 'pending', 'paid', 'failed' |
| payment_status | TEXT | 'initiated' | Payment gateway status |
| provider | TEXT | - | 'razorpay' or 'stripe' |
| created_at | TIMESTAMPTZ | now() | Transaction creation time |

**RLS Policies:**
- SELECT: `auth.uid() = user_id`

---

### referrals
Tracks referral relationships and credit awards.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID (PK) | gen_random_uuid() | Referral record ID |
| referrer_id | UUID (FK) | — | References profiles(id) ON DELETE CASCADE |
| referred_user_id | UUID | NULL | References profiles(id) |
| referred_user_name | TEXT | NULL | Display name of referred user |
| referral_code | TEXT | — | Code used to complete referral |
| credits_awarded | INTEGER | 50 | Credits given to referrer |
| created_at | TIMESTAMPTZ | now() | Referral timestamp |

**Indexes:** `idx_referrals_referrer` on `(referrer_id)`

**RLS Policies:**
- SELECT: `auth.uid() = referrer_id`

---

## Functions

### deduct_credits(p_user_id UUID, p_amount INT)
Atomically deducts credits from a user's profile. Uses `FOR UPDATE` row lock to prevent race conditions.

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

**Returns:** New credit balance (integer)
**Raises:** P0001 'Insufficient credits' if balance < amount

---

### handle_new_user()
Trigger function that creates a profile row when a new auth user signs up.

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
```

**Trigger:** `AFTER INSERT ON auth.users`

---

## Credit Packages

Defined in `backend/app/models/payment.py`:

| Package ID | Credits | Price | Currency | Region |
|-----------|---------|-------|----------|--------|
| starter_inr | 100 | 99 | INR | India |
| pro_inr | 300 | 249 | INR | India |
| unlimited_inr | 600 | 299 | INR | India |
| starter_usd | 100 | 4.00 | USD | Global |
| pro_usd | 300 | 5.00 | USD | Global |
| unlimited_usd | 600 | 6.00 | USD | Global |

## Credit Costs per Tool

| Tool | Basic Mode | Emergent Mode (1.3x) |
|------|-----------|---------------------|
| Resume | 5 | 7 |
| Project | 8 | 11 |
| English | 2 | 3 |
| Interview | 3 | 4 |
