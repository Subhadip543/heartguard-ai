
"""
HeartGuard AI
Final Model Training and Serialization

Loads the globally selected configuration,
trains the complete preprocessing + classifier
pipeline on all 918 development records, and
serializes the fitted pipeline and metadata.

This model is an educational prototype, not
a clinically validated diagnostic system.
"""

from pathlib import Path
from datetime import datetime, timezone
import json

import joblib
import pandas as pd
import sklearn

from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

from ml.src.preprocessing import (
    DATA_PATH,
    FEATURES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    TARGET,
    load_dataset,
    build_preprocessor,
)

# --------------------------------------------------
# 1. PROJECT PATHS
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ML_ROOT = PROJECT_ROOT / "ml"

CONFIG_PATH = (
    ML_ROOT
    / "reports"
    / "tables"
    / "selected_global_configuration.json"
)

RESULTS_PATH = (
    ML_ROOT
    / "reports"
    / "tables"
    / "global_model_selection_results.csv"
)

MODEL_DIR = ML_ROOT / "models"

MODEL_PATH = MODEL_DIR / "heartguard_final_pipeline.joblib"

METADATA_PATH = MODEL_DIR / "heartguard_final_metadata.json"


# --------------------------------------------------
# 2. LOAD SELECTED CONFIGURATION
# --------------------------------------------------

def load_selected_configuration():

    if not CONFIG_PATH.exists():
        raise FileNotFoundError(
            f"Configuration file not found: {CONFIG_PATH}"
        )

    with open(CONFIG_PATH, "r") as file:
        configuration = json.load(file)

    required_keys = [
        "strategy",
        "model",
        "hyperparameters",
        "mean_balanced_accuracy",
    ]

    for key in required_keys:
        if key not in configuration:
            raise ValueError(
                f"Missing configuration field: {key}"
            )

    if configuration["model"] != "Random Forest":
        raise ValueError(
            "Unexpected selected model. "
            "Update final_train.py before training."
        )

    if configuration["strategy"] != "missing_indicators":
        raise ValueError(
            "Unexpected preprocessing strategy."
        )

    return configuration


# --------------------------------------------------
# 3. BUILD SELECTED CLASSIFIER
# --------------------------------------------------

def build_classifier(configuration):

    model_name = configuration["model"]
    parameters = configuration["hyperparameters"]

    if model_name == "Random Forest":

        return RandomForestClassifier(
            n_estimators=200,
            max_depth=parameters["max_depth"],
            min_samples_leaf=parameters["min_samples_leaf"],
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )

    raise ValueError(
        f"Unsupported model: {model_name}"
    )


# --------------------------------------------------
# 4. BUILD COMPLETE PIPELINE
# --------------------------------------------------

def build_final_pipeline(configuration):

    strategy = configuration["strategy"]

    preprocessor = build_preprocessor(strategy=strategy)
    classifier = build_classifier(configuration)

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )

    return pipeline


# --------------------------------------------------
# 5. LOAD DATASET AND VALIDATE
# --------------------------------------------------

def load_training_data():

    X, y = load_dataset()

    df = pd.read_csv(DATA_PATH)

    if len(X) != 918:
        raise ValueError(
            f"Expected 918 records, found {len(X)}."
        )

    if list(X.columns) != FEATURES:
        raise ValueError(
            "Feature order does not match expected order."
        )

    if X.isna().sum().sum() == 0:
        print(
            "Warning: No missing values found in input data."
        )

    if y.nunique() != 2:
        raise ValueError(
            "Training dataset must contain both target classes."
        )

    if "site" not in df.columns:
        raise ValueError(
            "Hospital metadata column is missing."
        )

    if df["site"].isna().any():
        raise ValueError(
            "Missing hospital labels detected."
        )

    return X, y, df


# --------------------------------------------------
# 6. CREATE MODEL METADATA
# --------------------------------------------------

def create_metadata(
    configuration,
    X,
    y,
    df,
):

    hospital_distribution = (
        df["site"]
        .value_counts()
        .sort_index()
        .to_dict()
    )

    target_distribution = (
        y.value_counts()
        .sort_index()
        .to_dict()
    )

    metadata = {
        "project": "HeartGuard AI",
        "model_name": configuration["model"],
        "preprocessing_strategy": configuration["strategy"],

        "hyperparameters": {
            "n_estimators": 200,
            "max_depth": configuration["hyperparameters"]["max_depth"],
            "min_samples_leaf": configuration["hyperparameters"]["min_samples_leaf"],
            "class_weight": "balanced",
            "random_state": 42,
        },

        "model_selection": {
            "method": "Leave-One-Site-Out Cross-Validation",
            "selection_metric": "balanced_accuracy",
            "mean_selection_balanced_accuracy": (
                configuration["mean_balanced_accuracy"]
            ),
        },

        "training": {
            "training_records": len(X),
            "training_features": X.shape[1],
            "training_hospitals": sorted(
                df["site"].unique().tolist()
            ),
            "hospital_distribution": hospital_distribution,
            "target_distribution": {
                str(key): int(value)
                for key, value in target_distribution.items()
            },
            "trained_at_utc": datetime.now(
                timezone.utc
            ).isoformat(),
        },

        "features": {
            "all": FEATURES,
            "numerical": NUMERICAL_FEATURES,
            "categorical": CATEGORICAL_FEATURES,
            "target": TARGET,
        },

        "software": {
            "scikit_learn": sklearn.__version__,
            "pandas": pd.__version__,
        },

        "artifact": MODEL_PATH.name,

        "limitations": [
            "Educational machine-learning prototype.",
            "Not clinically validated.",
            "Not intended for independent medical diagnosis.",
            "Model-selection score is not an independent "
            "performance estimate.",
        ],
    }

    return metadata


# --------------------------------------------------
# 7. TRAIN AND SAVE
# --------------------------------------------------

def main():

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    print("\nHEARTGUARD AI")
    print("FINAL MODEL TRAINING")
    print("=" * 60)

    configuration = load_selected_configuration()

    print("\nSELECTED CONFIGURATION")
    print(f"Model: {configuration['model']}")
    print(f"Strategy: {configuration['strategy']}")
    print(
        "Selection balanced accuracy: "
        f"{configuration['mean_balanced_accuracy']:.4f}"
    )

    X, y, df = load_training_data()

    print("\nTRAINING DATA")
    print(f"Records: {len(X)}")
    print(f"Features: {X.shape[1]}")
    print(f"Hospitals: {df['site'].nunique()}")

    print("\nTARGET DISTRIBUTION")
    print(y.value_counts().sort_index().to_string())

    pipeline = build_final_pipeline(configuration)

    print("\nTRAINING FINAL PIPELINE...")

    pipeline.fit(X, y)

    # Save the complete fitted pipeline.
    joblib.dump(
        pipeline,
        MODEL_PATH,
        compress=3,
    )

    # Create and save metadata.
    metadata = create_metadata(
        configuration,
        X,
        y,
        df,
    )

    with open(METADATA_PATH, "w") as file:
        json.dump(
            metadata,
            file,
            indent=4,
        )

    # --------------------------------------------------
    # 8. VERIFY SERIALIZED MODEL
    # --------------------------------------------------

    loaded_model = joblib.load(MODEL_PATH)

    sample = X.iloc[:5]

    sample_predictions = loaded_model.predict(sample)
    sample_probabilities = (
        loaded_model.predict_proba(sample)[:, 1]
    )

    print("\nSERIALIZATION VERIFICATION")
    print("Model loaded successfully.")
    print(f"Sample predictions: {sample_predictions}")
    print(
        "Sample probabilities: "
        f"{sample_probabilities.round(4)}"
    )

    print("\nFILES SAVED")
    print(f"Model: {MODEL_PATH}")
    print(f"Metadata: {METADATA_PATH}")

    print("\nFINAL MODEL TRAINING COMPLETED.")


if __name__ == "__main__":
    main()
