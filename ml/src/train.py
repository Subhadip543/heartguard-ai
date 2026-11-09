from pathlib import Path

import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
    GradientBoostingClassifier,
)

from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV

from ml.src.preprocessing import (
    TARGET,
    get_feature_columns,
    build_preprocessor,
)
from ml.src.evaluation import (
    calculate_metrics,
    evaluate_leave_one_site_out,
)



# --------------------------------------------------
# PATHS AND CONFIGURATION
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ML_ROOT = PROJECT_ROOT / "ml"

DATA_PATH = (
    ML_ROOT
    / "data"
    / "processed"
    / "heart_disease_918_cleaned.csv"
)

MODEL_DIR = ML_ROOT / "models"
TABLE_DIR = ML_ROOT / "reports" / "tables"

RANDOM_STATE = 42
TEST_SIZE = 0.20


# --------------------------------------------------
# DATA LOADING AND VALIDATION
# --------------------------------------------------

def load_dataset():
    print("\nLoading dataset...")

    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_PATH}"
        )

    df = pd.read_csv(DATA_PATH)

    required_columns = (
        get_feature_columns()
        + [TARGET, "site", "num"]
    )

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    if df[TARGET].isna().any():
        raise ValueError("Target contains missing values.")

    if not set(df[TARGET].unique()).issubset({0, 1}):
        raise ValueError("Target must contain only 0 and 1.")

    if df["site"].isna().any():
        raise ValueError("Site metadata contains missing values.")

    print(f"Dataset shape: {df.shape}")
    print(f"Target distribution:\n{df[TARGET].value_counts()}")
    print(f"Sites: {sorted(df['site'].unique())}")

    return df


# --------------------------------------------------
# MODEL DEFINITIONS
# --------------------------------------------------


def build_models(
    numerical_features=None,
    categorical_features=None,
):
    models = {
        "logistic_regression": LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        ),

        "random_forest": RandomForestClassifier(
            n_estimators=500,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),

        "svm": CalibratedClassifierCV(
            estimator=SVC(
                kernel="rbf",
                C=1.0,
                class_weight="balanced",
                random_state=RANDOM_STATE,
            ),
            method="sigmoid",
            cv=5,
            ensemble=False,
        ),

        "extra_trees": ExtraTreesClassifier(
            n_estimators=500,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),

        "gradient_boosting": GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=2,
            random_state=RANDOM_STATE,
        ),

        "decision_tree": DecisionTreeClassifier(
            max_depth=4,
            min_samples_leaf=10,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        ),
    }

    pipelines = {}

    for name, classifier in models.items():
        pipelines[name] = Pipeline(
            steps=[
                (
                    "preprocessor",
                    build_preprocessor(
                        numerical_features,
                        categorical_features,
                    ),
                ),
                ("classifier", classifier),
            ]
        )

    return pipelines


# --------------------------------------------------
# RANDOM TRAIN-TEST EVALUATION
# --------------------------------------------------

def evaluate_random_split(df, models):
    print("\nStarting stratified random split evaluation...")

    X = df[get_feature_columns()]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    print(f"Training records: {len(X_train)}")
    print(f"Testing records: {len(X_test)}")

    results = []
    prediction_frames = []
    fitted_models = {}

    for model_name, model in models.items():
        print(f"\nTraining {model_name}...")

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)
        probabilities = model.predict_proba(X_test)[:, 1]

        metrics = calculate_metrics(
            y_test,
            predictions,
            probabilities,
        )

        results.append(
            {
                "model": model_name,
                **metrics,
            }
        )

        prediction_frames.append(
            pd.DataFrame(
                {
                    "record_index": X_test.index,
                    "site": df.loc[X_test.index, "site"].values,
                    "actual": y_test.values,
                    "predicted": predictions,
                    "probability": probabilities,
                }
            )
        )

        fitted_models[model_name] = model

        print(f"ROC-AUC: {metrics['roc_auc']:.4f}")
        print(f"Recall: {metrics['recall']:.4f}")
        print(f"Specificity: {metrics['specificity']:.4f}")
        print(
            f"Balanced accuracy: "
            f"{metrics['balanced_accuracy']:.4f}"
        )

    return (
        pd.DataFrame(results),
        pd.concat(prediction_frames, ignore_index=True),
        fitted_models,
    )


# --------------------------------------------------
# LEAVE-ONE-SITE-OUT EVALUATION
# --------------------------------------------------

def evaluate_site_generalization(df, models):
    print("\nStarting Leave-One-Site-Out evaluation...")

    X = df[get_feature_columns()]
    y = df[TARGET]
    groups = df["site"]

    all_results = []

    for model_name, model in models.items():
        print(f"\nEvaluating {model_name} across sites...")

        results = evaluate_leave_one_site_out(
            estimator=model,
            X=X,
            y=y,
            groups=groups,
            model_name=model_name,
        )

        all_results.append(results)

    return pd.concat(all_results, ignore_index=True)


# --------------------------------------------------
# SAVE OUTPUTS
# --------------------------------------------------

def save_outputs(
    random_results,
    predictions,
    site_results,
    fitted_models,
):
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    TABLE_DIR.mkdir(parents=True, exist_ok=True)

    random_results.to_csv(
        TABLE_DIR / "baseline_random_split_metrics.csv",
        index=False,
    )

    predictions.to_csv(
        TABLE_DIR / "baseline_random_split_predictions.csv",
        index=False,
    )

    site_results.to_csv(
        TABLE_DIR / "baseline_leave_one_site_out_metrics.csv",
        index=False,
    )

    site_summary = (
        site_results
        .groupby("model")[
            [
                "recall",
                "specificity",
                "balanced_accuracy",
                "roc_auc",
                "pr_auc",
            ]
        ]
        .agg(["mean", "std"])
    )

    site_summary.to_csv(
        TABLE_DIR / "baseline_leave_one_site_out_summary.csv"
    )

    for model_name, model in fitted_models.items():
        model_path = MODEL_DIR / f"{model_name}_baseline.joblib"
        joblib.dump(model, model_path)

    print("\nAll reports and models saved successfully.")


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():
    df = load_dataset()
    models = build_models()

    random_results, predictions, fitted_models = (
        evaluate_random_split(df, models)
    )

    site_results = evaluate_site_generalization(
        df,
        models,
    )

    print("\nRANDOM SPLIT RESULTS")
    print(random_results.to_string(index=False))

    print("\nLEAVE-ONE-SITE-OUT RESULTS")
    print(
        site_results[
            [
                "model",
                "held_out_site",
                "testing_records",
                "recall",
                "specificity",
                "balanced_accuracy",
                "roc_auc",
                "pr_auc",
            ]
        ].to_string(index=False)
    )

    save_outputs(
        random_results,
        predictions,
        site_results,
        fitted_models,
    )

    print("\nBASELINE TRAINING COMPLETE")


if __name__ == "__main__":
    main()
