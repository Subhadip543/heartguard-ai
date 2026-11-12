
from pathlib import Path
import pandas as pd
import numpy as np

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

feature_columns = (
    numeric_features + categorical_features
)


# ==========================================
# 3. LOAD DATASET
# ==========================================

print("\nHEARTCARE SITE DISTRIBUTION AUDIT")
print("=" * 60)

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded:", df.shape)

sites = sorted(df["site"].unique())

print("\nHospital sources:")
print(sites)


# ==========================================
# 4. NUMERICAL FEATURE SUMMARY
# ==========================================

numeric_results = []

for site in sites:

    site_data = df[df["site"] == site]

    for feature in numeric_features:

        values = site_data[feature].dropna()

        numeric_results.append({

            "site": site,

            "feature": feature,

            "available_records": len(values),

            "missing_percentage": (
                site_data[feature].isna().mean() * 100
            ),

            "mean": values.mean(),

            "median": values.median(),

            "standard_deviation": values.std()

        })


numeric_summary = pd.DataFrame(numeric_results)

numeric_path = (
    REPORT_DIR / "site_numeric_distribution.csv"
)

numeric_summary.to_csv(
    numeric_path,
    index=False
)

print("\nNUMERICAL FEATURE DISTRIBUTIONS")

print(
    numeric_summary.round(2).to_string(index=False)
)


# ==========================================
# 5. STANDARDIZED MEAN DIFFERENCE
# ==========================================

smd_results = []

for site in sites:

    site_data = df[df["site"] == site]

    other_data = df[df["site"] != site]

    for feature in numeric_features:

        first = site_data[feature].dropna()

        second = other_data[feature].dropna()

        if len(first) < 2 or len(second) < 2:
            continue

        first_std = first.std()
        second_std = second.std()

        pooled_std = np.sqrt(
            (first_std ** 2 + second_std ** 2) / 2
        )

        if pooled_std == 0 or pd.isna(pooled_std):
            smd = np.nan
        else:
            smd = (
                first.mean() - second.mean()
            ) / pooled_std

        smd_results.append({

            "site": site,

            "feature": feature,

            "site_mean": first.mean(),

            "other_sites_mean": second.mean(),

            "standardized_mean_difference": smd,

            "absolute_smd": abs(smd)
            if not pd.isna(smd) else np.nan

        })


smd_df = pd.DataFrame(smd_results)

smd_path = (
    REPORT_DIR / "site_feature_smd.csv"
)

smd_df.to_csv(
    smd_path,
    index=False
)

print("\nSTANDARDIZED MEAN DIFFERENCES")

print(
    smd_df.round(3).to_string(index=False)
)


# ==========================================
# 6. CATEGORICAL FEATURE DISTRIBUTION
# ==========================================

categorical_results = []

for site in sites:

    site_data = df[df["site"] == site]

    for feature in categorical_features:

        values = (
            site_data[feature]
            .astype("string")
            .fillna("MISSING")
        )

        counts = values.value_counts(
            dropna=False
        )

        percentages = (
            counts / len(site_data) * 100
        )

        for category in counts.index:

            categorical_results.append({

                "site": site,

                "feature": feature,

                "category": str(category),

                "records": int(counts[category]),

                "percentage": percentages[category]

            })


categorical_summary = pd.DataFrame(
    categorical_results
)

categorical_path = (
    REPORT_DIR / "site_categorical_distribution.csv"
)

categorical_summary.to_csv(
    categorical_path,
    index=False
)

print("\nCATEGORICAL FEATURE DISTRIBUTIONS")

print(
    categorical_summary.round(2).to_string(index=False)
)


# ==========================================
# 7. CHECK IDENTICAL FEATURE PROFILES
# ==========================================

comparison_features = feature_columns + [
    "target_binary"
]

complete_data = df.dropna(
    subset=comparison_features
).copy()

# Group by identical feature values.
# A matching profile is only a possible overlap,
# not proof of the same individual patient.

profile_groups = (
    complete_data
    .groupby(feature_columns, dropna=False)
    .agg(
        records=("site", "size"),

        number_of_sites=("site", "nunique"),

        sites=("site", lambda values: ", ".join(
            sorted(set(values))
        )),

        number_of_target_labels=(
            "target_binary",
            "nunique"
        )
    )
    .reset_index()
)

possible_overlaps = profile_groups[
    profile_groups["number_of_sites"] > 1
].copy()

# Profiles appearing at more than one site
# with different target labels.

label_conflicts = possible_overlaps[
    possible_overlaps["number_of_target_labels"] > 1
].copy()


print("\nPOSSIBLE CROSS-SITE PROFILE OVERLAPS")

print(
    "Matching feature profiles:",
    len(possible_overlaps)
)

print(
    "Profiles with conflicting labels:",
    len(label_conflicts)
)


# Save possible overlaps

overlap_path = (
    REPORT_DIR / "possible_cross_site_overlaps.csv"
)

possible_overlaps.to_csv(
    overlap_path,
    index=False
)


# ==========================================
# 8. SAVE FINAL SUMMARY
# ==========================================

summary = {

    "total_records": len(df),

    "hospital_count": len(sites),

    "selected_features": feature_columns,

    "numeric_features": numeric_features,

    "categorical_features": categorical_features,

    "possible_cross_site_matching_profiles": len(
        possible_overlaps
    ),

    "matching_profiles_with_conflicting_labels": len(
        label_conflicts
    ),

    "note": (
        "Distribution differences and identical feature "
        "profiles are exploratory findings. They do not "
        "establish clinical or patient identity."
    )

}

import json

summary_path = (
    REPORT_DIR / "site_shift_summary.json"
)

with open(
    summary_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(summary, file, indent=4)


# ==========================================
# 9. FINAL OUTPUT
# ==========================================

print("\n" + "=" * 60)

print("HEARTCARE SITE SHIFT AUDIT COMPLETED!")

print("\nGenerated files:")

print("1. site_numeric_distribution.csv")

print("2. site_feature_smd.csv")

print("3. site_categorical_distribution.csv")

print("4. possible_cross_site_overlaps.csv")

print("5. site_shift_summary.json")

print("\nSaved inside:", REPORT_DIR)

print("\nNo model or original dataset was modified.")

print("=" * 60)
