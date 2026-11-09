
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


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

TARGET = "target"
METADATA_COLUMNS = ["site", "num"]


def build_preprocessor(
    numerical_features=None,
    categorical_features=None,
):
    """Build preprocessing for a selected feature configuration."""

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

    numerical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "encoder",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=True,
                ),
            ),
        ]
    )

    return ColumnTransformer(
        transformers=[
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
        ],
        remainder="drop",
    )


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
