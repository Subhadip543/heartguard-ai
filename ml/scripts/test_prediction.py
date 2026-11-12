
from ml.src.preprocessing import load_dataset
from ml.src.prediction import predict_patient


def main():
    X, _ = load_dataset()

    # Use one record only to test the prediction interface.
    patient = X.iloc[0].to_dict()

    result = predict_patient(patient)

    print("\nHEARTGUARD AI")
    print("PREDICTION INTERFACE TEST")
    print("=" * 40)

    for key, value in result.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    main()
