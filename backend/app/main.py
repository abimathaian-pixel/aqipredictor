from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.endpoints import router as api_router
from app.models.database import init_db
from app.data.seed_data import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-time air quality monitoring, historical time-series analytics, and ML forecasting platform for Pune.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "documentation": "/docs",
        "api_v1": settings.API_V1_PREFIX,
        "region": "Pune Metropolitan Area, Maharashtra, India"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "pune-aqi-backend"}
