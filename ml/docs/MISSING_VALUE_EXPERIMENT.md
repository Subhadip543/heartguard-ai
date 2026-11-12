
# Missing Value Strategy Experiment

## 1. Objective

Evaluate different missing-value handling strategies for the
HeartGuard AI heart disease classification dataset.

The experiment investigates whether explicitly representing
missingness improves predictive performance compared with
conventional median and most-frequent imputation.

## 2. Dataset

- Dataset: UCI Heart Disease combined dataset
- Records: 918
- Input features: 13
- Target: Binary heart disease classification
- Negative cases: 410
- Positive cases: 508

## 3. Experimental Setup

### Cross-validation

- Stratified 5-fold cross-validation
- 3 repetitions
- 15 evaluations per model
- Total evaluations: 135

### Classifiers

- Logistic Regression
- Random Forest
- SVM

### Preprocessing strategies

1. Baseline:
   - Median imputation for numerical features.
   - Most-frequent imputation for categorical features.

2. Missing indicators:
   - Conventional imputation.
   - Additional missingness indicators.

3. Explicit missing category:
   - Missing categorical values represented as a separate category.
   - Numerical features handled through numerical imputation.

## 4. Results

| Strategy | Model | Balanced Accuracy | ROC-AUC |
|---|---|---:|---:|
| Baseline | Logistic Regression | 0.7976 | 0.8797 |
| Baseline | Random Forest | 0.8031 | 0.8806 |
| Baseline | SVM | 0.8054 | 0.8833 |
| Missing Indicators | Logistic Regression | 0.8263 | 0.9012 |
| Missing Indicators | Random Forest | 0.8187 | 0.8934 |
| Missing Indicators | SVM | 0.8215 | 0.8978 |
| Explicit Category | Logistic Regression | 0.8260 | 0.9000 |
| Explicit Category | Random Forest | 0.8248 | 0.8947 |
| Explicit Category | SVM | 0.8255 | 0.8966 |

## 5. Strategy-Level Comparison

| Strategy | Mean Balanced Accuracy |
|---|---:|
| Baseline | 0.8020 |
| Missing Indicators | 0.8222 |
| Explicit Missing Category | 0.8254 |

Explicit missing category achieved the highest average
balanced accuracy across the three classifiers.

However, its advantage over missing indicators was small.

## 6. Key Observations

- Both missingness-aware strategies outperformed baseline
  imputation across all three classifiers.
- Missing indicators produced the highest ROC-AUC for
  Logistic Regression.
- Explicit missing categories performed best for Random Forest.
- Explicit missing categories produced the highest balanced
  accuracy for SVM.
- Missing indicators produced the highest SVM recall.
- The overall difference between the two improved strategies
  was small.

## 7. Provisional Conclusion

Missingness-aware preprocessing appears promising for the
HeartGuard AI dataset.

Explicit missing categories achieved the highest average
balanced accuracy, but the improvement over missing indicators
was not large enough to establish a definitive winner.

The default preprocessing strategy should not be finalized
until implementation details, fold-level variation, and
hospital-level generalization have been reviewed.

## 8. Limitations

- Results are based on internal cross-validation.
- The four hospital sources have different target distributions.
- Missingness may reflect differences in data collection practices.
- Performance on unseen hospitals remains a concern.
- These results do not establish clinical validity.

## 9. Generated Results

- `ml/reports/tables/missing_value_experiment_fold_results.csv`
- `ml/reports/tables/missing_value_experiment_summary.csv`


## Results

### Experimental Configuration

- Dataset: 918 records
- Cross-validation: Repeated Stratified 5-Fold
- Repeats: 3
- Total evaluations: 135
- Classifiers: Logistic Regression, Random Forest, SVM
- Strategies:
  - Baseline median/mode imputation
  - Missing indicators
  - Explicit missing category

### Results — Balanced Accuracy

| Model | Baseline | Missing Indicators | Explicit Missing Category |
|---|---:|---:|---:|
| Logistic Regression | 0.7976 | 0.8263 | 0.8260 |
| Random Forest | 0.8031 | 0.8187 | 0.8248 |
| SVM | 0.8054 | 0.8215 | 0.8255 |

### Key Findings

1. Both missingness-aware strategies improved balanced accuracy over baseline imputation for all three classifiers.
2. Missing indicators performed marginally better with Logistic Regression.
3. Explicit missing categories performed better with Random Forest and SVM.
4. The differences between the two improved strategies were small.
5. These results are based on repeated stratified random cross-validation and do not establish generalization to unseen hospitals.

### Preliminary Conclusion

Missingness-aware preprocessing appears promising for the HeartGuard AI dataset. Explicit missing categories and missing indicators should both remain candidates for further evaluation.

No final preprocessing strategy or classifier is selected based solely on this experiment.

## Leave-One-Site-Out (LOSO) Experiment

### Experimental Configuration

- Dataset: 918 records
- Validation: Leave-One-Site-Out
- Hospital sites: Cleveland, Hungary, Switzerland, VA
- Preprocessing strategies: Baseline, Missing Indicators, Explicit Missing Category
- Classifiers: Logistic Regression, Random Forest, SVM
- Total evaluations: 36
- Hospital-level result rows: 144

### Balanced Accuracy Results

| Model | Baseline | Missing Indicators | Explicit Missing Category |
|---|---:|---:|---:|
| Logistic Regression | 0.7423 | 0.7372 | 0.7448 |
| Random Forest | 0.7472 | 0.7424 | 0.7390 |
| SVM | 0.7284 | 0.7454 | 0.7221 |

### Hospital-Level Findings

| Hospital | Best Observed Configuration | Balanced Accuracy |
|---|---|---:|
| Cleveland | Explicit Category + Logistic Regression | 0.8090 |
| Hungary | Explicit Category + Logistic Regression | 0.8280 |
| Switzerland | Missing Indicators + SVM | 0.7620 |
| VA | Missing Indicators + Logistic Regression | 0.6952 |

### Key Findings

1. Missingness-aware strategies did not consistently outperform baseline imputation under LOSO validation.
2. Logistic Regression performed marginally better with explicit missing categories.
3. Random Forest achieved its highest mean balanced accuracy with baseline preprocessing.
4. SVM performed best with missing indicators.
5. VA showed relatively weak generalization performance across configurations.
6. Switzerland has only eight negative records, making its specificity estimates unstable.
7. Performance varied across hospitals, indicating potential differences in hospital-specific data distributions.

### Comparison with Random Cross-Validation

The earlier repeated stratified cross-validation experiment showed consistent improvements from missingness-aware preprocessing.

However, LOSO results did not reproduce those improvements consistently.

This indicates that random cross-validation performance may be optimistic when the intended deployment environment includes previously unseen hospitals.

### Preliminary Conclusion

No universally superior missing-value strategy has been established.

Baseline Random Forest achieved the highest mean LOSO balanced accuracy (0.7472), while missing-indicator SVM achieved 0.7454.

These results are preliminary and do not establish a final model or preprocessing configuration.

Further investigation of hospital-level data distributions and generalization differences is required.