from backend.app.db.schemas import CropInput, CropResponse
from backend.app.db.models import CropPrediction
from backend.app.ml.crop_model import crop_model
from sqlalchemy.orm import Session

def predict_crop(data: CropInput, db: Session) -> CropResponse:

    # Prepare features in correct order
    features = [
        data.nitrogen,
        data.phosphorus,
        data.potassium,
        data.temperature,
        data.humidity,
        data.ph,
        data.rainfall
    ]

    # Get real prediction from model
    result = crop_model.predict(features)

    # Save to database
    record = CropPrediction(
        nitrogen   = data.nitrogen,
        phosphorus = data.phosphorus,
        potassium  = data.potassium,
        temperature= data.temperature,
        humidity   = data.humidity,
        ph         = data.ph,
        rainfall   = data.rainfall,
        result     = result["crop"]
    )
    db.add(record)
    db.commit()

    return CropResponse(
        crop       = result["crop"],
        confidence = result["confidence"],
        status     = "success"
    )