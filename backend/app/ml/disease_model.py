import numpy as np
import json
from pathlib import Path
from backend.app.config.settings import settings

class DiseaseModel:
    def __init__(self):
        self.model          = None
        self.class_labels   = None
        self.is_loaded      = False

    def load(self):
        try:
            model_path  = Path(settings.DISEASE_MODEL_PATH)
            labels_path = Path("models/disease_labels.json")

            if not model_path.exists():
                raise FileNotFoundError(f"Model not found at {model_path}")

            if not labels_path.exists():
                raise FileNotFoundError(f"Labels not found at {labels_path}")

            # Import tensorflow only when loading
            import tensorflow as tf
            self.model = tf.keras.models.load_model(str(model_path))

            with open(labels_path, 'r') as f:
                self.class_labels = json.load(f)

            self.is_loaded = True
            print(f" Disease model loaded successfully from {model_path}")
            print(f" {len(self.class_labels)} disease classes loaded")

        except Exception as e:
            print(f" Failed to load disease model: {e}")
            self.is_loaded = False

    def predict(self, img_array: np.ndarray) -> dict:
        if not self.is_loaded:
            raise RuntimeError("Model is not loaded. Call load() first.")

        # Ensure correct shape (1, 224, 224, 3)
        if img_array.ndim == 3:
            img_array = np.expand_dims(img_array, axis=0)

        # Normalize
        img_array = img_array / 255.0

        # Predict
        predictions  = self.model.predict(img_array, verbose=0)
        class_index  = int(np.argmax(predictions))
        confidence   = float(predictions.max())
        disease_name = self.class_labels[str(class_index)]

        # Get top 3 predictions
        top3_indices = np.argsort(predictions[0])[-3:][::-1]
        top3 = [
            {
                "disease": self.class_labels[str(i)],
                "confidence": round(float(predictions[0][i]), 4)
            }
            for i in top3_indices
        ]

        return {
            "disease"   : disease_name,
            "confidence": round(confidence, 4),
            "top3"      : top3
        }

# Single instance
disease_model = DiseaseModel()