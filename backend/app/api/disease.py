from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.db.schemas import DiseaseResponse
from backend.app.services.disease_service import predict_disease

router = APIRouter(prefix="/disease", tags=["Disease Detection"])

@router.post("/predict", response_model=DiseaseResponse)
async def disease_predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # Read image bytes
        image_bytes = await file.read()

        result = predict_disease(
            image_bytes = image_bytes,
            filename    = file.filename,
            db          = db
        )
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/classes", tags=["Disease Detection"])
def get_disease_classes():
    """Returns all detectable disease classes."""
    from backend.app.ml.disease_model import disease_model
    if not disease_model.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "total"  : len(disease_model.class_labels),
        "classes": list(disease_model.class_labels.values())
    }