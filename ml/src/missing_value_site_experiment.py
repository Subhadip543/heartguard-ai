
from pathlib import Path

import numpy as np
import pandas as pd

from sklearn.base import clone
from sklearn.pipeline import Pipeline

from ml.src.preprocessing import (
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    TARGET,
)
from ml.src.train import load_dataset
from ml.src.missing_value_experiment import (
    build_preprocessor,
    get_classifiers,
)
from ml.src.evaluation import evaluate_leave_one_site_out


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

ML_ROOT = Path(__file__).resolve().parents[1]
TABLE_DIR = ML_ROOT / "reports" / "tables"

PREPROCESSING_STRATEGIES = [
    "baseline",
    "missing_indicators",
    "explicit_missing_category",
]

SELECTED_MODELS = [
    "Logistic Regression",
    "Random Forest",
    "SVM",
]

METRICS = [
    "recall",
    "specificity",
    "balanced_accuracy",
    "roc_auc",
    "pr_auc",
]


# --------------------------------------------------
# PREPARE DATA
# --------------------------------------------------

def prepare_data(df):

    selected_features = (
        NUMERICAL_FEATURES + CATEGORICAL_FEATURES
    )

    X = df[selected_features].copy()
    y = df[TARGET].copy()
    groups = df["site"].copy()

    # Preserve missing categorical values as NaN.
    # Convert observed categorical values to strings.
    for column in CATEGORICAL_FEATURES:
        X[column] = X[column].map(
            lambda value: (
                str(value) if pd.notna(value) else np.nan
            )
        )

    return X, y, groups


# --------------------------------------------------
# BUILD EXPERIMENT PIPELINES
# --------------------------------------------------

def build_experiment_pipeline(strategy, classifier):

    return Pipeline(
        steps=[
            ("preprocessor", build_preprocessor(strategy)),
            ("classifier", clone(classifier)),
        ]
    )


# --------------------------------------------------
# RUN SITE-BASED EXPERIMENT
# --------------------------------------------------

def run_experiment(df):

    X, y, groups = prepare_data(df)

    classifiers = get_classifiers()

    all_results = []

    unique_sites = sorted(groups.dropna().unique())

    print(f"\nHospitals found: {unique_sites}")
    print(f"Number of hospitals: {len(unique_sites)}")

    if len(unique_sites) != 4:
        raise ValueError(
            f"Expected 4 hospital sites, found {len(unique_sites)}."
        )

    for strategy in PREPROCESSING_STRATEGIES:

        print("\n" + "=" * 65)
        print(f"PREPROCESSING STRATEGY: {strategy.upper()}")
        print("=" * 65)

        for model_name in SELECTED_MODELS:

            print(f"\nEvaluating: {model_name}")

            estimator = build_experiment_pipeline(
                strategy=strategy,
                classifier=classifiers[model_name],
            )

            results = evaluate_leave_one_site_out(
                estimator=estimator,
                X=X,
                y=y,
                groups=groups,
                model_name=model_name,
            )

            results["strategy"] = strategy

            all_results.append(results)

            print(
                results[
                    [
                        "held_out_site",
                        "testing_records",
                        "recall",
                        "specificity",
                        "balanced_accuracy",
                        "roc_auc",
                    ]
                ].round(4).to_string(index=False)
            )

    return pd.concat(all_results, ignore_index=True)


# --------------------------------------------------
# SUMMARIZE RESULTS
# --------------------------------------------------

def summarize_results(results):

    summary = (
        results
        .groupby(["strategy", "model"])[METRICS]
        .agg(["mean", "std"])
        .round(4)
    )

    return summary


# --------------------------------------------------
# SAVE RESULTS
# --------------------------------------------------

def save_results(results, summary):

    TABLE_DIR.mkdir(parents=True, exist_ok=True)

    results.to_csv(
        TABLE_DIR / "missing_value_site_experiment_results.csv",
        index=False,
    )

    summary.to_csv(
        TABLE_DIR / "missing_value_site_experiment_summary.csv",
    )

    print("\nResults saved:")
    print(
        TABLE_DIR / "missing_value_site_experiment_results.csv"
    )
    print(
        TABLE_DIR / "missing_value_site_experiment_summary.csv"
    )


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():

    print("\nHEARTGUARD AI — MISSING VALUE SITE EXPERIMENT")

    df = load_dataset()

    results = run_experiment(df)

    summary = summarize_results(results)

    print("\n" + "=" * 65)
    print("FINAL SITE-BASED RESULTS")
    print("=" * 65)

    print(summary.to_string())

    save_results(results, summary)

    print("\nMISSING VALUE SITE EXPERIMENT COMPLETED")


if __name__ == "__main__":
    main()

