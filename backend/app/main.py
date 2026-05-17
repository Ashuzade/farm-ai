from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config.settings import settings
from backend.app.db.database import Base, engine
from backend.app.api.crop       import router as crop_router
from backend.app.api.disease    import router as disease_router
from backend.app.api.weather    import router as weather_router
from backend.app.api.irrigation import router as irrigation_router
from backend.app.api.auth       import router as auth_router
from backend.app.ml.crop_model       import crop_model
from backend.app.ml.disease_model    import disease_model
from backend.app.ml.irrigation_model import irrigation_model

# Create all DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title       = settings.APP_NAME,
    version     = settings.APP_VERSION,
    description = "Smart Farming AI System",
    docs_url    = "/docs",
    redoc_url   = "/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

@app.on_event("startup")
def startup_event():
    crop_model.load()
    disease_model.load()
    irrigation_model.load()

@app.get("/", tags=["Health"])
def root():
    return {
        "app":     settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status":  "running"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}

app.include_router(crop_router)
app.include_router(disease_router)
app.include_router(weather_router)
app.include_router(irrigation_router)
app.include_router(auth_router)