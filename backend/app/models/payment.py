from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid


CREDIT_PACKAGES = {
    "starter_inr": {"credits": 100, "price": 99, "currency": "INR", "region": "india"},
    "pro_inr": {"credits": 300, "price": 249, "currency": "INR", "region": "india"},
    "unlimited_inr": {"credits": 600, "price": 299, "currency": "INR", "region": "india"},
    "starter_usd": {"credits": 100, "price": 4.0, "currency": "USD", "region": "global"},
    "pro_usd": {"credits": 300, "price": 5.0, "currency": "USD", "region": "global"},
    "unlimited_usd": {"credits": 600, "price": 6.0, "currency": "USD", "region": "global"},
}


class PurchaseRequest(BaseModel):
    package_id: str


class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str


class RazorpayVerifyRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str


class StripeCheckoutRequest(BaseModel):
    package_id: str


class StripeCheckoutResponse(BaseModel):
    session_id: str
    url: str


class StripeStatusResponse(BaseModel):
    session_id: str
    payment_status: str
    status: str


class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: Optional[str] = None
    payment_id: Optional[str] = None
    amount: float
    currency: str
    package_id: str
    credits: int
    status: str
    payment_status: str
    provider: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
