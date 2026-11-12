
"""
HeartGuard AI
Joint Nested Leave-One-Site-Out Model Selection

Inner loop:
    Select the best preprocessing strategy, classifier,
    and hyperparameters using GroupKFold.

Outer loop:
    Evaluate the selected configuration on an
    entirely unseen hospital.

Primary selection metric: Balanced Accuracy.
"""

from pathlib import Path

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

STRATEGIES = [
    "baseline",
    "missing_indicators",
    "explicit_missing_category",
]

INNER_SPLITS = 3


# --------------------------------------------------
# 2. LOAD DATA
# --------------------------------------------------

def load_grouped_dataset():

    X, y = load_dataset()

    df = pd.read_csv(DATA_PATH)

    groups = df.loc[X.index, "site"]

    if groups.isna().any():
        raise ValueError("Missing hospital information.")

    if groups.nunique() != 4:
        raise ValueError(
            f"Expected 4 hospitals, found {groups.nunique()}."
        )

    print("\nDATASET INFORMATION")
    print(f"Records: {len(X)}")
    print(f"Features: {X.shape[1]}")
    print(f"Hospitals: {groups.nunique()}")

    return X, y, groups


# --------------------------------------------------
# 3. DEFINE JOINT SEARCH SPACE
# --------------------------------------------------

def build_parameter_grid():

    parameter_grid = []

    for strategy in STRATEGIES:

        preprocessor = build_preprocessor(strategy)

        # Logistic Regression
        parameter_grid.append(
            {
                "preprocessor": [preprocessor],
                "classifier": [
                    LogisticRegression(
                        max_iter=3000,
                        class_weight="balanced",
                        random_state=RANDOM_STATE,
                    )
                ],
                "classifier__C": [
                    0.01,
                    0.1,
                    1.0,
                    10.0,
                ],
            }
        )

        # Random Forest
        parameter_grid.append(
            {
                "preprocessor": [preprocessor],
                "classifier": [
                    RandomForestClassifier(
                        n_estimators=200,
                        class_weight="balanced",
                        random_state=RANDOM_STATE,
                        n_jobs=1,
                    )
                ],
                "classifier__max_depth": [
                    None,
                    8,
                ],
                "classifier__min_samples_leaf": [
                    2,
                    5,
                ],
            }
        )

        # SVM
        parameter_grid.append(
            {
                "preprocessor": [preprocessor],
                "classifier": [
                    SVC(
                        kernel="rbf",
                        class_weight="balanced",
                        random_state=RANDOM_STATE,
                    )
                ],
                "classifier__C": [
                    0.1,
                    1.0,
                    10.0,
                ],
                "classifier__gamma": [
                    "scale",
                    0.01,
                ],
            }
        )

    return parameter_grid


# --------------------------------------------------
# 4. IDENTIFY SELECTED CONFIGURATION
# --------------------------------------------------


def identify_configuration(best_params):

    classifier = best_params["classifier"]
    preprocessor = best_params["preprocessor"]

    # Identify classifier
    if isinstance(classifier, LogisticRegression):
        model_name = "Logistic Regression"

    elif isinstance(classifier, RandomForestClassifier):
        model_name = "Random Forest"

    elif isinstance(classifier, SVC):
        model_name = "SVM"

    else:
        raise ValueError("Unknown classifier selected.")

    # Identify preprocessing strategy
    transformer_names = [
        name
        for name, _, _ in preprocessor.transformers
    ]

    if "missing_indicators" in transformer_names:
        strategy = "missing_indicators"

    else:
        categorical_pipeline = next(
            transformer
            for name, transformer, _ in preprocessor.transformers
            if name == "categorical"
        )

        imputer = categorical_pipeline.named_steps["imputer"]

        if imputer.strategy == "constant":
            strategy = "explicit_missing_category"
        else:
            strategy = "baseline"

    # Extract classifier hyperparameters
    hyperparameters = {
        key.replace("classifier__", ""): value
        for key, value in best_params.items()
        if key.startswith("classifier__")
    }

    return strategy, model_name, hyperparameters

# --------------------------------------------------
# 5. CALCULATE METRICS
# --------------------------------------------------

def calculate_metrics(y_true, predictions, scores):

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
# 6. JOINT NESTED VALIDATION
# --------------------------------------------------

def run_joint_selection():

    X, y, groups = load_grouped_dataset()

    parameter_grid = build_parameter_grid()

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

    outer_results = []
    prediction_results = []
    inner_results = []

    sites = sorted(groups.unique())

    for outer_number, held_out_site in enumerate(
        sites,
        start=1,
    ):

        print("\n" + "=" * 70)
        print(
            f"OUTER EVALUATION {outer_number}/{len(sites)}"
        )
        print(f"HELD-OUT HOSPITAL: {held_out_site}")
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

        # ----------------------------------
        # INNER GROUPED SEARCH
        # ----------------------------------

        inner_cv = GroupKFold(
            n_splits=INNER_SPLITS
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

        strategy, model_name, hyperparameters = (
            identify_configuration(search.best_params_)
        )

        print("\nSELECTED CONFIGURATION")
        print(f"Preprocessing: {strategy}")
        print(f"Model: {model_name}")
        print(f"Hyperparameters: {hyperparameters}")

        print(
            "Inner balanced accuracy:",
            round(search.best_score_, 4),
        )

        # ----------------------------------
        # OUTER TEST EVALUATION
        # ----------------------------------

        predictions = best_model.predict(X_test)

        classifier = best_model.named_steps["classifier"]

        if hasattr(classifier, "predict_proba"):

            scores = best_model.predict_proba(
                X_test
            )[:, 1]

        else:

            scores = best_model.decision_function(
                X_test
            )

        metrics = calculate_metrics(
            y_test,
            predictions,
            scores,
        )

        print(
            "Outer balanced accuracy:",
            round(metrics["balanced_accuracy"], 4),
        )

        outer_results.append(
            {
                "held_out_site": held_out_site,
                "training_records": len(X_train),
                "testing_records": len(X_test),
                "selected_strategy": strategy,
                "selected_model": model_name,
                "selected_hyperparameters": str(
                    hyperparameters
                ),
                "inner_best_balanced_accuracy": (
                    search.best_score_
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
                    "record_index": index,
                    "held_out_site": held_out_site,
                    "selected_strategy": strategy,
                    "selected_model": model_name,
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

        cv_results["held_out_site"] = held_out_site

        inner_results.append(
            cv_results[
                [
                    "held_out_site",
                    "params",
                    "mean_test_score",
                    "std_test_score",
                    "rank_test_score",
                ]
            ]
        )

    return (
        pd.DataFrame(outer_results),
        pd.DataFrame(prediction_results),
        pd.concat(inner_results, ignore_index=True),
    )


# --------------------------------------------------
# 7. SAVE RESULTS
# --------------------------------------------------

def save_results(
    outer_results,
    predictions,
    inner_results,
):

    TABLE_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    outer_results.to_csv(
        TABLE_DIR / "joint_nested_loso_outer_results.csv",
        index=False,
    )

    predictions.to_csv(
        TABLE_DIR / "joint_nested_loso_predictions.csv",
        index=False,
    )

    inner_results.to_csv(
        TABLE_DIR / "joint_nested_loso_inner_results.csv",
        index=False,
    )

    print("\nRESULTS SAVED")
    print(TABLE_DIR)


# --------------------------------------------------
# 8. MAIN
# --------------------------------------------------

def main():

    print("\nHEARTGUARD AI")
    print("JOINT NESTED HOSPITAL-AWARE MODEL SELECTION")

    outer_results, predictions, inner_results = (
        run_joint_selection()
    )

    save_results(
        outer_results,
        predictions,
        inner_results,
    )

    print("\nFINAL OUTER RESULTS")

    print(
        outer_results[
            [
                "held_out_site",
                "selected_strategy",
                "selected_model",
                "inner_best_balanced_accuracy",
                "balanced_accuracy",
                "recall",
                "specificity",
                "roc_auc",
                "pr_auc",
            ]
        ].round(4).to_string(index=False)
    )

    print("\nJOINT MODEL SELECTION COMPLETED")


if __name__ == "__main__":
    main()
