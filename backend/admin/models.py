# backend/admin/models.py

from sqlalchemy import Column, Integer, String, DateTime
#from sqlalchemy.sql import func
from utils.time import now_nepal
from database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String, unique=True, nullable=False)
    filepath = Column(String, nullable=False)
    #uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_at = Column(DateTime(timezone=True), default=now_nepal)