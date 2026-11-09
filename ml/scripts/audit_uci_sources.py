import csv
from collections import Counter
from pathlib import Path

DATA_DIR = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "raw"
    / "uci_heart_disease"
    / "source_files"
)

DATASETS = {
    "Cleveland": "processed.cleveland.data",
    "Hungary": "processed.hungarian.data",
    "Switzerland": "processed.switzerland.data",
    "VA Long Beach": "processed.va.data",
}

COLUMNS = [
    "age", "sex", "cp", "trestbps", "chol", "fbs",
    "restecg", "thalach", "exang", "oldpeak",
    "slope", "ca", "thal", "num",
]


def audit_dataset(site, filename):
    path = DATA_DIR / filename

    with path.open("r", newline="") as file:
        rows = list(csv.reader(file))

    missing_counts = Counter()
    target_counts = Counter()
    zero_counts = Counter()
    malformed_rows = []

    for row_number, row in enumerate(rows, start=1):
        if len(row) != len(COLUMNS):
            malformed_rows.append((row_number, len(row)))
            continue

        for index, value in enumerate(row):
            value = value.strip()

            if value == "?":
                missing_counts[COLUMNS[index]] += 1

            if value == "0" or value == "0.0":
                if COLUMNS[index] in ("trestbps", "chol"):
                    zero_counts[COLUMNS[index]] += 1

        target_counts[row[13].strip()] += 1

    print(f"\n{'=' * 55}")
    print(f"SITE: {site}")
    print(f"File: {filename}")
    print(f"Records: {len(rows)}")
    print(f"Malformed rows: {len(malformed_rows)}")

    print("\nMissing values by column:")
    if missing_counts:
        for column, count in sorted(missing_counts.items()):
            print(f"  {column}: {count}")
    else:
        print("  None")

    print("\nTarget (num) distribution:")
    for target, count in sorted(target_counts.items()):
        print(f"  {target}: {count}")

    print("\nZero values to investigate:")
    for column in ("trestbps", "chol"):
        print(f"  {column}: {zero_counts[column]}")

    if malformed_rows:
        print("\nMalformed row details:")
        for item in malformed_rows[:10]:
            print(f"  Row {item[0]} has {item[1]} columns")


def main():
    total_records = 0

    for site, filename in DATASETS.items():
        audit_dataset(site, filename)

        with (DATA_DIR / filename).open("r", newline="") as file:
            total_records += sum(1 for _ in csv.reader(file))

    print(f"\n{'=' * 55}")
    print(f"TOTAL RECORDS ACROSS ALL SOURCES: {total_records}")


if __name__ == "__main__":
    main()
