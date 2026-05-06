import shap
import numpy as np
from backend.app.ml.crop_model import crop_model

def explain_crop_prediction(features: list) -> dict:
    """
    Uses SHAP to explain why the model recommended a particular crop.
    Returns feature importance scores for the given input.
    """
    try:
        # Scale features same way model expects
        features_array = np.array(features).reshape(1, -1)
        features_scaled = crop_model.scaler.transform(features_array)

        # Create SHAP explainer
        explainer = shap.TreeExplainer(crop_model.model)
        shap_values = explainer.shap_values(features_scaled)

        # Get predicted class index
        predicted_class = crop_model.model.predict(features_scaled)[0]

        # SHAP values for predicted class
        shap_for_prediction = shap_values[predicted_class][0]

        feature_names = [
            "nitrogen", "phosphorus", "potassium",
            "temperature", "humidity", "ph", "rainfall"
        ]

        # Build explanation dict
        explanation = {}
        for name, value in zip(feature_names, shap_for_prediction):
            explanation[name] = round(float(value), 4)

        # Sort by absolute importance
        sorted_explanation = dict(
            sorted(explanation.items(),
            key=lambda x: abs(x[1]),
            reverse=True)
        )

        return {
            "feature_importance": sorted_explanation,
            "interpretation": _interpret(sorted_explanation)
        }

    except Exception as e:
        return {"error": str(e)}


def _interpret(explanation: dict) -> str:
    """
    Generates a human-readable interpretation of SHAP values.
    """
    top_features = list(explanation.items())[:3]
    parts = []

    for feature, value in top_features:
        if value > 0:
            parts.append(f"high {feature}")
        else:
            parts.append(f"low {feature}")

    return f"Prediction driven by: {', '.join(parts)}"