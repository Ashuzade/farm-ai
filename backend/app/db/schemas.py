from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict

# --- Crop Schemas ---
class CropInput(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class CropResponse(BaseModel):
    crop: str
    confidence: float
    status: str

# --- Disease Schemas ---
class DiseaseResponse(BaseModel):
    disease: str
    confidence: float
    status: str

class CropResponseDetailed(BaseModel):
    crop: str
    confidence: float
    status: str
    explanation: Optional[Dict] = None
    
from typing import List

# --- Disease Schemas ---
class DiseaseResponse(BaseModel):
    disease: str
    confidence: float
    top3: List[dict]
    status: str

class DiseasePredictionRecord(BaseModel):
    id: int
    image_path: str
    result: str
    confidence: float

    class Config:
        orm_mode = True
        
# --- Weather Schemas ---
class WeatherResponse(BaseModel):
    city:        str
    country:     str
    temperature: float
    humidity:    float
    rainfall:    float
    description: str
    icon:        str
    wind_speed:  float
    feels_like:  float
    pressure:    int

class WeatherCropResponse(BaseModel):
    weather: WeatherResponse
    crop_prefill: dict
    
# --- Irrigation Schemas ---
class IrrigationInput(BaseModel):
    crop:            str
    soil_type:       str
    growth_stage:    str
    temperature:     float
    humidity:        float
    rainfall:        float
    wind_speed:      float
    sunshine_hours:  float

class IrrigationResponse(BaseModel):
    water_requirement: float
    net_irrigation:    float
    weekly_total:      float
    daily_minutes:     int
    frequency:         str
    unit:              str
    status:            str

class IrrigationOptionsResponse(BaseModel):
    crops:   list
    soils:   list
    stages:  list