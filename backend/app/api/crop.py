from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.db.schemas import CropInput, CropResponse, CropResponseDetailed
from backend.app.utils.explainability import explain_crop_prediction
from backend.app.services.crop_service import predict_crop

router = APIRouter(prefix="/crop", tags=["Crop Recommendation"])

@router.post("/predict/explain", response_model=CropResponseDetailed)
def crop_predict_explained(data: CropInput, db: Session = Depends(get_db)):
    try:
        # Get prediction
        result = predict_crop(data, db)

        # Get explanation
        features = [
            data.nitrogen, data.phosphorus, data.potassium,
            data.temperature, data.humidity, data.ph, data.rainfall
        ]
        explanation = explain_crop_prediction(features)

        return CropResponseDetailed(
            crop=result.crop,
            confidence=result.confidence,
            status=result.status,
            explanation=explanation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))