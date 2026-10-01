from typing import Dict, Any, List
from app.services.aqi_calculator import get_aqi_category

POLLUTANT_HEALTH_IMPACTS = {
    "PM2.5": (
        "PM2.5 consists of ultra-fine inhalable particles (diameter ≤ 2.5 µm) that penetrate deep into alveolar lung tissues "
        "and can enter the systemic bloodstream. It is the leading pollutant responsible for cardiovascular and respiratory morbidity in urban corridors."
    ),
    "PM10": (
        "PM10 includes inhalable coarse particles (diameter ≤ 10 µm) originating from road dust, construction, and mechanical abrasion. "
        "It primarily settles in the upper airway, aggravating asthma, chronic bronchitis, and eye irritation."
    ),
    "NO2": (
        "Nitrogen Dioxide (NO2) is emitted primarily by motor vehicle exhausts and diesel transit. "
        "It inflames the lining of the lungs and exacerbates respiratory symptoms in asthmatics and young children."
    ),
    "SO2": (
        "Sulfur Dioxide (SO2) originates from industrial combustion and heavy fuel oil burning. "
        "Even brief exposures can induce bronchoconstriction, throat irritation, and breathing difficulties."
    ),
    "CO": (
        "Carbon Monoxide (CO) impairs the oxygen-carrying capacity of hemoglobin in blood. High levels can cause dizziness, headaches, and cardiac strain."
    ),
    "O3": (
        "Ground-level Ozone (O3) is a secondary photochemical pollutant formed in afternoon sunlight. "
        "It acts as a potent lung irritant, inducing coughing, chest tightness, and reduced lung capacity during outdoor exercise."
    )
}

def generate_health_advisory(aqi: int, dominant_pollutant: str = "PM2.5") -> Dict[str, Any]:
    cat_info = get_aqi_category(aqi)
    category = cat_info["category"]
    severity = cat_info["severity"]

    if category == "Good":
        general = "Air quality is ideal. Enjoy normal outdoor activities and sports without restriction."
        sensitive = "Safe for everyone, including children, elderly, and those with respiratory conditions."
        actions = [
            "Open windows for natural home and office ventilation.",
            "Great conditions for outdoor exercise, jogging, and cycling.",
            "No protective equipment required."
        ]
        mask = "Not required."
        outdoor = "No restrictions on outdoor exercise or activities."
        indoor = "Encourage outdoor fresh-air ventilation."

    elif category == "Satisfactory":
        general = "Air quality is acceptable. Most healthy individuals can enjoy normal outdoor activities."
        sensitive = "Unusually sensitive individuals may experience minor throat irritation or coughing after prolonged outdoor exertion."
        actions = [
            "Normal outdoor recreation is fine for the general public.",
            "Sensitive individuals should monitor for throat irritation or mild coughing.",
            "Keep emergency inhalers handy if diagnosed with asthma."
        ]
        mask = "Not needed for healthy public; optional for highly allergic individuals."
        outdoor = "Normal outdoor activity permitted; sensitive groups should avoid extreme endurance feats."
        indoor = "Natural ventilation is generally acceptable."

    elif category == "Moderate":
        general = "Air quality may cause breathing discomfort to sensitive individuals and mild irritation to others on prolonged exertion."
        sensitive = "People with asthma, heart ailments, children, and the elderly should reduce prolonged or heavy outdoor exertion."
        actions = [
            "Reduce prolonged or intense outdoor exercise during morning and evening rush hours.",
            "Sensitive groups should take frequent breaks when working or walking outside.",
            "Keep rescue medication accessible if you have asthma or COPD.",
            "Consider indoor fitness alternatives during peak traffic periods."
        ]
        mask = "Recommended for sensitive individuals during rush hour transit."
        outdoor = "Moderate outdoor exertion; avoid prolonged heavy workouts near arterial roads."
        indoor = "Close windows during high-traffic peak hours (8-11 AM, 6-9 PM)."

    elif category == "Poor":
        general = "Noticeable breathing discomfort to most people on prolonged exposure. May cause coughing, eye irritation, and fatigue."
        sensitive = "High risk of aggravated asthma, wheezing, and cardiac symptoms. Stay indoors as much as possible."
        actions = [
            "Avoid prolonged outdoor morning and evening jogging or strenuous cycling.",
            "Wear a certified N95 or well-fitting pollution mask when commuting.",
            "Use HEPA air purifiers in bedrooms if available.",
            "Keep doors and windows sealed during peak traffic and morning smog."
        ]
        mask = "Certified N95 / FFP2 mask strongly recommended for all outdoor commuters."
        outdoor = "Significantly reduce outdoor exertion; replace outdoor runs with indoor training."
        indoor = "Keep windows closed. Run air filtration if available."

    elif category == "Very Poor":
        general = "Significant respiratory illness risk for all individuals upon prolonged exposure. Throat dryness, eye stinging, and fatigue common."
        sensitive = "Severe risk of acute asthma attacks, bronchitis flare-ups, and cardiovascular stress. Remain indoors."
        actions = [
            "Avoid all non-essential outdoor physical exertion.",
            "Vulnerable groups (children, pregnant women, elderly) should strictly remain indoors.",
            "N95/FFP2 masks are mandatory for anyone stepping outdoors.",
            "Run air purifiers continuously on recirculation mode in enclosed spaces."
        ]
        mask = "Mandatory N95 / FFP2 respirator for any outdoor exposure."
        outdoor = "Strictly cancel outdoor sports, jogging, and school physical education activities."
        indoor = "Keep windows sealed. Use wet mopping instead of dry dusting to minimize indoor PM."

    else:  # Severe
        general = "Public health emergency. Extreme risk of acute respiratory distress and cardiovascular complications even in healthy individuals."
        sensitive = "Critical emergency danger. Immediate medical consultation recommended if breathing difficulty develops."
        actions = [
            "Strictly avoid all outdoor activity and stay indoors in sealed spaces.",
            "N95 / N99 respirators required for any unavoidable transit.",
            "Avoid burning any biomass, incense, or frying food without exhaust ventilation.",
            "Schools and vulnerable institutions should suspend outdoor sessions."
        ]
        mask = "N95 / N99 or equivalent high-efficiency respirator strictly required."
        outdoor = "Prohibit all outdoor physical activity."
        indoor = "Seal windows and gaps; operate HEPA filtration units at maximum settings."

    poll_impact = POLLUTANT_HEALTH_IMPACTS.get(
        dominant_pollutant,
        f"{dominant_pollutant} is currently the primary driver of the air quality index."
    )

    return {
        "aqi": aqi,
        "category": category,
        "severity": severity,
        "dominant_pollutant": dominant_pollutant,
        "general_public_advice": general,
        "sensitive_groups_advice": sensitive,
        "recommended_actions": actions,
        "mask_recommendation": mask,
        "outdoor_activity_guidance": outdoor,
        "indoor_ventilation_guidance": indoor,
        "dominant_pollutant_impact": poll_impact,
        "disclaimer": (
            "This dashboard provides general air-quality information and is not a substitute for professional medical advice. "
            "Air-quality values and forecasts are educational estimates and health recommendations follow standard CPCB and WHO guidelines."
        )
    }
