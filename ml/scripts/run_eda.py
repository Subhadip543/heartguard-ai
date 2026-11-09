
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


# --------------------------------------------------
# PATHS AND CONFIGURATION
# --------------------------------------------------

ROOT = Path(__file__).resolve().parents[1]

DATA_PATH = ROOT / "data/processed/heart_disease_918_cleaned.csv"

REPORT_DIR = ROOT / "reports"
FIGURE_DIR = REPORT_DIR / "figures"
TABLE_DIR = REPORT_DIR / "tables"

for directory in (REPORT_DIR, FIGURE_DIR, TABLE_DIR):
    directory.mkdir(parents=True, exist_ok=True)


NUMERICAL_FEATURES = [
    "age",
    "trestbps",
    "chol",
    "thalach",
    "oldpeak",
]

CATEGORICAL_FEATURES = [
    "sex",
    "cp",
    "fbs",
    "restecg",
    "exang",
    "slope",
    "ca",
    "thal",
]

TARGET = "target"
METADATA = "site"


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

def load_data():
    df = pd.read_csv(DATA_PATH)

    for column in NUMERICAL_FEATURES + CATEGORICAL_FEATURES + [
        "num",
        TARGET,
    ]:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    return df


# --------------------------------------------------
# DATASET OVERVIEW
# --------------------------------------------------

def dataset_overview(df):
    overview = pd.DataFrame({
        "column": df.columns,
        "data_type": df.dtypes.astype(str).values,
        "non_null_count": df.notna().sum().values,
        "missing_count": df.isna().sum().values,
        "unique_values": df.nunique().values,
    })

    overview.to_csv(TABLE_DIR / "dataset_overview.csv", index=False)

    with open(REPORT_DIR / "eda_report.txt", "w") as file:
        file.write("HEARTGUARD AI — EDA REPORT\n")
        file.write("=" * 55 + "\n\n")
        file.write(f"Total records: {len(df)}\n")
        file.write(f"Total columns: {len(df.columns)}\n")
        file.write(f"Duplicate rows: {df.duplicated().sum()}\n")
        file.write(f"Missing cells: {df.isna().sum().sum()}\n")


# --------------------------------------------------
# MISSING VALUE ANALYSIS
# --------------------------------------------------

def analyze_missing_values(df):
    missing = pd.DataFrame({
        "missing_count": df.isna().sum(),
        "missing_percentage": df.isna().mean() * 100,
    }).sort_values("missing_percentage", ascending=False)

    missing.to_csv(TABLE_DIR / "missing_values.csv")

    plt.figure(figsize=(12, 6))

    sns.barplot(
        x=missing.index,
        y=missing["missing_percentage"],
    )

    plt.xticks(rotation=45, ha="right")
    plt.ylabel("Missing values (%)")
    plt.title("Missing Values by Feature")
    plt.tight_layout()

    plt.savefig(FIGURE_DIR / "missingness.png", dpi=150)
    plt.close()

    return missing


# --------------------------------------------------
# NUMERICAL ANALYSIS
# --------------------------------------------------

def analyze_numerical_features(df):
    summary = df[NUMERICAL_FEATURES].describe().T

    summary["missing_count"] = df[NUMERICAL_FEATURES].isna().sum()
    summary["skewness"] = df[NUMERICAL_FEATURES].skew()

    summary.to_csv(TABLE_DIR / "numerical_summary.csv")

    # Distributions
    df[NUMERICAL_FEATURES].hist(
        figsize=(14, 10),
        bins=20,
        edgecolor="black",
    )

    plt.suptitle("Numerical Feature Distributions")
    plt.tight_layout()
    plt.savefig(
        FIGURE_DIR / "numerical_distributions.png",
        dpi=150,
    )
    plt.close()

    # Potential outliers using the IQR rule
    outlier_rows = []

    for column in NUMERICAL_FEATURES:
        series = df[column].dropna()

        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1

        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr

        outliers = series[(series < lower) | (series > upper)]

        outlier_rows.append({
            "feature": column,
            "lower_bound": lower,
            "upper_bound": upper,
            "potential_outliers": len(outliers),
            "percentage": len(outliers) / len(series) * 100,
        })

    outliers = pd.DataFrame(outlier_rows)
    outliers.to_csv(TABLE_DIR / "outlier_summary.csv", index=False)

    return summary, outliers


# --------------------------------------------------
# CATEGORICAL ANALYSIS
# --------------------------------------------------

def analyze_categorical_features(df):
    rows = []

    for column in CATEGORICAL_FEATURES + ["num", TARGET]:
        counts = df[column].value_counts(dropna=False)

        for category, count in counts.items():
            rows.append({
                "feature": column,
                "category": category,
                "count": count,
                "percentage": count / len(df) * 100,
            })

    summary = pd.DataFrame(rows)
    summary.to_csv(TABLE_DIR / "categorical_summary.csv", index=False)

    return summary


# --------------------------------------------------
# TARGET ANALYSIS
# --------------------------------------------------

def analyze_target(df):
    target_counts = df[TARGET].value_counts().sort_index()

    plt.figure(figsize=(7, 5))

    sns.barplot(
        x=target_counts.index.astype(str),
        y=target_counts.values,
    )

    plt.xlabel("Target")
    plt.ylabel("Number of records")
    plt.title("Binary Target Distribution")

    for index, value in enumerate(target_counts.values):
        plt.text(index, value + 5, str(value), ha="center")

    plt.tight_layout()
    plt.savefig(FIGURE_DIR / "target_distribution.png", dpi=150)
    plt.close()

    site_target = pd.crosstab(
        df[METADATA],
        df[TARGET],
    )

    site_target.to_csv(TABLE_DIR / "site_distribution.csv")

    plt.figure(figsize=(9, 6))

    sns.countplot(
        data=df,
        x=METADATA,
        hue=TARGET,
    )

    plt.title("Target Distribution by Source Site")
    plt.ylabel("Number of records")
    plt.tight_layout()

    plt.savefig(
        FIGURE_DIR / "site_target_distribution.png",
        dpi=150,
    )
    plt.close()

    return target_counts, site_target


# --------------------------------------------------
# CORRELATION ANALYSIS
# --------------------------------------------------

def analyze_correlations(df):
    correlation = df[NUMERICAL_FEATURES + [TARGET]].corr()

    correlation.to_csv(TABLE_DIR / "correlation_matrix.csv")

    plt.figure(figsize=(10, 8))

    sns.heatmap(
        correlation,
        annot=True,
        cmap="coolwarm",
        fmt=".2f",
        center=0,
    )

    plt.title("Numerical Feature Correlation")
    plt.tight_layout()

    plt.savefig(FIGURE_DIR / "correlation.png", dpi=150)
    plt.close()

    return correlation


# --------------------------------------------------
# CATEGORICAL VISUALIZATION
# --------------------------------------------------

def plot_categorical_distributions(df):
    fig, axes = plt.subplots(4, 2, figsize=(14, 16))

    for column, axis in zip(
        CATEGORICAL_FEATURES,
        axes.flatten(),
    ):
        sns.countplot(
            data=df,
            x=column,
            ax=axis,
        )

        axis.set_title(f"{column} distribution")

    plt.tight_layout()

    plt.savefig(
        FIGURE_DIR / "categorical_distributions.png",
        dpi=150,
    )

    plt.close()


# --------------------------------------------------
# SITE-WISE MISSINGNESS
# --------------------------------------------------

def analyze_site_missingness(df):
    result = (
        df.groupby(METADATA)[
            NUMERICAL_FEATURES + CATEGORICAL_FEATURES
        ]
        .apply(lambda group: group.isna().mean() * 100)
    )

    result.to_csv(TABLE_DIR / "site_missingness.csv")


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():
    print("Loading HeartGuard AI dataset...")

    df = load_data()

    print("Dataset loaded:", df.shape)

    print("\nRunning dataset overview...")
    dataset_overview(df)

    print("Analyzing missing values...")
    analyze_missing_values(df)

    print("Analyzing numerical features...")
    numerical_summary, outliers = analyze_numerical_features(df)

    print("Analyzing categorical features...")
    categorical_summary = analyze_categorical_features(df)

    print("Analyzing target distribution...")
    target_counts, site_target = analyze_target(df)

    print("Analyzing correlations...")
    correlation = analyze_correlations(df)

    print("Analyzing categorical distributions...")
    plot_categorical_distributions(df)

    print("Analyzing site-wise missingness...")
    analyze_site_missingness(df)

    print("\nEDA COMPLETE")
    print("=" * 50)

    print("\nDataset shape:", df.shape)
    print("\nTarget distribution:")
    print(target_counts)

    print("\nMissing values:")
    print(df.isna().sum().sort_values(ascending=False))

    print("\nPotential outliers:")
    print(outliers.to_string(index=False))

    print("\nSite-wise target distribution:")
    print(site_target)

    print("\nReports saved in:", REPORT_DIR)


if __name__ == "__main__":
    main()
