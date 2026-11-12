import sys
from pathlib import Path

# Add the repository root so the backend can import the ML package.
PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.src.prediction import predict_patient


MODEL_NAME = "Random Forest"


def get_prediction(patient_data: dict, threshold: float = 0.5) -> dict:
    """
    Generate a prediction using the trained HeartGuard AI pipeline.
    """
    result = predict_patient(
        patient_data=patient_data,
        threshold=threshold,
    )

    result["model_name"] = MODEL_NAME

    return result
