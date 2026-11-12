
# HeartGuard AI — Dataset Card

## 1. Dataset Source

The project uses the combined UCI Heart Disease dataset.

The four source cohorts are:

- Cleveland
- Hungary
- Switzerland
- VA Long Beach

Original source files are preserved in:

`ml/data/raw/uci_heart_disease/source_files/`

Official source:
https://archive.ics.uci.edu/dataset/45/heart+disease

## 2. Dataset Size

| Stage | Records |
|---|---:|
| Original combined data | 920 |
| Exact duplicate records removed | 2 |
| Experimental dataset | 918 |

## 3. Target Distribution

| Target | Meaning | Records |
|---|---|---:|
| 0 | No angiographic disease | 410 |
| 1 | Angiographic disease present | 508 |

## 4. Data Preparation

- Added column names.
- Added source-site metadata.
- Converted '?' to missing values.
- Converted identified invalid zero measurements to missing values.
- Removed two exact duplicate records within their respective sites.
- Preserved original diagnosis num.
- Derived binary target.

## 5. Known Limitations

- The source cohorts have different missing-value patterns.
- Some features are almost entirely missing in particular cohorts.
- The dataset is relatively small.
- The dataset comes from historical clinical cohorts.
- The binary target represents angiographic disease status, not future cardiovascular risk.

## 6. Intended Use

Educational machine-learning experimentation and software engineering demonstration.

Not intended for clinical diagnosis, treatment recommendations, or independent medical decision-making.

## 7. Validation Status

Initial source and structural validation completed.

Further statistical analysis, preprocessing validation, and model evaluation are pending.


## Dataset Preparation

The dataset is assembled from four UCI Heart Disease source files:

| Source | Original Records | Final Records |
|---|---:|---:|
| Cleveland | 303 | 303 |
| Hungary | 294 | 293 |
| Switzerland | 123 | 123 |
| VA | 200 | 199 |
| Total | 920 | 918 |

Two exact duplicate records were removed from the Hungarian and
VA source datasets.

## Missing Value Handling

The original dataset uses `?` to represent missing values.

The following cleaning rules are applied:

1. Convert `?` values into missing values.
2. Treat `chol = 0` as missing.
3. Treat `trestbps = 0` as missing.
4. Preserve zero values in categorical features because they
   represent valid categories.

The zero measurement rules are based on the interpretation that
zero cholesterol and zero resting blood pressure are not valid
physiological measurements.

## Target Construction

The original target variable `num` contains values from 0 to 4.

The binary target is created as follows:

- `num = 0`: No diagnosed heart disease.
- `num > 0`: Presence of heart disease.

The resulting target distribution is:

| Target | Records |
|---|---:|
| 0 | 410 |
| 1 | 508 |

## Final Dataset Information

- Total records: 918
- Clinical input features: 13
- Metadata columns: 2 (`site`, `num`)
- Target column: 1 (`target`)
- Total columns: 16

## Data Preparation Script

The canonical preparation script is:

`ml/scripts/prepare_uci_dataset.py`

Run it from the project root:

`python ml/scripts/prepare_uci_dataset.py`

This regenerates the interim and cleaned datasets from the
original source files.