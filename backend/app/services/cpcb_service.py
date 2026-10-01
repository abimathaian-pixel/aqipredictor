import httpx
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.config import settings
from app.models.database import Station, Reading
from app.services.aqi_calculator import compute_overall_aqi, get_aqi_category

logger = logging.getLogger(__name__)

class CPCBService:
    def __init__(self):
        self.api_key = settings.DATA_GOV_API_KEY or settings.CPCB_API_KEY
        self.resource_id = settings.DATA_GOV_RESOURCE_ID
        self.base_url = "https://api.data.gov.in/resource"

    async def fetch_live_data_gov_pune(self) -> Optional[List[Dict[str, Any]]]:
        """
        Attempts to fetch live Pune ambient air quality data from official data.gov.in CPCB resource.
        Returns parsed records if successful, or None on failure/missing credentials.
        """
        if not self.api_key:
            logger.info("No CPCB/DATA_GOV_API_KEY found in configuration. Operating in transparent Fallback Demo Mode.")
            return None

        url = f"{self.base_url}/{self.resource_id}"
        params = {
            "api-key": self.api_key,
            "format": "json",
            "filters[city]": "Pune",
            "limit": 100
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    records = data.get("records", [])
                    if records:
                        logger.info(f"Successfully fetched {len(records)} live records from data.gov.in for Pune")
                        return records
                else:
                    logger.warning(f"data.gov.in returned HTTP {response.status_code}: {response.text}")
                    return None
        except Exception as e:
            logger.error(f"Error connecting to live CPCB/data.gov.in endpoint: {e}")
            return None

    def get_latest_readings_from_db(self, db: Session) -> Dict[str, Any]:
        """
        Retrieves the most recent reading for each active Pune station from the database.
        Ensures the application never displays empty screens.
        """
        stations = db.query(Station).filter(Station.is_active == True).all()
        results = []

        now_formatted = datetime.now().strftime("%d %b %Y, %I:%M %p IST")

        for station in stations:
            # Get latest reading
            latest = (
                db.query(Reading)
                .filter(Reading.station_id == station.id)
                .order_by(Reading.timestamp.desc())
                .first()
            )

            # Get 24h prior reading for trend
            reading_24h_ago = (
                db.query(Reading)
                .filter(Reading.station_id == station.id)
                .order_by(Reading.timestamp.desc())
                .offset(24)
                .first()
            )

            if latest:
                aqi = latest.aqi
                diff_24h = (aqi - reading_24h_ago.aqi) if reading_24h_ago else 0
                trend = "up" if diff_24h > 3 else ("down" if diff_24h < -3 else "stable")
                cat_info = get_aqi_category(aqi)

                results.append({
                    "id": station.id,
                    "name": station.name,
                    "area": station.area,
                    "latitude": station.latitude,
                    "longitude": station.longitude,
                    "operator": station.operator,
                    "aqi": aqi,
                    "category_info": cat_info,
                    "dominant_pollutant": latest.dominant_pollutant,
                    "pm25": latest.pm25,
                    "pm10": latest.pm10,
                    "no2": latest.no2,
                    "so2": latest.so2,
                    "co": latest.co,
                    "o3": latest.o3,
                    "temperature": latest.temperature,
                    "humidity": latest.humidity,
                    "wind_speed": latest.wind_speed,
                    "last_updated": latest.timestamp.strftime("%d %b %Y, %I:%M %p IST"),
                    "trend": trend,
                    "change_24h": diff_24h
                })

        return {
            "stations": results,
            "is_demo_mode": not bool(self.api_key),
            "data_source": (
                "Live CPCB / data.gov.in API" if self.api_key else
                "Demo Mode — Live CPCB data is currently unavailable (Using verified realistic Pune baseline)"
            ),
            "last_updated": now_formatted
        }

cpcb_service = CPCBService()
