import pickle
import numpy as np
from pathlib import Path
from backend.app.config.settings import settings

class CropModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.is_loaded = False

    def load(self):
        try:
            model_path = Path(settings.CROP_MODEL_PATH)

            if not model_path.exists():
                raise FileNotFoundError(f"Model not found at {model_path}")

            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)

            self.model         = model_data["model"]
            self.scaler        = model_data["scaler"]
            self.label_encoder = model_data["label_encoder"]
            self.is_loaded     = True

            print(f"✅ Crop model loaded successfully from {model_path}")

        except Exception as e:
            print(f"❌ Failed to load crop model: {e}")
            self.is_loaded = False

    def predict(self, features: list) -> dict:
        if not self.is_loaded:
            raise RuntimeError("Model is not loaded. Call load() first.")

        # Scale input features
        features_array = np.array(features).reshape(1, -1)
        features_scaled = self.scaler.transform(features_array)

        # Predict crop
        prediction = self.model.predict(features_scaled)
        probabilities = self.model.predict_proba(features_scaled)

        crop_name  = self.label_encoder.inverse_transform(prediction)[0]
        confidence = round(float(probabilities.max()), 4)

        return {
            "crop": crop_name,
            "confidence": confidence
        }

# Single instance — loaded once when server starts
crop_model = CropModel()