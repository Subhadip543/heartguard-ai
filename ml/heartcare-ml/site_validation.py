
from pathlib import Path

import pandas as pd
import numpy as np
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    brier_score_loss
)


# ==========================================
# 1. PROJECT PATHS
# ==========================================

BASE_DIR = Path(__file__).parent

DATASET_PATH = (
    BASE_DIR / "dataset" / "heart_disease_4sites.csv"
)

REPORT_DIR = BASE_DIR / "reports"

REPORT_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# 2. SELECT COMMON FEATURES
# ==========================================

# These features were selected based on
# the missing-value audit across four sites.

feature_columns = [
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
# 3. LOAD DATASET
# ==========================================

print("\nHEARTCARE SITE-BASED VALIDATION")
print("=" * 60)

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded successfully!")

print("Total records:", len(df))

print("\nRecords per hospital:")
print(df["site"].value_counts())


# ==========================================
# 4. VALIDATE DATA
# ==========================================

required_columns = (
    feature_columns + ["site", "target_binary"]
)

missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Required columns missing: {missing_columns}"
    )

if df["site"].isna().any():
    raise ValueError("Hospital source information is missing.")

if df["target_binary"].isna().any():
    raise ValueError("Target values are missing.")

df["target_binary"] = pd.to_numeric(
    df["target_binary"],
    errors="coerce"
)

if df["target_binary"].isna().any():
    raise ValueError("Invalid target values.")

if not set(df["target_binary"].unique()).issubset({0, 1}):
    raise ValueError("Unexpected target class.")

df["target_binary"] = df["target_binary"].astype(int)

for column in feature_columns:
    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )

sites = sorted(df["site"].unique())

if len(sites) < 2:
    raise ValueError("At least two hospitals are required.")


# ==========================================
# 5. DISPLAY FEATURE MISSINGNESS
# ==========================================

print("\nSELECTED FEATURE MISSINGNESS")

print(
    df.groupby("site")[feature_columns]
    .apply(lambda group: group.isna().mean() * 100)
    .round(2)
)


# ==========================================
# 6. PREPROCESSING FUNCTION
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
            "numeric",
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
# 8. METRIC FUNCTION
# ==========================================

def calculate_metrics(y_true, predictions, scores):

    tn, fp, fn, tp = confusion_matrix(
        y_true,
        predictions,
        labels=[0, 1]
    ).ravel()

    sensitivity = recall_score(
        y_true,
        predictions,
        zero_division=0
    )

    specificity = (
        tn / (tn + fp)
        if (tn + fp) > 0
        else 0.0
    )

    auc = (
        roc_auc_score(y_true, scores)
        if len(np.unique(y_true)) == 2
        else np.nan
    )

    return {
        "accuracy": accuracy_score(
            y_true, predictions
        ),

        "balanced_accuracy": balanced_accuracy_score(
            y_true, predictions
        ),

        "precision": precision_score(
            y_true,
            predictions,
            zero_division=0
        ),

        "sensitivity": sensitivity,

        "specificity": specificity,

        "f1": f1_score(
            y_true,
            predictions,
            zero_division=0
        ),

        "roc_auc": auc,

        "brier_score": brier_score_loss(
            y_true,
            scores
        ),

        "TN": tn,
        "FP": fp,
        "FN": fn,
        "TP": tp
    }


# ==========================================
# 9. LEAVE-ONE-SITE-OUT VALIDATION
# ==========================================

all_metrics = []

all_predictions = []

for model_name, classifier in models.items():

    print("\n")
    print("=" * 60)
    print("MODEL:", model_name)
    print("=" * 60)

    for test_site in sites:

        print("\nTesting hospital:", test_site)

        # Test on one complete hospital
        test_data = df[df["site"] == test_site].copy()

        # Train on all other hospitals
        train_data = df[df["site"] != test_site].copy()

        X_train = train_data[feature_columns]
        y_train = train_data["target_binary"]

        X_test = test_data[feature_columns]
        y_test = test_data["target_binary"]

        print("Training records:", len(train_data))
        print("Testing records:", len(test_data))

        print(
            "Training class distribution:",
            y_train.value_counts().to_dict()
        )

        print(
            "Testing class distribution:",
            y_test.value_counts().to_dict()
        )

        if y_train.nunique() < 2 or y_test.nunique() < 2:
            raise ValueError(
                f"Both classes are required in training "
                f"and test data for {test_site}."
            )

        # Create a fresh pipeline for each hospital fold.
        # Imputation and scaling learn from training sites only.

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

        # Train without using the held-out hospital
        pipeline.fit(X_train, y_train)

        # Predict held-out hospital
        predictions = pipeline.predict(X_test)

        scores = pipeline.predict_proba(X_test)[:, 1]

        # Evaluate results
        metrics = calculate_metrics(
            y_test,
            predictions,
            scores
        )

        metrics["model"] = model_name
        metrics["test_site"] = test_site
        metrics["training_records"] = len(train_data)
        metrics["testing_records"] = len(test_data)

        all_metrics.append(metrics)

        print("\nResults:")

        for name, value in metrics.items():

            if isinstance(value, (float, np.floating)):
                print(f"{name}: {value:.4f}")

            elif name not in [
                "model",
                "test_site"
            ]:
                print(f"{name}: {value}")

        # Save each prediction
        site_predictions = test_data[
            ["site"]
        ].copy()

        site_predictions["model"] = model_name

        site_predictions["actual_class"] = y_test.values

        site_predictions["predicted_class"] = predictions

        site_predictions["positive_class_score"] = scores

        all_predictions.append(site_predictions)


# ==========================================
# 10. SAVE SITE-WISE METRICS
# ==========================================

metrics_df = pd.DataFrame(all_metrics)

metrics_path = (
    REPORT_DIR / "leave_one_site_out_results.csv"
)

metrics_df.to_csv(
    metrics_path,
    index=False
)

print("\n")
print("=" * 60)

print("SITE-WISE MODEL COMPARISON")

print(
    metrics_df[
        [
            "model",
            "test_site",
            "testing_records",
            "balanced_accuracy",
            "sensitivity",
            "specificity",
            "roc_auc"
        ]
    ].round(3).to_string(index=False)
)


# ==========================================
# 11. CALCULATE EQUAL-WEIGHT SITE AVERAGES
# ==========================================

metric_columns = [
    "accuracy",
    "balanced_accuracy",
    "precision",
    "sensitivity",
    "specificity",
    "f1",
    "roc_auc",
    "brier_score"
]

summary_df = (
    metrics_df
    .groupby("model")[metric_columns]
    .mean()
    .reset_index()
)

summary_path = (
    REPORT_DIR / "leave_one_site_out_summary.csv"
)

summary_df.to_csv(
    summary_path,
    index=False
)

print("\nEQUAL-WEIGHT SITE AVERAGES")

print(
    summary_df.round(4).to_string(index=False)
)


# ==========================================
# 12. SAVE PREDICTIONS
# ==========================================

predictions_df = pd.concat(
    all_predictions,
    ignore_index=True
)

predictions_path = (
    REPORT_DIR / "leave_one_site_out_predictions.csv"
)

predictions_df.to_csv(
    predictions_path,
    index=False
)


# ==========================================
# 13. CREATE COMPARISON CHART
# ==========================================

chart_data = metrics_df.pivot(
    index="test_site",
    columns="model",
    values="balanced_accuracy"
)

ax = chart_data.plot(
    kind="bar",
    figsize=(11, 6)
)

ax.set_title(
    "HeartCare - Leave-One-Site-Out Balanced Accuracy"
)

ax.set_xlabel("Held-Out Hospital")

ax.set_ylabel("Balanced Accuracy")

ax.set_ylim(0, 1)

ax.legend(title="Algorithm")

ax.grid(axis="y", alpha=0.25)

plt.xticks(rotation=0)

plt.tight_layout()

chart_path = (
    REPORT_DIR / "site_validation_comparison.png"
)

plt.savefig(
    chart_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()


# ==========================================
# 14. FINAL SUMMARY
# ==========================================

print("\n" + "=" * 60)

print("LEAVE-ONE-SITE-OUT VALIDATION COMPLETED!")

print("\nGenerated reports:")

print("1. leave_one_site_out_results.csv")

print("2. leave_one_site_out_summary.csv")

print("3. leave_one_site_out_predictions.csv")

print("4. site_validation_comparison.png")

print("\nAll reports saved inside:")
print(REPORT_DIR)

print("\nIMPORTANT:")
print(
    "The site column was used only to create validation folds."
)

print(
    "Only the eight selected clinical features were used "
    "as model inputs."
)

print(
    "The original trained model was not modified."
)

print(
    "These are research evaluation results, "
    "not clinical validation."
)

print("=" * 60)
