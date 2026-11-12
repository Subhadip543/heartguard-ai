
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Assessment.css";

const patientFields = [
  { key: "age", label: "Age", unit: "years" },
  { key: "sex", label: "Sex" },
  { key: "cp", label: "Chest Pain Type" },
  { key: "trestbps", label: "Resting Blood Pressure", unit: "mmHg" },
  { key: "chol", label: "Cholesterol", unit: "mg/dL" },
  { key: "fbs", label: "Fasting Blood Sugar" },
  { key: "restecg", label: "Resting ECG" },
  { key: "thalach", label: "Maximum Heart Rate", unit: "bpm" },
  { key: "exang", label: "Exercise-Induced Angina" },
  { key: "oldpeak", label: "ST Depression" },
  { key: "slope", label: "ST Segment Slope" },
  { key: "ca", label: "Major Vessels" },
  { key: "thal", label: "Thalassemia" },
];

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  const mappings = {
    sex: {
      0: "Female",
      1: "Male",
    },
    cp: {
      1: "Typical angina",
      2: "Atypical angina",
      3: "Non-anginal pain",
      4: "Asymptomatic",
    },
    fbs: {
      0: "120 mg/dL or below",
      1: "Above 120 mg/dL",
    },
    restecg: {
      0: "Normal",
      1: "ST-T wave abnormality",
      2: "Left ventricular hypertrophy",
    },
    exang: {
      0: "No",
      1: "Yes",
    },
    slope: {
      1: "Upsloping",
      2: "Flat",
      3: "Downsloping",
    },
    thal: {
      3: "Normal",
      6: "Fixed defect",
      7: "Reversible defect",
    },
  };

  if (mappings[key]) {
    return mappings[key][value] ?? value;
  }

  return value;
};

function AssessmentResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const patient = state.patient || {};
  const prediction = state.prediction || null;

  const hasPrediction =
    prediction &&
    typeof prediction.prediction === "number" &&
    typeof prediction.positive_probability === "number";

  const isPositive =
    hasPrediction && prediction.prediction === 1;

  const handlePrint = () => {
    window.print();
  };

  const handleNewAssessment = () => {
    navigate("/assessment");
  };

  if (!hasPrediction) {
    return (
      <div className="result-page">
        <header className="result-header">
          <div className="result-header-content">
            <Link to="/dashboard" className="result-logo">
              HeartCare
            </Link>

            <Link to="/dashboard" className="result-back-link">
              Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="result-container">
          <section className="result-card">
            <h2>No Prediction Available</h2>
            <p>
              No prediction result was found. Please complete
              a new assessment to generate your report.
            </p>

            <button
              type="button"
              className="result-primary-btn"
              onClick={handleNewAssessment}
            >
              Start Assessment
            </button>
          </section>
        </main>
      </div>
    );
  }

  const probability =
    (prediction.positive_probability * 100).toFixed(2);

  return (
    <div className="result-page">
      <header className="result-header">
        <div className="result-header-content">
          <Link to="/dashboard" className="result-logo">
            HeartCare
          </Link>

          <Link to="/dashboard" className="result-back-link">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="result-container">
        <section className="result-title-section">
          <div className="result-title-icon">
            ✓
          </div>

          <h1>Prediction Report</h1>

          <p>
            Your HeartGuard AI model prediction has been
            generated successfully.
          </p>
        </section>

        <section className="result-card">
          <div className="result-card-heading">
            <h2>Random Forest Prediction</h2>
          </div>

          <div className="result-details-grid">
            <div className="result-detail">
              <span>Prediction Output</span>
              <strong>
                {isPositive ? "Positive Class" : "Negative Class"}
              </strong>
            </div>

            <div className="result-detail">
              <span>Positive-Class Probability</span>
              <strong>{probability}%</strong>
            </div>

            <div className="result-detail">
              <span>Prediction Threshold</span>
              <strong>{prediction.threshold}</strong>
            </div>

            <div className="result-detail">
              <span>Model</span>
              <strong>{prediction.model_name}</strong>
            </div>
          </div>

          <div className="result-probability">
            <div className="result-card-heading">
              <h3>Positive-Class Probability</h3>
            </div>

            <div
              style={{
                width: "100%",
                height: "12px",
                background: "#e5e7eb",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, prediction.positive_probability * 100)
                  )}%`,
                  height: "100%",
                  background: "#0d9488",
                  borderRadius: "20px",
                }}
              />
            </div>

            <p>{probability}% positive-class probability</p>
          </div>
        </section>

        <section className="result-card">
          <div className="result-card-heading">
            <h2>Submitted Patient Features</h2>
          </div>

          <div className="result-details-grid">
            {patientFields.map((field) => {
              const value = formatValue(
                field.key,
                patient[field.key]
              );

              return (
                <div className="result-detail" key={field.key}>
                  <span>{field.label}</span>
                  <strong>
                    {value}
                    {field.unit && value !== "Not provided"
                      ? ` ${field.unit}`
                      : ""}
                  </strong>
                </div>
              );
            })}
          </div>
        </section>

        <section className="ai-disclaimer">
          <h3>Important Medical Disclaimer</h3>

          <p>
            HeartGuard AI is an educational machine learning
            prototype. This prediction is based on patterns
            learned from its training dataset.
          </p>

          <p>
            The positive-class probability is a model output.
            It is not a clinically validated estimate of your
            actual probability of having heart disease.
          </p>

          <p>
            This system is not a medical diagnostic tool.
            Do not use its output to make medical decisions
            or delay professional medical evaluation.
            Consult a qualified healthcare professional.
          </p>
        </section>

        <section className="result-actions">
          <button
            type="button"
            className="result-primary-btn"
            onClick={handleNewAssessment}
          >
            New Assessment
          </button>

          <button
            type="button"
            className="result-secondary-btn"
            onClick={handlePrint}
          >
            Print Report
          </button>

          <button
            type="button"
            className="result-secondary-btn"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </section>
      </main>

      <footer className="result-footer">
        <p>
          HeartCare | Smart Heart Health Awareness Platform
        </p>
      </footer>
    </div>
  );
}

export default AssessmentResult;
