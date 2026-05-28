# backend/auth/schemas.py

#from pydantic import BaseModel, EmailStr
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# class UserCreate(BaseModel):
#     username: str
#     email: EmailStr
#     password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    username: str
    password: str