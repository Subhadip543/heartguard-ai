
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt


# ==========================================
# 1. PROJECT PATHS
# ==========================================

BASE_DIR = Path(__file__).parent

MODEL_PATH = BASE_DIR / "models" / "heartcare_model.joblib"

DATASET_PATH = BASE_DIR / "dataset" / "heart_disease.csv"

OUTPUT_DIR = BASE_DIR / "models"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# 2. DEFINE INPUT FEATURES
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


# ==========================================
# 3. CHECK REQUIRED FILES
# ==========================================

print("\nHEARTCARE EXPLAINABLE AI")
print("=" * 55)

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        "Trained model not found. Run train_model.py first."
    )

if not DATASET_PATH.exists():
    raise FileNotFoundError(
        "Heart disease dataset not found."
    )


# ==========================================
# 4. LOAD TRAINED MODEL
# ==========================================

print("\nLoading trained ML model...")

model = joblib.load(MODEL_PATH)

print("Trained model loaded successfully!")


# ==========================================
# 5. LOAD DATASET
# ==========================================

print("\nLoading dataset...")

df = pd.read_csv(DATASET_PATH)

missing_columns = [
    column for column in feature_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing input features: {missing_columns}"
    )

X = df[feature_columns].copy()

print("Dataset loaded:", X.shape)


# ==========================================
# 6. SELECT BACKGROUND AND SAMPLE DATA
# ==========================================

# Background data provides a reference for
# comparing the model's output.

background = X.sample(
    n=min(30, len(X)),
    random_state=42
)

# Select records to explain
explanation_data = X.sample(
    n=min(20, len(X)),
    random_state=7
)

print("\nBackground records:", len(background))

print(
    "Records selected for explanation:",
    len(explanation_data)
)


# ==========================================
# 7. CREATE SHAP EXPLAINER
# ==========================================

print("\nCreating SHAP Permutation Explainer...")

explainer = shap.PermutationExplainer(
    model.predict_proba,
    background,
    feature_names=feature_columns,
    seed=42
)

print("SHAP explainer created successfully!")


# ==========================================
# 8. CALCULATE SHAP VALUES
# ==========================================

print("\nCalculating feature contributions...")

# Two permutation cycles for an initial
# explanation estimate.

max_evaluations = 2 * (len(feature_columns) + 1) * 2

shap_values = explainer(
    explanation_data,
    max_evals=max_evaluations
)

# Extract explanations for dataset class 1
# Class 1 = disease recorded in the UCI target

positive_class_shap = shap_values[..., 1]

print("SHAP calculations completed!")

shap_array = np.asarray(positive_class_shap.values)

if shap_array.ndim != 2:
    raise ValueError(
        f"Unexpected SHAP output shape: {shap_array.shape}"
    )


# ==========================================
# 9. GLOBAL FEATURE IMPORTANCE
# ==========================================

print("\nCalculating feature importance...")

importance_values = np.mean(
    np.abs(shap_array),
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

print("\nFEATURE IMPORTANCE")
print("=" * 55)

print(importance_df.to_string(index=False))


# Save feature importance
importance_path = OUTPUT_DIR / "shap_feature_importance.csv"

importance_df.to_csv(
    importance_path,
    index=False
)

print("\nFeature importance saved:")
print(importance_path)


# ==========================================
# 10. GLOBAL SHAP BAR CHART
# ==========================================

print("\nCreating SHAP feature importance chart...")

shap.plots.bar(
    positive_class_shap,
    max_display=13,
    show=False
)

plt.gcf().set_size_inches(10, 7)

plt.title(
    "HeartCare - Global Feature Importance",
    fontsize=15,
    fontweight="bold"
)

plt.tight_layout()

bar_chart_path = OUTPUT_DIR / "shap_global_importance.png"

plt.savefig(
    bar_chart_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close("all")

print("Global importance chart saved:")
print(bar_chart_path)


# ==========================================
# 11. SHAP BEESWARM CHART
# ==========================================

print("\nCreating SHAP beeswarm chart...")

shap.plots.beeswarm(
    positive_class_shap,
    max_display=13,
    show=False
)

plt.gcf().set_size_inches(11, 8)

plt.title(
    "HeartCare - SHAP Feature Contributions",
    fontsize=15,
    fontweight="bold"
)

plt.tight_layout()

beeswarm_path = OUTPUT_DIR / "shap_beeswarm.png"

plt.savefig(
    beeswarm_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close("all")

print("Beeswarm chart saved:")
print(beeswarm_path)


# ==========================================
# 12. EXPLAIN ONE SAMPLE RECORD
# ==========================================

print("\nEXPLAINING ONE SAMPLE RECORD")
print("=" * 55)

sample_explanation = positive_class_shap[0]

sample_input = explanation_data.iloc[[0]]

sample_prediction = model.predict(sample_input)[0]

sample_score = model.predict_proba(
    sample_input
)[0][1]

base_value = float(
    np.asarray(sample_explanation.base_values).reshape(-1)[0]
)

if sample_prediction == 0:
    predicted_class = "Class 0 - No disease recorded"
else:
    predicted_class = "Class 1 - Disease recorded"

print("Dataset class output:", predicted_class)

print(
    "Positive-class model score:",
    round(float(sample_score), 4)
)

print(
    "Baseline model score:",
    round(base_value, 4)
)


# ==========================================
# 13. TOP CONTRIBUTING FEATURES
# ==========================================

local_values = np.asarray(
    sample_explanation.values
)

local_df = pd.DataFrame({

    "Feature": feature_columns,

    "SHAP_Value": local_values,

    "Absolute_Contribution": np.abs(local_values)

})

local_df["Direction"] = np.where(
    local_df["SHAP_Value"] > 0,
    "Increased model score",
    "Decreased model score"
)

local_df = local_df.sort_values(
    by="Absolute_Contribution",
    ascending=False
)

print("\nTOP 5 CONTRIBUTING FEATURES")
print("=" * 55)

print(
    local_df.head(5).to_string(index=False)
)


# Save individual explanation
local_path = OUTPUT_DIR / "shap_sample_explanation.csv"

local_df.to_csv(
    local_path,
    index=False
)

print("\nIndividual explanation saved:")
print(local_path)


# ==========================================
# 14. CREATE WATERFALL CHART
# ==========================================

print("\nCreating individual SHAP waterfall chart...")

shap.plots.waterfall(
    sample_explanation,
    max_display=13,
    show=False
)

plt.gcf().set_size_inches(11, 8)

plt.title(
    "HeartCare - Individual Model Explanation",
    fontsize=15,
    fontweight="bold"
)

plt.tight_layout()

waterfall_path = OUTPUT_DIR / "shap_sample_explanation.png"

plt.savefig(
    waterfall_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close("all")

print("\nWaterfall chart saved:")
print(waterfall_path)


# ==========================================
# 15. FINAL OUTPUT
# ==========================================

print("\n" + "=" * 55)

print("HEARTCARE EXPLAINABLE AI COMPLETED!")

print("\nGenerated Files:")

print("1. shap_feature_importance.csv")

print("2. shap_sample_explanation.csv")

print("3. shap_global_importance.png")

print("4. shap_beeswarm.png")

print("5. shap_sample_explanation.png")

print("\nAll files saved inside:")
print(OUTPUT_DIR)

print("=" * 55)

print("\nNOTE:")
print(
    "SHAP explains model behaviour, not medical causes."
)

print(
    "Model scores are not clinically validated "
    "disease probabilities."
)
