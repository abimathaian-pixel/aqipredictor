# 🚀 AeroPulse Pune: Production Deployment Guide

This guide explains how to deploy **AeroPulse Pune** to production using the industry-standard architecture for full-stack data science applications:
* **Frontend**: [Vercel](https://vercel.com) (React 19 + Vite + Tailwind CSS)
* **Backend**: [Render](https://render.com) or [Railway](https://railway.app) (FastAPI + Python + Scikit-Learn ML Models)

Both platforms offer generous **100% Free Tiers** with zero credit card required.

---

## 🏗️ Architecture Overview

```text
┌─────────────────────────────────┐       HTTPS REST       ┌─────────────────────────────────┐
│         Vercel (Edge)           │ ─────────────────────> │       Render / Railway          │
│  React 19 + Vite + Tailwind     │                        │   FastAPI + Uvicorn + ML Model  │
│  https://aeropulse.vercel.app   │ <───────────────────── │  https://aeropulse-api.onrender.com│
└─────────────────────────────────┘      JSON Payload      └─────────────────────────────────┘
```

> **Why this architecture?**
> * **Vercel** provides instant global edge CDN hosting for Vite/React applications with automatic HTTPS.
> * Full-stack ML libraries (`scikit-learn`, `pandas`, `numpy`, `scipy`) run best on a persistent Python container (like **Render** or **Railway**) rather than serverless functions, avoiding Vercel's 250MB serverless lambda size limit and cold-start latency.

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Push Your Code to GitHub

If you haven't initialized Git yet, open PowerShell in `e:\CEP`:

```powershell
cd e:\CEP
git init
git add .
git commit -m "feat: complete AeroPulse Pune full-stack platform"
git branch -M main
git remote add origin https://github.com/<your-username>/aeropulse-pune.git
git push -u origin main
```

---

### Step 2: Deploy Backend to Render (Free)

1. Go to [Render.com](https://render.com/) and sign in with GitHub.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select your GitHub repository (`aeropulse-pune`).
4. Configure the Web Service settings:
   * **Name**: `aeropulse-backend` (or your preferred name)
   * **Region**: *Singapore* or *Frankfurt* (select closest to India)
   * **Root Directory**: `backend`
   * **Environment**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Plan**: `Free`
5. Click **Create Web Service**.
6. Wait 2–3 minutes while Render installs dependencies, initializes the database, and starts Uvicorn.
7. Once deployed, copy your backend URL:
   `https://aeropulse-backend.onrender.com`
   *(Test by visiting `https://aeropulse-backend.onrender.com/docs` to see Swagger UI)*.

---

### Step 3: Deploy Frontend to Vercel (Free)

1. Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository (`aeropulse-pune`).
4. Configure the Project:
   * **Framework Preset**: `Vite` (automatically detected)
   * **Root Directory**: Click *Edit* and select `frontend`
   * **Build Command**: `npm run build` (default)
   * **Output Directory**: `dist` (default)
5. **Environment Variables**:
   * Add a new environment variable:
     * **Name**: `VITE_API_BASE_URL`
     * **Value**: `https://aeropulse-backend.onrender.com/api` *(use your Render URL from Step 2 with `/api`)*
6. Click **Deploy**.
7. In ~30 seconds, your site will be live at `https://aeropulse-pune.vercel.app`! 🎉

---

## 🛠️ Alternative: Deploy Backend with Docker

If you prefer containerized deployment on Render, Railway, or Fly.io, a production `Dockerfile` is already included in `backend/Dockerfile`:

```bash
# Build locally or on cloud
docker build -t aeropulse-backend ./backend
docker run -p 8000:8000 aeropulse-backend
```

On **Render** or **Railway**, simply select **Docker** as the Environment, and it will build and run automatically!

---

## ⚙️ Environment Variables Summary

### Backend (`Render` / `Railway`)
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Optional | Defaults to SQLite (`sqlite:///./pune_aqi.db`). Can be set to PostgreSQL if using cloud DB. |
| `DATA_GOV_API_KEY` | Optional | Your official data.gov.in API key. If empty, the demo fallback layer runs smoothly. |
| `TIMEZONE` | Optional | Defaults to `Asia/Kolkata`. |

### Frontend (`Vercel`)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | URL pointing to your deployed backend API (e.g. `https://aeropulse-backend.onrender.com/api`). |

---

## 🧪 Post-Deployment Checklist

- [ ] Open your Vercel URL (e.g. `https://aeropulse-pune.vercel.app`).
- [ ] Verify the Overview dashboard loads 12 Pune stations.
- [ ] Navigate to the **AQI Prediction** page (`/#/aqi-prediction`).
- [ ] Select different future dates and verify the multi-day forecast timeline and machine learning prediction update.
- [ ] Test the Interactive Map and Exposure Dosimetry Calculator.
