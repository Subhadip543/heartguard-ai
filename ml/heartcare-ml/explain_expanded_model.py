
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt

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

REPORT_DIR = BASE_DIR / "reports"

REPORT_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# 2. DEFINE MODEL FEATURES
# ==========================================

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
# 3. EXPLANATION SETTINGS
# ==========================================

BACKGROUND_SIZE = 30

EXAMPLES_PER_SITE = 10

PERMUTATION_CYCLES = 5

MAX_EVALUATIONS = (
    2 * (len(feature_columns) + 1)
    * PERMUTATION_CYCLES
)


# ==========================================
# 4. LOAD DATASET
# ==========================================

print("\nHEARTCARE EXPANDED MODEL EXPLAINABILITY")

print("=" * 65)

if not DATASET_PATH.exists():
    raise FileNotFoundError(
        "Expanded dataset not found."
    )

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded:", df.shape)


# ==========================================
# 5. VALIDATE INPUT
# ==========================================

required_columns = feature_columns + [
    "site",
    "target_binary"
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
        "Hospital information contains missing values."
    )

df["target_binary"] = pd.to_numeric(
    df["target_binary"],
    errors="coerce"
)

if df["target_binary"].isna().any():
    raise ValueError(
        "Invalid target values detected."
    )

df["target_binary"] = df["target_binary"].astype(int)

if not set(df["target_binary"].unique()).issubset({0, 1}):
    raise ValueError("Unexpected target classes.")

for feature in feature_columns:

    df[feature] = pd.to_numeric(
        df[feature],
        errors="coerce"
    )

sites = sorted(df["site"].unique())

print("\nHospital sources:", sites)


# ==========================================
# 6. CREATE PREPROCESSING PIPELINE
# ==========================================

def create_model():

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

    preprocessor = ColumnTransformer([
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

    classifier = LogisticRegression(
        max_iter=2000,
        class_weight="balanced"
    )

    return Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", classifier)
    ])


# ==========================================
# 7. STORE EXPLANATIONS
# ==========================================

all_shap_values = []

all_base_values = []

all_explanation_data = []

all_prediction_reports = []


# ==========================================
# 8. EXPLAIN EACH HELD-OUT HOSPITAL
# ==========================================

for test_site in sites:

    print("\n" + "=" * 65)

    print("EXPLAINING HELD-OUT HOSPITAL:", test_site)

    print("=" * 65)

    # Training data excludes the test hospital
    train_data = df[
        df["site"] != test_site
    ].copy()

    # Test data contains only the held-out hospital
    test_data = df[
        df["site"] == test_site
    ].copy()

    X_train = train_data[feature_columns]

    y_train = train_data["target_binary"]

    if y_train.nunique() != 2:
        raise ValueError(
            "Training data must contain both target classes."
        )

    # Train a fresh fold model
    fold_model = create_model()

    fold_model.fit(
        X_train,
        y_train
    )

    print("Fold model trained successfully.")

    print("Training records:", len(train_data))

    print("Held-out records:", len(test_data))


    # ======================================
    # SELECT BACKGROUND RECORDS
    # ======================================

    background = X_train.sample(
        n=min(BACKGROUND_SIZE, len(X_train)),
        random_state=42
    )

    # Select a reproducible sample to explain
    explain_data = test_data.sample(
        n=min(EXAMPLES_PER_SITE, len(test_data)),
        random_state=42
    )

    explain_data = explain_data[feature_columns]

    print(
        "Records selected for explanation:",
        len(explain_data)
    )


    # ======================================
    # CREATE PREDICTION FUNCTION
    # ======================================

    def predict_proba_function(input_data):

        if isinstance(input_data, pd.DataFrame):

            input_frame = input_data[
                feature_columns
            ].copy()

        else:

            input_frame = pd.DataFrame(
                input_data,
                columns=feature_columns
            )

        return fold_model.predict_proba(
            input_frame
        )


    # ======================================
    # CREATE PERMUTATION EXPLAINER
    # ======================================

    print("\nCreating SHAP Permutation Explainer...")

    explainer = shap.PermutationExplainer(
        predict_proba_function,
        background,
        feature_names=feature_columns,
        seed=42
    )


    # ======================================
    # CALCULATE SHAP VALUES
    # ======================================

    print("Calculating SHAP contributions...")

    shap_result = explainer(
        explain_data,
        max_evals=MAX_EVALUATIONS
    )

    # Select explanations for class 1
    positive_explanation = shap_result[..., 1]

    values = np.asarray(
        positive_explanation.values
    )

    base_values = np.asarray(
        positive_explanation.base_values
    ).reshape(-1)

    if values.shape != (
        len(explain_data),
        len(feature_columns)
    ):

        raise ValueError(
            "Unexpected SHAP output shape: "
            f"{values.shape}"
        )

    print("SHAP values calculated successfully.")

    all_shap_values.append(values)

    all_base_values.append(base_values)

    all_explanation_data.append(
        explain_data.reset_index(drop=True)
    )


    # ======================================
    # SAVE LOCAL PREDICTION REPORT
    # ======================================

    predictions = fold_model.predict(
        explain_data
    )

    probabilities = fold_model.predict_proba(
        explain_data
    )[:, 1]

    report = explain_data.reset_index(drop=True).copy()

    report["site"] = test_site

    # Match each explanation to its actual label
    report["actual_class"] = (
        df.loc[explain_data.index, "target_binary"]
        .to_numpy()
    )

    report["predicted_class"] = predictions

    report["positive_class_score"] = probabilities

    report["baseline_score"] = base_values

    for index, feature in enumerate(feature_columns):

        report[f"shap_{feature}"] = values[:, index]

    all_prediction_reports.append(report)


    # ======================================
    # SAVE ONE WATERFALL CHART PER HOSPITAL
    # ======================================

    print("Creating individual explanation chart...")

    shap.plots.waterfall(
        positive_explanation[0],
        max_display=8,
        show=False
    )

    figure = plt.gcf()

    figure.set_size_inches(11, 7)

    safe_site = (
        test_site.lower()
        .replace(" ", "_")
        .replace("-", "_")
    )

    waterfall_path = (
        REPORT_DIR /
        f"shap_heldout_{safe_site}.png"
    )

    figure.savefig(
        waterfall_path,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close(figure)

    print("Waterfall chart saved:", waterfall_path)


# ==========================================
# 9. COMBINE HELD-OUT EXPLANATIONS
# ==========================================

print("\nCombining four hospital explanations...")

combined_values = np.vstack(
    all_shap_values
)

combined_base_values = np.concatenate(
    all_base_values
)

combined_data = pd.concat(
    all_explanation_data,
    ignore_index=True
)

global_explanation = shap.Explanation(
    values=combined_values,
    base_values=combined_base_values,
    data=combined_data.to_numpy(),
    feature_names=feature_columns
)

print(
    "Total explained records:",
    len(combined_data)
)


# ==========================================
# 10. GLOBAL SHAP FEATURE IMPORTANCE
# ==========================================

importance_values = np.mean(
    np.abs(combined_values),
    axis=0
)

importance_df = pd.DataFrame({

    "Feature": feature_columns,

    "Mean_Absolute_SHAP": importance_values

})

importance_df = importance_df.sort_values(
    by="Mean_Absolute_SHAP",
    ascending=False
).reset_index(drop=True)

print("\nGLOBAL FEATURE IMPORTANCE")

print(
    importance_df.to_string(index=False)
)

importance_path = (
    REPORT_DIR /
    "expanded_shap_global_importance.csv"
)

importance_df.to_csv(
    importance_path,
    index=False
)

print("\nGlobal importance saved:", importance_path)


# ==========================================
# 11. GLOBAL SHAP BAR CHART
# ==========================================

print("\nCreating global feature importance chart...")

shap.plots.bar(
    global_explanation,
    max_display=8,
    show=False
)

figure = plt.gcf()

figure.set_size_inches(10, 7)

plt.title(
    "HeartCare - Expanded Model Feature Importance"
)

plt.tight_layout()

bar_path = (
    REPORT_DIR /
    "expanded_shap_global_importance.png"
)

figure.savefig(
    bar_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close(figure)

print("Global SHAP chart saved:", bar_path)


# ==========================================
# 12. GLOBAL SHAP BEESWARM
# ==========================================

print("\nCreating global SHAP beeswarm...")

shap.plots.beeswarm(
    global_explanation,
    max_display=8,
    show=False
)

figure = plt.gcf()

figure.set_size_inches(11, 8)

plt.title(
    "HeartCare - Expanded Model SHAP Contributions"
)

plt.tight_layout()

beeswarm_path = (
    REPORT_DIR /
    "expanded_shap_beeswarm.png"
)

figure.savefig(
    beeswarm_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close(figure)

print("Beeswarm chart saved:", beeswarm_path)


# ==========================================
# 13. SAVE ALL EXPLANATION REPORTS
# ==========================================

prediction_report = pd.concat(
    all_prediction_reports,
    ignore_index=True
)

prediction_path = (
    REPORT_DIR /
    "expanded_shap_heldout_predictions.csv"
)

prediction_report.to_csv(
    prediction_path,
    index=False
)


# ==========================================
# 14. SAVE EXPLANATION SETTINGS
# ==========================================

settings = {

    "model": "Logistic Regression",

    "feature_configuration": "All 8 Features",

    "feature_names": feature_columns,

    "validation_method": "Leave-One-Site-Out",

    "number_of_hospitals": len(sites),

    "explained_records_per_hospital": EXAMPLES_PER_SITE,

    "background_records": BACKGROUND_SIZE,

    "permutation_cycles": PERMUTATION_CYCLES,

    "max_evaluations": MAX_EVALUATIONS,

    "explained_class": 1,

    "clinical_diagnosis": False,

    "note": (
        "SHAP values explain model behaviour. "
        "They do not establish medical causes."
    )

}

import json

settings_path = (
    REPORT_DIR /
    "expanded_shap_settings.json"
)

with open(
    settings_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(settings, file, indent=4)


# ==========================================
# 15. FINAL SUMMARY
# ==========================================

print("\n" + "=" * 65)

print("HEARTCARE EXPANDED SHAP COMPLETED!")

print("\nGenerated files:")

print("1. expanded_shap_global_importance.csv")

print("2. expanded_shap_heldout_predictions.csv")

print("3. expanded_shap_global_importance.png")

print("4. expanded_shap_beeswarm.png")

print("5. expanded_shap_settings.json")

print("6. Four hospital-specific waterfall charts")

print("\nAll files saved inside:")
print(REPORT_DIR)

print("\nIMPORTANT:")

print(
    "Temporary models were trained without the "
    "hospital being explained."
)

print(
    "The saved all-data candidate models were not modified."
)

print(
    "These explanations describe model behaviour, "
    "not clinical causes or diagnoses."
)

print("=" * 65)
