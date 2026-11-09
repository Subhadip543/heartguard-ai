
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
