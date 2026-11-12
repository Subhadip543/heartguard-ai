
from pathlib import Path
import json
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline

from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_validate
)

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)


# ==========================================
# 1. PROJECT PATHS
# ==========================================

BASE_DIR = Path(__file__).parent

DATASET_PATH = BASE_DIR / "dataset" / "heart_disease.csv"

MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# 2. LOAD HEART DISEASE DATASET
# ==========================================

print("\nLoading Heart Disease Dataset...")

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded successfully!")
print("Dataset shape:", df.shape)


# ==========================================
# 3. DEFINE INPUT FEATURES
# ==========================================

feature_columns = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal"
]

target_column = "num"

# Check required columns
required_columns = feature_columns + [target_column]

missing_columns = [
    column for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing required columns: {missing_columns}"
    )

# Separate features and target
X = df[feature_columns].copy()

original_target = pd.to_numeric(
    df[target_column],
    errors="coerce"
)

if original_target.isna().any():
    raise ValueError("Target column contains missing or invalid values.")

# Binary classification target
# 0 = No disease recorded in dataset
# 1 = Disease recorded in dataset (original target 1–4)

y = (original_target > 0).astype(int)

print("\nTarget Distribution:")
print(y.value_counts().sort_index())


# ==========================================
# 4. DEFINE FEATURE TYPES
# ==========================================

numeric_features = [
    "age",
    "trestbps",
    "chol",
    "thalach",
    "oldpeak"
]

categorical_features = [
    "sex",
    "cp",
    "fbs",
    "restecg",
    "exang",
    "slope",
    "ca",
    "thal"
]


# ==========================================
# 5. CREATE PREPROCESSING PIPELINE
# ==========================================

def create_preprocessor():

    # Numerical feature processing
    numeric_pipeline = Pipeline([
        (
            "imputer",
            SimpleImputer(strategy="median")
        ),
        (
            "scaler",
            StandardScaler()
        )
    ])

    # Categorical feature processing
    categorical_pipeline = Pipeline([
        (
            "imputer",
            SimpleImputer(strategy="most_frequent")
        ),
        (
            "encoder",
            OneHotEncoder(handle_unknown="ignore")
        )
    ])

    # Combine both pipelines
    preprocessor = ColumnTransformer([
        (
            "numerical",
            numeric_pipeline,
            numeric_features
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )
    ])

    return preprocessor


# ==========================================
# 6. SPLIT DATASET
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining Records:", len(X_train))
print("Testing Records:", len(X_test))


# ==========================================
# 7. INITIALIZE MACHINE LEARNING MODELS
# ==========================================

models = {

    "Logistic Regression": LogisticRegression(
        max_iter=2000,
        class_weight="balanced"
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=1
    )

}


# ==========================================
# 8. CROSS-VALIDATION SETTINGS
# ==========================================

cross_validation = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

scoring_metrics = {
    "roc_auc": "roc_auc",
    "sensitivity": "recall",
    "balanced_accuracy": "balanced_accuracy"
}

results = {}


# ==========================================
# 9. TRAIN AND EVALUATE BOTH MODELS
# ==========================================

for model_name, model in models.items():

    print("\n" + "=" * 50)
    print(model_name)
    print("=" * 50)

    # Complete pipeline
    pipeline = Pipeline([
        ("preprocessor", create_preprocessor()),
        ("classifier", model)
    ])

    # Cross-validation using training data only
    cv_results = cross_validate(
        pipeline,
        X_train,
        y_train,
        cv=cross_validation,
        scoring=scoring_metrics,
        n_jobs=-1
    )

    cv_roc_auc = cv_results["test_roc_auc"].mean()

    cv_sensitivity = cv_results["test_sensitivity"].mean()

    cv_balanced_accuracy = (
        cv_results["test_balanced_accuracy"].mean()
    )

    print("\nCross-validation results:")

    print(
        "Average ROC-AUC:",
        round(cv_roc_auc, 3)
    )

    print(
        "Average Sensitivity:",
        round(cv_sensitivity, 3)
    )

    print(
        "Average Balanced Accuracy:",
        round(cv_balanced_accuracy, 3)
    )

    # Train using training split
    pipeline.fit(X_train, y_train)

    # Predictions on held-out test data
    predictions = pipeline.predict(X_test)

    prediction_scores = pipeline.predict_proba(X_test)[:, 1]

    # Evaluation metrics
    accuracy = accuracy_score(y_test, predictions)

    balanced_accuracy = balanced_accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    sensitivity = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )

    roc_auc = roc_auc_score(
        y_test,
        prediction_scores
    )

    # Confusion matrix
    tn, fp, fn, tp = confusion_matrix(
        y_test,
        predictions,
        labels=[0, 1]
    ).ravel()

    specificity = (
        tn / (tn + fp)
        if (tn + fp) > 0
        else 0
    )

    # Display test results
    print("\nHeld-out test results:")

    print("Accuracy:", round(accuracy, 3))
    print("Balanced Accuracy:", round(balanced_accuracy, 3))
    print("Precision:", round(precision, 3))
    print("Sensitivity:", round(sensitivity, 3))
    print("Specificity:", round(specificity, 3))
    print("F1 Score:", round(f1, 3))
    print("ROC-AUC:", round(roc_auc, 3))

    print("\nConfusion Matrix:")
    print(confusion_matrix(
        y_test,
        predictions,
        labels=[0, 1]
    ))

    # Save results for comparison
    results[model_name] = {
        "cv_roc_auc": cv_roc_auc,
        "cv_sensitivity": cv_sensitivity,
        "cv_balanced_accuracy": cv_balanced_accuracy,
        "test_accuracy": accuracy,
        "test_balanced_accuracy": balanced_accuracy,
        "test_precision": precision,
        "test_sensitivity": sensitivity,
        "test_specificity": specificity,
        "test_f1": f1,
        "test_roc_auc": roc_auc
    }


# ==========================================
# 10. COMPARE MODELS
# ==========================================

print("\n")
print("=" * 60)
print("FINAL MODEL COMPARISON")
print("=" * 60)

comparison_df = pd.DataFrame(results).T

print(comparison_df.round(3).to_string())


# ==========================================
# 11. SELECT MODEL
# ==========================================

# Provisional selection based on cross-validation
# metrics, not a clinical diagnosis.

best_model_name = max(
    results,
    key=lambda name: (
        results[name]["cv_balanced_accuracy"],
        results[name]["cv_roc_auc"]
    )
)

print("\nSelected model:", best_model_name)


# ==========================================
# 12. TRAIN SELECTED MODEL ON ALL DATA
# ==========================================

print("\nTraining final selected model...")

if best_model_name == "Logistic Regression":

    final_classifier = LogisticRegression(
        max_iter=2000,
        class_weight="balanced"
    )

else:

    final_classifier = RandomForestClassifier(
        n_estimators=300,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=1
    )

final_model = Pipeline([
    ("preprocessor", create_preprocessor()),
    ("classifier", final_classifier)
])

# Train using all available dataset records
final_model.fit(X, y)


# ==========================================
# 13. SAVE TRAINED MODEL
# ==========================================

model_path = MODEL_DIR / "heartcare_model.joblib"

joblib.dump(final_model, model_path)

print("\nTrained model saved successfully!")
print("Model location:", model_path)


# ==========================================
# 14. SAVE MODEL METADATA
# ==========================================

metadata = {

    "model_name": best_model_name,

    "dataset": "UCI Heart Disease Dataset",

    "dataset_id": 45,

    "input_features": feature_columns,

    "numeric_features": numeric_features,

    "categorical_features": categorical_features,

    "target_column": target_column,

    "target_mapping": {
        "0": "No disease recorded",
        "1": "Disease recorded (original target values 1 to 4)"
    },

    "training_records": len(X),

    "purpose": "Educational ML research prototype",

    "clinical_diagnosis": False,

    "cross_validation_results": results[best_model_name],

    "model_file": "heartcare_model.joblib"
}

metadata_path = MODEL_DIR / "model_metadata.json"

with open(
    metadata_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(metadata, file, indent=4)

print("\nModel metadata saved successfully!")
print("Metadata location:", metadata_path)


# ==========================================
# 15. FINAL MESSAGE
# ==========================================

print("\n" + "=" * 60)

print("HEARTCARE ML TRAINING COMPLETED!")

print("Selected model:", best_model_name)

print("Model file:", model_path)

print("Metadata file:", metadata_path)

print("=" * 60)
