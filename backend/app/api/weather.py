from fastapi import APIRouter, HTTPException, Query
from backend.app.services.weather_service import weather_service
from backend.app.db.schemas import WeatherResponse, WeatherCropResponse

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/city", response_model=WeatherResponse)
async def get_weather_by_city(
    city: str = Query(..., description="City name e.g. Nagpur")
):
    """Get current weather for a city."""
    try:
        result = await weather_service.get_weather_by_city(city)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/coords", response_model=WeatherResponse)
async def get_weather_by_coords(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Get current weather by GPS coordinates."""
    try:
        result = await weather_service.get_weather_by_coords(lat, lon)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/crop-prefill", response_model=WeatherCropResponse)
async def get_weather_crop_prefill(
    city: str = Query(..., description="City name")
):
    """
    Get weather + auto-filled crop form values.
    Frontend uses this to prefill temperature,
    humidity and rainfall automatically.
    """
    try:
        weather = await weather_service.get_weather_by_city(city)

        # These three fields get auto-filled from weather
        crop_prefill = {
            "temperature": weather["temperature"],
            "humidity":    weather["humidity"],
            "rainfall":    weather["rainfall"],
        }

        return {
            "weather":      weather,
            "crop_prefill": crop_prefill
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))