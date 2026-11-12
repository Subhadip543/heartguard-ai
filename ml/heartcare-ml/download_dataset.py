
from pathlib import Path
import pandas as pd
from ucimlrepo import fetch_ucirepo

# Find the dataset folder
dataset_folder = Path(__file__).parent / "dataset"

# Create the folder if needed
dataset_folder.mkdir(parents=True, exist_ok=True)

try:
    print("Downloading UCI Heart Disease dataset...")

    # Download dataset number 45 from UCI
    heart_disease = fetch_ucirepo(id=45)

    # Get input features
    features = heart_disease.data.features.copy()

    # Get target values
    targets = heart_disease.data.targets.copy()

    # Combine features and target
    dataset = pd.concat([features, targets], axis=1)

    # Save as CSV
    file_path = dataset_folder / "heart_disease.csv"
    dataset.to_csv(file_path, index=False)

    print("\nDataset downloaded successfully!")
    print("Dataset shape:", dataset.shape)

    print("\nFeature columns:")
    print(features.columns.tolist())

    print("\nFirst five records:")
    print(dataset.head().to_string())

    print("\nMissing values:")
    print(dataset.isnull().sum())

    target_column = targets.columns[0]

    print("\nTarget distribution:")
    print(dataset[target_column].value_counts(dropna=False).sort_index())

    print("\nCSV saved at:", file_path)

except Exception as error:
    print("\nDataset download failed.")
    print("Error:", error)
