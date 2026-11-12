
import unittest

from predict import predict_one, predict_batch


# ==========================================
# SAMPLE TEST INPUTS
# ==========================================

VALID_ALL8 = {
    "age": 55,
    "sex": 1,
    "cp": 3,
    "trestbps": 130,
    "restecg": 0,
    "thalach": 150,
    "exang": 0,
    "oldpeak": 1.0
}

VALID_WITHOUT_SEX = {
    "age": 55,
    "cp": 3,
    "trestbps": 130,
    "restecg": 0,
    "thalach": 150,
    "exang": 0,
    "oldpeak": 1.0
}


# ==========================================
# PREDICTION MODULE TESTS
# ==========================================

class HeartCarePredictionTests(unittest.TestCase):

    # --------------------------------------
    # TEST 1: Eight-feature model
    # --------------------------------------

    def test_all8_model(self):

        result = predict_one(
            VALID_ALL8,
            model_name="all8"
        )

        self.assertTrue(result["success"])

        self.assertIn(
            result["predicted_dataset_class"],
            [0, 1]
        )

        self.assertTrue(
            0 <= result["positive_class_score"] <= 1
        )

        print("\nTEST 1 PASSED: Eight-feature model")

    # --------------------------------------
    # TEST 2: Model without sex
    # --------------------------------------

    def test_without_sex_model(self):

        result = predict_one(
            VALID_WITHOUT_SEX,
            model_name="without_sex"
        )

        self.assertTrue(result["success"])

        self.assertIn(
            result["predicted_dataset_class"],
            [0, 1]
        )

        print("\nTEST 2 PASSED: Model without sex")

    # --------------------------------------
    # TEST 3: Missing measurement
    # --------------------------------------

    def test_missing_measurement(self):

        patient = VALID_ALL8.copy()

        patient["thalach"] = None

        result = predict_one(
            patient,
            model_name="all8"
        )

        self.assertTrue(result["success"])

        print("\nTEST 3 PASSED: Missing measurement")

    # --------------------------------------
    # TEST 4: Invalid category
    # --------------------------------------

    def test_invalid_category(self):

        patient = VALID_ALL8.copy()

        patient["cp"] = 99

        with self.assertRaises(ValueError):

            predict_one(
                patient,
                model_name="all8"
            )

        print("\nTEST 4 PASSED: Invalid category rejected")

    # --------------------------------------
    # TEST 5: Missing required feature
    # --------------------------------------

    def test_missing_required_feature(self):

        patient = VALID_ALL8.copy()

        del patient["age"]

        with self.assertRaises(ValueError):

            predict_one(
                patient,
                model_name="all8"
            )

        print("\nTEST 5 PASSED: Missing feature rejected")

    # --------------------------------------
    # TEST 6: Invalid feature type
    # --------------------------------------

    def test_invalid_feature_type(self):

        patient = VALID_ALL8.copy()

        patient["age"] = "invalid"

        with self.assertRaises(ValueError):

            predict_one(
                patient,
                model_name="all8"
            )

        print("\nTEST 6 PASSED: Invalid input rejected")

    # --------------------------------------
    # TEST 7: Invalid model name
    # --------------------------------------

    def test_invalid_model_name(self):

        with self.assertRaises(ValueError):

            predict_one(
                VALID_ALL8,
                model_name="unknown"
            )

        print("\nTEST 7 PASSED: Invalid model rejected")

    # --------------------------------------
    # TEST 8: Invalid threshold
    # --------------------------------------

    def test_invalid_threshold(self):

        with self.assertRaises(ValueError):

            predict_one(
                VALID_ALL8,
                model_name="all8",
                threshold=1.5
            )

        print("\nTEST 8 PASSED: Invalid threshold rejected")

    # --------------------------------------
    # TEST 9: Batch predictions
    # --------------------------------------

    def test_batch_predictions(self):

        patients = [
            VALID_ALL8,
            VALID_ALL8
        ]

        results = predict_batch(
            patients,
            model_name="all8"
        )

        self.assertEqual(len(results), 2)

        for result in results:
            self.assertTrue(result["success"])

        print("\nTEST 9 PASSED: Batch prediction")


# ==========================================
# RUN ALL TESTS
# ==========================================

if __name__ == "__main__":

    print("\nHEARTCARE PREDICTION MODULE TEST SUITE")
    print("=" * 55)

    unittest.main(verbosity=2)
