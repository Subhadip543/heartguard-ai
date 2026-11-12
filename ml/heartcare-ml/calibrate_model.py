
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
import sklearn
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline

from sklearn.model_selection import train_test_split, StratifiedKFold

from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV, calibration_curve

from sklearn.metrics import (
    brier_score_loss,
    log_loss,
    roc_auc_score,
    balanced_accuracy_score,
    accuracy_score,
    precision_score,
    recall_score,
    confusion_matrix
)


# ==========================================
# 1. PROJECT PATHS
# ==========================================

BASE_DIR = Path(__file__).parent

DATASET_PATH = BASE_DIR / "dataset" / "heart_disease.csv"

MODEL_DIR = BASE_DIR / "models"
REPORT_DIR = BASE_DIR / "reports"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# 2. LOAD DATASET
# ==========================================

print("\nHEARTCARE PROBABILITY CALIBRATION")
print("=" * 55)

print("Scikit-learn version:", sklearn.__version__)

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded:", df.shape)


# ==========================================
# 3. DEFINE INPUT FEATURES
# ==========================================

feature_columns = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal"
]

target_column = "num"

X = df[feature_columns].copy()

original_target = pd.to_numeric(
    df[target_column],
    errors="coerce"
)

if original_target.isna().any():
    raise ValueError("Invalid target values found.")

# 0 = No disease recorded
# 1 = Disease recorded in original UCI target

y = (original_target > 0).astype(int)

print("\nTarget distribution:")
print(y.value_counts().sort_index())


# ==========================================
# 4. DEFINE FEATURE TYPES
# ==========================================

numeric_features = [
    "age",
    "trestbps",
    "chol",
    "thalach",
    "oldpeak"
]

categorical_features = [
    "sex",
    "cp",
    "fbs",
    "restecg",
    "exang",
    "slope",
    "ca",
    "thal"
]


# ==========================================
# 5. CREATE PREPROCESSING PIPELINE
# ==========================================

def create_preprocessor():

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

    return ColumnTransformer([
        (
            "numerical",
            numeric_pipeline,
            numeric_features
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )
    ])


# ==========================================
# 6. SPLIT DATASET
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))


# ==========================================
# 7. CREATE BASE LOGISTIC REGRESSION
# ==========================================

base_model = Pipeline([
    (
        "preprocessor",
        create_preprocessor()
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=2000,
            class_weight="balanced"
        )
    )
])


# ==========================================
# 8. TRAIN ORIGINAL MODEL
# ==========================================

print("\nTraining original Logistic Regression...")

base_model.fit(X_train, y_train)

print("Original model training completed!")


# ==========================================
# 9. CREATE SIGMOID CALIBRATION
# ==========================================

print("\nCreating calibrated model...")

calibration_cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

calibrated_model = CalibratedClassifierCV(
    estimator=base_model,
    method="sigmoid",
    cv=calibration_cv,
    ensemble=False,
    n_jobs=1
)

calibrated_model.fit(X_train, y_train)

print("Sigmoid calibration completed!")


# ==========================================
# 10. GENERATE TEST SCORES
# ==========================================

print("\nGenerating test predictions...")

original_probabilities = base_model.predict_proba(
    X_test
)[:, 1]

calibrated_probabilities = calibrated_model.predict_proba(
    X_test
)[:, 1]


# ==========================================
# 11. EVALUATION FUNCTION
# ==========================================

def evaluate_model(name, probabilities):

    predictions = (
        probabilities >= 0.50
    ).astype(int)

    brier = brier_score_loss(
        y_test,
        probabilities
    )

    loss = log_loss(
        y_test,
        probabilities,
        labels=[0, 1]
    )

    auc = roc_auc_score(
        y_test,
        probabilities
    )

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    balanced_accuracy = balanced_accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    sensitivity = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    tn, fp, fn, tp = confusion_matrix(
        y_test,
        predictions,
        labels=[0, 1]
    ).ravel()

    specificity = (
        tn / (tn + fp)
        if (tn + fp) > 0
        else 0
    )

    return {
        "Model": name,
        "Brier Score": brier,
        "Log Loss": loss,
        "ROC-AUC": auc,
        "Accuracy": accuracy,
        "Balanced Accuracy": balanced_accuracy,
        "Precision": precision,
        "Sensitivity": sensitivity,
        "Specificity": specificity,
        "True Negatives": tn,
        "False Positives": fp,
        "False Negatives": fn,
        "True Positives": tp
    }


# ==========================================
# 12. COMPARE ORIGINAL AND CALIBRATED MODELS
# ==========================================

original_results = evaluate_model(
    "Original Logistic Regression",
    original_probabilities
)

calibrated_results = evaluate_model(
    "Sigmoid Calibrated Logistic Regression",
    calibrated_probabilities
)

comparison = pd.DataFrame([
    original_results,
    calibrated_results
])

print("\nCALIBRATION COMPARISON")
print("=" * 80)

print(
    comparison.round(4).to_string(index=False)
)


# ==========================================
# 13. SAVE COMPARISON RESULTS
# ==========================================

comparison_path = (
    REPORT_DIR / "calibration_comparison.csv"
)

comparison.to_csv(
    comparison_path,
    index=False
)

print("\nComparison saved:")
print(comparison_path)


# ==========================================
# 14. CREATE CALIBRATION CURVE
# ==========================================

print("\nCreating calibration chart...")

original_fraction, original_mean = calibration_curve(
    y_test,
    original_probabilities,
    n_bins=5,
    strategy="quantile"
)

calibrated_fraction, calibrated_mean = calibration_curve(
    y_test,
    calibrated_probabilities,
    n_bins=5,
    strategy="quantile"
)

plt.figure(figsize=(9, 7))

# Perfect calibration reference
plt.plot(
    [0, 1],
    [0, 1],
    linestyle="--",
    label="Perfect Calibration"
)

# Original model
plt.plot(
    original_mean,
    original_fraction,
    marker="o",
    label="Original Logistic Regression"
)

# Calibrated model
plt.plot(
    calibrated_mean,
    calibrated_fraction,
    marker="s",
    label="Sigmoid Calibrated Model"
)

plt.xlabel("Mean Predicted Positive-Class Score")

plt.ylabel("Fraction of Positive Records")

plt.title(
    "HeartCare - Probability Calibration Comparison"
)

plt.grid(alpha=0.25)

plt.legend()

plt.tight_layout()

chart_path = (
    REPORT_DIR / "calibration_curve.png"
)

plt.savefig(
    chart_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print("Calibration chart saved:")
print(chart_path)


# ==========================================
# 15. SAVE CALIBRATED MODEL AS CANDIDATE
# ==========================================

candidate_path = (
    MODEL_DIR / "heartcare_calibrated_candidate.joblib"
)

joblib.dump(
    calibrated_model,
    candidate_path
)

print("\nCalibrated candidate model saved:")
print(candidate_path)


# ==========================================
# 16. SAVE CANDIDATE METADATA
# ==========================================

metadata = {

    "model_name": "Logistic Regression",

    "calibration_method": "sigmoid",

    "calibration_cross_validation": 5,

    "input_features": feature_columns,

    "target_column": "num",

    "target_mapping": {
        "0": "No disease recorded",
        "1": "Disease recorded (original values 1 to 4)"
    },

    "purpose": "Educational research prototype",

    "clinical_diagnosis": False,

    "clinical_probability_validated": False,

    "test_split": "80/20",

    "random_state": 42,

    "sklearn_version": sklearn.__version__

}

metadata_path = (
    MODEL_DIR / "calibrated_model_metadata.json"
)

with open(
    metadata_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(metadata, file, indent=4)

print("\nMetadata saved:")
print(metadata_path)


# ==========================================
# 17. FINAL SUMMARY
# ==========================================

print("\n" + "=" * 55)

print("HEARTCARE CALIBRATION EXPERIMENT COMPLETED!")

print("\nGenerated files:")

print("1. reports/calibration_comparison.csv")

print("2. reports/calibration_curve.png")

print("3. models/heartcare_calibrated_candidate.joblib")

print("4. models/calibrated_model_metadata.json")

print("\nIMPORTANT:")
print(
    "Calibration does not establish clinical diagnostic accuracy."
)

print(
    "The existing test partition was previously examined, "
    "so these results are exploratory."
)

print("=" * 55)
