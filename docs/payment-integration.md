# SkillPilot - Payment Integration Guide

## Overview

SkillPilot uses **Razorpay** as the primary payment gateway for both Indian (INR) and international (USD) transactions. Stripe integration exists in the codebase but is currently dormant in the UI.

## Payment Architecture

```
User clicks "Buy Now"
       |
       v
Frontend (PurchaseCreditsPage.js)
       |
       | POST /api/payments/razorpay/create-order
       v
Backend (payments.py)
       |
       | razorpay.order.create()
       v
Razorpay API
       |
       | Returns order_id, amount, currency
       v
Backend saves pending transaction -> Supabase
       |
       | Returns order details + key_id
       v
Frontend opens Razorpay checkout popup
       |
       | User completes payment
       v
Razorpay returns: order_id, payment_id, signature
       |
       | POST /api/payments/razorpay/verify
       v
Backend verifies HMAC signature
       |
       | On success:
       |   1. Updates transaction status to "paid"
       |   2. Adds credits to user profile
       v
Frontend refreshes credit display
```

## Razorpay Configuration

### Test Mode
```
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your_test_secret
```

### Live Mode
After Razorpay KYC verification:
```
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=your_live_secret
```

### International Transactions
- Application submitted for international transaction support
- Once approved, USD packages work via Razorpay (no Stripe needed)
- Razorpay handles currency conversion

### Website Verification
- Razorpay requires a live website for verification
- Provide URL: `https://skillspilot.xyz`
- Business type: EdTech / Online Education Platform

## Package Definitions

Packages are defined in `backend/app/models/payment.py`:

```python
CREDIT_PACKAGES = {
    "starter_inr":   {"credits": 100, "price": 99,  "currency": "INR"},
    "pro_inr":       {"credits": 300, "price": 249, "currency": "INR"},
    "unlimited_inr": {"credits": 600, "price": 299, "currency": "INR"},
    "starter_usd":   {"credits": 100, "price": 4.0, "currency": "USD"},
    "pro_usd":       {"credits": 300, "price": 5.0, "currency": "USD"},
    "unlimited_usd": {"credits": 600, "price": 6.0, "currency": "USD"},
}
```

## Signature Verification

Razorpay signs each payment with HMAC-SHA256:

```python
import hmac, hashlib

generated_signature = hmac.new(
    key=RAZORPAY_KEY_SECRET.encode(),
    msg=f"{order_id}|{payment_id}".encode(),
    digestmod=hashlib.sha256
).hexdigest()

if generated_signature != received_signature:
    raise HTTPException(400, "Invalid signature")
```

## Frontend Integration

The `PurchaseCreditsPage.js` uses the `react-razorpay` SDK:

```javascript
const options = {
  key: response.data.key_id,      // From backend
  amount: response.data.amount,    // In smallest unit (paise/cents)
  currency: response.data.currency,
  order_id: response.data.order_id,
  name: 'SkillPilot',
  description: `Purchase ${pkg.credits} Credits`,
  handler: async (razorpayResponse) => {
    // Verify payment with backend
    await axios.post('/api/payments/razorpay/verify', {
      order_id: razorpayResponse.razorpay_order_id,
      payment_id: razorpayResponse.razorpay_payment_id,
      signature: razorpayResponse.razorpay_signature
    });
  },
  prefill: { name: user.name, email: user.email },
  theme: { color: '#7C3AED' }
};
```

## Stripe (Dormant)

Stripe code exists but is not connected in the UI:

### Backend Endpoints (functional but unused by frontend)
- `POST /api/payments/stripe/create-checkout` - Creates Stripe Checkout Session
- `GET /api/payments/stripe/status/{session_id}` - Checks session status
- `POST /api/webhook/stripe` - Webhook for `checkout.session.completed`

### Why Dormant
- Stripe doesn't support India as a business location for the user's account
- Razorpay handles both INR and USD (once international transactions approved)
- Stripe code kept for future use if needed

### Re-enabling Stripe
1. Add tab UI back to PurchaseCreditsPage.js
2. Restore `handleStripePurchase` function
3. Route USD packages to Stripe instead of Razorpay
4. Configure Stripe webhook URL: `https://api.skillspilot.xyz/api/webhook/stripe`

## Transaction States

| Status | payment_status | Meaning |
|--------|---------------|---------|
| pending | initiated | Order created, awaiting payment |
| paid | captured | Payment verified, credits added |
| failed | failed | Payment failed or signature invalid |

## Security Considerations

1. **Key ID is public** - Sent to frontend for Razorpay initialization
2. **Key Secret is private** - Only used on backend for signature verification
3. **Atomic credit addition** - Credits added in same DB transaction as status update
4. **Idempotent verification** - Duplicate verify calls won't add credits twice (order status checked)
5. **Webhook backup** - Stripe uses webhooks as backup; Razorpay relies on client-side verify
