from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import chi2_contingency


ROOT = Path(__file__).resolve().parents[1]

DATA_PATH = ROOT / "data/processed/heart_disease_918_cleaned.csv"
REPORT_DIR = ROOT / "reports"
TABLE_DIR = REPORT_DIR / "tables"
FIGURE_DIR = REPORT_DIR / "figures"

NUMERICAL = [
    "age", "trestbps", "chol", "thalach", "oldpeak"
]

CATEGORICAL = [
    "sex", "cp", "fbs", "restecg",
    "exang", "slope", "ca", "thal"
]

SITE = "site"
TARGET = "target"


def load_data():
    df = pd.read_csv(DATA_PATH)

    for column in NUMERICAL + CATEGORICAL + ["num", TARGET]:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    return df


def analyze_numerical_by_target(df):
    result = (
        df.groupby(TARGET)[NUMERICAL]
        .agg(["count", "mean", "median", "std"])
    )

    result.to_csv(TABLE_DIR / "numerical_by_target.csv")

    # Visual comparison of numerical distributions
    fig, axes = plt.subplots(3, 2, figsize=(14, 13))

    for column, axis in zip(NUMERICAL, axes.flatten()):
        sns.boxplot(
            data=df,
            x=TARGET,
            y=column,
            ax=axis,
            showfliers=True,
        )

        axis.set_title(f"{column} by target")

    plt.tight_layout()
    plt.savefig(
        FIGURE_DIR / "numerical_by_target.png",
        dpi=150,
    )
    plt.close()

    return result


def analyze_categorical_by_target(df):
    rows = []

    for column in CATEGORICAL:
        table = pd.crosstab(
            df[column],
            df[TARGET],
            dropna=False,
        )

        for category, values in table.iterrows():
            total = values.sum()

            rows.append({
                "feature": column,
                "category": category,
                "negative_count": values.get(0, 0),
                "positive_count": values.get(1, 0),
                "positive_rate": (
                    values.get(1, 0) / total * 100
                    if total else 0
                ),
            })

    result = pd.DataFrame(rows)

    result.to_csv(
        TABLE_DIR / "categorical_by_target.csv",
        index=False,
    )

    return result


def analyze_site_feature_distributions(df):
    result = (
        df.groupby(SITE)[NUMERICAL]
        .agg(["count", "mean", "median", "std"])
    )

    result.to_csv(
        TABLE_DIR / "numerical_by_site.csv"
    )

    fig, axes = plt.subplots(3, 2, figsize=(14, 13))

    for column, axis in zip(NUMERICAL, axes.flatten()):
        sns.boxplot(
            data=df,
            x=SITE,
            y=column,
            ax=axis,
        )

        axis.set_title(f"{column} across source sites")
        axis.tick_params(axis="x", rotation=20)

    plt.tight_layout()

    plt.savefig(
        FIGURE_DIR / "numerical_by_site.png",
        dpi=150,
    )

    plt.close()

    return result


def analyze_categorical_associations(df):
    rows = []

    for column in CATEGORICAL:
        observed = pd.crosstab(
            df[column],
            df[TARGET],
        )

        # Chi-square requires at least a 2x2 table.
        if observed.shape[0] < 2 or observed.shape[1] < 2:
            continue

        chi2, p_value, dof, _ = chi2_contingency(observed)

        total = observed.to_numpy().sum()

        # Cramer's V measures categorical association strength.
        denominator = min(observed.shape[0] - 1, observed.shape[1] - 1)

        cramer_v = (
            (chi2 / total / denominator) ** 0.5
            if denominator > 0 and total > 0
            else 0
        )

        rows.append({
            "feature": column,
            "chi_square": chi2,
            "degrees_of_freedom": dof,
            "p_value": p_value,
            "cramers_v": cramer_v,
            "observations": total,
        })

    result = pd.DataFrame(rows)

    result.to_csv(
        TABLE_DIR / "categorical_associations.csv",
        index=False,
    )

    return result


def main():
    print("Loading dataset...")
    df = load_data()

    print("\nAnalyzing numerical features by target...")
    numerical = analyze_numerical_by_target(df)

    print("\nAnalyzing categorical features by target...")
    categorical = analyze_categorical_by_target(df)

    print("\nAnalyzing feature distributions by site...")
    site = analyze_site_feature_distributions(df)

    print("\nAnalyzing categorical associations...")
    associations = analyze_categorical_associations(df)

    print("\nADVANCED EDA COMPLETE")
    print("=" * 50)

    print("\nNumerical comparison:")
    print(numerical)

    print("\nCategorical associations:")
    print(associations.to_string(index=False))

    print("\nSaved additional reports in:", TABLE_DIR)


if __name__ == "__main__":
    main()
