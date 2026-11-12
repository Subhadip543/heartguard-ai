
from pathlib import Path

import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import MissingIndicator, SimpleImputer
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

METADATA_COLUMNS = ["site", "num"]

SUPPORTED_STRATEGIES = [
    "baseline",
    "missing_indicators",
    "explicit_missing_category",
]


# --------------------------------------------------
# 2. LOAD DATASET
# --------------------------------------------------

def load_dataset():
    """
    Load and validate the cleaned heart disease dataset.

    Categorical values are converted to strings while
    preserving missing values as actual NaN values.
    """

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
        raise ValueError(
            "Target must contain only 0 and 1."
        )

    # Normalize categorical values while preserving NaN.
    for column in CATEGORICAL_FEATURES:
        X[column] = X[column].map(
            lambda value: (
                str(value) if pd.notna(value) else float("nan")
            )
        )

    return X, y


# --------------------------------------------------
# 3. BUILD PREPROCESSOR
# --------------------------------------------------

def build_preprocessor(
    numerical_features=None,
    categorical_features=None,
    strategy="baseline",
):
    """
    Build a preprocessing pipeline.

    Supported strategies:
        baseline
        missing_indicators
        explicit_missing_category

    Existing calls using numerical_features and
    categorical_features remain supported.

    A positional strategy string is also supported
    for compatibility with existing experiment scripts.
    """

    # Support build_preprocessor("missing_indicators")
    if isinstance(numerical_features, str):
        if categorical_features is not None:
            raise ValueError(
                "Cannot combine a positional strategy "
                "with custom feature lists."
            )

        if strategy != "baseline":
            raise ValueError(
                "Strategy was supplied more than once."
            )

        strategy = numerical_features
        numerical_features = None

    if strategy not in SUPPORTED_STRATEGIES:
        raise ValueError(
            f"Unknown strategy: {strategy}. "
            f"Supported strategies: {SUPPORTED_STRATEGIES}"
        )

    numerical_features = (
        NUMERICAL_FEATURES
        if numerical_features is None
        else numerical_features
    )

    categorical_features = (
        CATEGORICAL_FEATURES
        if categorical_features is None
        else categorical_features
    )

    feature_columns = (
        numerical_features + categorical_features
    )

    # Numerical preprocessing:
    # Median imputation -> Standardization
    numerical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    # Categorical preprocessing depends on strategy.
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

    transformers = [
        (
            "numerical",
            numerical_pipeline,
            numerical_features,
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features,
        ),
    ]

    # Add missing-value indicators for all selected features.
    if strategy == "missing_indicators":

        transformers.append(
            (
                "missing_indicators",
                MissingIndicator(features="all"),
                feature_columns,
            )
        )

    return ColumnTransformer(
        transformers=transformers,
        remainder="drop",
    )


# --------------------------------------------------
# 4. FEATURE UTILITIES
# --------------------------------------------------

def get_feature_columns(
    numerical_features=None,
    categorical_features=None,
):
    """Return the selected predictive feature names."""

    numerical_features = (
        NUMERICAL_FEATURES
        if numerical_features is None
        else numerical_features
    )

    categorical_features = (
        CATEGORICAL_FEATURES
        if categorical_features is None
        else categorical_features
    )

    return numerical_features + categorical_features
