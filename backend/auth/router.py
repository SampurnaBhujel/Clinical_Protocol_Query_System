# backend/auth/router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth.models import User
#from auth.schemas import UserCreate, UserOut, Token, LoginRequest
from auth.utils import hash_password, verify_password, create_access_token

from auth.schemas import UserCreate, UserOut, Token
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check for existing username or email before creating
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        role="user"  # all self-registered users get role "user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# @router.post("/login", response_model=Token)
# async def login(request: LoginRequest, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.username == request.username).first()
#     if not user or not verify_password(request.password, user.hashed_password):
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     # Encode both username and role into the JWT
#     token = create_access_token({"sub": user.username, "role": user.role})
#     return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": user.username,
        "role": user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }