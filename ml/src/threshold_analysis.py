
"""
HeartGuard AI
Hospital-aware threshold analysis.

Threshold selection uses out-of-fold scores from the
outer training hospitals only.

The held-out hospital is used exclusively for evaluation.
"""

from pathlib import Path

import numpy as np
import pandas as pd

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
from sklearn.model_selection import (
    GridSearchCV,
    GroupKFold,
    cross_val_predict,
)
from sklearn.pipeline import Pipeline

from ml.src.joint_model_selection import (
    load_grouped_dataset,
    build_parameter_grid,
)
from ml.src.missing_value_experiment import (
    build_preprocessor,
)


# --------------------------------------------------
# 1. CONFIGURATION
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

TABLE_DIR = (
    PROJECT_ROOT
    / "ml"
    / "reports"
    / "tables"
)

INNER_SPLITS = 3
RANDOM_STATE = 42


# --------------------------------------------------
# 2. SCORE GENERATION
# --------------------------------------------------

def get_score_method(estimator):

    classifier = estimator.named_steps["classifier"]

    if hasattr(classifier, "predict_proba"):
        return "predict_proba"

    return "decision_function"


def extract_scores(estimator, X, method):

    if method == "predict_proba":
        return estimator.predict_proba(X)[:, 1]

    return estimator.decision_function(X)


# --------------------------------------------------
# 3. THRESHOLD CANDIDATES
# --------------------------------------------------

def generate_thresholds(scores, method):

    quantiles = np.linspace(
        0.05,
        0.95,
        91,
    )

    thresholds = np.quantile(
        scores,
        quantiles,
    )

    if method == "predict_proba":
        thresholds = np.append(thresholds, 0.5)

    else:
        thresholds = np.append(thresholds, 0.0)

    return np.unique(thresholds)


# --------------------------------------------------
# 4. THRESHOLD METRICS
# --------------------------------------------------

def calculate_threshold_metrics(
    y_true,
    scores,
    threshold,
):

    predictions = (
        scores >= threshold
    ).astype(int)

    return {
        "threshold": threshold,

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
# 5. SELECT THRESHOLD USING TRAINING DATA
# --------------------------------------------------

def select_threshold(
    y_train,
    oof_scores,
    method,
):

    thresholds = generate_thresholds(
        oof_scores,
        method,
    )

    threshold_results = []

    for threshold in thresholds:

        metrics = calculate_threshold_metrics(
            y_train,
            oof_scores,
            threshold,
        )

        threshold_results.append(metrics)

    threshold_df = pd.DataFrame(
        threshold_results
    )

    # Primary objective: maximum balanced accuracy.
    # Tie-breaker: higher specificity.

    best_row = threshold_df.sort_values(
        by=[
            "balanced_accuracy",
            "specificity",
        ],
        ascending=[
            False,
            False,
        ],
    ).iloc[0]

    return (
        float(best_row["threshold"]),
        threshold_df,
    )


# --------------------------------------------------
# 6. NESTED THRESHOLD EVALUATION
# --------------------------------------------------

def run_threshold_analysis():

    X, y, groups = load_grouped_dataset()

    parameter_grid = build_parameter_grid()

    sites = sorted(
        groups.unique()
    )

    outer_results = []
    threshold_curves = []
    prediction_results = []

    for outer_number, held_out_site in enumerate(
        sites,
        start=1,
    ):

        print("\n" + "=" * 70)

        print(
            f"OUTER EVALUATION {outer_number}/{len(sites)}"
        )

        print(
            f"HELD-OUT HOSPITAL: {held_out_site}"
        )

        print("=" * 70)

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

        inner_cv = GroupKFold(
            n_splits=INNER_SPLITS
        )

        # ----------------------------------
        # SELECT MODEL CONFIGURATION
        # ----------------------------------

        base_pipeline = Pipeline(
            steps=[
                (
                    "preprocessor",
                    build_preprocessor("baseline"),
                ),
                (
                    "classifier",
                    LogisticRegression(
                        max_iter=3000,
                        random_state=RANDOM_STATE,
                    ),
                ),
            ]
        )

        search = GridSearchCV(
            estimator=base_pipeline,
            param_grid=parameter_grid,
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

        classifier = best_model.named_steps["classifier"]

        if isinstance(classifier, LogisticRegression):
            model_name = "Logistic Regression"

        elif classifier.__class__.__name__ == "RandomForestClassifier":
            model_name = "Random Forest"

        else:
            model_name = "SVM"

        print(f"Selected model: {model_name}")

        print(
            "Inner balanced accuracy:",
            round(search.best_score_, 4),
        )

        print("Best parameters:")
        print(search.best_params_)

        # ----------------------------------
        # GENERATE INNER OOF SCORES
        # ----------------------------------

        score_method = get_score_method(
            best_model
        )

        oof_scores = cross_val_predict(
            best_model,
            X_train,
            y_train,
            groups=groups_train,
            cv=inner_cv,
            method=score_method,
            n_jobs=-1,
        )

        if score_method == "predict_proba":
            oof_scores = oof_scores[:, 1]

        # ----------------------------------
        # SELECT THRESHOLD
        # ----------------------------------

        selected_threshold, threshold_df = (
            select_threshold(
                y_train,
                oof_scores,
                score_method,
            )
        )

        threshold_df["held_out_site"] = held_out_site

        threshold_curves.append(
            threshold_df
        )

        inner_threshold_metrics = calculate_threshold_metrics(
            y_train,
            oof_scores,
            selected_threshold,
        )

        print(
            "Selected threshold:",
            round(selected_threshold, 4),
        )

        print(
            "Inner OOF balanced accuracy:",
            round(
                inner_threshold_metrics["balanced_accuracy"],
                4,
            ),
        )

        # ----------------------------------
        # OUTER HOSPITAL EVALUATION
        # ----------------------------------

        test_scores = extract_scores(
            best_model,
            X_test,
            score_method,
        )

        outer_metrics = calculate_threshold_metrics(
            y_test,
            test_scores,
            selected_threshold,
        )

        print(
            "Outer balanced accuracy:",
            round(
                outer_metrics["balanced_accuracy"],
                4,
            ),
        )

        print(
            "Outer recall:",
            round(outer_metrics["recall"], 4),
        )

        print(
            "Outer specificity:",
            round(outer_metrics["specificity"], 4),
        )

        # ----------------------------------
        # SAVE OUTER RESULTS
        # ----------------------------------

        outer_results.append(
            {
                "held_out_site": held_out_site,
                "selected_model": model_name,
                "score_method": score_method,
                "selected_threshold": selected_threshold,
                "inner_best_balanced_accuracy": search.best_score_,
                **outer_metrics,
            }
        )

        # ----------------------------------
        # SAVE PREDICTIONS
        # ----------------------------------

        predictions = (
            test_scores >= selected_threshold
        ).astype(int)

        for index, actual, predicted, score in zip(
            X_test.index,
            y_test,
            predictions,
            test_scores,
        ):

            prediction_results.append(
                {
                    "record_index": index,
                    "held_out_site": held_out_site,
                    "selected_model": model_name,
                    "selected_threshold": selected_threshold,
                    "actual": actual,
                    "predicted": predicted,
                    "score": score,
                }
            )

    return (
        pd.DataFrame(outer_results),
        pd.concat(threshold_curves, ignore_index=True),
        pd.DataFrame(prediction_results),
    )


# --------------------------------------------------
# 7. SAVE RESULTS
# --------------------------------------------------

def save_results(
    outer_results,
    threshold_curves,
    predictions,
):

    TABLE_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    outer_results.to_csv(
        TABLE_DIR / "threshold_outer_results.csv",
        index=False,
    )

    threshold_curves.to_csv(
        TABLE_DIR / "threshold_inner_curves.csv",
        index=False,
    )

    predictions.to_csv(
        TABLE_DIR / "threshold_predictions.csv",
        index=False,
    )

    print("\nRESULTS SAVED")

    print(TABLE_DIR)


# --------------------------------------------------
# 8. MAIN
# --------------------------------------------------

def main():

    print("\nHEARTGUARD AI")
    print("HOSPITAL-AWARE THRESHOLD ANALYSIS")

    (
        outer_results,
        threshold_curves,
        predictions,
    ) = run_threshold_analysis()

    save_results(
        outer_results,
        threshold_curves,
        predictions,
    )

    print("\nFINAL OUTER RESULTS")

    print(
        outer_results[
            [
                "held_out_site",
                "selected_model",
                "score_method",
                "selected_threshold",
                "balanced_accuracy",
                "recall",
                "specificity",
                "roc_auc",
                "pr_auc",
            ]
        ].round(4).to_string(index=False)
    )

    print("\nTHRESHOLD ANALYSIS COMPLETED")


if __name__ == "__main__":
    main()
