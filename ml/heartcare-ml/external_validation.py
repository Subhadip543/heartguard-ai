
from pathlib import Path

import joblib
import pandas as pd
import numpy as np

from ucimlrepo import fetch_ucirepo

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    brier_score_loss,
    log_loss
)


# ==========================================
# 1. PROJECT PATHS
# ==========================================

BASE_DIR = Path(__file__).parent

MODEL_PATH = (
    BASE_DIR / "models" / "heartcare_model.joblib"
)

ORIGINAL_DATASET_PATH = (
    BASE_DIR / "dataset" / "heart_disease.csv"
)

DATASET_DIR = BASE_DIR / "dataset"

REPORT_DIR = BASE_DIR / "reports"

DATASET_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# 2. FEATURE DEFINITIONS
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
# 3. CHECK REQUIRED FILES
# ==========================================

print("\nHEARTCARE CROSS-DATASET VALIDATION")
print("=" * 60)

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        "Trained model not found. Run train_model.py first."
    )

if not ORIGINAL_DATASET_PATH.exists():
    raise FileNotFoundError(
        "Original Cleveland dataset not found."
    )


# ==========================================
# 4. LOAD EXISTING TRAINED MODEL
# ==========================================

print("\nLoading existing Logistic Regression model...")

model = joblib.load(MODEL_PATH)

print("Existing model loaded successfully!")

print("No model retraining will be performed.")


# ==========================================
# 5. DOWNLOAD STATLOG DATASET
# ==========================================

print("\nDownloading UCI Statlog Heart Dataset...")

statlog = fetch_ucirepo(id=145)

external_features = statlog.data.features.copy()

external_target = statlog.data.targets.copy()

print("Dataset downloaded successfully!")

print("\nOriginal feature names:")
print(external_features.columns.tolist())

print("\nOriginal target columns:")
print(external_target.columns.tolist())


# ==========================================
# 6. MAP DATASET FEATURE NAMES
# ==========================================

# Statlog uses different names for some features.
# Convert them to our model's expected names.

def normalize_name(name):

    return "".join(
        character
        for character in str(name).lower()
        if character.isalnum()
    )


feature_aliases = {

    "age": "age",

    "sex": "sex",

    "chestpain": "cp",
    "chestpaintype": "cp",
    "cp": "cp",

    "restbp": "trestbps",
    "restingbloodpressure": "trestbps",
    "trestbps": "trestbps",

    "serumchol": "chol",
    "cholesterol": "chol",
    "chol": "chol",

    "fastingbloodsugar": "fbs",
    "fbs": "fbs",

    "electrocardiographic": "restecg",
    "restingecg": "restecg",
    "restecg": "restecg",

    "maxheartrate": "thalach",
    "maximumheartrate": "thalach",
    "thalach": "thalach",

    "angina": "exang",
    "exerciseinducedangina": "exang",
    "exang": "exang",

    "oldpeak": "oldpeak",

    "slope": "slope",

    "majorvessels": "ca",
    "numberofmajorvessels": "ca",
    "ca": "ca",

    "thal": "thal"
}


renamed_columns = {}

for column in external_features.columns:

    normalized = normalize_name(column)

    if normalized not in feature_aliases:

        raise ValueError(
            f"Cannot map external feature: {column}. "
            "Please check the UCI feature definitions."
        )

    new_name = feature_aliases[normalized]

    if new_name in renamed_columns.values():

        raise ValueError(
            f"Duplicate mapping detected for {new_name}"
        )

    renamed_columns[column] = new_name


external_features = external_features.rename(
    columns=renamed_columns
)

# Check all expected input features exist
if set(external_features.columns) != set(feature_columns):

    raise ValueError(
        "External dataset feature mapping is incomplete."
    )

external_features = external_features[feature_columns].copy()

print("\nFeature mapping completed successfully!")


# ==========================================
# 7. CONVERT FEATURES TO NUMERIC VALUES
# ==========================================

for column in feature_columns:

    external_features[column] = pd.to_numeric(
        external_features[column],
        errors="coerce"
    )

# Statlog is documented as having no missing values.
# Stop rather than silently passing malformed data.

if external_features.isnull().any().any():

    print("\nInvalid or missing feature values found:")

    print(
        external_features.isnull().sum()
    )

    raise ValueError(
        "Please inspect invalid values before validation."
    )


# ==========================================
# 8. CHECK CATEGORICAL VALUE COMPATIBILITY
# ==========================================

print("\nChecking categorical value compatibility...")

original_df = pd.read_csv(ORIGINAL_DATASET_PATH)

for column in categorical_features:

    original_values = set(
        original_df[column].dropna().unique()
    )

    external_values = set(
        external_features[column].unique()
    )

    unseen_values = external_values - original_values

    print(f"\n{column}")

    print("Original categories:", sorted(original_values))

    print("External categories:", sorted(external_values))

    if unseen_values:

        raise ValueError(
            f"Unseen categories in {column}: {unseen_values}. "
            "Do not silently treat these as equivalent."
        )

print("\nAll categorical values are compatible with training data!")


# ==========================================
# 9. CONVERT EXTERNAL TARGET
# ==========================================

if external_target.shape[1] != 1:

    raise ValueError(
        "Expected exactly one target column."
    )

raw_target = pd.to_numeric(
    external_target.iloc[:, 0],
    errors="coerce"
)

if raw_target.isnull().any():

    raise ValueError(
        "External target contains missing or invalid values."
    )

target_values = set(raw_target.unique())

print("\nOriginal Statlog target values:", target_values)

if not target_values.issubset({1, 2}):

    raise ValueError(
        "Unexpected Statlog target values. "
        "Expected 1 for absence and 2 for presence."
    )

# Statlog mapping:
# 1 = Absence
# 2 = Presence

y_external = raw_target.map({
    1: 0,
    2: 1
}).astype(int)

print("\nConverted target distribution:")
print(y_external.value_counts().sort_index())


# ==========================================
# 10. SAVE DOWNLOADED EXTERNAL DATASET
# ==========================================

external_csv = external_features.copy()

external_csv["target"] = y_external.values

external_dataset_path = (
    DATASET_DIR / "statlog_heart_external.csv"
)

external_csv.to_csv(
    external_dataset_path,
    index=False
)

print("\nExternal dataset saved:")
print(external_dataset_path)


# ==========================================
# 11. GENERATE PREDICTIONS
# ==========================================

print("\nGenerating predictions on Statlog records...")

# IMPORTANT:
# Existing saved model is only used for prediction.
# No fit() or retraining is performed.

predictions = model.predict(external_features)

positive_scores = model.predict_proba(
    external_features
)[:, 1]

print("External predictions generated!")


# ==========================================
# 12. EVALUATE MODEL
# ==========================================

print("\nEXTERNAL DATASET EVALUATION")
print("=" * 60)

accuracy = accuracy_score(
    y_external,
    predictions
)

balanced_accuracy = balanced_accuracy_score(
    y_external,
    predictions
)

precision = precision_score(
    y_external,
    predictions,
    zero_division=0
)

sensitivity = recall_score(
    y_external,
    predictions,
    zero_division=0
)

f1 = f1_score(
    y_external,
    predictions,
    zero_division=0
)

roc_auc = roc_auc_score(
    y_external,
    positive_scores
)

brier = brier_score_loss(
    y_external,
    positive_scores
)

loss = log_loss(
    y_external,
    positive_scores,
    labels=[0, 1]
)

tn, fp, fn, tp = confusion_matrix(
    y_external,
    predictions,
    labels=[0, 1]
).ravel()

specificity = (
    tn / (tn + fp)
    if (tn + fp) > 0
    else 0
)


# ==========================================
# 13. DISPLAY RESULTS
# ==========================================

print("\nDataset: UCI Statlog Heart")

print("Total records:", len(external_features))

print("\nEvaluation metrics:")

print("Accuracy:", round(accuracy, 4))

print(
    "Balanced Accuracy:",
    round(balanced_accuracy, 4)
)

print("Precision:", round(precision, 4))

print("Sensitivity:", round(sensitivity, 4))

print("Specificity:", round(specificity, 4))

print("F1 Score:", round(f1, 4))

print("ROC-AUC:", round(roc_auc, 4))

print("Brier Score:", round(brier, 4))

print("Log Loss:", round(loss, 4))


# ==========================================
# 14. CONFUSION MATRIX
# ==========================================

print("\nCONFUSION MATRIX")

print(
    "[[TN, FP],"
)

print(
    " [FN, TP]]"
)

print(
    confusion_matrix(
        y_external,
        predictions,
        labels=[0, 1]
    )
)

print("\nTrue Negatives:", tn)

print("False Positives:", fp)

print("False Negatives:", fn)

print("True Positives:", tp)


# ==========================================
# 15. SAVE PREDICTION DETAILS
# ==========================================

prediction_report = external_features.copy()

prediction_report["actual_class"] = y_external.values

prediction_report["predicted_class"] = predictions

prediction_report["positive_class_score"] = positive_scores

prediction_report["correct_prediction"] = (
    predictions == y_external.values
)

prediction_path = (
    REPORT_DIR / "statlog_external_predictions.csv"
)

prediction_report.to_csv(
    prediction_path,
    index=False
)

print("\nPrediction report saved:")
print(prediction_path)


# ==========================================
# 16. SAVE METRIC REPORT
# ==========================================

metrics = {

    "dataset": "UCI Statlog Heart",

    "dataset_records": len(external_features),

    "model": "Logistic Regression",

    "accuracy": float(accuracy),

    "balanced_accuracy": float(balanced_accuracy),

    "precision": float(precision),

    "sensitivity": float(sensitivity),

    "specificity": float(specificity),

    "f1_score": float(f1),

    "roc_auc": float(roc_auc),

    "brier_score": float(brier),

    "log_loss": float(loss),

    "true_negatives": int(tn),

    "false_positives": int(fp),

    "false_negatives": int(fn),

    "true_positives": int(tp),

    "classification_threshold": 0.50,

    "retrained_during_validation": False,

    "clinical_validation": False

}

metrics_path = (
    REPORT_DIR / "statlog_external_validation.json"
)

import json

with open(
    metrics_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(metrics, file, indent=4)


# ==========================================
# 17. FINAL SUMMARY
# ==========================================

print("\n" + "=" * 60)

print("HEARTCARE CROSS-DATASET VALIDATION COMPLETED!")

print("\nGenerated files:")

print("1. dataset/statlog_heart_external.csv")

print("2. reports/statlog_external_predictions.csv")

print("3. reports/statlog_external_validation.json")

print("\nExisting trained model was not modified.")

print("\nIMPORTANT:")

print(
    "This is a secondary public-dataset evaluation, "
    "not clinical validation."
)

print(
    "Model scores are not validated disease probabilities."
)

print("=" * 60)
