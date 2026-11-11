
from pathlib import Path

import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline

from sklearn.linear_model import LogisticRegression

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
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
# 2. FEATURE CONFIGURATIONS
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

feature_configs = {
    "All 8 Features": all_features,

    "Without Sex": [
        feature for feature in all_features
        if feature != "sex"
    ]
}

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

print("\nHEARTCARE SUBGROUP PERFORMANCE AUDIT")
print("=" * 65)

if not DATASET_PATH.exists():
    raise FileNotFoundError(
        "Expanded dataset was not found."
    )

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded:", df.shape)

sites = sorted(df["site"].dropna().unique())


# ==========================================
# 4. VALIDATE INPUT DATA
# ==========================================

required_columns = (
    all_features + ["site", "target_binary"]
)

missing_columns = [
    column for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing columns: {missing_columns}"
    )

df["target_binary"] = pd.to_numeric(
    df["target_binary"],
    errors="coerce"
)

df["sex"] = pd.to_numeric(
    df["sex"],
    errors="coerce"
)

if df["target_binary"].isna().any():
    raise ValueError("Invalid target values.")

if df["sex"].isna().any():
    raise ValueError("Missing sex-group values.")

if not set(df["target_binary"].unique()).issubset({0, 1}):
    raise ValueError("Unexpected target labels.")

for feature in all_features:
    df[feature] = pd.to_numeric(
        df[feature],
        errors="coerce"
    )

df["target_binary"] = df["target_binary"].astype(int)


# ==========================================
# 5. CREATE PREPROCESSING PIPELINE
# ==========================================

def create_pipeline(selected_features):

    selected_numeric = [
        feature for feature in numeric_features
        if feature in selected_features
    ]

    selected_categorical = [
        feature for feature in categorical_features
        if feature in selected_features
    ]

    transformers = []

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

    preprocessor = ColumnTransformer(
        transformers=transformers
    )

    classifier = LogisticRegression(
        max_iter=2000,
        class_weight="balanced"
    )

    return Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", classifier)
    ])


# ==========================================
# 6. SUBGROUP METRIC FUNCTION
# ==========================================

def calculate_group_metrics(y_true, predictions, scores):

    tn, fp, fn, tp = confusion_matrix(
        y_true,
        predictions,
        labels=[0, 1]
    ).ravel()

    negative_count = tn + fp
    positive_count = tp + fn

    sensitivity = (
        tp / positive_count
        if positive_count > 0 else np.nan
    )

    specificity = (
        tn / negative_count
        if negative_count > 0 else np.nan
    )

    auc = (
        roc_auc_score(y_true, scores)
        if len(np.unique(y_true)) == 2
        else np.nan
    )

    balanced_accuracy = (
        (sensitivity + specificity) / 2
        if not np.isnan(sensitivity)
        and not np.isnan(specificity)
        else np.nan
    )

    return {

        "records": len(y_true),

        "negative_records": negative_count,

        "positive_records": positive_count,

        "accuracy": accuracy_score(
            y_true,
            predictions
        ),

        "balanced_accuracy": balanced_accuracy,

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

        "false_positives": fp,

        "false_negatives": fn,

        "true_positives": tp,

        "true_negatives": tn

    }


# ==========================================
# 7. RUN SITE-WISE SUBGROUP AUDIT
# ==========================================

all_results = []

for config_name, selected_features in feature_configs.items():

    print("\n" + "=" * 65)

    print("MODEL CONFIGURATION:", config_name)

    print("=" * 65)

    for test_site in sites:

        print("\nTesting hospital:", test_site)

        train_data = df[
            df["site"] != test_site
        ].copy()

        test_data = df[
            df["site"] == test_site
        ].copy()

        X_train = train_data[selected_features]

        y_train = train_data["target_binary"]

        X_test = test_data[selected_features]

        y_test = test_data["target_binary"]

        if y_train.nunique() != 2:
            raise ValueError(
                "Training data must contain both classes."
            )

        if y_test.nunique() != 2:
            raise ValueError(
                f"Test hospital {test_site} must contain "
                "both classes for the full-site comparison."
            )

        # Train on other hospitals only
        pipeline = create_pipeline(selected_features)

        pipeline.fit(X_train, y_train)

        # Predict on the held-out hospital
        predictions = pipeline.predict(X_test)

        scores = pipeline.predict_proba(X_test)[:, 1]

        # Group by recorded sex category
        for sex_value in sorted(
            test_data["sex"].dropna().unique()
        ):

            group_mask = (
                test_data["sex"] == sex_value
            )

            group_y = y_test.loc[group_mask]

            group_predictions = predictions[
                group_mask.to_numpy()
            ]

            group_scores = scores[
                group_mask.to_numpy()
            ]

            if len(group_y) == 0:
                continue

            metrics = calculate_group_metrics(
                group_y,
                group_predictions,
                group_scores
            )

            metrics["configuration"] = config_name

            metrics["test_site"] = test_site

            metrics["sex_category"] = sex_value

            metrics["small_sample_warning"] = (
                len(group_y) < 20
            )

            all_results.append(metrics)

            print(
                f"\nSex category: {sex_value}"
            )

            print(
                "Records:", metrics["records"]
            )

            print(
                "Sensitivity:",
                round(metrics["sensitivity"], 3)
                if not np.isnan(metrics["sensitivity"])
                else "Not calculable"
            )

            print(
                "Specificity:",
                round(metrics["specificity"], 3)
                if not np.isnan(metrics["specificity"])
                else "Not calculable"
            )

            if metrics["small_sample_warning"]:
                print(
                    "WARNING: Small subgroup; "
                    "results are highly uncertain."
                )


# ==========================================
# 8. SAVE SUBGROUP RESULTS
# ==========================================

results_df = pd.DataFrame(all_results)

output_path = (
    REPORT_DIR / "subgroup_performance.csv"
)

results_df.to_csv(
    output_path,
    index=False
)

print("\n" + "=" * 65)

print("SUBGROUP PERFORMANCE COMPARISON")

display_columns = [
    "configuration",
    "test_site",
    "sex_category",
    "records",
    "sensitivity",
    "specificity",
    "balanced_accuracy",
    "roc_auc",
    "small_sample_warning"
]

print(
    results_df[display_columns]
    .round(3)
    .to_string(index=False)
)


# ==========================================
# 9. FINAL SUMMARY
# ==========================================

print("\n" + "=" * 65)

print("HEARTCARE SUBGROUP AUDIT COMPLETED!")

print("\nReport saved:")
print(output_path)

print("\nIMPORTANT:")

print(
    "Sex category is used for subgroup evaluation. "
    "It is omitted from the second model's input features."
)

print(
    "Small subgroups may produce unstable metrics."
)

print(
    "This is a descriptive research audit, "
    "not proof of fairness or clinical safety."
)

print("=" * 65)
