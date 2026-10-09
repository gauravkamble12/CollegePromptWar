from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from backend.app.models.user import RoleEnum

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    # NOTE: role is intentionally NOT accepted from clients to prevent
    # privilege escalation. Every self-registered account is a plain USER.

class UserLogin(BaseModel):
    email_or_username: str
    password: str

class UserResponse(UserBase):
    id: int
    role: RoleEnum
    is_active: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[RoleEnum] = None

class UserPreferenceUpdate(BaseModel):
    default_city_mode: Optional[str] = "tourist"
    preferred_transport: Optional[str] = "walking"
    budget_level: Optional[str] = "moderate"
    accessibility_required: Optional[int] = 0
    dietary_preferences: Optional[List[str]] = []

class UserPreferenceResponse(UserPreferenceUpdate):
    id: int
    user_id: int
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
