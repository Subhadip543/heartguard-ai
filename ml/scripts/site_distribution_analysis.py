
from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

ML_ROOT = Path(__file__).resolve().parents[1]

DATA_PATH = (
    ML_ROOT / "data/processed/heart_disease_918_cleaned.csv"
)

TABLE_DIR = ML_ROOT / "reports/tables"
FIGURE_DIR = ML_ROOT / "reports/figures"

NUMERICAL = [
    "age", "trestbps", "chol", "thalach", "oldpeak"
]

CATEGORICAL = [
    "sex", "cp", "fbs", "restecg",
    "exang", "slope", "ca", "thal"
]

FEATURES = NUMERICAL + CATEGORICAL

SITE = "site"
TARGET = "target"


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

def load_data():

    df = pd.read_csv(DATA_PATH)

    required_columns = FEATURES + [SITE, TARGET]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    return df


# --------------------------------------------------
# 1. MISSINGNESS BY SITE
# --------------------------------------------------

def analyze_missingness_by_site(df):

    rows = []

    for site, site_df in df.groupby(SITE):

        site_size = len(site_df)

        for feature in FEATURES:

            missing_count = site_df[feature].isna().sum()

            rows.append({
                "site": site,
                "feature": feature,
                "total_records": site_size,
                "missing_count": missing_count,
                "missing_percentage": (
                    missing_count / site_size * 100
                ),
            })

    result = pd.DataFrame(rows)

    result.to_csv(
        TABLE_DIR / "missingness_by_site.csv",
        index=False,
    )

    # Create missingness heatmap
    heatmap_data = result.pivot(
        index="site",
        columns="feature",
        values="missing_percentage",
    )

    plt.figure(figsize=(13, 5))

    sns.heatmap(
        heatmap_data,
        annot=True,
        fmt=".1f",
        cmap="YlOrRd",
        linewidths=0.5,
        cbar_kws={"label": "Missing values (%)"},
    )

    plt.title("Missing Value Percentage Across Hospitals")
    plt.xlabel("Features")
    plt.ylabel("Hospital")

    plt.tight_layout()

    plt.savefig(
        FIGURE_DIR / "missingness_by_site.png",
        dpi=150,
    )

    plt.close()

    return result


# --------------------------------------------------
# 2. TARGET DISTRIBUTION BY SITE
# --------------------------------------------------

def analyze_target_by_site(df):

    result = (
        df.groupby(SITE)[TARGET]
        .value_counts()
        .unstack(fill_value=0)
        .reindex(columns=[0, 1], fill_value=0)
    )

    result.columns = [
        "negative_count",
        "positive_count",
    ]

    result["total_records"] = (
        result["negative_count"] +
        result["positive_count"]
    )

    result["negative_percentage"] = (
        result["negative_count"] /
        result["total_records"] * 100
    )

    result["positive_percentage"] = (
        result["positive_count"] /
        result["total_records"] * 100
    )

    result = result.reset_index()

    result.to_csv(
        TABLE_DIR / "target_distribution_by_site.csv",
        index=False,
    )

    # Plot positive and negative proportions
    plot_data = result.melt(
        id_vars=SITE,
        value_vars=[
            "negative_percentage",
            "positive_percentage",
        ],
        var_name="target_class",
        value_name="percentage",
    )

    plt.figure(figsize=(10, 6))

    sns.barplot(
        data=plot_data,
        x=SITE,
        y="percentage",
        hue="target_class",
    )

    plt.title("Target Distribution Across Hospitals")
    plt.xlabel("Hospital")
    plt.ylabel("Percentage (%)")
    plt.xticks(rotation=15)
    plt.tight_layout()

    plt.savefig(
        FIGURE_DIR / "target_distribution_by_site.png",
        dpi=150,
    )

    plt.close()

    return result


# --------------------------------------------------
# 3. CATEGORICAL DISTRIBUTION BY SITE
# --------------------------------------------------

def analyze_categorical_by_site(df):

    rows = []

    for feature in CATEGORICAL:

        # Work on a copy so the original dataset remains unchanged.
        temp = df[[SITE, feature]].copy()

        # Represent missing values as an explicit category
        # for descriptive analysis only.
        temp[feature] = (
            temp[feature]
            .astype("string")
            .fillna("__MISSING__")
        )

        counts = (
            temp.groupby([SITE, feature], dropna=False)
            .size()
            .reset_index(name="count")
        )

        site_totals = (
            temp.groupby(SITE)
            .size()
            .to_dict()
        )

        for _, row in counts.iterrows():

            site = row[SITE]
            category = row[feature]
            count = row["count"]

            rows.append({
                "feature": feature,
                "site": site,
                "category": category,
                "count": count,
                "percentage": (
                    count / site_totals[site] * 100
                ),
            })

    result = pd.DataFrame(rows)

    result.to_csv(
        TABLE_DIR / "categorical_distribution_by_site.csv",
        index=False,
    )

    return result


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():

    TABLE_DIR.mkdir(parents=True, exist_ok=True)
    FIGURE_DIR.mkdir(parents=True, exist_ok=True)

    print("\nHEARTGUARD AI — SITE DISTRIBUTION ANALYSIS")

    df = load_data()

    print(f"\nDataset shape: {df.shape}")

    print("\nAnalyzing missingness by hospital...")

    missingness = analyze_missingness_by_site(df)

    print("\nMissingness summary:")
    print(
        missingness[
            ["site", "feature", "missing_count",
             "missing_percentage"]
        ].to_string(index=False)
    )

    print("\nAnalyzing target distribution by hospital...")

    target = analyze_target_by_site(df)

    print("\nTarget distribution:")
    print(target.to_string(index=False))

    print("\nAnalyzing categorical distributions by hospital...")

    categorical = analyze_categorical_by_site(df)

    print("\nCategorical distribution preview:")
    print(categorical.head(20).to_string(index=False))

    print("\nSITE DISTRIBUTION ANALYSIS COMPLETE")

    print("\nSaved tables:")
    print(" - missingness_by_site.csv")
    print(" - target_distribution_by_site.csv")
    print(" - categorical_distribution_by_site.csv")

    print("\nSaved figures:")
    print(" - missingness_by_site.png")
    print(" - target_distribution_by_site.png")


if __name__ == "__main__":
    main()
