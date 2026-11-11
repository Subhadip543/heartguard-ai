
from pathlib import Path
import json
import warnings

import joblib
import numpy as np
import pandas as pd
import sklearn


# ==========================================
# 1. PROJECT CONFIGURATION
# ==========================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_DIR = BASE_DIR / "models"

SCHEMA_PATH = MODEL_DIR / "expanded_feature_schema.json"

# Available model candidates
MODEL_OPTIONS = {
    "all8": {
        "model_file": "heartcare_expanded_all8_candidate.joblib",
        "metadata_file": "heartcare_expanded_all8_candidate_metadata.json"
    },

    "without_sex": {
        "model_file": "heartcare_expanded_without_sex_candidate.joblib",
        "metadata_file": "heartcare_expanded_without_sex_candidate_metadata.json"
    }
}

# Cache loaded models to avoid loading them repeatedly
MODEL_CACHE = {}


# ==========================================
# 2. MEDICAL SAFETY DISCLAIMER
# ==========================================

DISCLAIMER = (
    "HeartCare is an educational machine-learning research prototype. "
    "Its output represents a classification based on historical UCI "
    "Heart Disease dataset labels. It is not a medical diagnosis, "
    "a validated clinical risk estimate, or a substitute for "
    "professional medical evaluation."
)


# ==========================================
# 3. LOAD MODEL AND METADATA
# ==========================================

def load_model(model_name="all8"):
    """
    Load a trained HeartCare model and its metadata.

    Supported models:
        all8
        without_sex
    """

    if model_name not in MODEL_OPTIONS:
        raise ValueError(
            "Invalid model name. Choose 'all8' or 'without_sex'."
        )

    # Return cached model if already loaded
    if model_name in MODEL_CACHE:
        return MODEL_CACHE[model_name]

    config = MODEL_OPTIONS[model_name]

    model_path = MODEL_DIR / config["model_file"]

    metadata_path = MODEL_DIR / config["metadata_file"]

    # Check required files
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model file not found: {model_path}"
        )

    if not metadata_path.exists():
        raise FileNotFoundError(
            f"Model metadata not found: {metadata_path}"
        )

    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(
            f"Feature schema not found: {SCHEMA_PATH}"
        )

    # Load metadata
    with open(
        metadata_path,
        "r",
        encoding="utf-8"
    ) as file:

        metadata = json.load(file)

    # Load feature schema
    with open(
        SCHEMA_PATH,
        "r",
        encoding="utf-8"
    ) as file:

        schema = json.load(file)

    # Verify feature information
    features = metadata.get("input_features")

    if not features:
        raise ValueError(
            "Input feature information is missing from metadata."
        )

    if not all(feature in schema["features"] for feature in features):
        raise ValueError(
            "Model features do not match the feature schema."
        )

    # Load trusted model artifact
    model = joblib.load(model_path)

    # Warn if the installed scikit-learn version differs
    saved_version = metadata.get("sklearn_version")

    if saved_version and saved_version != sklearn.__version__:

        warnings.warn(
            f"Model was created using scikit-learn {saved_version}, "
            f"but current version is {sklearn.__version__}. "
            "Use a compatible version and verify predictions.",
            RuntimeWarning
        )

    MODEL_CACHE[model_name] = {
        "model": model,
        "metadata": metadata,
        "schema": schema
    }

    print(
        f"HeartCare model loaded successfully: {model_name}"
    )

    return MODEL_CACHE[model_name]


# ==========================================
# 4. VALIDATE PATIENT INPUT
# ==========================================

def prepare_input(patient_data, metadata, schema):
    """
    Validate and prepare patient features.

    All model feature keys must be supplied.
    Missing measurements can be represented by None.
    The model pipeline will handle missing values.
    """

    if not isinstance(patient_data, dict):
        raise TypeError(
            "Patient input must be a dictionary."
        )

    features = metadata["input_features"]

    # Check required keys
    missing_keys = [
        feature
        for feature in features
        if feature not in patient_data
    ]

    if missing_keys:
        raise ValueError(
            f"Missing required feature keys: {missing_keys}. "
            "Use None for unavailable measurements."
        )

    prepared_data = {}

    for feature in features:

        raw_value = patient_data[feature]

        # Missing measurements are allowed.
        if raw_value is None:
            prepared_data[feature] = np.nan
            continue

        if isinstance(raw_value, str) and not raw_value.strip():
            prepared_data[feature] = np.nan
            continue

        # Convert feature values to numbers
        try:
            numeric_value = float(raw_value)

        except (TypeError, ValueError):
            raise ValueError(
                f"Feature '{feature}' must contain a numeric value."
            )

        if not np.isfinite(numeric_value):
            raise ValueError(
                f"Feature '{feature}' must be finite."
            )

        # Validate categorical values
        feature_schema = schema["features"][feature]

        if feature_schema["type"] == "categorical_number":

            allowed_values = feature_schema["allowed_categories"]

            if not any(
                np.isclose(numeric_value, allowed, atol=1e-8)
                for allowed in allowed_values
            ):
                raise ValueError(
                    f"Invalid category for '{feature}'. "
                    f"Allowed values: {allowed_values}"
                )

        prepared_data[feature] = numeric_value

    # Preserve the exact feature order expected by the model
    return pd.DataFrame(
        [prepared_data],
        columns=features
    )


# ==========================================
# 5. GENERATE SINGLE PREDICTION
# ==========================================

def predict_one(
    patient_data,
    model_name="all8",
    threshold=0.50
):
    """
    Generate one dataset-based binary classification.

    Class 0:
        Original UCI target num = 0.

    Class 1:
        Original UCI target num = 1, 2, 3 or 4.

    The positive_class_score is not a clinically
    validated probability of heart disease.
    """

    # Validate threshold
    if not isinstance(threshold, (int, float)):
        raise TypeError(
            "Threshold must be a number."
        )

    if not np.isfinite(threshold) or not 0 <= threshold <= 1:
        raise ValueError(
            "Threshold must be between 0 and 1."
        )

    # Load selected model
    loaded = load_model(model_name)

    model = loaded["model"]

    metadata = loaded["metadata"]

    schema = loaded["schema"]

    # Prepare patient input
    input_df = prepare_input(
        patient_data,
        metadata,
        schema
    )

    # Generate positive-class score
    scores = model.predict_proba(input_df)

    class_1_index = list(model.classes_).index(1)

    positive_score = float(
        scores[0, class_1_index]
    )

    # Apply explicit classification threshold
    predicted_class = int(
        positive_score >= threshold
    )

    # Describe original dataset label
    if predicted_class == 0:

        dataset_label = "original_target_num_0"

        label_description = (
            "The model assigned this input to dataset class 0."
        )

    else:

        dataset_label = "original_target_num_1_to_4"

        label_description = (
            "The model assigned this input to dataset class 1."
        )

    return {

        "success": True,

        "model_name": metadata["model_name"],

        "model_algorithm": metadata["algorithm"],

        "model_candidate": model_name,

        "predicted_dataset_class": predicted_class,

        "dataset_class_label": dataset_label,

        "label_description": label_description,

        "positive_class_score": round(
            positive_score,
            6
        ),

        "classification_threshold": float(threshold),

        "input_features": metadata["input_features"],

        "clinical_diagnosis": False,

        "disclaimer": DISCLAIMER

    }


# ==========================================
# 6. GENERATE MULTIPLE PREDICTIONS
# ==========================================

def predict_batch(
    patients,
    model_name="all8",
    threshold=0.50
):
    """
    Generate predictions for multiple input records.
    """

    if not isinstance(patients, list):
        raise TypeError(
            "Batch input must be a list of dictionaries."
        )

    results = []

    for index, patient in enumerate(patients):

        try:

            result = predict_one(
                patient,
                model_name=model_name,
                threshold=threshold
            )

            result["record_number"] = index + 1

            results.append(result)

        except (ValueError, TypeError, FileNotFoundError) as error:

            results.append({

                "success": False,

                "record_number": index + 1,

                "error": str(error)

            })

    return results


# ==========================================
# 7. DISPLAY AVAILABLE MODEL OPTIONS
# ==========================================

def get_available_models():
    """
    Return information about available model candidates.
    """

    available = []

    for model_name, config in MODEL_OPTIONS.items():

        available.append({

            "model_key": model_name,

            "model_file": config["model_file"],

            "metadata_file": config["metadata_file"],

            "available": (
                (MODEL_DIR / config["model_file"]).exists()
                and
                (MODEL_DIR / config["metadata_file"]).exists()
            )

        })

    return available


# ==========================================
# 8. LOCAL TEST
# ==========================================

if __name__ == "__main__":

    print("\nHEARTCARE PREDICTION MODULE TEST")

    print("=" * 55)

    print("\nAvailable models:")

    for item in get_available_models():
        print(item)

    # Example input for a software smoke test only.
    # These values are not a real patient assessment.

    demo_input = {

        "age": 63,

        "sex": 1,

        "cp": 1,

        "trestbps": 145,

        "restecg": 2,

        "thalach": 150,

        "exang": 0,

        "oldpeak": 2.3

    }

    print("\nTesting eight-feature model...")

    result = predict_one(
        demo_input,
        model_name="all8"
    )

    print("\nPrediction output:")

    print(json.dumps(result, indent=4))

    # Test the seven-feature alternative
    print("\nTesting model without sex...")

    result_without_sex = predict_one(
        demo_input,
        model_name="without_sex"
    )

    print("\nAlternative model output:")

    print(
        json.dumps(
            result_without_sex,
            indent=4
        )
    )

    print("\nPrediction module test completed!")

    print("=" * 55)
