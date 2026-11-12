# HeartCare ML Prediction Module

## Project Overview

HeartCare ML is an educational machine-learning research prototype
using historical UCI Heart Disease datasets.

It provides binary classification and model-output explanations.

It does not provide a medical diagnosis.

## Models Available

### Model 1: All 8 Features

File:
models/heartcare_expanded_all8_candidate.joblib

Algorithm: Logistic Regression

Input features:

- age
- sex
- cp
- trestbps
- restecg
- thalach
- exang
- oldpeak

### Model 2: Without Sex

File:
models/heartcare_expanded_without_sex_candidate.joblib

Algorithm: Logistic Regression

Input features:

- age
- cp
- trestbps
- restecg
- thalach
- exang
- oldpeak

## Dataset

Source: UCI Heart Disease Dataset

Records: 920

Sources:

- Cleveland
- Hungarian
- Long Beach VA
- Switzerland

## Target Mapping

Class 0:
No disease recorded in the original UCI target.

Class 1:
Disease recorded in the original UCI target (values 1–4).

This is a dataset-label classification task, not identification
of a specific heart disease.

## Installation

Install the dependencies:

pip install -r requirements.txt

## Python Usage

Import the prediction function:

from predict import predict_one

Example:

patient_data = {
"age": 55,
"sex": 1,
"cp": 3,
"trestbps": 130,
"restecg": 0,
"thalach": 150,
"exang": 0,
"oldpeak": 1.0
}

result = predict_one(
patient_data,
model_name="all8"
)

print(result)

For the model without sex, omit the sex field
and use model_name="without_sex".

Use None for unavailable measurements.

## Prediction Output

The prediction function returns:

- Model name
- Predicted dataset class
- Positive-class model score
- Classification threshold
- Input feature names
- Medical disclaimer

## Important Limitations

- This is an educational research prototype.
- Predictions are not medical diagnoses.
- Model scores are not clinically validated probabilities.
- Historical UCI data may not represent current patients.
- External clinical validation is required before medical use.
- A qualified healthcare professional must evaluate medical concerns.
- Do not delay emergency care while using this software.

## Model Compatibility

The model artifacts were created using scikit-learn 1.9.1.

Use compatible Python, scikit-learn and Joblib versions.

Only load trusted model files.

## Project Status

Initial model development, comparison, cross-site
experiments, calibration experiments and SHAP
explainability have been completed.

The models remain research candidates, not clinically validated tools.
