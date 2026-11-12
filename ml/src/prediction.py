
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from ml.src.preprocessing import (
    FEATURES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
)

MODEL_PATH = (
    Path(__file__).resolve().parents[1]
    / "models"
    / "heartguard_final_pipeline.joblib"
)


@lru_cache(maxsize=1)
def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Trained model not found: {MODEL_PATH}"
        )

    return joblib.load(MODEL_PATH)


def get_allowed_categories(model):
    """Get categorical values learned by the fitted encoder."""

    preprocessor = model.named_steps["preprocessor"]

    encoder = (
        preprocessor
        .named_transformers_["categorical"]
        .named_steps["encoder"]
    )

    return {
        feature: {
            str(category) for category in categories
        }
        for feature, categories in zip(
            CATEGORICAL_FEATURES,
            encoder.categories_,
        )
    }


def prepare_patient_data(patient_data, model=None):
    if not isinstance(patient_data, dict):
        raise TypeError("Patient data must be a dictionary.")

    missing_features = set(FEATURES) - set(patient_data)
    extra_features = set(patient_data) - set(FEATURES)

    if missing_features:
        raise ValueError(
            f"Missing features: {sorted(missing_features)}"
        )

    if extra_features:
        raise ValueError(
            f"Unexpected features: {sorted(extra_features)}"
        )

    if model is None:
        model = load_model()

    allowed_categories = get_allowed_categories(model)

    row = {}

    # Numerical feature normalization
    for feature in NUMERICAL_FEATURES:
        value = patient_data[feature]

        if pd.isna(value):
            row[feature] = np.nan
            continue

        if isinstance(value, (bool, np.bool_)):
            raise ValueError(
                f"{feature} must be numeric, not boolean."
            )

        try:
            numeric_value = float(value)
        except (TypeError, ValueError):
            raise ValueError(
                f"{feature} must be numeric or missing."
            ) from None

        if not np.isfinite(numeric_value):
            raise ValueError(
                f"{feature} must be finite or missing."
            )
        # Match the zero-value rules used during dataset preparation.
        if feature in ["chol", "trestbps"] and numeric_value == 0:
            row[feature] = np.nan
        else:
            row[feature] = numeric_value
        

    # Categorical feature normalization
    for feature in CATEGORICAL_FEATURES:
        value = patient_data[feature]

        if pd.isna(value):
            row[feature] = np.nan
            continue

        if isinstance(value, (bool, np.bool_)):
            raise ValueError(
                f"{feature} must be a valid categorical value."
            )

        try:
            numeric_value = float(value)
        except (TypeError, ValueError):
            raise ValueError(
                f"{feature} must be a valid categorical value."
            ) from None

        if not np.isfinite(numeric_value):
            raise ValueError(
                f"{feature} must be finite or missing."
            )

        normalized_value = str(numeric_value)

        if normalized_value not in allowed_categories[feature]:
            raise ValueError(
                f"Invalid value for {feature}: {value}. "
                f"Allowed values: "
                f"{sorted(allowed_categories[feature])}"
            )

        row[feature] = normalized_value

    return pd.DataFrame([row], columns=FEATURES)


def predict_patient(patient_data, threshold=0.5):
    if not np.isfinite(threshold) or not 0 <= threshold <= 1:
        raise ValueError("Threshold must be between 0 and 1.")

    model = load_model()

    patient_df = prepare_patient_data(
        patient_data,
        model=model,
    )

    probabilities = model.predict_proba(patient_df)[0]

    positive_class_index = list(model.classes_).index(1)

    positive_probability = float(
        probabilities[positive_class_index]
    )

    prediction = int(positive_probability >= threshold)

    return {
        "prediction": prediction,
        "prediction_label": (
            "positive_class" if prediction == 1
            else "negative_class"
        ),
        "positive_probability": round(
            positive_probability, 4
        ),
        "threshold": threshold,
    }
