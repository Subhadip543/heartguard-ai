
from pathlib import Path

import pandas as pd

from ml.src.preprocessing import (
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    TARGET,
)
from ml.src.train import load_dataset, build_models
from ml.src.evaluation import evaluate_leave_one_site_out


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

ML_ROOT = Path(__file__).resolve().parents[1]
TABLE_DIR = ML_ROOT / "reports" / "tables"

SELECTED_MODELS = [
    "logistic_regression",
    "random_forest",
    "svm",
]


# --------------------------------------------------
# FEATURE CONFIGURATIONS
# --------------------------------------------------

FEATURE_CONFIGS = {
    "all_features": (
        NUMERICAL_FEATURES.copy(),
        CATEGORICAL_FEATURES.copy(),
    ),

    "without_ca": (
        NUMERICAL_FEATURES.copy(),
        [f for f in CATEGORICAL_FEATURES if f != "ca"],
    ),

    "without_thal": (
        NUMERICAL_FEATURES.copy(),
        [f for f in CATEGORICAL_FEATURES if f != "thal"],
    ),

    "without_ca_thal": (
        NUMERICAL_FEATURES.copy(),
        [
            f for f in CATEGORICAL_FEATURES
            if f not in ["ca", "thal"]
        ],
    ),

    "core_features": (
        NUMERICAL_FEATURES.copy(),
        [
            f for f in CATEGORICAL_FEATURES
            if f not in ["ca", "thal", "slope"]
        ],
    ),
}


# --------------------------------------------------
# SITE-AWARE FEATURE EVALUATION
# --------------------------------------------------

def run_experiment(df):

    y = df[TARGET]
    groups = df["site"]

    all_results = []

    for config_name, feature_groups in FEATURE_CONFIGS.items():

        numerical_features, categorical_features = feature_groups

        selected_features = (
            numerical_features + categorical_features
        )

        X = df[selected_features]

        print("\n" + "=" * 55)
        print(f"FEATURE CONFIGURATION: {config_name}")
        print(f"Number of features: {len(selected_features)}")
        print("=" * 55)

        models = build_models(
            numerical_features=numerical_features,
            categorical_features=categorical_features,
        )

        for model_name in SELECTED_MODELS:

            print(f"\nEvaluating {model_name}...")

            results = evaluate_leave_one_site_out(
                estimator=models[model_name],
                X=X,
                y=y,
                groups=groups,
                model_name=model_name,
            )

            results["feature_set"] = config_name

            all_results.append(results)

            print(
                results[
                    [
                        "held_out_site",
                        "balanced_accuracy",
                        "roc_auc",
                    ]
                ].to_string(index=False)
            )

    return pd.concat(all_results, ignore_index=True)


# --------------------------------------------------
# SUMMARIZE RESULTS
# --------------------------------------------------

def summarize_results(results):

    metrics = [
        "recall",
        "specificity",
        "balanced_accuracy",
        "roc_auc",
        "pr_auc",
    ]

    return (
        results
        .groupby(["feature_set", "model"])[metrics]
        .agg(["mean", "std"])
        .round(4)
    )


# --------------------------------------------------
# SAVE REPORTS
# --------------------------------------------------

def save_results(results, summary):

    TABLE_DIR.mkdir(parents=True, exist_ok=True)

    results.to_csv(
        TABLE_DIR / "site_feature_ablation_results.csv",
        index=False,
    )

    summary.to_csv(
        TABLE_DIR / "site_feature_ablation_summary.csv"
    )

    print("\nReports saved successfully.")


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():

    print("\nHEARTGUARD AI - SITE-AWARE FEATURE ABLATION")

    df = load_dataset()

    results = run_experiment(df)

    summary = summarize_results(results)

    print("\nSITE-AWARE FEATURE ABLATION SUMMARY")
    print(summary.to_string())

    save_results(results, summary)

    print("\nSITE-AWARE FEATURE ABLATION COMPLETE")


if __name__ == "__main__":
    main()
