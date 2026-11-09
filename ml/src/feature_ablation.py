
from pathlib import Path

import pandas as pd

from sklearn.metrics import confusion_matrix, make_scorer
from sklearn.model_selection import (
    RepeatedStratifiedKFold,
    cross_validate,
)

from ml.src.preprocessing import (
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    TARGET,
)
from ml.src.train import load_dataset, build_models


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

ML_ROOT = Path(__file__).resolve().parents[1]
TABLE_DIR = ML_ROOT / "reports" / "tables"

RANDOM_STATE = 42
N_SPLITS = 5
N_REPEATS = 3

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
# CUSTOM METRIC
# --------------------------------------------------

def calculate_specificity(y_true, y_pred):

    tn, fp, fn, tp = confusion_matrix(
        y_true,
        y_pred,
        labels=[0, 1],
    ).ravel()

    return tn / (tn + fp) if (tn + fp) > 0 else 0.0


# --------------------------------------------------
# CROSS-VALIDATION
# --------------------------------------------------

def run_feature_ablation(df):

    y = df[TARGET]

    cv = RepeatedStratifiedKFold(
        n_splits=N_SPLITS,
        n_repeats=N_REPEATS,
        random_state=RANDOM_STATE,
    )

    scoring = {
        "accuracy": "accuracy",
        "recall": "recall",
        "specificity": make_scorer(calculate_specificity),
        "precision": "precision",
        "f1": "f1",
        "balanced_accuracy": "balanced_accuracy",
        "roc_auc": "roc_auc",
        "pr_auc": "average_precision",
    }

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

            scores = cross_validate(
                estimator=models[model_name],
                X=X,
                y=y,
                cv=cv,
                scoring=scoring,
                n_jobs=1,
                return_train_score=False,
                error_score="raise",
            )

            for index in range(N_SPLITS * N_REPEATS):

                result = {
                    "feature_set": config_name,
                    "model": model_name,
                    "repeat": (index // N_SPLITS) + 1,
                    "fold": (index % N_SPLITS) + 1,
                    "feature_count": len(selected_features),
                }

                for metric in scoring:
                    result[metric] = scores[
                        f"test_{metric}"
                    ][index]

                all_results.append(result)

            print(
                f"Mean ROC-AUC: "
                f"{scores['test_roc_auc'].mean():.4f}"
            )

            print(
                f"Mean balanced accuracy: "
                f"{scores['test_balanced_accuracy'].mean():.4f}"
            )

    return pd.DataFrame(all_results)


# --------------------------------------------------
# SUMMARIZE RESULTS
# --------------------------------------------------

def summarize_results(results):

    metrics = [
        "accuracy",
        "recall",
        "specificity",
        "precision",
        "f1",
        "balanced_accuracy",
        "roc_auc",
        "pr_auc",
    ]

    summary = (
        results
        .groupby(["feature_set", "model"])[metrics]
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
        TABLE_DIR / "feature_ablation_fold_results.csv",
        index=False,
    )

    summary.to_csv(
        TABLE_DIR / "feature_ablation_summary.csv"
    )

    print("\nFeature ablation reports saved successfully.")


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():

    print("\nHEARTGUARD AI - FEATURE ABLATION EXPERIMENT")

    df = load_dataset()

    results = run_feature_ablation(df)

    summary = summarize_results(results)

    print("\nFEATURE ABLATION SUMMARY")
    print(summary.to_string())

    save_results(results, summary)

    print("\nFEATURE ABLATION COMPLETE")


if __name__ == "__main__":
    main()
