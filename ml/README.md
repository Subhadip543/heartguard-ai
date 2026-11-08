# HeartGuard AI — Machine Learning

This directory contains the machine learning development pipeline for HeartGuard AI.

## Planned Pipeline

1. Data collection and understanding
2. Data cleaning and preprocessing
3. Exploratory data analysis
4. Feature engineering
5. Model training
6. Model evaluation
7. Model selection
8. Model serialization
9. Model inference integration with the backend

## Directory Structure

```text
ml/
├── data/
│   ├── raw/
│   ├── interim/
│   └── processed/
├── notebooks/
├── src/
│   ├── data/
│   ├── features/
│   ├── training/
│   ├── evaluation/
│   └── inference/
├── models/
├── experiments/
└── reports/
```

## Setup

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt
```

## Important Guidelines

- Never commit private or restricted datasets.
- Keep raw datasets unchanged.
- Separate experimentation from reusable production code.
- Record model evaluation metrics and experiment configurations.
- Do not claim clinical validity without appropriate validation.
- Treat model predictions as research outputs, not medical diagnoses.

## Current Status

The ML directory is an architectural foundation. The actual training and inference pipeline will be implemented in later development phases.
