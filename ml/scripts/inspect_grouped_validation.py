
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "processed"
    / "heart_disease_918_cleaned.csv"
)

df = pd.read_csv(DATA_PATH)

print("\nHOSPITAL SAMPLE COUNTS")
print(df.groupby("site").size())

print("\nHOSPITAL × TARGET COUNTS")
print(
    pd.crosstab(
        df["site"],
        df["target"],
        margins=True,
    )
)

print("\nHOSPITAL TARGET DISTRIBUTION")
print(
    pd.crosstab(
        df["site"],
        df["target"],
        normalize="index",
    ).round(4)
)

print("\nTOTAL RECORDS:", len(df))
