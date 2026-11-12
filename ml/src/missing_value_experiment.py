from pathlib import Path

import pandas as pd

from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.impute import MissingIndicator, SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import RepeatedStratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


# --------------------------------------------------
# 1. PROJECT PATHS AND CONFIGURATION
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
N_SPLITS = 5
N_REPEATS = 3

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

FEATURES = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
TARGET = "target"


# --------------------------------------------------
# 2. LOAD DATA
# --------------------------------------------------

def load_dataset():
    df = pd.read_csv(DATA_PATH)

    required_columns = FEATURES + [TARGET]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    X = df[FEATURES].copy()
    y = df[TARGET].copy()

    if not set(y.unique()).issubset({0, 1}):
        raise ValueError("Target must contain only 0 and 1.")

    # Convert categorical values to strings while
    # preserving missing values as actual NaN values.
    for column in CATEGORICAL_FEATURES:
        X[column] = X[column].map(
            lambda value: (
                str(value) if pd.notna(value) else float("nan")
            )
        )

    return X, y


# --------------------------------------------------
# 3. PREPROCESSING STRATEGIES
# --------------------------------------------------

def build_preprocessor(strategy):
    numerical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    if strategy in ["baseline", "missing_indicators"]:
        categorical_pipeline = Pipeline(
            steps=[
                (
                    "imputer",
                    SimpleImputer(strategy="most_frequent"),
                ),
                (
                    "encoder",
                    OneHotEncoder(handle_unknown="ignore"),
                ),
            ]
        )

    elif strategy == "explicit_missing_category":
        categorical_pipeline = Pipeline(
            steps=[
                (
                    "imputer",
                    SimpleImputer(
                        strategy="constant",
                        fill_value="__MISSING__",
                    ),
                ),
                (
                    "encoder",
                    OneHotEncoder(handle_unknown="ignore"),
                ),
            ]
        )

    else:
        raise ValueError(f"Unknown strategy: {strategy}")

    transformers = [
        (
            "numerical",
            numerical_pipeline,
            NUMERICAL_FEATURES,
        ),
        (
            "categorical",
            categorical_pipeline,
            CATEGORICAL_FEATURES,
        ),
    ]

    if strategy == "missing_indicators":
        transformers.append(
            (
                "missing_indicators",
                MissingIndicator(features="all"),
                FEATURES,
            )
        )

    return ColumnTransformer(
        transformers=transformers,
        remainder="drop",
    )


# --------------------------------------------------
# 4. CLASSIFIERS
# --------------------------------------------------


def get_classifiers():
    from .train import build_models

    existing_models = build_models()

    selected_models = {
        "logistic_regression": "Logistic Regression",
        "random_forest": "Random Forest",
        "svm": "SVM",
    }

    classifiers = {}

    for model_key, display_name in selected_models.items():
        pipeline = existing_models[model_key]

        classifiers[display_name] = clone(
            pipeline.named_steps["classifier"]
        )

    return classifiers


# --------------------------------------------------
# 5. EXPERIMENT PIPELINES
# --------------------------------------------------

def build_experiment_models(strategy):
    classifiers = get_classifiers()

    models = {}

    for model_name, classifier in classifiers.items():
        models[model_name] = Pipeline(
            steps=[
                ("preprocessor", build_preprocessor(strategy)),
                ("classifier", classifier),
            ]
        )

    return models


# --------------------------------------------------
# 6. EVALUATION
# --------------------------------------------------

def evaluate_experiment():
    X, y = load_dataset()

    strategies = [
        "baseline",
        "missing_indicators",
        "explicit_missing_category",
    ]

    cv = RepeatedStratifiedKFold(
        n_splits=N_SPLITS,
        n_repeats=N_REPEATS,
        random_state=RANDOM_STATE,
    )
    splits = list(cv.split(X, y))

    fold_results = []

    total_evaluations = (
        len(strategies)
        * 3
        * N_SPLITS
        * N_REPEATS
    )

    evaluation_number = 0

    for strategy in strategies:
        print(f"\n{'=' * 65}")
        print(f"PREPROCESSING STRATEGY: {strategy.upper()}")
        print(f"{'=' * 65}")

        models = build_experiment_models(strategy)

        for model_name, model in models.items():
            print(f"\nEvaluating: {model_name}")

            for fold_number, (train_idx, test_idx) in enumerate(
                splits,
                start=1,
            ):
                evaluation_number += 1

                X_train = X.iloc[train_idx]
                X_test = X.iloc[test_idx]

                y_train = y.iloc[train_idx]
                y_test = y.iloc[test_idx]

                estimator = clone(model)

                estimator.fit(X_train, y_train)

                predictions = estimator.predict(X_test)
                probabilities = estimator.predict_proba(X_test)[:, 1]

                fold_results.append(
                    {
                        "strategy": strategy,
                        "model": model_name,
                        "fold": fold_number,
                        "accuracy": accuracy_score(
                            y_test, predictions
                        ),
                        "recall": recall_score(
                            y_test, predictions,
                            zero_division=0,
                        ),
                        "precision": precision_score(
                            y_test, predictions,
                            zero_division=0,
                        ),
                        "specificity": recall_score(
                            y_test,
                            predictions,
                            pos_label=0,
                            zero_division=0,
                        ),
                        "f1": f1_score(
                            y_test, predictions,
                            zero_division=0,
                        ),
                        "balanced_accuracy": balanced_accuracy_score(
                            y_test, predictions
                        ),
                        "roc_auc": roc_auc_score(
                            y_test, probabilities
                        ),
                    }
                )

                print(
                    f"  Fold {fold_number:02d} | "
                    f"{evaluation_number}/{total_evaluations} "
                    f"completed"
                )

    return pd.DataFrame(fold_results)


# --------------------------------------------------
# 7. SUMMARIZE RESULTS
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
    ]

    summary = (
        results
        .groupby(["strategy", "model"])[metrics]
        .agg(["mean", "std"])
        .round(4)
    )

    summary.columns = [
        f"{metric}_{statistic}"
        for metric, statistic in summary.columns
    ]

    return summary.reset_index()


# --------------------------------------------------
# 8. SAVE RESULTS
# --------------------------------------------------

def save_results(results, summary):
    TABLE_DIR.mkdir(parents=True, exist_ok=True)

    fold_path = (
        TABLE_DIR / "missing_value_experiment_fold_results.csv"
    )

    summary_path = (
        TABLE_DIR / "missing_value_experiment_summary.csv"
    )

    results.to_csv(fold_path, index=False)
    summary.to_csv(summary_path, index=False)

    print("\nResults saved:")
    print(f"  {fold_path}")
    print(f"  {summary_path}")


# --------------------------------------------------
# 9. MAIN
# --------------------------------------------------

def main():
    print("HEARTGUARD AI — MISSING VALUE EXPERIMENT")

    results = evaluate_experiment()

    summary = summarize_results(results)

    save_results(results, summary)

    print("\nFINAL RESULTS")
    print(summary.to_string(index=False))

    print("\nExperiment completed successfully.")


if __name__ == "__main__":
    main()
