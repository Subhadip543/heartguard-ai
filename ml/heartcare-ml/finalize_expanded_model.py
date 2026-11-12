
from pathlib import Path
import json
import platform

import joblib
import numpy as np
import pandas as pd
import sklearn

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression


# ==========================================
# 1. PROJECT PATHS
# ==========================================

BASE_DIR = Path(__file__).parent

DATASET_PATH = (
    BASE_DIR / "dataset" / "heart_disease_4sites.csv"
)

MODEL_DIR = BASE_DIR / "models"

REPORT_DIR = BASE_DIR / "reports"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# 2. DEFINE FEATURES
# ==========================================

all_features = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "restecg",
    "thalach",
    "exang",
    "oldpeak"
]

numeric_features = [
    "age",
    "trestbps",
    "thalach",
    "oldpeak"
]

categorical_features = [
    "sex",
    "cp",
    "restecg",
    "exang"
]


# ==========================================
# 3. DEFINE MODEL CANDIDATES
# ==========================================

model_configs = {

    "All 8 Features": {
        "features": all_features,
        "filename": "heartcare_expanded_all8_candidate.joblib"
    },

    "Without Sex": {
        "features": [
            feature for feature in all_features
            if feature != "sex"
        ],
        "filename": "heartcare_expanded_without_sex_candidate.joblib"
    }

}


# ==========================================
# 4. LOAD DATASET
# ==========================================

print("\nHEARTCARE FINAL MODEL CANDIDATES")
print("=" * 65)

if not DATASET_PATH.exists():
    raise FileNotFoundError(
        "Expanded dataset not found. "
        "Run expand_dataset.py first."
    )

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded successfully!")
print("Dataset records:", len(df))


# ==========================================
# 5. VALIDATE DATASET
# ==========================================

required_columns = all_features + [
    "target_binary",
    "site"
]

missing_columns = [
    column for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing columns: {missing_columns}"
    )

if df["site"].isna().any():
    raise ValueError(
        "Hospital source information contains missing values."
    )

df["target_binary"] = pd.to_numeric(
    df["target_binary"],
    errors="coerce"
)

if df["target_binary"].isna().any():
    raise ValueError("Invalid target values found.")

if not set(df["target_binary"].unique()).issubset({0, 1}):
    raise ValueError("Unexpected target labels.")

df["target_binary"] = df["target_binary"].astype(int)

for feature in all_features:
    df[feature] = pd.to_numeric(
        df[feature],
        errors="coerce"
    )

X = df[all_features].copy()

y = df["target_binary"].copy()

print("\nTarget distribution:")
print(y.value_counts().sort_index())

print("\nHospital distribution:")
print(df["site"].value_counts())


# ==========================================
# 6. CREATE PREPROCESSOR
# ==========================================

def create_preprocessor(selected_features):

    selected_numeric = [
        feature
        for feature in numeric_features
        if feature in selected_features
    ]

    selected_categorical = [
        feature
        for feature in categorical_features
        if feature in selected_features
    ]

    transformers = []

    # Numerical preprocessing
    if selected_numeric:

        numeric_pipeline = Pipeline([
            (
                "imputer",
                SimpleImputer(strategy="median")
            ),
            (
                "scaler",
                StandardScaler()
            )
        ])

        transformers.append((
            "numeric",
            numeric_pipeline,
            selected_numeric
        ))

    # Categorical preprocessing
    if selected_categorical:

        categorical_pipeline = Pipeline([
            (
                "imputer",
                SimpleImputer(strategy="most_frequent")
            ),
            (
                "encoder",
                OneHotEncoder(handle_unknown="ignore")
            )
        ])

        transformers.append((
            "categorical",
            categorical_pipeline,
            selected_categorical
        ))

    return ColumnTransformer(
        transformers=transformers
    )


# ==========================================
# 7. CREATE FINAL MODEL PIPELINE
# ==========================================

def create_model(selected_features):

    preprocessor = create_preprocessor(
        selected_features
    )

    classifier = LogisticRegression(
        max_iter=2000,
        class_weight="balanced"
    )

    return Pipeline([
        (
            "preprocessor",
            preprocessor
        ),
        (
            "classifier",
            classifier
        )
    ])


# ==========================================
# 8. CREATE MODEL METADATA
# ==========================================

def create_metadata(
    model_name,
    selected_features,
    model_filename
):

    selected_numeric = [
        feature
        for feature in numeric_features
        if feature in selected_features
    ]

    selected_categorical = [
        feature
        for feature in categorical_features
        if feature in selected_features
    ]

    metadata = {

        "project": "HeartCare",

        "model_name": model_name,

        "algorithm": "Logistic Regression",

        "dataset": "UCI Heart Disease Four-Site Collection",

        "dataset_records": len(df),

        "hospital_sources": sorted(
            df["site"].unique().tolist()
        ),

        "input_features": selected_features,

        "numeric_features": selected_numeric,

        "categorical_features": selected_categorical,

        "target_column": "target_binary",

        "target_mapping": {
            "0": "No disease recorded",
            "1": "Disease recorded"
        },

        "classification_threshold": 0.50,

        "imputation": {
            "numeric": "median",
            "categorical": "most_frequent"
        },

        "scaling": "StandardScaler",

        "categorical_encoding": "OneHotEncoder",

        "unknown_categories": "Ignored by encoder",

        "site_column_used_as_input": False,

        "model_file": model_filename,

        "python_version": platform.python_version(),

        "sklearn_version": sklearn.__version__,

        "clinical_diagnosis": False,

        "clinical_validation": False,

        "probability_calibration_validated": False,

        "purpose": "Educational ML research prototype",

        "important_note": (
            "The model predicts a binary UCI dataset label. "
            "It does not diagnose a specific heart disease."
        )

    }

    return metadata


# ==========================================
# 9. GENERATE FEATURE SCHEMA
# ==========================================

schema = {

    "schema_name": "HeartCare Expanded Model Input",

    "schema_version": "1.0",

    "features": {},

    "target": {
        "name": "target_binary",
        "classes": {
            "0": "No disease recorded",
            "1": "Disease recorded"
        }
    }

}

for feature in all_features:

    if feature in numeric_features:

        schema["features"][feature] = {

            "type": "number",

            "nullable": True,

            "observed_min": float(
                df[feature].min()
            ),

            "observed_max": float(
                df[feature].max()
            )

        }

    else:

        categories = sorted(
            df[feature].dropna().unique().tolist()
        )

        schema["features"][feature] = {

            "type": "categorical_number",

            "nullable": True,

            "allowed_categories": [
                float(value)
                for value in categories
            ]

        }


schema_path = MODEL_DIR / "expanded_feature_schema.json"

with open(
    schema_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(schema, file, indent=4)

print("\nFeature schema saved:")
print(schema_path)


# ==========================================
# 10. TRAIN AND SAVE CANDIDATE MODELS
# ==========================================

saved_models = []

for model_name, config in model_configs.items():

    selected_features = config["features"]

    filename = config["filename"]

    model_path = MODEL_DIR / filename

    print("\n" + "=" * 65)

    print("TRAINING:", model_name)

    print("Input features:", selected_features)

    print("=" * 65)

    # Create a new model
    model = create_model(selected_features)

    # Fit on all four-site records
    model.fit(
        X[selected_features],
        y
    )

    # Technical smoke test using one dataset record.
    sample = X[selected_features].head(1)

    prediction = model.predict(sample)

    score = model.predict_proba(sample)[0, 1]

    # Export model
    joblib.dump(
        model,
        model_path
    )

    # Save metadata
    metadata = create_metadata(
        model_name,
        selected_features,
        filename
    )

    metadata_path = MODEL_DIR / (
        filename.replace(
            ".joblib",
            "_metadata.json"
        )
    )

    with open(
        metadata_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(metadata, file, indent=4)

    # Verify saved artifact can be reloaded
    loaded_model = joblib.load(model_path)

    check_prediction = loaded_model.predict(sample)

    if not np.array_equal(prediction, check_prediction):
        raise RuntimeError(
            f"Reload verification failed for {model_name}"
        )

    print("\nModel saved successfully!")
    print("Model:", model_path)
    print("Metadata:", metadata_path)

    print("Smoke-test output class:", int(prediction[0]))

    print(
        "Positive-class score:",
        round(float(score), 4)
    )

    saved_models.append({
        "model": model_name,
        "model_file": filename,
        "metadata_file": metadata_path.name,
        "features": len(selected_features),
        "training_records": len(df),
        "verification": "Passed"
    })


# ==========================================
# 11. SAVE TRAINING SUMMARY
# ==========================================

summary_df = pd.DataFrame(saved_models)

summary_path = REPORT_DIR / "final_candidate_summary.csv"

summary_df.to_csv(
    summary_path,
    index=False
)


# ==========================================
# 12. FINAL MESSAGE
# ==========================================

print("\n" + "=" * 65)

print("HEARTCARE EXPANDED MODEL TRAINING COMPLETED!")

print("\nCandidate models:")

print(summary_df.to_string(index=False))

print("\nGenerated model files:")

for item in saved_models:
    print(item["model_file"])
    print(item["metadata_file"])

print("\nFeature schema:")
print(schema_path)

print("\nTraining summary:")
print(summary_path)

print("\nIMPORTANT:")

print(
    "These are experimental candidates trained on all "
    "920 records."
)

print(
    "Their training predictions are not evidence "
    "of unseen-record performance."
)

print(
    "The previous site-validation results remain "
    "the available cross-site evaluation evidence."
)

print(
    "Do not interpret model scores as clinical "
    "disease probabilities."
)

print("=" * 65)
