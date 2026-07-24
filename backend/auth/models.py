# # backend/auth/models.py

# from sqlalchemy import Column, Integer, String, DateTime
# from sqlalchemy.sql import func
# from database import Base
# from utils.time import now_nepal

# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, autoincrement=True)
#     username = Column(String, unique=True, nullable=False)
#     email = Column(String, unique=True, nullable=False)
#     hashed_password = Column(String, nullable=False)
#     # role is either "user" or "admin"; defaults to "user" on registration
#     role = Column(String, default="user", nullable=False)
#     #created_at = Column(DateTime(timezone=True), server_default=func.now())
#     created_at = Column(
#         DateTime(timezone=True),
#         default=now_nepal
#     )

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from database import Base
from utils.time import now_nepal


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    role = Column(String(20), default="user", nullable=False)

    failed_login_attempts = Column(Integer, default=0, nullable=False)
    lockout_until = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=now_nepal,
    )


class RevokedToken(Base):
    __tablename__ = "revoked_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    jti = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), server_default=func.now())