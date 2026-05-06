import pickle
import numpy as np
from pathlib import Path
from backend.app.config.settings import settings

class IrrigationModel:
    def __init__(self):
        self.model          = None
        self.scaler         = None
        self.le_crop        = None
        self.le_soil        = None
        self.le_stage       = None
        self.feature_cols   = None
        self.crops          = None
        self.soils          = None
        self.stages         = None
        self.crop_water_base= None
        self.is_loaded      = False

    def load(self):
        try:
            model_path = Path(settings.IRRIGATION_MODEL_PATH)

            if not model_path.exists():
                raise FileNotFoundError(f"Model not found at {model_path}")

            with open(model_path, 'rb') as f:
                data = pickle.load(f)

            self.model           = data['model']
            self.scaler          = data['scaler']
            self.le_crop         = data['le_crop']
            self.le_soil         = data['le_soil']
            self.le_stage        = data['le_stage']
            self.feature_cols    = data['feature_cols']
            self.crops           = data['crops']
            self.soils           = data['soils']
            self.stages          = data['stages']
            self.crop_water_base = data['crop_water_base']
            self.is_loaded       = True

            print(f"✅ Irrigation model loaded from {model_path}")
            print(f"✅ Supports {len(self.crops)} crops, {len(self.soils)} soil types")

        except Exception as e:
            print(f"❌ Failed to load irrigation model: {e}")
            self.is_loaded = False

    def predict(self, crop: str, soil_type: str, growth_stage: str,
                temperature: float, humidity: float, rainfall: float,
                wind_speed: float, sunshine_hours: float) -> dict:

        if not self.is_loaded:
            raise RuntimeError("Model not loaded. Call load() first.")

        # Validate inputs
        if crop not in self.crops:
            raise ValueError(f"Unknown crop '{crop}'. Choose from: {self.crops}")
        if soil_type not in self.soils:
            raise ValueError(f"Unknown soil '{soil_type}'. Choose from: {self.soils}")
        if growth_stage not in self.stages:
            raise ValueError(f"Unknown stage '{growth_stage}'. Choose from: {self.stages}")

        # Encode categorical features
        crop_enc  = self.le_crop.transform([crop])[0]
        soil_enc  = self.le_soil.transform([soil_type])[0]
        stage_enc = self.le_stage.transform([growth_stage])[0]

        # Build feature array
        features = np.array([[
            crop_enc, soil_enc, stage_enc,
            temperature, humidity, rainfall,
            wind_speed, sunshine_hours
        ]])

        # Scale
        features_scaled = self.scaler.transform(features)

        # Predict
        water_req = float(self.model.predict(features_scaled)[0])
        water_req = max(0.5, round(water_req, 2))

        # Calculate irrigation needed after rainfall
        effective_rainfall = rainfall * 0.7
        net_irrigation     = max(0.0, round(water_req - effective_rainfall, 2))

        # Weekly schedule
        weekly_total  = round(net_irrigation * 7, 1)
        daily_minutes = round((net_irrigation / 5) * 60, 0)

        # Irrigation frequency recommendation
        if net_irrigation < 1.0:
            frequency = "Every 3-4 days"
        elif net_irrigation < 3.0:
            frequency = "Every 2 days"
        else:
            frequency = "Daily"

        return {
            "water_requirement":  water_req,
            "net_irrigation":     net_irrigation,
            "weekly_total":       weekly_total,
            "daily_minutes":      int(daily_minutes),
            "frequency":          frequency,
            "unit":               "mm/day",
        }

# Single instance
irrigation_model = IrrigationModel()