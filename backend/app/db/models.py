from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from backend.app.db.database import Base

class CropPrediction(Base):
    __tablename__ = "crop_predictions"

    id        = Column(Integer, primary_key=True, index=True)
    nitrogen  = Column(Float)
    phosphorus= Column(Float)
    potassium = Column(Float)
    temperature=Column(Float)
    humidity  = Column(Float)
    ph        = Column(Float)
    rainfall  = Column(Float)
    result    = Column(String)
    created_at= Column(DateTime, default=func.now())

class DiseasePrediction(Base):
    __tablename__ = "disease_predictions"

    id        = Column(Integer, primary_key=True, index=True)
    image_path= Column(String)
    result    = Column(String)
    confidence= Column(Float)
    created_at= Column(DateTime, default=func.now())