
"""
HeartGuard AI
Nested Leave-One-Site-Out Model Tuning

Outer loop:
    Hold out one hospital for final evaluation.

Inner loop:
    GroupKFold across the remaining three hospitals
    to select hyperparameters.

Primary selection metric:
    Balanced accuracy.
"""

from pathlib import Path
import json

import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    balanced_accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import GridSearchCV, GroupKFold
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC

from ml.src.missing_value_experiment import (
    build_preprocessor,
    load_dataset,
)


# --------------------------------------------------
# 1. CONFIGURATION
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ML_ROOT = PROJECT_ROOT / "ml"

DATA_PATH = (
    ML_ROOT
    / "data"
    / "processed"
    / "heart_disease_918_cleaned.csv"
)

TABLE_DIR = ML_ROOT / "reports" / "tables"

RANDOM_STATE = 42

PREPROCESSING_STRATEGIES = [
    "baseline",
    "missing_indicators",
    "explicit_missing_category",
]

MODEL_NAMES = [
    "Logistic Regression",
    "Random Forest",
    "SVM",
]

# Four outer hospital evaluations.
# Three inner hospital folds.
OUTER_SPLITS = 4
INNER_SPLITS = 3


# --------------------------------------------------
# 2. LOAD DATA
# --------------------------------------------------

def load_grouped_dataset():

    X, y = load_dataset()

    df = pd.read_csv(DATA_PATH)

    groups = df.loc[X.index, "site"]

    if groups.isna().any():
        raise ValueError("Hospital/site information contains missing values.")

    if groups.nunique() != OUTER_SPLITS:
        raise ValueError(
            f"Expected {OUTER_SPLITS} hospitals, "
            f"found {groups.nunique()}."
        )

    print("\nDATASET INFORMATION")
    print(f"Records: {len(X)}")
    print(f"Features: {X.shape[1]}")
    print(f"Hospitals: {groups.nunique()}")

    return X, y, groups


# --------------------------------------------------
# 3. CLASSIFIERS AND PARAMETER GRIDS
# --------------------------------------------------

def get_model_configurations():

    configurations = {

        "Logistic Regression": {
            "classifier": LogisticRegression(
                max_iter=3000,
                class_weight="balanced",
                random_state=RANDOM_STATE,
            ),
            "parameters": {
                "classifier__C": [0.01, 0.1, 1.0, 10.0],
            },
        },

        "Random Forest": {
            "classifier": RandomForestClassifier(
                n_estimators=200,
                class_weight="balanced",
                random_state=RANDOM_STATE,
                n_jobs=-1,
            ),
            "parameters": {
                "classifier__max_depth": [None, 8],
                "classifier__min_samples_leaf": [2, 5],
            },
        },

        "SVM": {
            "classifier": SVC(
                kernel="rbf",
                class_weight="balanced",
                random_state=RANDOM_STATE,
            ),
            "parameters": {
                "classifier__C": [0.1, 1.0, 10.0],
                "classifier__gamma": ["scale", 0.01],
            },
        },
    }

    return configurations


# --------------------------------------------------
# 4. BUILD EXPERIMENT PIPELINE
# --------------------------------------------------

def build_model(strategy, classifier):

    return Pipeline(
        steps=[
            (
                "preprocessor",
                build_preprocessor(strategy),
            ),
            (
                "classifier",
                classifier,
            ),
        ]
    )


# --------------------------------------------------
# 5. CALCULATE OUTER TEST METRICS
# --------------------------------------------------

def calculate_site_metrics(
    y_true,
    predictions,
    scores,
):

    return {
        "accuracy": accuracy_score(
            y_true,
            predictions,
        ),

        "recall": recall_score(
            y_true,
            predictions,
            zero_division=0,
        ),

        "specificity": recall_score(
            y_true,
            predictions,
            pos_label=0,
            zero_division=0,
        ),

        "precision": precision_score(
            y_true,
            predictions,
            zero_division=0,
        ),

        "f1": f1_score(
            y_true,
            predictions,
            zero_division=0,
        ),

        "balanced_accuracy": balanced_accuracy_score(
            y_true,
            predictions,
        ),

        "roc_auc": roc_auc_score(
            y_true,
            scores,
        ),

        "pr_auc": average_precision_score(
            y_true,
            scores,
        ),
    }


# --------------------------------------------------
# 6. NESTED LEAVE-ONE-SITE-OUT EVALUATION
# --------------------------------------------------

def run_nested_validation():

    X, y, groups = load_grouped_dataset()

    configurations = get_model_configurations()

    sites = sorted(groups.unique())

    total_searches = (
        len(PREPROCESSING_STRATEGIES)
        * len(MODEL_NAMES)
        * len(sites)
    )

    search_number = 0

    outer_results = []
    prediction_results = []
    inner_results = []

    for strategy in PREPROCESSING_STRATEGIES:

        for model_name in MODEL_NAMES:

            config = configurations[model_name]

            print("\n" + "=" * 70)
            print(f"STRATEGY: {strategy}")
            print(f"MODEL: {model_name}")
            print("=" * 70)

            for held_out_site in sites:

                search_number += 1

                print(
                    f"\nSearch {search_number}/{total_searches}"
                )

                print(
                    f"Held-out hospital: {held_out_site}"
                )

                # ----------------------------------
                # OUTER TRAIN / TEST SPLIT
                # ----------------------------------

                train_mask = groups != held_out_site
                test_mask = groups == held_out_site

                X_train = X.loc[train_mask]
                X_test = X.loc[test_mask]

                y_train = y.loc[train_mask]
                y_test = y.loc[test_mask]

                groups_train = groups.loc[train_mask]

                # ----------------------------------
                # INNER GROUPED CROSS-VALIDATION
                # ----------------------------------

                inner_cv = GroupKFold(
                    n_splits=INNER_SPLITS
                )

                pipeline = build_model(
                    strategy,
                    config["classifier"],
                )

                search = GridSearchCV(
                    estimator=pipeline,
                    param_grid=config["parameters"],
                    scoring="balanced_accuracy",
                    cv=inner_cv,
                    refit=True,
                    n_jobs=-1,
                    error_score="raise",
                    return_train_score=False,
                )

                search.fit(
                    X_train,
                    y_train,
                    groups=groups_train,
                )

                best_model = search.best_estimator_

                # ----------------------------------
                # OUTER TEST PREDICTIONS
                # ----------------------------------

                predictions = best_model.predict(X_test)

                classifier = best_model.named_steps["classifier"]

                # SVC is intentionally uncalibrated here.
                # Its decision scores support ROC-AUC
                # and average precision without an
                # additional non-grouped calibration CV.

                if hasattr(classifier, "predict_proba"):

                    scores = best_model.predict_proba(
                        X_test
                    )[:, 1]

                else:

                    scores = best_model.decision_function(
                        X_test
                    )

                metrics = calculate_site_metrics(
                    y_test,
                    predictions,
                    scores,
                )

                # ----------------------------------
                # SAVE OUTER RESULTS
                # ----------------------------------

                outer_results.append(
                    {
                        "strategy": strategy,
                        "model": model_name,
                        "held_out_site": held_out_site,
                        "training_records": len(X_train),
                        "testing_records": len(X_test),
                        "inner_best_balanced_accuracy": (
                            search.best_score_
                        ),
                        "best_parameters": json.dumps(
                            search.best_params_
                        ),
                        **metrics,
                    }
                )

                # ----------------------------------
                # SAVE PREDICTIONS
                # ----------------------------------

                for index, actual, predicted, score in zip(
                    X_test.index,
                    y_test,
                    predictions,
                    scores,
                ):

                    prediction_results.append(
                        {
                            "strategy": strategy,
                            "model": model_name,
                            "record_index": index,
                            "held_out_site": held_out_site,
                            "actual": actual,
                            "predicted": predicted,
                            "score": score,
                        }
                    )

                # ----------------------------------
                # SAVE INNER SEARCH RESULTS
                # ----------------------------------

                cv_results = pd.DataFrame(
                    search.cv_results_
                )

                cv_results["strategy"] = strategy
                cv_results["model"] = model_name
                cv_results["held_out_site"] = held_out_site

                inner_results.append(cv_results)

                print(
                    "Best inner balanced accuracy:",
                    round(search.best_score_, 4),
                )

                print("Best parameters:")
                print(search.best_params_)

                print(
                    "Outer balanced accuracy:",
                    round(metrics["balanced_accuracy"], 4),
                )

    return (
        pd.DataFrame(outer_results),
        pd.DataFrame(prediction_results),
        pd.concat(inner_results, ignore_index=True),
    )


# --------------------------------------------------
# 7. SUMMARIZE OUTER RESULTS
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
        .groupby(["strategy", "model"])[metrics]
        .agg(["mean", "std"])
        .round(4)
    )

    summary.columns = [
        f"{metric}_{stat}"
        for metric, stat in summary.columns
    ]

    return summary.reset_index()


# --------------------------------------------------
# 8. SAVE RESULTS
# --------------------------------------------------

def save_results(
    outer_results,
    predictions,
    inner_results,
    summary,
):

    TABLE_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    outer_results.to_csv(
        TABLE_DIR / "nested_loso_outer_results.csv",
        index=False,
    )

    predictions.to_csv(
        TABLE_DIR / "nested_loso_predictions.csv",
        index=False,
    )

    inner_results.to_csv(
        TABLE_DIR / "nested_loso_inner_search_results.csv",
        index=False,
    )

    summary.to_csv(
        TABLE_DIR / "nested_loso_summary.csv",
        index=False,
    )

    print("\nRESULTS SAVED")

    print(TABLE_DIR)


# --------------------------------------------------
# 9. MAIN
# --------------------------------------------------

def main():

    print("\nHEARTGUARD AI")
    print("NESTED HOSPITAL-AWARE MODEL TUNING")

    outer_results, predictions, inner_results = (
        run_nested_validation()
    )

    summary = summarize_results(
        outer_results
    )

    save_results(
        outer_results,
        predictions,
        inner_results,
        summary,
    )

    print("\nFINAL NESTED LOSO RESULTS")

    print(
        summary.to_string(index=False)
    )

    print("\nNESTED MODEL TUNING COMPLETED")


if __name__ == "__main__":
    main()
