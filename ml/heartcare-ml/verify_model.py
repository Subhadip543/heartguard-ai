
from pathlib import Path
import joblib
import pandas as pd

# ==========================================
# 1. PROJECT PATHS
# ==========================================

BASE_DIR = Path(__file__).parent

MODEL_PATH = BASE_DIR / "models" / "heartcare_model.joblib"

DATASET_PATH = BASE_DIR / "dataset" / "heart_disease.csv"


# ==========================================
# 2. CHECK FILES
# ==========================================

print("\nHEARTCARE MODEL VERIFICATION")
print("=" * 45)

if not MODEL_PATH.exists():
    raise FileNotFoundError("Trained model file was not found!")

if not DATASET_PATH.exists():
    raise FileNotFoundError("Dataset file was not found!")

print("Model file found.")
print("Dataset file found.")


# ==========================================
# 3. LOAD TRAINED MODEL
# ==========================================

print("\nLoading trained model...")

model = joblib.load(MODEL_PATH)

print("Model loaded successfully!")


# ==========================================
# 4. LOAD SAMPLE PATIENT RECORDS
# ==========================================

df = pd.read_csv(DATASET_PATH)

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

# Check input columns
missing_columns = [
    column for column in feature_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Required features missing: {missing_columns}"
    )

# Select five records for technical testing
sample_data = df[feature_columns].head(5).copy()

print("\nSample input data:")
print(sample_data.to_string(index=False))


# ==========================================
# 5. GENERATE MODEL OUTPUT
# ==========================================

print("\nGenerating model predictions...")

predictions = model.predict(sample_data)

scores = model.predict_proba(sample_data)

# ==========================================
# 6. DISPLAY RESULTS
# ==========================================

print("\nMODEL OUTPUT")
print("=" * 45)

for index in range(len(predictions)):

    print(f"\nSample Record {index + 1}")

    if predictions[index] == 0:
        output = "Class 0 - No disease recorded"
    else:
        output = "Class 1 - Disease recorded"

    print("Predicted dataset class:", output)

    print(
        "Model positive-class score:",
        round(float(scores[index][1]), 4)
    )


# ==========================================
# 7. FINAL VERIFICATION
# ==========================================

print("\n" + "=" * 45)

print("MODEL LOADING: SUCCESS")
print("PREDICTION GENERATION: SUCCESS")
print("INPUT FEATURE CHECK: SUCCESS")

print("\nHeartCare ML model verification completed!")

print("=" * 45)
