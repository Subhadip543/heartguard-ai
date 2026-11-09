
import numpy as np
import pandas as pd

from sklearn.base import clone
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    balanced_accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)


def calculate_metrics(y_true, y_pred, y_probability):
    """Calculate binary classification evaluation metrics."""

    tn, fp, fn, tp = confusion_matrix(
        y_true,
        y_pred,
        labels=[0, 1],
    ).ravel()

    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0

    try:
        roc_auc = roc_auc_score(y_true, y_probability)
    except ValueError:
        roc_auc = np.nan

    try:
        pr_auc = average_precision_score(y_true, y_probability)
    except ValueError:
        pr_auc = np.nan

    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "recall": recall_score(y_true, y_pred, zero_division=0),
        "specificity": specificity,
        "precision": precision_score(y_true, y_pred, zero_division=0),
        "f1_score": f1_score(y_true, y_pred, zero_division=0),
        "balanced_accuracy": balanced_accuracy_score(y_true, y_pred),
        "roc_auc": roc_auc,
        "pr_auc": pr_auc,
        "true_negatives": tn,
        "false_positives": fp,
        "false_negatives": fn,
        "true_positives": tp,
    }


def evaluate_leave_one_site_out(
    estimator,
    X,
    y,
    groups,
    model_name,
):
    """
    Train on all but one site and evaluate on the held-out site.

    Each fold gets a fresh estimator, so preprocessing is fitted
    only on that fold's training data.
    """

    results = []

    unique_sites = sorted(pd.Series(groups).dropna().unique())

    for held_out_site in unique_sites:
        train_mask = groups != held_out_site
        test_mask = groups == held_out_site

        X_train = X.loc[train_mask]
        X_test = X.loc[test_mask]

        y_train = y.loc[train_mask]
        y_test = y.loc[test_mask]

        fold_model = clone(estimator)
        fold_model.fit(X_train, y_train)

        predictions = fold_model.predict(X_test)
        probabilities = fold_model.predict_proba(X_test)[:, 1]

        metrics = calculate_metrics(
            y_test,
            predictions,
            probabilities,
        )

        results.append(
            {
                "model": model_name,
                "held_out_site": held_out_site,
                "training_records": len(X_train),
                "testing_records": len(X_test),
                **metrics,
            }
        )

    return pd.DataFrame(results)
