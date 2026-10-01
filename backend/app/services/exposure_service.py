from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.database import Station, Reading

VENTILATION_RATES_M3_PER_HOUR = {
    "low": 0.5,        # Resting, standing, desk work
    "moderate": 1.2,   # Walking, light cycling, casual strolling
    "vigorous": 2.8    # Running, fast cycling, high-intensity workouts
}

COMMUTE_EXPOSURE_FACTORS = {
    "walking": 1.0,
    "cycling": 1.2,
    "two_wheeler": 1.3,     # Direct tailpipe plume on Pune roads
    "bus_train": 0.8,       # Partial shielding
    "car_ac": 0.35          # In-cabin AC filter reduces PM by ~65%
}

def calculate_personal_exposure(
    db: Session,
    station_id: str,
    hours_outdoors: float,
    commute_duration_mins: float,
    commute_mode: str,
    activity_intensity: str
) -> Dict[str, Any]:
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        station_name = "Selected Pune Station"
        pm25_val = 65.0
        aqi_val = 140
    else:
        station_name = station.name
        latest = (
            db.query(Reading)
            .filter(Reading.station_id == station_id)
            .order_by(Reading.timestamp.desc())
            .first()
        )
        pm25_val = latest.pm25 if latest and latest.pm25 else 60.0
        aqi_val = latest.aqi if latest else 140

    # 1. Outdoor activity dose
    vent_rate = VENTILATION_RATES_M3_PER_HOUR.get(activity_intensity.lower(), 1.0)
    outdoor_dose = pm25_val * hours_outdoors * vent_rate

    # 2. Commute exposure dose
    commute_hours = commute_duration_mins / 60.0
    commute_factor = COMMUTE_EXPOSURE_FACTORS.get(commute_mode.lower(), 1.0)
    # Commute inhalation rate is estimated at moderate 1.2 m3/hr
    commute_dose = pm25_val * commute_hours * 1.2 * commute_factor

    total_inhaled_pm25 = round(outdoor_dose + commute_dose, 1)

    # WHO guideline recommends 24-hr mean PM2.5 under 15 µg/m³
    # Daily normal breathing volume is ~15 m³
    # WHO benchmark safe daily intake ~ 15 µg/m³ * 15 m³ = 225 µg
    # We calibrate a 0-100 risk score
    raw_risk = (total_inhaled_pm25 / 250.0) * 100.0
    risk_score = min(100, max(5, int(round(raw_risk))))

    if risk_score <= 25:
        risk_level = "Minimal"
        recs = [
            "Your estimated exposure is low. No urgent precautions needed.",
            "Continue standard outdoor fitness routines.",
            "Maintain adequate hydration."
        ]
    elif risk_score <= 50:
        risk_level = "Low"
        recs = [
            "Your exposure is within acceptable daily thresholds for healthy adults.",
            "If commuting on a two-wheeler, consider wearing a light dust mask.",
            "Avoid idling behind heavy commercial diesel trucks."
        ]
    elif risk_score <= 75:
        risk_level = "Moderate"
        recs = [
            "Noticeable particulate burden. Shift intense workouts indoors or to early mornings.",
            "Wear a certified N95 mask while commuting on two-wheelers or walking near arterial corridors.",
            "Rinse face and eyes after returning from long commutes."
        ]
    elif risk_score <= 90:
        risk_level = "High"
        recs = [
            "High cumulative exposure. Reduce non-essential outdoor transit.",
            "A well-fitted N95 / FFP2 respirator is strongly recommended for your commute.",
            "Use recirculated AC in vehicles; keep windows firmly rolled up.",
            "Use air purification in bedrooms overnight to support lung recovery."
        ]
    else:
        risk_level = "Severe"
        recs = [
            "Critical exposure level. Strictly curtail outdoor physical exertion.",
            "Respirator protection (N95/N99) is essential for any outdoor duration.",
            "Sensitive individuals should consult a physician if wheezing or coughing occurs."
        ]

    return {
        "station_name": station_name,
        "current_aqi": aqi_val,
        "pm25_level": round(pm25_val, 1),
        "estimated_inhaled_pm25_ug": total_inhaled_pm25,
        "relative_exposure_level": risk_level,
        "risk_score_100": risk_score,
        "recommendations": recs,
        "disclaimer": (
            "This calculator provides an approximate educational estimate of particulate inhalation based on ambient "
            "station-level pollution data and standard physiological respiratory equations. It does not represent an individual clinical measurement."
        )
    }
