
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

from sklearn.linear_model import LogisticRegression

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
# 3. DEFINE FEATURE CONFIGURATIONS
# ==========================================

feature_configs = {

    "All 8 Features": all_features,

    "Without Sex": [
        f for f in all_features
        if f != "sex"
    ],

    "Without Thalach": [
        f for f in all_features
        if f != "thalach"
    ],

    "Without Age": [
        f for f in all_features
        if f != "age"
    ],

    "Without Sex and Thalach": [
        f for f in all_features
        if f not in ["sex", "thalach"]
    ],

    "Without Sex, Age and Thalach": [
        f for f in all_features
        if f not in ["sex", "age", "thalach"]
    ]

}


# ==========================================
# 4. LOAD DATASET
# ==========================================

print("\nHEARTCARE FEATURE ABLATION")
print("=" * 65)

if not DATASET_PATH.exists():
    raise FileNotFoundError(
        "Expanded dataset not found. "
        "Run expand_dataset.py first."
    )

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded successfully!")
print("Dataset shape:", df.shape)

sites = sorted(df["site"].dropna().unique())

print("\nHospital sources:")
print(sites)


# ==========================================
# 5. VALIDATE DATASET
# ==========================================

required_columns = all_features + [
    "site",
    "target_binary"
]

missing_columns = [
    column for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Required columns are missing: {missing_columns}"
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
    raise ValueError(
        "Missing or invalid target values found."
    )

if not set(df["target_binary"].unique()).issubset({0, 1}):
    raise ValueError(
        "Unexpected target classes detected."
    )

df["target_binary"] = df["target_binary"].astype(int)

# Convert all selected features to numeric
for feature in all_features:

    df[feature] = pd.to_numeric(
        df[feature],
        errors="coerce"
    )

print("\nTarget distribution:")
print(df["target_binary"].value_counts().sort_index())


# ==========================================
# 6. CREATE PREPROCESSING PIPELINE
# ==========================================

def create_pipeline(selected_features):

    # Select numerical features
    selected_numeric = [
        feature
        for feature in numeric_features
        if feature in selected_features
    ]

    # Select categorical features
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
                OneHotEncoder(
                    handle_unknown="ignore"
                )
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
# 7. EVALUATION FUNCTION
# ==========================================

def evaluate_model(y_true, predictions, scores):

    matrix = confusion_matrix(
        y_true,
        predictions,
        labels=[0, 1]
    )

    tn, fp, fn, tp = matrix.ravel()

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

    return {

        "accuracy": accuracy_score(
            y_true,
            predictions
        ),

        "balanced_accuracy": balanced_accuracy_score(
            y_true,
            predictions
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

        "roc_auc": roc_auc_score(
            y_true,
            scores
        ),

        "brier_score": brier_score_loss(
            y_true,
            scores
        ),

        "TN": int(tn),

        "FP": int(fp),

        "FN": int(fn),

        "TP": int(tp)

    }


# ==========================================
# 8. RUN FEATURE ABLATION
# ==========================================

all_results = []

total_experiments = (
    len(feature_configs) * len(sites)
)

experiment_number = 0

for config_name, selected_features in feature_configs.items():

    print("\n")
    print("=" * 65)

    print("FEATURE CONFIGURATION:", config_name)

    print("Number of features:", len(selected_features))

    print("Selected features:", selected_features)

    print("=" * 65)

    for test_site in sites:

        experiment_number += 1

        print(
            f"\nExperiment {experiment_number}"
            f"/{total_experiments}"
        )

        print("Testing hospital:", test_site)

        # Train on three hospitals
        train_data = df[
            df["site"] != test_site
        ].copy()

        # Test on the remaining hospital
        test_data = df[
            df["site"] == test_site
        ].copy()

        X_train = train_data[selected_features]

        y_train = train_data["target_binary"]

        X_test = test_data[selected_features]

        y_test = test_data["target_binary"]

        if y_train.nunique() < 2 or y_test.nunique() < 2:

            print(
                "Skipping experiment because both "
                "target classes are required."
            )

            continue

        # Create a fresh pipeline
        pipeline = create_pipeline(selected_features)

        # Fit only on training hospitals
        pipeline.fit(
            X_train,
            y_train
        )

        # Predict on held-out hospital
        predictions = pipeline.predict(X_test)

        scores = pipeline.predict_proba(
            X_test
        )[:, 1]

        # Calculate metrics
        metrics = evaluate_model(
            y_test,
            predictions,
            scores
        )

        metrics["feature_configuration"] = config_name

        metrics["number_of_features"] = len(
            selected_features
        )

        metrics["test_site"] = test_site

        metrics["training_records"] = len(train_data)

        metrics["testing_records"] = len(test_data)

        all_results.append(metrics)

        print(
            f"Balanced Accuracy: "
            f"{metrics['balanced_accuracy']:.3f}"
        )

        print(
            f"Sensitivity: "
            f"{metrics['sensitivity']:.3f}"
        )

        print(
            f"Specificity: "
            f"{metrics['specificity']:.3f}"
        )

        print(
            f"ROC-AUC: "
            f"{metrics['roc_auc']:.3f}"
        )


# ==========================================
# 9. CHECK EXPERIMENT RESULTS
# ==========================================

if not all_results:
    raise RuntimeError(
        "No experiments completed successfully."
    )

results_df = pd.DataFrame(all_results)


# ==========================================
# 10. SAVE SITE-WISE RESULTS
# ==========================================

site_results_path = (
    REPORT_DIR / "feature_ablation_site_results.csv"
)

results_df.to_csv(
    site_results_path,
    index=False
)

print("\nSite-wise results saved:")
print(site_results_path)


# ==========================================
# 11. CALCULATE SITE AVERAGES
# ==========================================

metrics_to_average = [
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
    results_df
    .groupby(
        [
            "feature_configuration",
            "number_of_features"
        ]
    )[metrics_to_average]
    .mean()
    .reset_index()
)

summary_df = summary_df.sort_values(
    by="balanced_accuracy",
    ascending=False
).reset_index(drop=True)


# ==========================================
# 12. SAVE SUMMARY RESULTS
# ==========================================

summary_path = (
    REPORT_DIR / "feature_ablation_summary.csv"
)

summary_df.to_csv(
    summary_path,
    index=False
)

print("\n")
print("=" * 90)

print("FINAL FEATURE ABLATION COMPARISON")

print(
    summary_df.round(4).to_string(index=False)
)

print("\nSummary saved:")
print(summary_path)


# ==========================================
# 13. CREATE COMPARISON CHART
# ==========================================

print("\nCreating feature ablation chart...")

chart_data = summary_df.set_index(
    "feature_configuration"
)["balanced_accuracy"]

ax = chart_data.plot(
    kind="bar",
    figsize=(12, 6)
)

ax.set_title(
    "HeartCare - Feature Ablation Comparison"
)

ax.set_xlabel(
    "Feature Configuration"
)

ax.set_ylabel(
    "Mean Site Balanced Accuracy"
)

ax.set_ylim(0, 1)

ax.grid(
    axis="y",
    alpha=0.25
)

ax.tick_params(
    axis="x",
    rotation=25
)

# Get the actual Figure object
fig = ax.get_figure()

fig.tight_layout()

chart_path = (
    REPORT_DIR / "feature_ablation_comparison.png"
)

fig.savefig(
    chart_path,
    dpi=300,
    bbox_inches="tight"
)

# Correct way to close the figure
plt.close(fig)

print("\nFeature ablation chart saved:")
print(chart_path)


# ==========================================
# 14. FINAL SUMMARY
# ==========================================

print("\n" + "=" * 65)

print("HEARTCARE FEATURE ABLATION COMPLETED!")

print("\nGenerated files:")

print("1. feature_ablation_site_results.csv")

print("2. feature_ablation_summary.csv")

print("3. feature_ablation_comparison.png")

print("\nAll files saved inside:")
print(REPORT_DIR)

print("\nNo existing trained model was modified.")

print(
    "\nIMPORTANT: Feature ablation is an exploratory "
    "experiment, not proof of clinical relevance."
)

print("=" * 65)
