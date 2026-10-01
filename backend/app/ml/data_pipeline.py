import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.models.database import Reading, Station

FEATURE_COLUMNS = [
    "aqi_lag_1",
    "aqi_lag_2",
    "aqi_lag_3",
    "aqi_rolling_3",
    "aqi_rolling_7",
    "pm25",
    "pm10",
    "no2",
    "so2",
    "co",
    "o3",
    "temperature",
    "humidity",
    "wind_speed",
    "day_of_week",
    "month",
    "season"
]

FEATURE_LABELS = {
    "aqi_lag_1": "Previous Day AQI (t-1)",
    "aqi_lag_2": "AQI 2 Days Ago (t-2)",
    "aqi_lag_3": "AQI 3 Days Ago (t-3)",
    "aqi_rolling_3": "3-Day Rolling Average AQI",
    "aqi_rolling_7": "7-Day Rolling Average AQI",
    "pm25": "PM2.5 Concentration",
    "pm10": "PM10 Concentration",
    "no2": "NO2 Concentration",
    "so2": "SO2 Concentration",
    "co": "CO Concentration",
    "o3": "Ozone (O3) Concentration",
    "temperature": "Ambient Temperature (°C)",
    "humidity": "Relative Humidity (%)",
    "wind_speed": "Wind Speed (km/h)",
    "day_of_week": "Day of the Week",
    "month": "Calendar Month",
    "season": "Seasonal Climate Index"
}

def get_season_code(month: int) -> int:
    """
    1: Winter (Nov-Feb)
    2: Summer (Mar-May)
    3: Monsoon (Jun-Sep)
    4: Post-Monsoon (Oct)
    """
    if month in [11, 12, 1, 2]:
        return 1
    elif month in [3, 4, 5]:
        return 2
    elif month in [6, 7, 8, 9]:
        return 3
    else:
        return 4

def prepare_station_dataset(db: Session, station_id: str = None) -> pd.DataFrame:
    """
    Extracts time series readings from database, aggregates daily values,
    and engineers lag and rolling features.
    """
    query = db.query(Reading)
    if station_id:
        query = query.filter(Reading.station_id == station_id)
    
    query = query.order_by(Reading.timestamp.asc())
    records = query.all()

    if not records:
        return pd.DataFrame()

    data = []
    for r in records:
        data.append({
            "station_id": r.station_id,
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
        })

    df = pd.DataFrame(data)
    df["date"] = pd.to_datetime(df["timestamp"]).dt.date

    # Aggregate daily averages per station to form a consistent daily time series
    daily = df.groupby(["station_id", "date"]).agg({
        "aqi": "mean",
        "pm25": "mean",
        "pm10": "mean",
        "no2": "mean",
        "so2": "mean",
        "co": "mean",
        "o3": "mean",
        "temperature": "mean",
        "humidity": "mean",
        "wind_speed": "mean",
    }).reset_index()

    daily = daily.sort_values(by=["station_id", "date"])

    # Generate lag and rolling features per station
    feature_dfs = []
    for s_id, group in daily.groupby("station_id"):
        g = group.copy().sort_values(by="date")
        
        # Lag features
        g["aqi_lag_1"] = g["aqi"].shift(1)
        g["aqi_lag_2"] = g["aqi"].shift(2)
        g["aqi_lag_3"] = g["aqi"].shift(3)

        # Rolling statistics (using past values up to lag 1 to avoid data leakage)
        g["aqi_rolling_3"] = g["aqi_lag_1"].rolling(window=3, min_periods=1).mean()
        g["aqi_rolling_7"] = g["aqi_lag_1"].rolling(window=7, min_periods=1).mean()

        # Target: Next-day AQI
        g["target_next_day_aqi"] = g["aqi"].shift(-1)

        # Calendar features
        dates = pd.to_datetime(g["date"])
        g["day_of_week"] = dates.dt.weekday
        g["month"] = dates.dt.month
        g["season"] = g["month"].apply(get_season_code)

        feature_dfs.append(g)

    full_df = pd.concat(feature_dfs, ignore_index=True)
    
    # Drop rows without complete lag or target values
    full_df = full_df.dropna(subset=["aqi_lag_1", "aqi_lag_2", "aqi_lag_3", "target_next_day_aqi"])
    return full_df
