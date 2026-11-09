
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

RAW_DIR = ROOT / "data/raw/uci_heart_disease/source_files"
INTERIM_DIR = ROOT / "data/interim"
PROCESSED_DIR = ROOT / "data/processed"

FILES = {
    "cleveland": "processed.cleveland.data",
    "hungarian": "processed.hungarian.data",
    "switzerland": "processed.switzerland.data",
    "va": "processed.va.data",
}

COLUMNS = [
    "age", "sex", "cp", "trestbps", "chol", "fbs",
    "restecg", "thalach", "exang", "oldpeak",
    "slope", "ca", "thal", "num",
]

OUTPUT_COLUMNS = COLUMNS + ["site", "target"]


def load_records():
    records = []

    for site, filename in FILES.items():
        path = RAW_DIR / filename

        with path.open(newline="") as file:
            reader = csv.reader(file)

            for line_number, row in enumerate(reader, start=1):
                if len(row) != len(COLUMNS):
                    raise ValueError(
                        f"Invalid row: {filename}:{line_number}"
                    )

                record = dict(zip(COLUMNS, row))
                record["site"] = site

                if record["num"].strip() not in {"0", "1", "2", "3", "4"}:
                    raise ValueError(
                        f"Invalid target in {filename}:{line_number}"
                    )

                records.append(record)

    return records


def normalize_missing_values(record):
    cleaned = record.copy()

    for column in COLUMNS:
        value = cleaned[column].strip()

        if value == "?":
            cleaned[column] = ""
        else:
            cleaned[column] = value

    # Confirmed invalid measurement values in these source files.
    if cleaned["chol"] in ("0", "0.0"):
        cleaned["chol"] = ""

    if cleaned["trestbps"] in ("0", "0.0"):
        cleaned["trestbps"] = ""

    return cleaned


def save_csv(path, records, fieldnames):
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)


def main():
    records = load_records()

    # Interim dataset: preserve measurement values and all records.
    interim_records = []

    for record in records:
        interim = record.copy()

        for column in COLUMNS:
            if interim[column].strip() == "?":
                interim[column] = ""

        interim_records.append(interim)

    interim_path = INTERIM_DIR / "heart_disease_920_interim.csv"
    save_csv(interim_path, interim_records, COLUMNS + ["site"])

    # Cleaned dataset: normalize missing values and remove
    # exact duplicate records within the same source site.
    cleaned_records = []
    seen = set()
    duplicate_count = 0

    for record in records:
        cleaned = normalize_missing_values(record)

        key = tuple(cleaned[column] for column in COLUMNS)
        key += (cleaned["site"],)

        if key in seen:
            duplicate_count += 1
            continue

        seen.add(key)

        cleaned["target"] = (
            0 if int(cleaned["num"]) == 0 else 1
        )

        cleaned_records.append(cleaned)

    cleaned_path = PROCESSED_DIR / "heart_disease_918_cleaned.csv"
    save_csv(cleaned_path, cleaned_records, OUTPUT_COLUMNS)

    print("\nDATASET PREPARATION COMPLETE")
    print("-" * 40)
    print(f"Original records: {len(records)}")
    print(f"Duplicate records removed: {duplicate_count}")
    print(f"Cleaned records: {len(cleaned_records)}")
    print(f"Interim file: {interim_path}")
    print(f"Cleaned file: {cleaned_path}")

    print("\nBinary target distribution:")

    for target in (0, 1):
        count = sum(
            record["target"] == target
            for record in cleaned_records
        )
        print(f"Target {target}: {count}")

    print("\nRecords by site:")

    for site in FILES:
        count = sum(
            record["site"] == site
            for record in cleaned_records
        )
        print(f"{site}: {count}")


if __name__ == "__main__":
    main()
