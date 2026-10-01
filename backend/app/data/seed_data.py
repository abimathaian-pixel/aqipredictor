import json
import random
import os
import datetime
from sqlalchemy.orm import Session
from app.models.database import Station, Reading, ModelMetricRecord, SessionLocal, init_db
from app.services.aqi_calculator import compute_overall_aqi, get_aqi_category

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
STATIONS_FILE = os.path.join(DATA_DIR, "pune_stations.json")

def load_stations_data():
    with open(STATIONS_FILE, "r") as f:
        return json.load(f)

def generate_realistic_pollutants(station_info: dict, dt: datetime.datetime):
    """
    Simulates high-fidelity Pune atmospheric conditions using real meteorological &
    diurnal equations for Pune's topography and seasonal climate.
    """
    base_aqi = station_info.get("baseline_aqi", 130)
    month = dt.month
    hour = dt.hour
    day_of_week = dt.weekday()

    # 1. Seasonal coefficient
    # Winter (Nov-Feb): highest pollution due to thermal inversions
    # Summer (Mar-May): high dust/PM10, moderate PM2.5
    # Monsoon (Jun-Sep): precipitation scavenging wash-out (lowest AQI)
    # Post-monsoon (Oct): transitioning up
    if month in [11, 12, 1, 2]:
        season_mult = 1.35
    elif month in [3, 4, 5]:
        season_mult = 1.05
    elif month in [6, 7, 8]:
        season_mult = 0.50
    elif month == 9:
        season_mult = 0.65
    else:  # October
        season_mult = 1.0

    # 2. Diurnal traffic & atmospheric boundary layer coefficient
    # Morning peak (8-11am) & evening peak (6-10pm)
    if 8 <= hour <= 11:
        diurnal_mult = 1.25
        traffic_boost = 1.3
    elif 18 <= hour <= 22:
        diurnal_mult = 1.30
        traffic_boost = 1.35
    elif 12 <= hour <= 16:
        diurnal_mult = 0.85
        traffic_boost = 0.95
    else:
        diurnal_mult = 0.95
        traffic_boost = 0.80

    # 3. Weekend effect (Sunday has slightly less commercial transport)
    weekend_mult = 0.90 if day_of_week == 6 else 1.0

    # Target effective AQI baseline
    target_aqi = base_aqi * season_mult * diurnal_mult * weekend_mult
    # Add mild stochastic fluctuation
    random_noise = random.gauss(0, 4.0)
    effective_aqi = max(25.0, target_aqi + random_noise)

    # Specific pollutant proportions
    # PM2.5 is usually ~60% of PM10 in Pune winter, ~40% in dry summer
    pm25_ratio = 0.65 if month in [11, 12, 1, 2] else 0.50
    
    # Back-calculate realistic concentrations from AQI target
    if effective_aqi <= 50:
        pm25 = max(5.0, (effective_aqi / 50.0) * 30.0 + random.uniform(-2, 2))
        pm10 = pm25 / pm25_ratio + random.uniform(5, 15)
        no2 = max(8.0, 25.0 * traffic_boost + random.uniform(-3, 3))
        so2 = max(5.0, 15.0 + random.uniform(-2, 2))
        co = max(0.2, 0.45 * traffic_boost)
        o3 = max(10.0, 30.0 + (15.0 if 12 <= hour <= 16 else -5.0))
    elif effective_aqi <= 100:
        pm25 = max(31.0, 30.0 + ((effective_aqi - 50) / 50.0) * 30.0 + random.uniform(-3, 3))
        pm10 = pm25 / pm25_ratio + random.uniform(10, 25)
        no2 = max(20.0, 45.0 * traffic_boost + random.uniform(-5, 5))
        so2 = max(8.0, 22.0 + random.uniform(-3, 3))
        co = max(0.4, 0.85 * traffic_boost)
        o3 = max(15.0, 45.0 + (25.0 if 12 <= hour <= 16 else -8.0))
    elif effective_aqi <= 200:
        pm25 = max(61.0, 60.0 + ((effective_aqi - 100) / 100.0) * 30.0 + random.uniform(-4, 4))
        pm10 = pm25 / pm25_ratio + random.uniform(20, 40)
        no2 = max(35.0, 75.0 * traffic_boost + random.uniform(-6, 8))
        so2 = max(12.0, 30.0 + random.uniform(-4, 4))
        co = max(0.8, 1.6 * traffic_boost)
        o3 = max(20.0, 65.0 + (30.0 if 12 <= hour <= 16 else -10.0))
    elif effective_aqi <= 300:
        pm25 = max(91.0, 90.0 + ((effective_aqi - 200) / 100.0) * 30.0 + random.uniform(-5, 5))
        pm10 = pm25 / pm25_ratio + random.uniform(30, 60)
        no2 = max(50.0, 110.0 * traffic_boost + random.uniform(-8, 12))
        so2 = max(15.0, 45.0 + random.uniform(-5, 5))
        co = max(1.2, 2.4 * traffic_boost)
        o3 = max(25.0, 80.0 + (35.0 if 12 <= hour <= 16 else -12.0))
    else:
        pm25 = max(121.0, 120.0 + ((effective_aqi - 300) / 100.0) * 130.0 + random.uniform(-8, 8))
        pm10 = pm25 / pm25_ratio + random.uniform(40, 80)
        no2 = max(60.0, 140.0 * traffic_boost)
        so2 = max(20.0, 55.0)
        co = max(1.5, 3.2 * traffic_boost)
        o3 = max(30.0, 95.0)

    # Station specific adjustments
    if "bhosari" in station_info["id"]:
        # Industrial: higher SO2 and PM10
        so2 *= 1.45
        pm10 *= 1.25
    elif "swargate" in station_info["id"] or "shivajinagar" in station_info["id"]:
        # High traffic: higher NO2 and CO
        no2 *= 1.35
        co *= 1.30
    elif "pashan" in station_info["id"]:
        # Green campus: lower PM2.5, higher relative biogenic O3
        pm25 *= 0.75
        pm10 *= 0.75
        no2 *= 0.70

    # Temperature & Humidity in Pune (tropical wet-and-dry climate)
    if month in [3, 4, 5]:
        base_temp = 34.0
        base_humidity = 35.0
    elif month in [6, 7, 8, 9]:
        base_temp = 26.0
        base_humidity = 82.0
    elif month in [10, 11]:
        base_temp = 28.0
        base_humidity = 60.0
    else:
        base_temp = 24.0
        base_humidity = 50.0

    # Diurnal temperature cycle: coolest at 5am, warmest at 2pm
    hour_offset = -6.0 if hour < 6 else (4.0 if 12 <= hour <= 16 else 0.0)
    temp = round(base_temp + hour_offset + random.uniform(-1.5, 1.5), 1)
    humidity = round(max(20.0, min(95.0, base_humidity - (hour_offset * 2) + random.uniform(-4, 4))), 1)
    wind_speed = round(max(1.0, 7.5 + (4.0 if 13 <= hour <= 18 else -2.0) + random.uniform(-1.5, 2.0)), 1)

    pollutant_dict = {
        "PM2.5": round(pm25, 1),
        "PM10": round(pm10, 1),
        "NO2": round(no2, 1),
        "SO2": round(so2, 1),
        "CO": round(co, 2),
        "O3": round(o3, 1),
    }

    computed_aqi, dom_poll, _ = compute_overall_aqi(pollutant_dict)
    if computed_aqi is None:
        computed_aqi = int(round(effective_aqi))
        dom_poll = "PM2.5"

    category_info = get_aqi_category(computed_aqi)

    return {
        "aqi": computed_aqi,
        "category": category_info["category"],
        "dominant_pollutant": dom_poll,
        "pm25": pollutant_dict["PM2.5"],
        "pm10": pollutant_dict["PM10"],
        "no2": pollutant_dict["NO2"],
        "so2": pollutant_dict["SO2"],
        "co": pollutant_dict["CO"],
        "o3": pollutant_dict["O3"],
        "temperature": temp,
        "humidity": humidity,
        "wind_speed": wind_speed
    }

def seed_database(force: bool = False):
    init_db()
    db: Session = SessionLocal()
    try:
        existing_stations = db.query(Station).count()
        if existing_stations > 0 and not force:
            print(f"[Seed] Database already contains {existing_stations} stations. Checking readings count...")
            readings_count = db.query(Reading).count()
            if readings_count > 500:
                print(f"[Seed] Database already seeded with {readings_count} readings. Skipping.")
                return

        print("[Seed] Initializing Pune stations and historical atmospheric dataset...")
        stations_json = load_stations_data()

        # Insert or update stations
        for st_data in stations_json:
            st = db.query(Station).filter(Station.id == st_data["id"]).first()
            if not st:
                st = Station(
                    id=st_data["id"],
                    name=st_data["name"],
                    area=st_data["area"],
                    latitude=st_data["latitude"],
                    longitude=st_data["longitude"],
                    operator=st_data["operator"],
                    station_type=st_data["station_type"],
                    description=st_data.get("description", ""),
                    baseline_aqi=st_data.get("baseline_aqi", 120),
                    is_active=True
                )
                db.add(st)
        db.commit()

        # Generate historical data for past 180 days up to current reference time
        # Reference anchor: 2026-09-30 17:00:00 (Matches current simulated timestamp)
        now = datetime.datetime(2026, 9, 30, 17, 0, 0)
        
        # Check if readings exist
        existing_readings = db.query(Reading).count()
        if existing_readings > 100 and not force:
            print(f"[Seed] {existing_readings} readings exist. Done.")
            return

        print("[Seed] Synthesizing 180 days of realistic time-series readings for 12 Pune stations...")
        all_readings = []

        # Hourly readings for the last 7 days (7 * 24 = 168 time points)
        hourly_timestamps = [now - datetime.timedelta(hours=h) for h in range(168)]
        hourly_timestamps.reverse()

        # Daily representative readings for days 8 to 180 (172 days, sampled at 12:00 PM)
        daily_timestamps = [now - datetime.timedelta(days=d, hours=5) for d in range(8, 181)]
        daily_timestamps.reverse()

        combined_timestamps = daily_timestamps + hourly_timestamps

        for st_data in stations_json:
            for ts in combined_timestamps:
                res = generate_realistic_pollutants(st_data, ts)
                r = Reading(
                    station_id=st_data["id"],
                    timestamp=ts,
                    aqi=res["aqi"],
                    category=res["category"],
                    dominant_pollutant=res["dominant_pollutant"],
                    pm25=res["pm25"],
                    pm10=res["pm10"],
                    no2=res["no2"],
                    so2=res["so2"],
                    co=res["co"],
                    o3=res["o3"],
                    temperature=res["temperature"],
                    humidity=res["humidity"],
                    wind_speed=res["wind_speed"],
                    is_forecast=False
                )
                all_readings.append(r)

        # Batch insert for optimal performance
        db.bulk_save_objects(all_readings)
        db.commit()
        print(f"[Seed] Successfully populated {len(all_readings)} historical readings across {len(stations_json)} Pune stations.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database(force=True)
