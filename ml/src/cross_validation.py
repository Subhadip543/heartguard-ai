
from pathlib import Path

import pandas as pd

from sklearn.metrics import confusion_matrix, make_scorer
from sklearn.model_selection import (
    RepeatedStratifiedKFold,
    cross_validate,
)

from ml.src.train import build_models, load_dataset
from ml.src.preprocessing import TARGET, get_feature_columns


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

ML_ROOT = Path(__file__).resolve().parents[1]

TABLE_DIR = ML_ROOT / "reports" / "tables"

RANDOM_STATE = 42
N_SPLITS = 5
N_REPEATS = 3


# --------------------------------------------------
# CUSTOM METRIC
# --------------------------------------------------

def calculate_specificity(y_true, y_pred):
    """Calculate the true negative rate."""

    tn, fp, fn, tp = confusion_matrix(
        y_true,
        y_pred,
        labels=[0, 1],
    ).ravel()

    return tn / (tn + fp) if (tn + fp) > 0 else 0.0


# --------------------------------------------------
# CROSS-VALIDATION
# --------------------------------------------------

def run_cross_validation(df, models):
    X = df[get_feature_columns()]
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

    for model_name, model in models.items():
        print(f"\nEvaluating {model_name}...")

        scores = cross_validate(
            estimator=model,
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
                "model": model_name,
                "repeat": (index // N_SPLITS) + 1,
                "fold": (index % N_SPLITS) + 1,
                "fit_time_seconds": scores["fit_time"][index],
                "score_time_seconds": scores["score_time"][index],
            }

            for metric in scoring:
                result[metric] = scores[f"test_{metric}"][index]

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

def summarize_results(fold_results):
    metrics = [
        "accuracy",
        "recall",
        "specificity",
        "precision",
        "f1",
        "balanced_accuracy",
        "roc_auc",
        "pr_auc",
        "fit_time_seconds",
    ]

    summary = (
        fold_results
        .groupby("model")[metrics]
        .agg(["mean", "std"])
        .round(4)
    )

    return summary


# --------------------------------------------------
# SAVE RESULTS
# --------------------------------------------------

def save_results(fold_results, summary):
    TABLE_DIR.mkdir(parents=True, exist_ok=True)

    fold_path = TABLE_DIR / "cross_validation_fold_results.csv"
    summary_path = TABLE_DIR / "cross_validation_summary.csv"

    fold_results.to_csv(fold_path, index=False)
    summary.to_csv(summary_path)

    print("\nSaved reports:")
    print(fold_path)
    print(summary_path)


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():
    print("=" * 55)
    print("HEARTGUARD AI - REPEATED STRATIFIED CROSS-VALIDATION")
    print("=" * 55)

    df = load_dataset()
    models = build_models()

    print(f"\nNumber of folds: {N_SPLITS}")
    print(f"Number of repeats: {N_REPEATS}")
    print(f"Evaluations per model: {N_SPLITS * N_REPEATS}")

    fold_results = run_cross_validation(df, models)
    summary = summarize_results(fold_results)

    print("\nCROSS-VALIDATION SUMMARY")
    print(summary.to_string())

    save_results(fold_results, summary)

    print("\nCROSS-VALIDATION COMPLETE")


if __name__ == "__main__":
    main()
