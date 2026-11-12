
import numpy as np
import pytest

from ml.src.preprocessing import (
    FEATURES,
    load_dataset,
)

from ml.src.prediction import (
    load_model,
    prepare_patient_data,
    predict_patient,
)


@pytest.fixture(scope="module")
def model():
    return load_model()


@pytest.fixture
def patient():
    X, _ = load_dataset()
    return X.iloc[0].to_dict()


def test_model_loads(model):
    assert model is not None
    assert "preprocessor" in model.named_steps
    assert "classifier" in model.named_steps


def test_valid_patient_preparation(patient, model):
    prepared = prepare_patient_data(patient, model=model)

    assert prepared.shape == (1, 13)
    assert list(prepared.columns) == FEATURES


def test_categorical_normalization(patient, model):
    patient["sex"] = 1

    prepared = prepare_patient_data(patient, model=model)

    assert prepared.iloc[0]["sex"] == "1.0"
    assert isinstance(prepared.iloc[0]["sex"], str)


def test_invalid_categorical_value(patient, model):
    patient["sex"] = 99

    with pytest.raises(ValueError, match="Invalid value for sex"):
        prepare_patient_data(patient, model=model)


def test_missing_feature_is_rejected(patient, model):
    patient.pop("age")

    with pytest.raises(ValueError, match="Missing features"):
        prepare_patient_data(patient, model=model)


def test_extra_feature_is_rejected(patient, model):
    patient["extra_feature"] = 123

    with pytest.raises(ValueError, match="Unexpected features"):
        prepare_patient_data(patient, model=model)


def test_invalid_numerical_value_is_rejected(patient, model):
    patient["age"] = "not-a-number"

    with pytest.raises(ValueError, match="age must be numeric"):
        prepare_patient_data(patient, model=model)


def test_boolean_numerical_value_is_rejected(patient, model):
    patient["age"] = True

    with pytest.raises(ValueError, match="not boolean"):
        prepare_patient_data(patient, model=model)


def test_zero_value_handling(patient, model):
    patient["chol"] = 0
    patient["trestbps"] = 0
    patient["oldpeak"] = 0

    prepared = prepare_patient_data(patient, model=model)

    assert np.isnan(prepared.iloc[0]["chol"])
    assert np.isnan(prepared.iloc[0]["trestbps"])
    assert prepared.iloc[0]["oldpeak"] == 0


@pytest.mark.parametrize(
    "threshold",
    [-0.1, 1.1, np.nan, np.inf, -np.inf],
)
def test_invalid_threshold_is_rejected(patient, threshold):
    with pytest.raises(ValueError, match="Threshold"):
        predict_patient(patient, threshold=threshold)


def test_prediction_output(patient):
    result = predict_patient(patient, threshold=0.5)

    assert result["prediction"] in [0, 1]

    assert result["prediction_label"] in [
        "positive_class",
        "negative_class",
    ]

    assert 0 <= result["positive_probability"] <= 1
    assert result["threshold"] == 0.5

    expected_label = (
        "positive_class"
        if result["prediction"] == 1
        else "negative_class"
    )

    assert result["prediction_label"] == expected_label
