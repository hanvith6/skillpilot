from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import uuid


class Profile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    credits: int = 100
    picture: Optional[str] = None
    referral_code: str = ""
    referred_by: Optional[str] = None
    total_referrals: int = 0
    referral_credits_earned: int = 0
    created_at: Optional[str] = None


class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    referral_code: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: Profile


class ReferralStats(BaseModel):
    referral_code: str
    total_referrals: int
    credits_earned: int
    recent_referrals: List[Dict[str, Any]]
