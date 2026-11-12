
import numpy as np
import pytest

from ml.src.preprocessing import (
    FEATURES,
    TARGET,
    load_dataset,
    build_preprocessor,
)


def test_dataset_shape_and_features():
    X, y = load_dataset()

    assert X.shape == (918, 13)
    assert list(X.columns) == FEATURES
    assert y.shape == (918,)
    assert set(y.unique()) == {0, 1}


def test_dataset_contains_missing_values():
    X, _ = load_dataset()

    assert X.isna().sum().sum() > 0


@pytest.mark.parametrize(
    "strategy, expected_columns",
    [
        ("baseline", 28),
        ("missing_indicators", 41),
        ("explicit_missing_category", 34),
    ],
)
def test_preprocessing_strategy_output(
    strategy,
    expected_columns,
):
    X, y = load_dataset()

    preprocessor = build_preprocessor(strategy=strategy)

    transformed = preprocessor.fit_transform(X, y)

    assert transformed.shape == (918, expected_columns)


def test_missing_indicator_transformer_exists():
    preprocessor = build_preprocessor(
        strategy="missing_indicators"
    )

    transformer_names = [
        item[0] for item in preprocessor.transformers
    ]

    assert "missing_indicators" in transformer_names


def test_baseline_has_no_missing_indicator_transformer():
    preprocessor = build_preprocessor(strategy="baseline")

    transformer_names = [
        item[0] for item in preprocessor.transformers
    ]

    assert "missing_indicators" not in transformer_names


def test_positional_strategy_compatibility():
    preprocessor = build_preprocessor("missing_indicators")

    transformer_names = [
        item[0] for item in preprocessor.transformers
    ]

    assert transformer_names == [
        "numerical",
        "categorical",
        "missing_indicators",
    ]


def test_unknown_strategy_raises_error():
    with pytest.raises(ValueError, match="Unknown strategy"):
        build_preprocessor(strategy="invalid_strategy")
