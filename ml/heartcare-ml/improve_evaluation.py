
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline

from sklearn.model_selection import (
    train_test_split,
    RepeatedStratifiedKFold,
    StratifiedKFold,
    cross_validate,
    cross_val_predict
)

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    make_scorer
)


# ==========================================
# 1. PROJECT PATHS
# ==========================================

BASE_DIR = Path(__file__).parent

DATASET_PATH = BASE_DIR / "dataset" / "heart_disease.csv"

REPORT_DIR = BASE_DIR / "reports"
REPORT_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# 2. LOAD DATASET
# ==========================================

print("\nHEARTCARE MODEL IMPROVEMENT")
print("=" * 55)

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded successfully!")
print("Dataset shape:", df.shape)


# ==========================================
# 3. DEFINE FEATURES
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
    raise ValueError("Invalid or missing target values found.")

# Binary dataset target:
# 0 = No disease recorded
# 1 = Disease recorded (original values 1 to 4)

y = (original_target > 0).astype(int)

print("\nTarget distribution:")
print(y.value_counts().sort_index())


# ==========================================
# 4. FEATURE TYPES
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
# 5. PREPROCESSING FUNCTION
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
# 6. TRAINING DATA SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining records:", len(X_train))
print("Previously held-out test records:", len(X_test))


# ==========================================
# 7. DEFINE MODELS
# ==========================================

models = {

    "Logistic Regression": LogisticRegression(
        max_iter=2000,
        class_weight="balanced"
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=1
    )

}


# ==========================================
# 8. CUSTOM SPECIFICITY METRIC
# ==========================================

def calculate_specificity(y_true, y_pred):

    tn, fp, fn, tp = confusion_matrix(
        y_true,
        y_pred,
        labels=[0, 1]
    ).ravel()

    if tn + fp == 0:
        return 0.0

    return tn / (tn + fp)


# ==========================================
# 9. REPEATED CROSS-VALIDATION
# ==========================================

repeated_cv = RepeatedStratifiedKFold(
    n_splits=5,
    n_repeats=5,
    random_state=42
)

scoring_metrics = {

    "roc_auc": "roc_auc",

    "balanced_accuracy": "balanced_accuracy",

    "sensitivity": make_scorer(
        recall_score,
        zero_division=0
    ),

    "specificity": make_scorer(
        calculate_specificity
    ),

    "precision": make_scorer(
        precision_score,
        zero_division=0
    ),

    "f1": make_scorer(
        f1_score,
        zero_division=0
    )
}


# ==========================================
# 10. EVALUATE BOTH ALGORITHMS
# ==========================================

all_results = []

for model_name, classifier in models.items():

    print("\n" + "=" * 55)
    print(model_name)
    print("=" * 55)

    pipeline = Pipeline([
        (
            "preprocessor",
            create_preprocessor()
        ),

        (
            "classifier",
            classifier
        )
    ])

    results = cross_validate(
        pipeline,
        X_train,
        y_train,
        cv=repeated_cv,
        scoring=scoring_metrics,
        n_jobs=1,
        return_train_score=False
    )

    row = {"Model": model_name}

    print("\nRepeated 5-Fold Cross-Validation")
    print("Total evaluation folds: 25\n")

    for metric in scoring_metrics:

        values = results[f"test_{metric}"]

        mean_value = values.mean()
        std_value = values.std(ddof=1)

        row[f"{metric}_mean"] = mean_value
        row[f"{metric}_std"] = std_value

        print(
            f"{metric}: "
            f"{mean_value:.3f} "
            f"+/- {std_value:.3f}"
        )

    all_results.append(row)


# ==========================================
# 11. SAVE CROSS-VALIDATION RESULTS
# ==========================================

summary_df = pd.DataFrame(all_results)

summary_path = REPORT_DIR / "repeated_cv_results.csv"

summary_df.to_csv(
    summary_path,
    index=False
)

print("\nFINAL REPEATED CV COMPARISON")
print("=" * 55)

print(summary_df.round(3).to_string(index=False))

print("\nResults saved:", summary_path)


# ==========================================
# 12. OUT-OF-FOLD PREDICTIONS
# ==========================================

print("\nStarting threshold analysis...")

# Use Logistic Regression for this analysis.
# Keep the original held-out test partition separate.

logistic_pipeline = Pipeline([
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

# Each training record receives one prediction
# from a model that did not train on that record.

threshold_cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=2026
)

oof_probabilities = cross_val_predict(
    logistic_pipeline,
    X_train,
    y_train,
    cv=threshold_cv,
    method="predict_proba",
    n_jobs=1
)[:, 1]

print("Out-of-fold predictions generated!")


# ==========================================
# 13. THRESHOLD ANALYSIS
# ==========================================

thresholds = np.round(
    np.arange(0.20, 0.81, 0.05),
    2
)

threshold_results = []

for threshold in thresholds:

    predictions = (
        oof_probabilities >= threshold
    ).astype(int)

    tn, fp, fn, tp = confusion_matrix(
        y_train,
        predictions,
        labels=[0, 1]
    ).ravel()

    sensitivity = recall_score(
        y_train,
        predictions,
        zero_division=0
    )

    specificity = calculate_specificity(
        y_train,
        predictions
    )

    precision = precision_score(
        y_train,
        predictions,
        zero_division=0
    )

    accuracy = accuracy_score(
        y_train,
        predictions
    )

    balanced_accuracy = balanced_accuracy_score(
        y_train,
        predictions
    )

    f1 = f1_score(
        y_train,
        predictions,
        zero_division=0
    )

    threshold_results.append({

        "Threshold": threshold,

        "Accuracy": accuracy,

        "Balanced_Accuracy": balanced_accuracy,

        "Sensitivity": sensitivity,

        "Specificity": specificity,

        "Precision": precision,

        "F1_Score": f1,

        "True_Negatives": tn,

        "False_Positives": fp,

        "False_Negatives": fn,

        "True_Positives": tp

    })


threshold_df = pd.DataFrame(threshold_results)


# ==========================================
# 14. SAVE THRESHOLD RESULTS
# ==========================================

threshold_path = REPORT_DIR / "threshold_analysis.csv"

threshold_df.to_csv(
    threshold_path,
    index=False
)

print("\nTHRESHOLD COMPARISON")
print("=" * 90)

print(
    threshold_df.round(3).to_string(index=False)
)

print("\nThreshold results saved:", threshold_path)


# ==========================================
# 15. CREATE THRESHOLD CHART
# ==========================================

plt.figure(figsize=(10, 6))

plt.plot(
    threshold_df["Threshold"],
    threshold_df["Sensitivity"],
    marker="o",
    label="Sensitivity"
)

plt.plot(
    threshold_df["Threshold"],
    threshold_df["Specificity"],
    marker="o",
    label="Specificity"
)

plt.plot(
    threshold_df["Threshold"],
    threshold_df["Balanced_Accuracy"],
    marker="o",
    label="Balanced Accuracy"
)

plt.axvline(
    0.50,
    linestyle="--",
    label="Default threshold 0.50"
)

plt.xlabel("Classification Threshold")

plt.ylabel("Score")

plt.title(
    "HeartCare - Threshold Performance Analysis"
)

plt.ylim(0, 1.05)

plt.grid(alpha=0.25)

plt.legend()

plt.tight_layout()

chart_path = REPORT_DIR / "threshold_tradeoff.png"

plt.savefig(
    chart_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print("\nThreshold chart saved:", chart_path)


# ==========================================
# 16. FINAL SUMMARY
# ==========================================

print("\n" + "=" * 55)

print("HEARTCARE EVALUATION IMPROVEMENT COMPLETED!")

print("\nGenerated files:")

print("1. repeated_cv_results.csv")

print("2. threshold_analysis.csv")

print("3. threshold_tradeoff.png")

print("\nAll files saved inside:")
print(REPORT_DIR)

print("\nIMPORTANT:")
print(
    "Threshold results are exploratory. "
    "No clinical threshold has been selected."
)

print(
    "Model scores are not validated disease probabilities."
)

print("=" * 55)
