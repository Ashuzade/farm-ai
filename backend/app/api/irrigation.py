from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.db.schemas import (
    IrrigationInput,
    IrrigationResponse,
    IrrigationOptionsResponse
)
from backend.app.services.irrigation_service import predict_irrigation
from backend.app.ml.irrigation_model import irrigation_model

router = APIRouter(prefix="/irrigation", tags=["Irrigation"])

@router.post("/predict", response_model=IrrigationResponse)
def irrigation_predict(
    data: IrrigationInput,
    db: Session = Depends(get_db)
):
    """Predict irrigation water requirement."""
    try:
        result = predict_irrigation(data, db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/options", response_model=IrrigationOptionsResponse)
def get_irrigation_options():
    """
    Returns all valid options for crops, soils
    and growth stages — used to populate frontend dropdowns.
    """
    if not irrigation_model.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "crops":  irrigation_model.crops,
        "soils":  irrigation_model.soils,
        "stages": irrigation_model.stages,
    }

@router.get("/crop-water-base")
def get_crop_water_base():
    """Returns base water requirements per crop (FAO standard)."""
    if not irrigation_model.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "data": irrigation_model.crop_water_base,
        "unit": "mm/day"
    }