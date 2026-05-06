from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    APP_NAME: str = "FarmAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./farmai.db"

    WEATHER_API_KEY: str = ""
    OPENWEATHER_BASE_URL: str = "https://api.openweathermap.org/data/2.5"

    CROP_MODEL_PATH: str = "models/crop_model.pkl"
    DISEASE_MODEL_PATH: str = "models/disease_model.h5"
    IRRIGATION_MODEL_PATH: str = "models/irrigation_model.pkl"

    class Config:
        env_file = ".env"

settings = Settings()