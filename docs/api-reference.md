# SkillPilot - API Reference

Base URL: `https://api.skillspilot.xyz` (production) | `http://localhost:8000` (development)

All authenticated endpoints require: `Authorization: Bearer <jwt_token>`

---

## Health

### GET /health
Check API status.

**Response:** `200`
```json
{"status": "healthy", "service": "skillpilot"}
```

---

## Authentication

### POST /api/auth/signup
Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass1!",
  "referral_code": "SKILLPILOT-XXXXXXXX"
}
```

**Response:** `200`
```json
{"token": "<jwt>", "user": { ...profile }}
```

**Notes:** Creates Supabase auth user. DB trigger auto-creates profile. Optional referral code awards +20 credits to new user and +50 to referrer.

---

### POST /api/auth/login
Login with email and password.

**Body:**
```json
{"email": "john@example.com", "password": "SecurePass1!"}
```

**Response:** `200`
```json
{"token": "<jwt>", "user": { ...profile }}
```

**Errors:** `401` Invalid credentials

---

### GET /api/auth/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200`
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "credits": 100,
  "picture": "violet-indigo",
  "referral_code": "SKILLPILOT-A1B2C3D4",
  "created_at": "2026-03-01T00:00:00Z"
}
```

**Errors:** `401` Not authenticated

---

### PATCH /api/auth/me
Update user profile. Only `name` and `picture` fields are allowed.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "New Name",
  "picture": "cat"
}
```

**Response:** `200`
```json
{"status": "updated", "name": "New Name", "picture": "cat"}
```

**Errors:** `400` Invalid fields, `401` Not authenticated

---

### POST /api/auth/apply-referral
Apply a referral code to an existing account (post-signup).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{"referral_code": "SKILLPILOT-XXXXXXXX"}
```

**Response:** `200`
```json
{"status": "success", "credits_added": 20}
```

**Errors:** `400` Invalid code or self-referral, `401` Not authenticated

---

## AI Generation

### POST /api/generate/resume
Generate an ATS-friendly resume.

**Body:**
```json
{
  "resume_text": "Name: John...\nSkills: Python...",
  "target_role": "Software Developer",
  "country": "India",
  "emergent_mode": false
}
```

**Credits:** 5 (basic) | 7 (emergent)

**Response:** `200`
```json
{
  "result": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9999999999",
    "summary": "...",
    "experience": [{"title": "...", "company": "...", "duration": "...", "points": ["..."]}],
    "education": [{"degree": "...", "institution": "...", "year": "..."}],
    "skills": ["Python", "React"],
    "certifications": ["..."]
  },
  "history_id": "uuid"
}
```

---

### POST /api/generate/project
Generate a project report.

**Body:**
```json
{
  "topic": "Student Management System",
  "branch": "Computer Science",
  "emergent_mode": false
}
```

**Credits:** 8 (basic) | 10 (emergent)

**Response:** `200`
```json
{
  "result": {
    "title": "Student Management System",
    "abstract": "...",
    "introduction": "...",
    "modules": [{"name": "...", "description": "..."}],
    "tech_stack": [{"name": "...", "reason": "..."}],
    "timeline": "...",
    "conclusion": "...",
    "viva_questions": [{"question": "...", "answer": "..."}]
  },
  "history_id": "uuid"
}
```

---

### POST /api/generate/english
Improve English text.

**Body:**
```json
{
  "text": "i am going to college yesterday",
  "emergent_mode": false
}
```

**Credits:** 2 (basic) | 3 (emergent)

**Response:** `200`
```json
{
  "result": {
    "formal": "I went to college yesterday.",
    "semi_formal": "I went to college yesterday.",
    "simple": "I went to college yesterday."
  },
  "history_id": "uuid"
}
```

---

### POST /api/generate/interview
Generate interview questions.

**Body:**
```json
{
  "question_type": "Frontend Developer",
  "background": "2 years React experience",
  "emergent_mode": false
}
```

**Credits:** 3 (basic) | 4 (emergent)

**Response:** `200`
```json
{
  "result": {
    "questions": [
      {"question": "...", "answer": "...", "difficulty": "medium"}
    ]
  },
  "history_id": "uuid"
}
```

---

### Common Generation Errors

| Code | Detail | Cause |
|------|--------|-------|
| 401 | Not authenticated | Missing/invalid token |
| 402 | Insufficient credits | Not enough credits for this tool |
| 422 | Validation error | Missing/invalid request fields |
| 500 | Generation failed | AI API error |

---

## History

### GET /api/history
List generation history.

**Query Params:** `?limit=10` (default: 10)

**Response:** `200`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "type": "Resume",
    "title": "Resume Generation",
    "content": {...},
    "credits_used": 5,
    "created_at": "2026-03-08T12:00:00Z"
  }
]
```

---

### GET /api/history/stats
Get usage statistics.

**Response:** `200`
```json
{
  "total_generations": 25,
  "total_credits_used": 100,
  "breakdown": {
    "Resume": 5,
    "Project": 3,
    "English": 12,
    "Interview": 5
  },
  "most_used_tool": "English"
}
```

---

## Downloads

### GET /api/download/{history_id}/{format}
Download generated content as PDF or DOCX.

**Path Params:**
- `history_id`: UUID from generation response
- `format`: `pdf` or `docx`

**Response:** `200` with binary file stream
- PDF: `Content-Type: application/pdf`
- DOCX: `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Errors:** `400` Invalid format, `404` Document not found, `401` Not authenticated

---

## Payments

### GET /api/payments/packages
List all credit packages.

**Response:** `200`
```json
[
  {"id": "starter_inr", "credits": 100, "price": 99, "currency": "INR"},
  {"id": "pro_inr", "credits": 300, "price": 249, "currency": "INR"},
  {"id": "unlimited_inr", "credits": 600, "price": 299, "currency": "INR"},
  {"id": "starter_usd", "credits": 100, "price": 4.0, "currency": "USD"},
  {"id": "pro_usd", "credits": 300, "price": 5.0, "currency": "USD"},
  {"id": "unlimited_usd", "credits": 600, "price": 6.0, "currency": "USD"}
]
```

---

### POST /api/payments/razorpay/create-order
Create a Razorpay payment order. Supports both INR and USD packages.

**Body:**
```json
{"package_id": "pro_inr"}
```

**Response:** `200`
```json
{
  "order_id": "order_xxx",
  "amount": 24900,
  "currency": "INR",
  "key_id": "rzp_test_xxx"
}
```

---

### POST /api/payments/razorpay/verify
Verify payment after Razorpay checkout.

**Body:**
```json
{
  "order_id": "order_xxx",
  "payment_id": "pay_xxx",
  "signature": "hmac_signature"
}
```

**Response:** `200`
```json
{"status": "success", "credits_added": 300}
```

---

### POST /api/payments/stripe/create-checkout (Dormant)
Create Stripe checkout session. Endpoint exists but is not linked in the UI.

### GET /api/payments/stripe/status/{session_id} (Dormant)
Check Stripe session status.

### POST /api/webhook/stripe (Dormant)
Stripe webhook endpoint for payment confirmation.

---

## Credit Costs

| Tool | Basic | Emergent (1.3x) |
|------|-------|-----------------|
| Resume | 5 | 7 |
| Project | 8 | 10 |
| English | 2 | 3 |
| Interview | 3 | 4 |

New users receive **100 free credits** on signup.

---

## Referrals

### GET /api/referrals/stats
Get the current user's referral statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200`
```json
{
  "referral_code": "SKILLPILOT-A1B2C3D4",
  "total_referrals": 3,
  "credits_earned": 150,
  "recent_referrals": [
    {
      "referred_user_name": "Jane Doe",
      "credits_awarded": 50,
      "created_at": "2026-03-10T10:00:00Z"
    }
  ]
}
```

---

## Geo Detection

### GET /api/geo/detect
Detect the user's location via IP address. Used for geo-based pricing on the purchase page.

**Auth:** Not required

**Response:** `200`
```json
{
  "country_code": "IN",
  "country": "India",
  "is_vpn": false,
  "region": "india"
}
```

**Notes:**
- `region` is either `"india"` or `"global"`
- `is_vpn: true` if the IP is a detected proxy/hosting provider — purchase page blocks these users
- Powered by ip-api.com (no API key required)
- Falls back to `{"country_code": "UNKNOWN", "is_vpn": false, "region": "global"}` on failure
