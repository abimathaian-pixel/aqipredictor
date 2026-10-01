import numpy as np
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.database import Station, Reading

HOTSPOT_THRESHOLDS = {
    "High Pollution Tier": "Historical Mean AQI > 150 (Consistent heavy exposure risk)",
    "Medium Pollution Tier": "Historical Mean AQI 100 – 150 (Moderate chronic particulate burden)",
    "Low Pollution Tier": "Historical Mean AQI < 100 (Relatively cleaner microclimate or green buffer)"
}

STATION_PRIMARY_DRIVERS = {
    "station-bhosari": "Heavy industrial manufacturing corridor, MIDC metallurgy & continuous heavy transport",
    "station-swargate": "High-density intercity bus transit hub, stop-and-go diesel combustion & narrow junction",
    "station-hadapsar": "East arterial freight traffic, construction dust & mixed commercial-industrial buffer",
    "station-wakad": "Intense IT corridor rush-hour congestion, flyover construction & diesel cabs",
    "station-karve-road": "Dense residential-commercial corridor, high two-wheeler density & valley trap",
    "station-shivajinagar": "Central multimodal junction (railway/metro/bus), high vehicular idling",
    "station-yerwada": "Arterial highway connectivity to Ahmednagar, commercial traffic",
    "station-katraj": "Bypass highway commercial freight, southern valley topography",
    "station-lohegaon": "Airport aviation traffic, expanding northeast residential construction",
    "station-alandi": "Pilgrimage transit spikes, peri-urban open burning & unpaved shoulders",
    "station-nigdi": "Planned suburban township layout, moderate tree canopy",
    "station-pashan": "IITM & IISER ecological institutional green belt, minimal direct heavy industry"
}

def analyze_pune_hotspots(db: Session) -> Dict[str, Any]:
    stations = db.query(Station).filter(Station.is_active == True).all()
    hotspot_records = []

    all_aqis = []

    for station in stations:
        readings = db.query(Reading).filter(Reading.station_id == station.id).all()
        if not readings:
            continue

        aqis = [r.aqi for r in readings]
        all_aqis.extend(aqis)

        avg_aqi = round(float(np.mean(aqis)), 1)
        med_aqi = round(float(np.median(aqis)), 1)
        max_aqi = int(np.max(aqis))
        p90_aqi = round(float(np.percentile(aqis, 90)), 1)

        # Classification based on project-defined analytical tiers
        if avg_aqi > 150:
            tier = "High Pollution"
            tier_color = "#dc2626"  # red
        elif avg_aqi >= 100:
            tier = "Medium Pollution"
            tier_color = "#d97706"  # amber
        else:
            tier = "Low Pollution"
            tier_color = "#16a34a"  # green

        driver = STATION_PRIMARY_DRIVERS.get(
            station.id,
            f"Urban vehicular and commercial activity in {station.area}"
        )

        hotspot_records.append({
            "station_id": station.id,
            "name": station.name,
            "area": station.area,
            "latitude": station.latitude,
            "longitude": station.longitude,
            "avg_aqi": avg_aqi,
            "median_aqi": med_aqi,
            "max_aqi": max_aqi,
            "p90_aqi": p90_aqi,
            "tier": tier,
            "tier_color": tier_color,
            "primary_driver": driver,
            "observations_count": len(aqis)
        })

    # Sort descending by historical average AQI
    hotspot_records.sort(key=lambda x: x["avg_aqi"], reverse=True)

    # Assign ranks
    for rank, item in enumerate(hotspot_records, 1):
        item["rank"] = rank

    city_avg = round(float(np.mean(all_aqis)), 1) if all_aqis else 125.0
    most_polluted = hotspot_records[0]["name"] if hotspot_records else "N/A"
    cleanest = hotspot_records[-1]["name"] if hotspot_records else "N/A"

    return {
        "methodology": (
            "Hotspot tiers are computed from station-level historical time-series observations. "
            "Note: These represent project-defined analytical tiers for Pune microclimates, rather than official CPCB administrative categories."
        ),
        "thresholds": HOTSPOT_THRESHOLDS,
        "stations": hotspot_records,
        "city_average_aqi": city_avg,
        "most_polluted_station": most_polluted,
        "cleanest_station": cleanest
    }
