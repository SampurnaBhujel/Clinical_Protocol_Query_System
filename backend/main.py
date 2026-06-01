# backend/main.py\

# Fix SSL certificate issue for HuggingFace / HTTP requests (important for model downloads)
import os
import certifi

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

import warnings
import logging

# Suppress noisy transformer warnings on startup
warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from auth.router import router as auth_router
from rag.router import router as rag_router
from admin.router import router as admin_router

# Create all SQLite tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Clinical Protocol Query System")

# Allow requests from the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(rag_router, prefix="/rag", tags=["RAG"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Clinical Protocol Query System Running"}