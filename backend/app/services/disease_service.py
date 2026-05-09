import os
import uuid
from backend.app.ml.disease_model import disease_model
from backend.app.utils.image_utils import preprocess_image, validate_image
from backend.app.db.models import DiseasePrediction
from backend.app.db.schemas import DiseaseResponse
from sqlalchemy.orm import Session

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def predict_disease(
    image_bytes: bytes,
    filename: str,
    db: Session
) -> DiseaseResponse:

    print(f"📸 Received file: {filename}, size: {len(image_bytes)} bytes")

    # Validate image
    is_valid, message = validate_image(filename, len(image_bytes))
    print(f"✅ Validation result: {is_valid}, message: {message}")

    if not is_valid:
        raise ValueError(message)

    # Check model loaded
    if not disease_model.is_loaded:
        raise ValueError("Disease model is not loaded. Please check server startup logs.")

    # Save uploaded image
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    save_path   = os.path.join(UPLOAD_DIR, unique_name)
    with open(save_path, 'wb') as f:
        f.write(image_bytes)

    print(f"💾 Image saved to: {save_path}")

    # Preprocess and predict
    img_array = preprocess_image(image_bytes)
    result    = disease_model.predict(img_array)

    # Save to database
    record = DiseasePrediction(
        image_path = save_path,
        result     = result["disease"],
        confidence = result["confidence"]
    )
    db.add(record)
    db.commit()

    return DiseaseResponse(
        disease    = result["disease"],
        confidence = result["confidence"],
        top3       = result["top3"],
        status     = "success"
    )