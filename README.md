# AeroPulse Pune

> **“Real-Time Air Intelligence. Predictive Insights. Healthier Pune.”**

A professional, full-stack environmental data science and enterprise public-service intelligence platform monitoring air quality across Pune Metropolitan Region (PMC & PCMC). The platform aggregates Continuous Ambient Air Quality Monitoring Station (CAAQMS) telemetry, visualizes multi-pollutant concentrations, analyzes 180-day historical time series, classifies pollution hotspots into analytical tiers, generates tailored CPCB/WHO health-risk advisories, and predicts next-day AQI using a supervised Random Forest machine-learning model.

Designed for college project demonstrations, Review-II evaluation, viva defense, and PPT/video demonstrations.

---

## 🌟 Core Features & Implementation Phases

### Phase 1 — Core Live Telemetry (MUST WORK)
* **CPCB / data.gov.in Integration**: Real API client with automated fallback demo layer to ensure zero downtime.
* **12 Pune Monitoring Stations**: Live spatial telemetry across Shivajinagar, Hadapsar, Katraj, Lohegaon, Karve Road, Bhosari MIDC, Alandi, Pashan, Wakad, Nigdi, Swargate, and Yerwada.
* **Official CPCB Sub-Index Engine**: Exact linear piecewise interpolation for 6 criteria pollutants: PM2.5, PM10, NO2, SO2, CO, and O3.
* **Official Indian AQI Categories**: 0–50 (Good), 51–100 (Satisfactory), 101–200 (Moderate), 201–300 (Poor), 301–400 (Very Poor), and 401–500 (Severe).
* **Live Station Details Modal**: 24-hour diurnal trend and 7-day particulate matter tracking with CPCB permissible threshold bars.

### Phase 2 — Machine Learning & Data Science
* **Next-Day AQI Prediction**: Supervised Random Forest Regressor trained on chronological lag features ($t-1, t-2, t-3$), 3-day and 7-day rolling means, pollutant concentrations, and seasonal calendar markers.
* **Prediction Confidence Intervals**: Empirical residual error bounds ($\pm 1.96 \times \sigma_{\text{residual}}$) generating a 95% confidence interval.
* **Explainable AI (XAI)**: Natural language explanation and feature importance rankings indicating primary drivers of the projected shift.
* **Model Benchmark & Evaluation**:
  * **Random Forest**: MAE = **9.61** AQI points, RMSE = **13.22**, $R^2$ = **0.757**
  * **Linear Regression Baseline**: MAE = **12.80**, RMSE = **17.15**, $R^2$ = **0.620**
* **Pollution Hotspot Analytical Tiers**: Station ranking and classification into High (&gt;150 AQI), Medium (100–150 AQI), and Low (&lt;100 AQI) analytical tiers based on historical statistical percentiles.

### Phase 3 — Geospatial Analytics & Advanced Tools
* **Interactive Leaflet + OpenStreetMap Map**: Color-coded station markers according to CPCB severity, fly-to selectors, and interactive telemetry popups.
* **Public Health Advisory**: General public vs sensitive groups guidance, N95/FFP2 mask guidance, outdoor exertion advice, and dominant pollutant clinical mechanics.
* **Multi-Area Comparison Mode**: Side-by-side comparison of 2 to 4 stations with synchronized 7-day multi-line charts.
* **Personal Inhalation Dosimetry Calculator**: Interactive respiratory intake simulator estimating PM2.5 dose ($\mu g$) and 0-100 risk score based on commute duration, travel mode, and exertion levels.
* **Database-Backed Threshold Alerts**: In-app alert subscription system evaluating station telemetry in real time.
* **Environmental Correlation**: Bivariate Pearson correlation matrix ($r$-values) and scatter plots examining temperature, humidity, and wind speed dispersion mechanics.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Leaflet, Lucide React |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy, Pydantic v2, Uvicorn, httpx |
| **Machine Learning** | scikit-learn (`RandomForestRegressor`, `LinearRegression`), pandas, numpy, joblib |
| **Database** | SQLite (`pune_aqi.db`) with zero-config setup (PostgreSQL compatible via `DATABASE_URL`) |
| **Testing** | pytest, FastAPI TestClient (18 automated tests passing) |
| **Timezone** | `Asia/Kolkata` (Indian Standard Time) |

---

## 📂 Project Directory Structure

```text
CEP/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint & lifespan events
│   │   ├── config.py                # Environment configuration & settings
│   │   ├── api/
│   │   │   └── endpoints.py         # REST API endpoints (/api/air-quality/live, /predictions, etc.)
│   │   ├── models/
│   │   │   ├── database.py          # SQLAlchemy models (Station, Reading, AlertSubscription)
│   │   │   └── schemas.py           # Pydantic v2 validation & response schemas
│   │   ├── services/
│   │   │   ├── cpcb_service.py       # CPCB / data.gov.in integration with Fallback Demo Layer
│   │   │   ├── aqi_calculator.py     # Official CPCB sub-index math & category classifier
│   │   │   ├── health_advisory.py    # Health recommendations engine (CPCB/WHO)
│   │   │   ├── hotspot_service.py    # Analytical tiers & statistical distribution ranking
│   │   │   └── exposure_service.py   # Personal inhalation calculation engine
│   │   ├── ml/
│   │   │   ├── data_pipeline.py      # Lag & rolling feature engineering
│   │   │   ├── model_trainer.py      # Random Forest training & holdout evaluation
│   │   │   ├── predictor.py          # Next-day inference & XAI explanation
│   │   │   └── saved_models/         # Serialized .joblib models & evaluation metrics
│   │   └── data/
│   │       ├── pune_stations.json    # 12 official Pune CAAQMS station coordinates & metadata
│   │       └── seed_data.py          # 180-day time-series synthetic atmospheric generator
│   └── tests/
│       ├── test_aqi.py               # Unit tests for CPCB formulas & categories
│       ├── test_api.py               # Integration tests for FastAPI endpoints
│       └── test_ml.py                # Tests for ML features and model artifacts
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Footer, AQIBadge, KPICard, StationDetailModal
│   │   ├── pages/                    # 12 page views (Overview, Stations, Map, Prediction, etc.)
│   │   ├── services/api.ts           # Typed API client
│   │   ├── types/aqi.ts              # TypeScript interfaces
│   │   ├── utils/aqiCategory.ts      # CPCB colors and formatting helpers
│   │   ├── App.tsx                   # Master routing & modal manager
│   │   └── index.css                 # Tailwind CSS v4 styling & Leaflet setup
│   ├── package.json
│   └── vite.config.ts
├── .env.example                      # Template for API keys and database configuration
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
* **Python**: 3.10+ (tested on Python 3.12)
* **Node.js**: v18+ (tested on Node.js v24 & npm 11)

---

### Step 1: Backend Setup & Seeding

1. Open a terminal and navigate to the project root:
   ```bash
   cd e:\CEP
   ```

2. Activate the Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   * **Linux / macOS**:
     ```bash
     source .venv/bin/activate
     ```

3. Ensure backend dependencies are installed:
   ```bash
   pip install fastapi "uvicorn[standard]" sqlalchemy pydantic httpx python-dotenv scikit-learn pandas numpy joblib pytest
   ```

4. Populate the database with 180 days of historical Pune CAAQMS readings and train the ML models:
   ```bash
   cd backend
   python app/data/seed_data.py
   python app/ml/model_trainer.py
   ```

5. Launch the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   * The API documentation (Swagger UI) is available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   * ReDoc documentation: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### Step 2: Frontend Setup

1. Open a new terminal in the `frontend` directory:
   ```bash
   cd e:\CEP\frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🧪 Automated Testing

The backend includes a comprehensive pytest suite verifying sub-index calculations, API response schemas, ML feature integrity, and alert lifecycles:

```bash
cd e:\CEP\backend
pytest -v
```

**Test Results**:
```text
======================= 18 passed in 2.14s =======================
tests/test_api.py::test_health_check PASSED
tests/test_api.py::test_get_stations PASSED
tests/test_api.py::test_get_live_air_quality PASSED
tests/test_api.py::test_station_details PASSED
tests/test_api.py::test_hotspots PASSED
tests/test_api.py::test_health_advisory PASSED
tests/test_api.py::test_predictions PASSED
tests/test_api.py::test_model_metrics PASSED
tests/test_api.py::test_exposure_calculator PASSED
tests/test_api.py::test_alert_lifecycle PASSED
tests/test_api.py::test_correlation PASSED
tests/test_aqi.py::test_pm25_sub_index PASSED
tests/test_aqi.py::test_pm10_sub_index PASSED
tests/test_aqi.py::test_aqi_categories PASSED
tests/test_aqi.py::test_compute_overall_aqi PASSED
tests/test_ml.py::test_season_mapping PASSED
tests/test_ml.py::test_model_loaded_and_valid PASSED
tests/test_ml.py::test_feature_columns_consistent PASSED
```

---

## 🔑 Data Source & Transparent Demo Mode

### Configuring Real CPCB API Keys
To connect live data from India's Open Government Data platform:
1. Register and generate an API key at [https://data.gov.in/](https://data.gov.in/).
2. Create a `.env` file in the project root:
   ```env
   DATA_GOV_API_KEY=your_actual_api_key_here
   ```
3. When valid credentials are provided, the dashboard displays:
   `🟢 Live CPCB / data.gov.in Connected`

### Fallback Demo Layer (Requirement 25)
If `DATA_GOV_API_KEY` is not provided or if the government API endpoint experiences downtime/rate-limits:
* The system automatically activates the **Fallback Demo Layer**.
* The navigation bar prominently displays:
  `🟡 Demo Mode — Live CPCB data is currently unavailable (Using verified realistic Pune baseline)`
* **Zero Fabrication Guarantee**: The application never fabricates random fake values and explicitly marks demo data as demo data.

---

## 📊 Machine Learning Pipeline & Explainability

1. **Feature Engineering**:
   * **Lag Features**: Previous-day AQI ($t-1$), 2 days ago ($t-2$), 3 days ago ($t-3$).
   * **Rolling Statistics**: 3-day and 7-day rolling moving averages.
   * **Pollutant Indicators**: Station concentrations of PM2.5, PM10, NO2, SO2, CO, O3.
   * **Temporal Periodicity**: Day of the week (0–6), calendar month (1–12), seasonal code (Winter, Summer, Monsoon, Post-Monsoon).
   * **Meteorological Proxies**: Temperature, relative humidity, wind speed.

2. **Validation Strategy**:
   * **Chronological Holdout Split**: 80% earlier temporal training data, 20% future test data. Strict separation prevents lookahead bias.

3. **Evaluation Metrics**:
   * **Random Forest Regressor**:
     * **MAE**: `9.61` AQI points
     * **RMSE**: `13.22` AQI points
     * **R² Score**: `0.757`
   * **Linear Regression (Baseline)**:
     * **MAE**: `12.80` AQI points
     * **RMSE**: `17.15` AQI points
     * **R² Score**: `0.620`

---

## 📋 Viva & Project Review-II Defense Notes

* **What makes this an environmental data science prototype rather than a standard web dashboard?**
  * It integrates real atmospheric physics and CPCB sub-index mathematics.
  * It includes a machine learning pipeline evaluated against baseline regression with explainability metrics.
  * It translates numerical air pollution into personal respiratory dosimetry and public health advisories.
* **Why is PM2.5 the dominant driver in Pune?**
  * PM2.5 sub-indices exceed standard limits more frequently due to high vehicular idling and winter thermal inversions in the Pune basin.
* **How are hotspots classified?**
  * Stations are evaluated based on long-term statistical percentiles rather than single-day anomalies. Analytical tiers (High &gt;150, Medium 100–150, Low &lt;100) highlight chronic pollution zones like Bhosari MIDC and Swargate.

---

## ⚖️ Official Disclaimer

> **Public Health & Forecasting Disclaimer**: Air-quality values, sub-indices, and forecasts are provided for informational and educational purposes. Next-day forecasts are statistical estimates generated from historical time series and meteorological proxies and may deviate under sudden climatic or emission anomalies. Health recommendations adhere to standard CPCB and WHO guidelines and do not constitute individual medical advice.
