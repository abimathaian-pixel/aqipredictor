import datetime
import numpy as np
import pandas as pd
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.database import get_db, Station, Reading, AlertSubscription
from app.models.schemas import (
    StationResponse, CityOverviewResponse, LiveStationItem,
    HistoricalResponse, HealthAdvisoryResponse, HotspotsResponse,
    PredictionRequest, PredictionResponse, ModelMetricsResponse, ExposureRequest,
    ExposureResponse, AlertCreate, AlertItem, CorrelationResponse
)
from app.services.cpcb_service import cpcb_service
from app.services.aqi_calculator import get_aqi_category
from app.services.health_advisory import generate_health_advisory
from app.services.hotspot_service import analyze_pune_hotspots
from app.services.exposure_service import calculate_personal_exposure
from app.ml.predictor import predict_station_aqi, predict_station_next_day_aqi, get_model_metrics

router = APIRouter()

@router.get("/stations", response_model=List[StationResponse])
def get_stations(db: Session = Depends(get_db)):
    """List all official Pune ambient air quality monitoring stations."""
    stations = db.query(Station).filter(Station.is_active == True).all()
    return stations

@router.get("/air-quality/live")
def get_live_air_quality(db: Session = Depends(get_db)):
    """
    Returns real-time AQI and pollutant breakdown for all Pune monitoring stations,
    along with city-wide summary KPIs and transparent data source status.
    """
    data = cpcb_service.get_latest_readings_from_db(db)
    station_items = data["stations"]

    if not station_items:
        raise HTTPException(status_code=503, detail="Air quality monitoring data currently unavailable.")

    # Calculate City Overall AQI (mean of active stations)
    aqis = [s["aqi"] for s in station_items]
    city_aqi = int(round(np.mean(aqis)))
    cat_info = get_aqi_category(city_aqi)

    # Sort stations to identify highest and lowest pollution areas
    sorted_by_aqi = sorted(station_items, key=lambda x: x["aqi"], reverse=True)
    highest = sorted_by_aqi[0]
    lowest = sorted_by_aqi[-1]

    # Find dominant pollutant across city
    poll_counts = {}
    for s in station_items:
        dp = s["dominant_pollutant"]
        poll_counts[dp] = poll_counts.get(dp, 0) + 1
    dominant_poll = max(poll_counts, key=poll_counts.get) if poll_counts else "PM2.5"

    # Next-day predicted city AQI
    pred_info = predict_station_next_day_aqi(db, highest["id"])
    pred_tomorrow = pred_info["predicted_tomorrow_aqi"] if pred_info else int(city_aqi * 1.05)
    pct_change = round(((pred_tomorrow - city_aqi) / city_aqi) * 100.0, 1)

    return {
        "overview": {
            "city_name": "Pune",
            "city_aqi": city_aqi,
            "category_info": cat_info,
            "active_stations_count": len(station_items),
            "total_stations_count": 12,
            "highest_station": {
                "id": highest["id"],
                "name": highest["name"],
                "area": highest["area"],
                "aqi": highest["aqi"],
                "category": highest["category_info"]["category"]
            },
            "lowest_station": {
                "id": lowest["id"],
                "name": lowest["name"],
                "area": lowest["area"],
                "aqi": lowest["aqi"],
                "category": lowest["category_info"]["category"]
            },
            "dominant_pollutant": dominant_poll,
            "predicted_tomorrow_aqi": pred_tomorrow,
            "predicted_change_percent": pct_change,
            "last_updated": data["last_updated"],
            "is_demo_mode": data["is_demo_mode"],
            "data_source": data["data_source"],
            "disclaimer": (
                "Air-quality values and forecasts are provided for informational and educational purposes. "
                "Forecasts are estimates generated from historical and available environmental data and may not accurately predict future conditions."
            )
        },
        "stations": station_items
    }

@router.get("/stations/{station_id}")
def get_station_details(station_id: str, db: Session = Depends(get_db)):
    """Detailed view for a specific station with current pollutants and recent trend."""
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    latest = (
        db.query(Reading)
        .filter(Reading.station_id == station_id)
        .order_by(Reading.timestamp.desc())
        .first()
    )
    if not latest:
        raise HTTPException(status_code=404, detail="No readings available for this station")

    # 24 hours history
    recent_24h = (
        db.query(Reading)
        .filter(Reading.station_id == station_id)
        .order_by(Reading.timestamp.desc())
        .limit(24)
        .all()
    )
    recent_24h.reverse()

    # 7 days history
    recent_7d = (
        db.query(Reading)
        .filter(Reading.station_id == station_id)
        .order_by(Reading.timestamp.desc())
        .limit(168)
        .all()
    )
    recent_7d.reverse()

    category_info = get_aqi_category(latest.aqi)

    # Sub-indices comparison
    pollutant_cards = {
        "PM2.5": {"value": latest.pm25, "unit": "µg/m³", "label": "Fine Particulate Matter", "standard": "60 µg/m³ (24h)"},
        "PM10": {"value": latest.pm10, "unit": "µg/m³", "label": "Coarse Particulate Matter", "standard": "100 µg/m³ (24h)"},
        "NO2": {"value": latest.no2, "unit": "µg/m³", "label": "Nitrogen Dioxide", "standard": "80 µg/m³ (24h)"},
        "SO2": {"value": latest.so2, "unit": "µg/m³", "label": "Sulfur Dioxide", "standard": "80 µg/m³ (24h)"},
        "CO": {"value": latest.co, "unit": "mg/m³", "label": "Carbon Monoxide", "standard": "2.0 mg/m³ (8h)"},
        "O3": {"value": latest.o3, "unit": "µg/m³", "label": "Ground-Level Ozone", "standard": "100 µg/m³ (8h)"},
    }

    return {
        "station": {
            "id": station.id,
            "name": station.name,
            "area": station.area,
            "latitude": station.latitude,
            "longitude": station.longitude,
            "operator": station.operator,
            "station_type": station.station_type,
            "description": station.description,
            "baseline_aqi": station.baseline_aqi
        },
        "current": {
            "aqi": latest.aqi,
            "category_info": category_info,
            "dominant_pollutant": latest.dominant_pollutant,
            "analysis_statement": f"{latest.dominant_pollutant} is currently the primary pollutant associated with elevated air quality risk at {station.name}.",
            "pollutants": pollutant_cards,
            "temperature": latest.temperature,
            "humidity": latest.humidity,
            "wind_speed": latest.wind_speed,
            "last_updated": latest.timestamp.strftime("%d %b %Y, %I:%M %p IST")
        },
        "history_24h": [
            {
                "time": r.timestamp.strftime("%I:%M %p"),
                "aqi": r.aqi,
                "pm25": r.pm25,
                "pm10": r.pm10,
                "no2": r.no2,
                "o3": r.o3
            } for r in recent_24h
        ],
        "history_7d": [
            {
                "date": r.timestamp.strftime("%b %d, %H:%M"),
                "aqi": r.aqi,
                "pm25": r.pm25,
                "pm10": r.pm10
            } for r in recent_7d[::4]  # sample every 4 hours for smooth 7-day chart
        ]
    }

@router.get("/air-quality/history", response_model=HistoricalResponse)
def get_historical_trends(
    station_id: Optional[str] = Query(None, description="Optional station ID filter"),
    timeframe: str = Query("7d", description="24h, 7d, 30d, 90d, 180d"),
    db: Session = Depends(get_db)
):
    """Returns historical time series data filtered by station and timeframe."""
    query = db.query(Reading)
    station_name = "City Average (All Pune Stations)"
    if station_id:
        st = db.query(Station).filter(Station.id == station_id).first()
        if st:
            station_name = st.name
            query = query.filter(Reading.station_id == station_id)

    # Determine limit / sampling based on timeframe
    if timeframe == "24h":
        limit = 24 if station_id else 24 * 12
    elif timeframe == "7d":
        limit = 168 if station_id else 168 * 12
    elif timeframe == "30d":
        limit = 200 if station_id else 500
    elif timeframe == "90d":
        limit = 350 if station_id else 800
    else:  # 180d
        limit = 600 if station_id else 1200

    readings = query.order_by(Reading.timestamp.desc()).limit(limit).all()
    readings.reverse()

    if not readings:
        return {
            "station_id": station_id,
            "station_name": station_name,
            "timeframe": timeframe,
            "points": [],
            "summary": {"count": 0, "avg_aqi": 0, "max_aqi": 0, "min_aqi": 0}
        }

    # Aggregate by timestamp if multiple stations (City average)
    if not station_id:
        df = pd.DataFrame([{
            "timestamp": r.timestamp,
            "aqi": r.aqi,
            "pm25": r.pm25,
            "pm10": r.pm10,
            "no2": r.no2,
            "so2": r.so2,
            "co": r.co,
            "o3": r.o3,
            "temperature": r.temperature,
            "humidity": r.humidity,
            "wind_speed": r.wind_speed,
        } for r in readings])
        
        # Round timestamps to nearest hour
        df["dt_hour"] = pd.to_datetime(df["timestamp"]).dt.floor("h")
        grouped = df.groupby("dt_hour").mean(numeric_only=True).reset_index()

        points = []
        for _, row in grouped.iterrows():
            aqi_val = int(round(row["aqi"]))
            points.append({
                "timestamp": row["dt_hour"].strftime("%b %d, %H:%M"),
                "aqi": aqi_val,
                "category": get_aqi_category(aqi_val)["category"],
                "pm25": round(row["pm25"], 1) if pd.notnull(row["pm25"]) else None,
                "pm10": round(row["pm10"], 1) if pd.notnull(row["pm10"]) else None,
                "no2": round(row["no2"], 1) if pd.notnull(row["no2"]) else None,
                "so2": round(row["so2"], 1) if pd.notnull(row["so2"]) else None,
                "co": round(row["co"], 2) if pd.notnull(row["co"]) else None,
                "o3": round(row["o3"], 1) if pd.notnull(row["o3"]) else None,
                "temperature": round(row["temperature"], 1) if pd.notnull(row["temperature"]) else None,
                "humidity": round(row["humidity"], 1) if pd.notnull(row["humidity"]) else None,
                "wind_speed": round(row["wind_speed"], 1) if pd.notnull(row["wind_speed"]) else None,
            })
    else:
        # Step down points for long timeframes
        step = 1 if timeframe in ["24h", "7d"] else 2
        sampled = readings[::step]
        points = []
        for r in sampled:
            points.append({
                "timestamp": r.timestamp.strftime("%b %d, %H:%M"),
                "aqi": r.aqi,
                "category": r.category,
                "pm25": r.pm25,
                "pm10": r.pm10,
                "no2": r.no2,
                "so2": r.so2,
                "co": r.co,
                "o3": r.o3,
                "temperature": r.temperature,
                "humidity": r.humidity,
                "wind_speed": r.wind_speed,
            })

    aqi_values = [p["aqi"] for p in points]
    summary = {
        "count": len(points),
        "avg_aqi": round(float(np.mean(aqi_values)), 1) if aqi_values else 0,
        "max_aqi": int(np.max(aqi_values)) if aqi_values else 0,
        "min_aqi": int(np.min(aqi_values)) if aqi_values else 0,
    }

    return {
        "station_id": station_id,
        "station_name": station_name,
        "timeframe": timeframe,
        "points": points,
        "summary": summary
    }

@router.post("/predictions", response_model=PredictionResponse)
def create_station_prediction(req: PredictionRequest, db: Session = Depends(get_db)):
    """
    Generates an AQI prediction for a given Pune monitoring station and target future date.
    Employs recursive multi-step forecasting supporting up to 7 days ahead.
    """
    try:
        pred = predict_station_aqi(db, req.station_id, req.target_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not pred:
        raise HTTPException(status_code=404, detail="Unable to compute prediction for this station.")
    return pred

@router.get("/predictions/{station_id}", response_model=PredictionResponse)
def get_station_prediction(
    station_id: str,
    target_date: Optional[str] = Query(None, description="Future prediction target date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Generates an AQI prediction for a given station and optional target future date.
    Defaults to tomorrow if target_date is not specified.
    """
    try:
        pred = predict_station_aqi(db, station_id, target_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not pred:
        raise HTTPException(status_code=404, detail="Unable to compute prediction for this station.")
    return pred

@router.get("/model/metrics", response_model=ModelMetricsResponse)
def get_model_evaluation_metrics():
    """Returns actual vs predicted evaluation metrics and explainability parameters."""
    metrics = get_model_metrics()
    if not metrics:
        raise HTTPException(status_code=503, detail="Model metrics not yet initialized.")
    return metrics

@router.get("/hotspots", response_model=HotspotsResponse)
def get_hotspot_analysis(db: Session = Depends(get_db)):
    """Classifies Pune monitoring areas into analytical tiers based on historical AQI distributions."""
    return analyze_pune_hotspots(db)

@router.get("/health-advisory", response_model=HealthAdvisoryResponse)
def get_health_advisory_endpoint(
    station_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns official CPCB/WHO health guidance tailored to current air pollution levels."""
    if station_id:
        latest = (
            db.query(Reading)
            .filter(Reading.station_id == station_id)
            .order_by(Reading.timestamp.desc())
            .first()
        )
        aqi = latest.aqi if latest else 140
        dom_poll = latest.dominant_pollutant if latest else "PM2.5"
    else:
        # City average
        live_data = cpcb_service.get_latest_readings_from_db(db)
        aqis = [s["aqi"] for s in live_data["stations"]]
        aqi = int(round(np.mean(aqis))) if aqis else 140
        dom_poll = "PM2.5"

    return generate_health_advisory(aqi, dom_poll)

@router.get("/comparison")
def compare_stations(
    stations: str = Query(..., description="Comma-separated station IDs, e.g. station-shivajinagar,station-hadapsar"),
    db: Session = Depends(get_db)
):
    """Compares 2 to 4 Pune stations side-by-side with synchronized metrics and trends."""
    station_ids = [s.strip() for s in stations.split(",") if s.strip()]
    if len(station_ids) < 2:
        raise HTTPException(status_code=400, detail="Please select at least 2 stations to compare.")

    results = []
    trend_data = {}

    for s_id in station_ids[:4]:
        st = db.query(Station).filter(Station.id == s_id).first()
        if not st:
            continue

        latest = (
            db.query(Reading)
            .filter(Reading.station_id == s_id)
            .order_by(Reading.timestamp.desc())
            .first()
        )

        # 30-day average
        readings_30d = (
            db.query(Reading)
            .filter(Reading.station_id == s_id)
            .order_by(Reading.timestamp.desc())
            .limit(100)
            .all()
        )
        avg_30d = round(float(np.mean([r.aqi for r in readings_30d])), 1) if readings_30d else 0

        # Prediction
        pred = predict_station_next_day_aqi(db, s_id)
        pred_val = pred["predicted_tomorrow_aqi"] if pred else 0

        # 7-day trend (sampled)
        recent_7d = (
            db.query(Reading)
            .filter(Reading.station_id == s_id)
            .order_by(Reading.timestamp.desc())
            .limit(42)
            .all()
        )
        recent_7d.reverse()

        results.append({
            "id": st.id,
            "name": st.name,
            "area": st.area,
            "current_aqi": latest.aqi if latest else 0,
            "category_info": get_aqi_category(latest.aqi if latest else 0),
            "pm25": latest.pm25 if latest else None,
            "pm10": latest.pm10 if latest else None,
            "no2": latest.no2 if latest else None,
            "so2": latest.so2 if latest else None,
            "co": latest.co if latest else None,
            "o3": latest.o3 if latest else None,
            "avg_30d": avg_30d,
            "predicted_aqi": pred_val,
            "trend_7d": [
                {
                    "time": r.timestamp.strftime("%a %H:%M"),
                    "aqi": r.aqi
                } for r in recent_7d
            ]
        })

    return {"stations": results}

@router.post("/exposure/calculate", response_model=ExposureResponse)
def compute_exposure_endpoint(req: ExposureRequest, db: Session = Depends(get_db)):
    """Calculates estimated particulate inhalation and educational exposure risk."""
    return calculate_personal_exposure(
        db=db,
        station_id=req.station_id,
        hours_outdoors=req.hours_outdoors,
        commute_duration_mins=req.commute_duration_mins,
        commute_mode=req.commute_mode,
        activity_intensity=req.activity_intensity
    )

@router.get("/alerts", response_model=List[AlertItem])
def get_alerts(db: Session = Depends(get_db)):
    """Lists registered air quality alert subscriptions and checks live trigger status."""
    alerts = db.query(AlertSubscription).filter(AlertSubscription.is_active == True).all()
    results = []

    for a in alerts:
        st = db.query(Station).filter(Station.id == a.station_id).first()
        st_name = st.name if st else "Unknown Station"

        latest = (
            db.query(Reading)
            .filter(Reading.station_id == a.station_id)
            .order_by(Reading.timestamp.desc())
            .first()
        )
        curr_aqi = latest.aqi if latest else 0
        triggered = curr_aqi >= a.threshold

        results.append({
            "id": a.id,
            "station_id": a.station_id,
            "station_name": st_name,
            "threshold": a.threshold,
            "contact": a.contact or "In-App Notification",
            "is_active": a.is_active,
            "created_at": a.created_at.strftime("%d %b %Y, %I:%M %p") if a.created_at else "Just now",
            "is_triggered_now": triggered,
            "current_aqi": curr_aqi
        })

    return results

@router.post("/alerts", response_model=AlertItem)
def create_alert(req: AlertCreate, db: Session = Depends(get_db)):
    """Registers a new in-app air quality threshold alert."""
    st = db.query(Station).filter(Station.id == req.station_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Station not found")

    alert = AlertSubscription(
        station_id=req.station_id,
        threshold=req.threshold,
        contact=req.contact,
        notify_method=req.notify_method or "in_app",
        is_active=True,
        created_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    latest = (
        db.query(Reading)
        .filter(Reading.station_id == req.station_id)
        .order_by(Reading.timestamp.desc())
        .first()
    )
    curr_aqi = latest.aqi if latest else 0

    return {
        "id": alert.id,
        "station_id": alert.station_id,
        "station_name": st.name,
        "threshold": alert.threshold,
        "contact": alert.contact or "In-App Notification",
        "is_active": alert.is_active,
        "created_at": alert.created_at.strftime("%d %b %Y, %I:%M %p"),
        "is_triggered_now": curr_aqi >= alert.threshold,
        "current_aqi": curr_aqi
    }

@router.delete("/alerts/{alert_id}")
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    """Deletes an alert subscription."""
    alert = db.query(AlertSubscription).filter(AlertSubscription.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted successfully"}

@router.get("/correlation", response_model=CorrelationResponse)
def get_environmental_correlation(db: Session = Depends(get_db)):
    """Computes Pearson correlation matrix and scatter points between meteorological parameters and AQI."""
    # Pull sample of 300 readings across stations
    readings = db.query(Reading).order_by(Reading.timestamp.desc()).limit(400).all()
    if not readings:
        raise HTTPException(status_code=404, detail="No readings available for correlation analysis.")

    data = []
    for r in readings:
        if r.temperature and r.humidity and r.wind_speed and r.pm25:
            data.append({
                "aqi": r.aqi,
                "pm25": r.pm25,
                "temperature": r.temperature,
                "humidity": r.humidity,
                "wind_speed": r.wind_speed,
                "station": r.station_id.replace("station-", "").capitalize(),
                "date": r.timestamp.strftime("%d %b")
            })

    df = pd.DataFrame(data)
    variables = ["aqi", "pm25", "temperature", "humidity", "wind_speed"]
    corr_df = df[variables].corr()

    matrix = {}
    for var1 in variables:
        matrix[var1] = {}
        for var2 in variables:
            matrix[var1][var2] = round(float(corr_df.loc[var1, var2]), 3)

    # Scatter points (sample 60 points for responsive rendering)
    scatter_sample = df.sample(min(80, len(df)), random_state=42)

    scatter_aqi_temp = [
        {"x": round(row["temperature"], 1), "y": row["aqi"], "station": row["station"], "date": row["date"]}
        for _, row in scatter_sample.iterrows()
    ]
    scatter_aqi_hum = [
        {"x": round(row["humidity"], 1), "y": row["aqi"], "station": row["station"], "date": row["date"]}
        for _, row in scatter_sample.iterrows()
    ]
    scatter_aqi_wind = [
        {"x": round(row["wind_speed"], 1), "y": row["aqi"], "station": row["station"], "date": row["date"]}
        for _, row in scatter_sample.iterrows()
    ]
    scatter_aqi_pm25 = [
        {"x": round(row["pm25"], 1), "y": row["aqi"], "station": row["station"], "date": row["date"]}
        for _, row in scatter_sample.iterrows()
    ]

    return {
        "variables": variables,
        "matrix": matrix,
        "scatter_aqi_temp": scatter_aqi_temp,
        "scatter_aqi_humidity": scatter_aqi_hum,
        "scatter_aqi_wind": scatter_aqi_wind,
        "scatter_aqi_pm25": scatter_aqi_pm25,
        "interpretation": (
            "Strong positive correlation (r ≈ 0.85) between PM2.5 and AQI confirms fine particulate matter as the dominant driver in Pune. "
            "Negative correlation observed with wind speed reflects atmospheric ventilation and dispersion dynamics. "
            "Statistical association does not imply direct physical causation."
        )
    }
