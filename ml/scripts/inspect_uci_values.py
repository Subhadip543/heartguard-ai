
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

FILES = {
    "Cleveland": "processed.cleveland.data",
    "Hungary": "processed.hungarian.data",
    "Switzerland": "processed.switzerland.data",
    "VA": "processed.va.data",
}

COLUMNS = [
    "age", "sex", "cp", "trestbps", "chol", "fbs",
    "restecg", "thalach", "exang", "oldpeak",
    "slope", "ca", "thal", "num",
]

all_records = []
zero_observations = Counter()
site_records = {}

for site, filename in FILES.items():
    with (DATA_DIR / filename).open(newline="") as file:
        rows = list(csv.reader(file))

    site_records[site] = rows

    print(f"\n{'=' * 50}")
    print(f"{site}: {len(rows)} records")

    for index, column in enumerate(COLUMNS):
        values = [
            float(row[index])
            for row in rows
            if row[index].strip() != "?"
        ]

        if values:
            print(
                f"{column:10} "
                f"min={min(values):8.2f} "
                f"max={max(values):8.2f} "
                f"unique={len(set(values)):4}"
            )

    for row_number, row in enumerate(rows, start=1):
        record = tuple(value.strip() for value in row)
        all_records.append((site, row_number, record))

        for column in ("trestbps", "chol"):
            index = COLUMNS.index(column)

            if row[index].strip() in ("0", "0.0"):
                zero_observations[(site, column)] += 1
                print(
                    f"ZERO: site={site}, "
                    f"row={row_number}, "
                    f"column={column}, "
                    f"target={row[13]}"
                )

print("\n" + "=" * 50)
print("ZERO VALUE SUMMARY")

for (site, column), count in sorted(zero_observations.items()):
    print(f"{site:15} {column:10} {count}")

print("\n" + "=" * 50)
print("EXACT DUPLICATE AUDIT")

record_counts = Counter(record for _, _, record in all_records)

duplicate_groups = {
    record: count
    for record, count in record_counts.items()
    if count > 1
}

print(f"Total records: {len(all_records)}")
print(f"Unique records: {len(record_counts)}")
print(f"Duplicate groups: {len(duplicate_groups)}")
print(
    "Extra repeated records:",
    sum(count - 1 for count in duplicate_groups.values())
)

for record, count in list(duplicate_groups.items())[:10]:
    locations = [
        f"{site}:row {row_number}"
        for site, row_number, current in all_records
        if current == record
    ]

    print(f"\nRepeated {count} times: {locations}")
