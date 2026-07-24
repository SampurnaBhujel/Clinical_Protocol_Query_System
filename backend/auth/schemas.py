# # backend/auth/schemas.py

# #from pydantic import BaseModel, EmailStr
# from datetime import datetime
# from pydantic import BaseModel, EmailStr, Field

# # class UserCreate(BaseModel):
# #     username: str
# #     email: EmailStr
# #     password: str

# class UserCreate(BaseModel):
#     username: str
#     email: EmailStr
#     password: str = Field(min_length=6, max_length=72)

# class UserOut(BaseModel):
#     id: int
#     username: str
#     email: str
#     role: str
#     created_at: datetime

#     class Config:
#         from_attributes = True

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# class LoginRequest(BaseModel):
#     username: str
#     password: str

import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("Password must contain at least one special character")
        return value


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LogoutResponse(BaseModel):
    message: str