
from pathlib import Path
import pandas as pd
import numpy as np

# ==========================================
# 1. PROJECT PATHS
# ==========================================

BASE_DIR = Path(__file__).parent

DATASET_DIR = BASE_DIR / "dataset"

DATASET_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_PATH = DATASET_DIR / "heart_disease_4sites.csv"


# ==========================================
# 2. DEFINE DATASET SOURCES
# ==========================================

BASE_URL = (
    "https://archive.ics.uci.edu/ml/"
    "machine-learning-databases/heart-disease/"
)

datasets = {
    "Cleveland": "processed.cleveland.data",
    "Hungarian": "processed.hungarian.data",
    "Switzerland": "processed.switzerland.data",
    "Long Beach VA": "processed.va.data"
}


# ==========================================
# 3. DEFINE COLUMN NAMES
# ==========================================

columns = [
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
    "thal",
    "num"
]


# ==========================================
# 4. DOWNLOAD AND READ DATASETS
# ==========================================

all_datasets = []

print("\nHEARTCARE DATASET EXPANSION")
print("=" * 55)

for site, filename in datasets.items():

    url = BASE_URL + filename

    print(f"\nDownloading {site} dataset...")

    try:

        data = pd.read_csv(
            url,
            header=None,
            names=columns,
            na_values=["?", "-9", -9, -9.0],
            skipinitialspace=True
        )

        print("Download successful!")
        print("Records:", len(data))

        # Record the source hospital
        data["site"] = site

        all_datasets.append(data)

    except Exception as error:

        print(f"\nFailed to download {site} dataset.")

        raise RuntimeError(
            f"Could not download {filename}: {error}"
        ) from error


# ==========================================
# 5. COMBINE FOUR DATASETS
# ==========================================

print("\nCombining all datasets...")

combined = pd.concat(
    all_datasets,
    ignore_index=True
)

print("Combined shape:", combined.shape)


# ==========================================
# 6. CONVERT FEATURES TO NUMERIC
# ==========================================

numeric_columns = columns

for column in numeric_columns:

    combined[column] = pd.to_numeric(
        combined[column],
        errors="coerce"
    )


# ==========================================
# 7. HANDLE INVALID MEASUREMENTS
# ==========================================

# Zero blood pressure and zero cholesterol
# are treated as missing measurements.

combined["trestbps"] = combined[
    "trestbps"
].replace(0, np.nan)

combined["chol"] = combined[
    "chol"
].replace(0, np.nan)


# ==========================================
# 8. HANDLE TARGET VALUES
# ==========================================

# Rows with missing targets cannot be used
# for supervised training.

before = len(combined)

combined = combined.dropna(
    subset=["num"]
).copy()

removed = before - len(combined)

print("\nRecords removed due to missing target:", removed)

# Original target must be between 0 and 4.
invalid_targets = ~combined["num"].isin(
    [0, 1, 2, 3, 4]
)

if invalid_targets.any():

    raise ValueError(
        "Unexpected target values detected."
    )

combined["num"] = combined["num"].astype(int)

# Binary target
# 0 = No disease recorded
# 1 = Disease recorded

combined["target_binary"] = (
    combined["num"] > 0
).astype(int)


# ==========================================
# 9. DISPLAY DATASET SOURCE DISTRIBUTION
# ==========================================

print("\nRECORDS BY DATA SOURCE")
print("=" * 55)

print(
    combined["site"].value_counts()
)


# ==========================================
# 10. DISPLAY TARGET DISTRIBUTION
# ==========================================

print("\nBINARY TARGET DISTRIBUTION")
print("=" * 55)

print(
    combined["target_binary"].value_counts()
)


# ==========================================
# 11. DISPLAY MISSING VALUES
# ==========================================

print("\nMISSING VALUES")
print("=" * 55)

print(
    combined[columns].isnull().sum()
)


# ==========================================
# 12. SAVE EXPANDED DATASET
# ==========================================

combined.to_csv(
    OUTPUT_PATH,
    index=False
)

print("\n" + "=" * 55)

print("HEARTCARE DATASET EXPANSION COMPLETED!")

print("Total records:", len(combined))

print("Total input features:", 13)

print("Total columns:", len(combined.columns))

print("\nSaved location:")
print(OUTPUT_PATH)

print("\nDataset structure:")
print(combined.head().to_string())

print("\nIMPORTANT:")
print(
    "Missing input values have been preserved "
    "for preprocessing during model training."
)

print(
    "The site column must not be used as a "
    "patient prediction feature."
)

print("=" * 55)
