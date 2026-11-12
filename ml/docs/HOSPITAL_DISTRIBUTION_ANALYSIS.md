# Hospital Distribution Analysis

## 1. Objective

Investigate differences in clinical feature distributions, missing-value patterns, categorical distributions, and target proportions across the four source hospitals.

The purpose is to understand potential dataset shift and investigate why model performance decreases under Leave-One-Site-Out validation.

## 2. Dataset Overview

| Hospital | Records | Negative | Positive |
|---|---:|---:|---:|
| Cleveland | 303 | 164 | 139 |
| Hungary | 293 | 187 | 106 |
| Switzerland | 123 | 8 | 115 |
| VA | 199 | 51 | 148 |
| **Total** | **918** | **410** | **508** |

## 3. Numerical Feature Distributions

### Mean values

| Feature | Cleveland | Hungary | Switzerland | VA |
|---|---:|---:|---:|---:|
| Age | 54.44 | 47.82 | 55.32 | 59.36 |
| Resting BP | 131.69 | 132.66 | 130.21 | 134.59 |
| Cholesterol | 246.69 | 250.85 | N/A | 239.71 |
| Maximum heart rate | 149.61 | 139.06 | 121.56 | 122.83 |
| Oldpeak | 1.04 | 0.59 | 0.65 | 1.33 |

Switzerland has no recorded cholesterol measurements in the cleaned dataset, so its mean and median cannot be calculated.

### Observations

1. Hungary has the lowest mean age.
2. VA has the highest mean age.
3. Maximum heart rate differs substantially between Cleveland and VA.
4. VA has the highest mean oldpeak.
5. Numerical feature distributions vary across hospitals.

## 4. Missing-Value Distribution

Missing percentages:

| Feature | Cleveland | Hungary | Switzerland | VA |
|---|---:|---:|---:|---:|
| trestbps | 0.00% | 0.34% | 1.63% | 28.64% |
| chol | 0.00% | 7.51% | 100.00% | 28.14% |
| fbs | 0.00% | 2.73% | 60.98% | 3.52% |
| slope | 0.00% | 64.51% | 13.82% | 50.75% |
| ca | 1.32% | 98.98% | 95.93% | 98.99% |
| thal | 0.66% | 90.44% | 42.28% | 82.91% |

### Observations

1. Cleveland has very low missingness across most features.
2. `ca` is almost completely missing in Hungary, Switzerland, and VA.
3. `thal` has substantial missingness outside Cleveland.
4. Switzerland has no cholesterol measurements.
5. VA has approximately 27–29% missingness in several numerical features.

These differences indicate that the availability of clinical information varies substantially across hospitals.

## 5. Categorical Distribution Differences

Selected observations:

| Feature | Cleveland | Hungary | Switzerland | VA |
|---|---:|---:|---:|---:|
| Female (`sex=0`) | 32.01% | 27.30% | 8.13% | 3.02% |
| Chest pain category 4 | 47.52% | 41.98% | 79.67% | 65.83% |
| Exercise angina (`exang=1`) | 32.67% | 30.38% | 43.90% | 47.24% |

Other categorical features, including `fbs`, `restecg`, and `slope`, also show considerable differences across hospitals.

## 6. Target Distribution Differences

| Hospital | Negative percentage | Positive percentage |
|---|---:|---:|
| Cleveland | 54.13% | 45.87% |
| Hungary | 63.82% | 36.18% |
| Switzerland | 6.50% | 93.50% |
| VA | 25.63% | 74.37% |

Switzerland has only eight negative records. Its specificity and balanced accuracy estimates therefore require particular caution.

These are dataset label proportions, not estimates of actual disease prevalence in the hospitals.

## 7. Connection to Model Generalization

Earlier experiments produced the following mean balanced accuracy:

| Validation | Best observed model configuration | Balanced accuracy |
|---|---|---:|
| Random CV | SVM with explicit missing category | 0.8301 |
| LOSO | Baseline Random Forest | 0.7472 |

The difference indicates that performance on randomly held-out records does not necessarily represent performance on patients from an unseen hospital.

Potential contributing factors include:

- Different patient and feature distributions.
- Hospital-specific missing-value patterns.
- Differences in categorical feature distributions.
- Different target-label proportions.

These observations suggest substantial hospital-level dataset shift. They do not establish that any individual factor causes the performance difference.

## 8. Conclusions

1. The four source hospitals have substantially different data distributions.
2. Missingness patterns vary considerably across hospitals.
3. Target-label proportions differ substantially.
4. Numerical and categorical feature distributions are not consistent across sites.
5. Hospital-level distribution differences are plausible contributors to weaker LOSO performance.

## 9. Implications for Further Development

- Retain all 13 clinical features as candidates until further validation.
- Do not select a missing-value strategy using random cross-validation alone.
- Consider hospital-level generalization when selecting the final model.
- Investigate model calibration and decision thresholds.
- Preserve hospital-level evaluation results in the final project documentation.

No final model or preprocessing strategy is selected at this stage.
