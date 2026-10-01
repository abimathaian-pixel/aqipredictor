import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from sqlalchemy.orm import Session
from app.models.database import SessionLocal, ModelMetricRecord
from app.ml.data_pipeline import prepare_station_dataset, FEATURE_COLUMNS, FEATURE_LABELS

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

RF_MODEL_PATH = os.path.join(MODEL_DIR, "random_forest_aqi.joblib")
LR_MODEL_PATH = os.path.join(MODEL_DIR, "linear_regression_aqi.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "model_metrics.json")

def train_and_evaluate_models(db: Session = None):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        print("[ML Training] Extracting time-series dataset from database...")
        df = prepare_station_dataset(db)
        if df.empty or len(df) < 50:
            print("[ML Training] Insufficient data to train ML model.")
            return None

        # Chronological train/test split (80% train, 20% test holdout)
        dates = sorted(df["date"].unique())
        split_idx = int(len(dates) * 0.8)
        train_dates = set(dates[:split_idx])
        test_dates = set(dates[split_idx:])

        train_df = df[df["date"].isin(train_dates)].copy()
        test_df = df[df["date"].isin(test_dates)].copy()

        X_train = train_df[FEATURE_COLUMNS]
        y_train = train_df["target_next_day_aqi"]
        X_test = test_df[FEATURE_COLUMNS]
        y_test = test_df["target_next_day_aqi"]

        print(f"[ML Training] Training samples: {len(X_train)}, Testing samples: {len(X_test)}")

        # 1. Primary Model: Random Forest Regressor
        rf = RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        rf.fit(X_train, y_train)
        rf_pred = rf.predict(X_test)

        rf_mae = float(mean_absolute_error(y_test, rf_pred))
        rf_rmse = float(root_mean_squared_error(y_test, rf_pred))
        rf_r2 = float(r2_score(y_test, rf_pred))

        # 2. Baseline Model: Linear Regression
        lr = LinearRegression()
        lr.fit(X_train, y_train)
        lr_pred = lr.predict(X_test)

        lr_mae = float(mean_absolute_error(y_test, lr_pred))
        lr_rmse = float(root_mean_squared_error(y_test, lr_pred))
        lr_r2 = float(r2_score(y_test, lr_pred))

        # Feature Importance from Random Forest
        importances = rf.feature_importances_
        sorted_indices = np.argsort(importances)[::-1]
        feature_importance_list = []
        for idx in sorted_indices:
            feat_name = FEATURE_COLUMNS[idx]
            feature_importance_list.append({
                "feature": feat_name,
                "label": FEATURE_LABELS.get(feat_name, feat_name),
                "importance": round(float(importances[idx]), 4)
            })

        # Generate sample Actual vs Predicted holdout points for visualization
        test_eval_df = test_df.copy()
        test_eval_df["predicted"] = rf_pred
        # Aggregate by date across stations for clean chart
        daily_eval = test_eval_df.groupby("date").agg({
            "target_next_day_aqi": "mean",
            "predicted": "mean"
        }).reset_index()

        actual_vs_predicted = []
        for _, row in daily_eval.iterrows():
            act = round(float(row["target_next_day_aqi"]), 1)
            pred = round(float(row["predicted"]), 1)
            actual_vs_predicted.append({
                "date": str(row["date"]),
                "actual": act,
                "predicted": pred,
                "residual": round(act - pred, 1)
            })

        # Residual std dev for prediction intervals
        residual_std = float(np.std(y_test - rf_pred))

        # Save models to disk
        joblib.dump(rf, RF_MODEL_PATH)
        joblib.dump(lr, LR_MODEL_PATH)

        metrics_payload = {
            "model_name": "Random Forest Regressor (100 Trees)",
            "baseline_model_name": "Linear Regression Baseline",
            "mae": round(rf_mae, 2),
            "rmse": round(rf_rmse, 2),
            "r2": round(rf_r2, 3),
            "baseline_mae": round(lr_mae, 2),
            "baseline_rmse": round(lr_rmse, 2),
            "baseline_r2": round(lr_r2, 3),
            "residual_std": round(residual_std, 2),
            "features_used": [FEATURE_LABELS.get(f, f) for f in FEATURE_COLUMNS],
            "feature_importances": feature_importance_list,
            "sample_size": len(df),
            "test_sample_size": len(X_test),
            "actual_vs_predicted": actual_vs_predicted,
            "description": (
                "The primary model is a Random Forest Regressor trained on lagged air-quality indicators "
                "(t-1, t-2, t-3), multi-day rolling means, station pollutant concentrations, and seasonal calendar markers. "
                "The test split uses a strict chronological holdout to prevent lookahead bias."
            )
        }

        with open(METRICS_PATH, "w") as f:
            json.dump(metrics_payload, f, indent=2)

        # Record in database
        db_metric = ModelMetricRecord(
            model_name="RandomForestRegressor",
            mae=rf_mae,
            rmse=rf_rmse,
            r2=rf_r2,
            features_json=json.dumps(feature_importance_list),
            status="active"
        )
        db.add(db_metric)
        db.commit()

        print(f"[ML Training] Complete! RF MAE: {rf_mae:.2f}, RMSE: {rf_rmse:.2f}, R2: {rf_r2:.3f}")
        return metrics_payload

    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    train_and_evaluate_models()
