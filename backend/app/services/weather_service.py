import httpx
from backend.app.config.settings import settings

class WeatherService:
    def __init__(self):
        self.base_url = settings.OPENWEATHER_BASE_URL
        self.api_key  = settings.WEATHER_API_KEY

    async def get_weather_by_city(self, city: str) -> dict:
        """Fetch current weather for a city."""
        try:
            url    = f"{self.base_url}/weather"
            params = {
                "q":     city,
                "appid": self.api_key,
                "units": "metric"  # Celsius
            }

            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10)

            if response.status_code == 404:
                raise ValueError(f"City '{city}' not found")

            if response.status_code == 401:
                raise ValueError("Invalid API key")

            if response.status_code != 200:
                raise ValueError(f"Weather API error: {response.status_code}")

            data = response.json()
            return self._parse_weather(data)

        except httpx.TimeoutException:
            raise ValueError("Weather API timed out. Try again.")
        except httpx.RequestError as e:
            raise ValueError(f"Network error: {str(e)}")

    async def get_weather_by_coords(
        self,
        lat: float,
        lon: float
    ) -> dict:
        """Fetch current weather by GPS coordinates."""
        try:
            url    = f"{self.base_url}/weather"
            params = {
                "lat":   lat,
                "lon":   lon,
                "appid": self.api_key,
                "units": "metric"
            }

            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10)

            if response.status_code != 200:
                raise ValueError(f"Weather API error: {response.status_code}")

            data = response.json()
            return self._parse_weather(data)

        except httpx.TimeoutException:
            raise ValueError("Weather API timed out. Try again.")

    def _parse_weather(self, data: dict) -> dict:
        """Extract relevant fields from OpenWeatherMap response."""
        rain = data.get("rain", {})
        rainfall = rain.get("1h", rain.get("3h", 0.0))

        return {
            "city":        data["name"],
            "country":     data["sys"]["country"],
            "temperature": round(data["main"]["temp"], 1),
            "humidity":    round(data["main"]["humidity"], 1),
            "rainfall":    round(rainfall, 1),
            "description": data["weather"][0]["description"].title(),
            "icon":        data["weather"][0]["icon"],
            "wind_speed":  round(data["wind"]["speed"], 1),
            "feels_like":  round(data["main"]["feels_like"], 1),
            "pressure":    data["main"]["pressure"],
        }

# Single instance
weather_service = WeatherService()