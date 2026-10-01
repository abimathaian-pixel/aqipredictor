import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from app.config import settings

# Handle SQLite vs PostgreSQL URL if needed
db_url = settings.DATABASE_URL
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Station(Base):
    __tablename__ = "stations"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    area = Column(String(256), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    operator = Column(String(128), nullable=False)
    station_type = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    baseline_aqi = Column(Integer, default=120)
    is_active = Column(Boolean, default=True)

    readings = relationship("Reading", back_populates="station", cascade="all, delete-orphan")
    alerts = relationship("AlertSubscription", back_populates="station", cascade="all, delete-orphan")

class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(String(64), ForeignKey("stations.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    aqi = Column(Integer, nullable=False)
    category = Column(String(32), nullable=False)
    dominant_pollutant = Column(String(32), nullable=False)
    pm25 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    so2 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)
    o3 = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    is_forecast = Column(Boolean, default=False)

    station = relationship("Station", back_populates="readings")

class AlertSubscription(Base):
    __tablename__ = "alert_subscriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(String(64), ForeignKey("stations.id"), nullable=False)
    threshold = Column(Integer, nullable=False)
    contact = Column(String(128), nullable=True)
    notify_method = Column(String(32), default="in_app")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_triggered_at = Column(DateTime, nullable=True)

    station = relationship("Station", back_populates="alerts")

class ModelMetricRecord(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    model_name = Column(String(64), nullable=False)
    mae = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    r2 = Column(Float, nullable=False)
    training_date = Column(DateTime, default=datetime.datetime.utcnow)
    features_json = Column(Text, nullable=True)
    status = Column(String(32), default="active")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
