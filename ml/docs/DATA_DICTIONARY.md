
# HeartGuard AI — Data Dictionary

## Dataset Information

- Dataset: Combined UCI Heart Disease Dataset
- Original records: 920
- Records after duplicate removal: 918
- Original clinical attributes: 13
- Original diagnosis column: num
- Additional metadata: site
- Derived target: target

## Feature Definitions

| Feature | Description | Type | Role |
|---|---|---|---|
| age | Age in years | Numeric | Input |
| sex | Biological sex (0/1 coding) | Categorical | Input |
| cp | Chest pain type | Categorical | Input |
| trestbps | Resting blood pressure | Numeric | Input |
| chol | Serum cholesterol | Numeric | Input |
| fbs | Fasting blood sugar > 120 mg/dl | Categorical | Input |
| restecg | Resting ECG result | Categorical | Input |
| thalach | Maximum heart rate achieved | Numeric | Input |
| exang | Exercise-induced angina | Categorical | Input |
| oldpeak | ST depression induced by exercise | Numeric | Input |
| slope | Slope of peak exercise ST segment | Categorical | Input |
| ca | Major vessels coloured by fluoroscopy | Categorical | Input |
| thal | Thallium test result | Categorical | Input |
| num | Original angiographic diagnosis (0–4) | Ordinal label | Original target |
| target | Binary diagnosis derived from num | Binary | ML target |
| site | Source hospital/cohort | Metadata | Analysis only |

## Target Transformation

- num = 0 → target = 0
- num = 1, 2, 3, or 4 → target = 1

The original num column is retained.

## Important Notes

- '?' is interpreted as a missing value.
- Zero cholesterol values in Switzerland and VA are treated as missing.
- Zero resting blood pressure in VA is treated as missing.
- site is retained for analysis, not used as a predictive feature.
- The dataset is for educational ML research, not clinical diagnosis.
