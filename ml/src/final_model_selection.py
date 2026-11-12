
"""
HeartGuard AI
Global Model Selection Using Leave-One-Site-Out CV

Every candidate configuration is evaluated across
the same four hospital folds.

The configuration with the highest mean balanced
accuracy is selected globally.

This is model selection, not independent evaluation.
"""

from pathlib import Path
import json

import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, LeaveOneGroupOut
from sklearn.pipeline import Pipeline

from ml.src.joint_model_selection import (
    RANDOM_STATE,
    build_parameter_grid,
    identify_configuration,
    load_grouped_dataset,
)


# --------------------------------------------------
# 1. PATHS
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

TABLE_DIR = PROJECT_ROOT / "ml" / "reports" / "tables"

TABLE_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# 2. MAIN
# --------------------------------------------------

def main():

    X, y, groups = load_grouped_dataset()

    print("\nHEARTGUARD AI")
    print("GLOBAL MODEL SELECTION")
    print("=" * 65)

    print("\nEvaluation strategy: Leave-One-Site-Out CV")
    print(f"Hospital groups: {sorted(groups.unique())}")

    # All nine model/preprocessing combinations
    parameter_grid = build_parameter_grid()

    # Placeholder estimator; candidates replace both steps
    pipeline = Pipeline([
        ("preprocessor", "passthrough"),
        (
            "classifier",
            LogisticRegression(
                max_iter=3000,
                random_state=RANDOM_STATE,
            ),
        ),
    ])

    cv = LeaveOneGroupOut()

    search = GridSearchCV(
        estimator=pipeline,
        param_grid=parameter_grid,
        scoring="balanced_accuracy",
        cv=cv,
        n_jobs=-1,
        refit=False,
        error_score="raise",
        return_train_score=False,
    )

    print("\nEvaluating all candidate configurations...")

    search.fit(
        X,
        y,
        groups=groups,
    )

    # --------------------------------------------------
    # 3. BUILD RESULTS TABLE
    # --------------------------------------------------

    results = pd.DataFrame(search.cv_results_)

    rows = []

    for _, row in results.iterrows():

        params = row["params"]

        strategy, model_name, hyperparameters = (
            identify_configuration(params)
        )

        result = {
            "strategy": strategy,
            "model": model_name,
            "hyperparameters": json.dumps(
                hyperparameters,
                sort_keys=True,
            ),
            "mean_balanced_accuracy": row["mean_test_score"],
            "std_balanced_accuracy": row["std_test_score"],
            "rank": row["rank_test_score"],
        }

        # Individual hospital-fold scores
        for fold_index, site in enumerate(
            sorted(groups.unique())
        ):

            result[f"{site}_balanced_accuracy"] = (
                row[f"split{fold_index}_test_score"]
            )

        rows.append(result)

    results_df = pd.DataFrame(rows)

    results_df = results_df.sort_values(
        by=["mean_balanced_accuracy", "std_balanced_accuracy"],
        ascending=[False, True],
    ).reset_index(drop=True)

    # --------------------------------------------------
    # 4. SELECT ONE GLOBAL CONFIGURATION
    # --------------------------------------------------

    best_params = search.best_params_

    strategy, model_name, hyperparameters = (
        identify_configuration(best_params)
    )

    selected_configuration = {
        "strategy": strategy,
        "model": model_name,
        "hyperparameters": hyperparameters,
        "mean_balanced_accuracy": float(search.best_score_),
    }

    # --------------------------------------------------
    # 5. SAVE RESULTS
    # --------------------------------------------------

    results_path = (
        TABLE_DIR / "global_model_selection_results.csv"
    )

    selected_path = (
        TABLE_DIR / "selected_global_configuration.json"
    )

    results_df.to_csv(results_path, index=False)

    with open(selected_path, "w") as file:
        json.dump(
            selected_configuration,
            file,
            indent=4,
        )

    # --------------------------------------------------
    # 6. DISPLAY RESULTS
    # --------------------------------------------------

    print("\nALL CONFIGURATIONS")
    print("=" * 65)

    print(
        results_df.to_string(
            index=False,
            float_format=lambda value: f"{value:.4f}",
        )
    )

    print("\nSELECTED GLOBAL CONFIGURATION")
    print("=" * 65)

    print(f"Strategy: {strategy}")
    print(f"Model: {model_name}")
    print(f"Hyperparameters: {hyperparameters}")

    print(
        "Mean LOSO balanced accuracy: "
        f"{search.best_score_:.4f}"
    )

    print("\nRESULTS SAVED")
    print(results_path)
    print(selected_path)


if __name__ == "__main__":
    main()

