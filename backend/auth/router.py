# # backend/auth/router.py

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from database import get_db
# from auth.models import User
# #from auth.schemas import UserCreate, UserOut, Token, LoginRequest
# from auth.utils import hash_password, verify_password, create_access_token

# from auth.schemas import UserCreate, UserOut, Token
# from fastapi.security import OAuth2PasswordRequestForm

# router = APIRouter()

# @router.post("/register", response_model=UserOut)
# async def register(user: UserCreate, db: Session = Depends(get_db)):
#     # Check for existing username or email before creating
#     if db.query(User).filter(User.username == user.username).first():
#         raise HTTPException(status_code=400, detail="Username already exists")
#     if db.query(User).filter(User.email == user.email).first():
#         raise HTTPException(status_code=400, detail="Email already registered")

#     new_user = User(
#         username=user.username,
#         email=user.email,
#         hashed_password=hash_password(user.password),
#         role="user"  # all self-registered users get role "user"
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     return new_user

# # @router.post("/login", response_model=Token)
# # async def login(request: LoginRequest, db: Session = Depends(get_db)):
# #     user = db.query(User).filter(User.username == request.username).first()
# #     if not user or not verify_password(request.password, user.hashed_password):
# #         raise HTTPException(status_code=401, detail="Invalid credentials")

# #     # Encode both username and role into the JWT
# #     token = create_access_token({"sub": user.username, "role": user.role})
# #     return {"access_token": token, "token_type": "bearer"}

# @router.post("/login", response_model=Token)
# async def login(
#     form_data: OAuth2PasswordRequestForm = Depends(),
#     db: Session = Depends(get_db)
# ):
#     user = db.query(User).filter(User.username == form_data.username).first()

#     if not user or not verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     token = create_access_token({
#         "sub": user.username,
#         "role": user.role
#     })

#     return {
#         "access_token": token,
#         "token_type": "bearer"
#     }

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user, oauth2_scheme
from auth.models import RevokedToken, User
from auth.schemas import LogoutResponse, Token, UserCreate, UserOut
from auth.utils import create_access_token, decode_token, hash_password, verify_password
from database import get_db

router = APIRouter()

MAX_FAILED_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

LOGIN_RATE_LIMIT: dict[str, list[datetime]] = {}
MAX_LOGIN_REQUESTS_PER_MINUTE = 10


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _to_aware_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def check_ip_rate_limit(request: Request) -> None:
    client_ip = request.client.host if request.client else "unknown"
    now = utc_now()
    window_start = now - timedelta(minutes=1)

    attempts = LOGIN_RATE_LIMIT.get(client_ip, [])
    attempts = [attempt for attempt in attempts if attempt > window_start]

    if len(attempts) >= MAX_LOGIN_REQUESTS_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
        )

    attempts.append(now)
    LOGIN_RATE_LIMIT[client_ip] = attempts


def cleanup_expired_revoked_tokens(db: Session) -> None:
    db.query(RevokedToken).filter(RevokedToken.expires_at < utc_now()).delete()
    db.commit()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        role="user",
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists",
        )

    return new_user


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    check_ip_rate_limit(request)

    user = db.query(User).filter(User.username == form_data.username).first()

    if user:
        lockout_until = _to_aware_utc(user.lockout_until)

        if lockout_until and lockout_until > utc_now():
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Account temporarily locked. Try again after {lockout_until.isoformat()}",
            )

    if not user or not verify_password(form_data.password, user.hashed_password):
        if user:
            user.failed_login_attempts += 1

            if user.failed_login_attempts >= MAX_FAILED_LOGIN_ATTEMPTS:
                user.lockout_until = utc_now() + timedelta(minutes=LOCKOUT_MINUTES)
                user.failed_login_attempts = 0

            db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user.failed_login_attempts = 0
    user.lockout_until = None
    db.commit()

    # Do not store role in token. Frontend should call /auth/me.
    token = create_access_token({"sub": user.username})

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    token: str = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        payload = decode_token(token)
        jti = payload.get("jti")
        exp = payload.get("exp")

        if not jti or not exp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token",
            )

        expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)

        existing = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
        if not existing:
            revoked_token = RevokedToken(jti=jti, expires_at=expires_at)
            db.add(revoked_token)
            db.commit()

        cleanup_expired_revoked_tokens(db)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token",
        )

    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user