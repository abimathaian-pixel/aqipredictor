from typing import Dict, Any, Optional, Tuple

AQI_BREAKPOINTS = {
    "PM2.5": [
        (0.0, 30.0, 0, 50),
        (30.1, 60.0, 51, 100),
        (60.1, 90.0, 101, 200),
        (90.1, 120.0, 201, 300),
        (120.1, 250.0, 301, 400),
        (250.1, 500.0, 401, 500),
    ],
    "PM10": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 250.0, 101, 200),
        (250.1, 350.0, 201, 300),
        (350.1, 430.0, 301, 400),
        (430.1, 600.0, 401, 500),
    ],
    "NO2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 180.0, 101, 200),
        (180.1, 280.0, 201, 300),
        (280.1, 400.0, 301, 400),
        (400.1, 800.0, 401, 500),
    ],
    "SO2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 380.0, 101, 200),
        (380.1, 800.0, 201, 300),
        (800.1, 1600.0, 301, 400),
        (1600.1, 2000.0, 401, 500),
    ],
    "CO": [
        (0.0, 1.0, 0, 50),
        (1.01, 2.0, 51, 100),
        (2.01, 10.0, 101, 200),
        (10.01, 17.0, 201, 300),
        (17.01, 34.0, 301, 400),
        (34.01, 50.0, 401, 500),
    ],
    "O3": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 168.0, 101, 200),
        (168.1, 208.0, 201, 300),
        (208.1, 748.0, 301, 400),
        (748.1, 1000.0, 401, 500),
    ],
}

def calculate_sub_index(pollutant: str, concentration: Optional[float]) -> Optional[int]:
    """Calculate sub-index for a single pollutant using official CPCB formula."""
    if concentration is None or concentration < 0:
        return None
    
    pollutant_key = pollutant.upper()
    if pollutant_key not in AQI_BREAKPOINTS:
        return None

    breakpoints = AQI_BREAKPOINTS[pollutant_key]
    
    # Cap at lowest if below 0 (already guarded) or cap at highest bracket
    if concentration > breakpoints[-1][1]:
        return 500
    
    for b_low, b_high, i_low, i_high in breakpoints:
        if b_low <= concentration <= b_high:
            sub_index = i_low + ((i_high - i_low) / (b_high - b_low)) * (concentration - b_low)
            return int(round(sub_index))
            
    return None

def get_aqi_category(aqi: Optional[float]) -> Dict[str, Any]:
    """
    Official Indian CPCB AQI Category System
    0–50: Good
    51–100: Satisfactory
    101–200: Moderate
    201–300: Poor
    301–400: Very Poor
    401–500: Severe
    """
    if aqi is None:
        return {
            "category": "Unavailable",
            "severity": "Unknown",
            "range": "N/A",
            "color": "#94a3b8",
            "bg_color": "#f1f5f9",
            "text_color": "#475569",
            "border_color": "#cbd5e1",
            "description": "Air quality monitoring data currently unavailable for this station.",
            "health_implication": "Data not available to provide health guidance."
        }

    aqi_val = int(round(aqi))
    if aqi_val <= 50:
        return {
            "category": "Good",
            "severity": "Low",
            "range": "0–50",
            "color": "#16a34a",       # green-600
            "bg_color": "#f0fdf4",    # green-50
            "text_color": "#15803d",  # green-700
            "border_color": "#bbf7d0",# green-200
            "description": "Minimal health impact. Air quality is considered satisfactory, and air pollution poses little or no risk.",
            "health_implication": "Air quality is ideal for all individuals to enjoy outdoor activities."
        }
    elif aqi_val <= 100:
        return {
            "category": "Satisfactory",
            "severity": "Minor",
            "range": "51–100",
            "color": "#65a30d",       # lime-600
            "bg_color": "#f7fee7",    # lime-50
            "text_color": "#4d7c0f",  # lime-700
            "border_color": "#d9f99d",# lime-200
            "description": "Minor breathing discomfort to sensitive individuals. Generally acceptable air quality.",
            "health_implication": "Most people can continue regular outdoor activities. Exceptionally sensitive people should monitor symptoms."
        }
    elif aqi_val <= 200:
        return {
            "category": "Moderate",
            "severity": "Moderate",
            "range": "101–200",
            "color": "#d97706",       # amber-600
            "bg_color": "#fffbeb",    # amber-50
            "text_color": "#b45309",  # amber-700
            "border_color": "#fde68a",# amber-200
            "description": "Breathing discomfort to people with lungs, asthma, and heart diseases, and children and older adults.",
            "health_implication": "Sensitive individuals should consider reducing prolonged or intense outdoor exertion."
        }
    elif aqi_val <= 300:
        return {
            "category": "Poor",
            "severity": "High",
            "range": "201–300",
            "color": "#ea580c",       # orange-600
            "bg_color": "#fff7ed",    # orange-50
            "text_color": "#c2410c",  # orange-700
            "border_color": "#fed7aa",# orange-200
            "description": "Breathing discomfort to most people on prolonged exposure. May trigger symptoms in healthy people.",
            "health_implication": "Everyone should reduce prolonged heavy outdoor exertion. Sensitive groups should stay indoors."
        }
    elif aqi_val <= 400:
        return {
            "category": "Very Poor",
            "severity": "Very High",
            "range": "301–400",
            "color": "#dc2626",       # red-600
            "bg_color": "#fef2f2",    # red-50
            "text_color": "#b91c1c",  # red-700
            "border_color": "#fecaca",# red-200
            "description": "Respiratory illness to people on prolonged exposure. Pronounced effect on people with lung and heart diseases.",
            "health_implication": "Avoid prolonged outdoor exposure. Keep windows closed and use air purifiers where available."
        }
    else:
        return {
            "category": "Severe",
            "severity": "Critical",
            "range": "401–500",
            "color": "#7f1d1d",       # red-950 / dark maroon
            "bg_color": "#450a0a",    # dark red-950
            "text_color": "#fecaca",  # red-200
            "border_color": "#991b1b",# red-800
            "description": "Affects healthy people and seriously impacts those with existing diseases. Emergency health warning.",
            "health_implication": "Everyone should avoid all outdoor physical activity. Wear N95 masks if venturing outside is mandatory."
        }

def compute_overall_aqi(pollutants: Dict[str, Optional[float]]) -> Tuple[Optional[int], Optional[str], Dict[str, int]]:
    """
    Computes overall AQI as the maximum sub-index of measured pollutants,
    provided at least PM2.5 or PM10 is present, per CPCB guidelines.
    Returns (overall_aqi, dominant_pollutant, sub_indices_dict)
    """
    sub_indices: Dict[str, int] = {}
    for poll, val in pollutants.items():
        if val is not None:
            si = calculate_sub_index(poll, val)
            if si is not None:
                sub_indices[poll] = si

    if not sub_indices:
        return None, None, {}

    # Must contain at least PM2.5 or PM10 to form a reliable CPCB AQI
    has_pm = "PM2.5" in sub_indices or "PM10" in sub_indices
    if not has_pm:
        # Fallback to max available if PM missing
        pass

    dominant_pollutant = max(sub_indices, key=sub_indices.get)
    overall_aqi = sub_indices[dominant_pollutant]

    return overall_aqi, dominant_pollutant, sub_indices
