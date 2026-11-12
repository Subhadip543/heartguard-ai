
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HeartAssessment.css";

const categoricalFields = [
  {
    name: "sex",
    label: "Sex",
    options: [
      { value: "0", label: "Female" },
      { value: "1", label: "Male" },
    ],
  },
  {
    name: "cp",
    label: "Chest Pain Type",
    options: [
      { value: "1", label: "Typical angina" },
      { value: "2", label: "Atypical angina" },
      { value: "3", label: "Non-anginal pain" },
      { value: "4", label: "Asymptomatic" },
    ],
  },
  {
    name: "fbs",
    label: "Fasting Blood Sugar",
    options: [
      { value: "0", label: "120 mg/dL or below" },
      { value: "1", label: "Above 120 mg/dL" },
    ],
  },
  {
    name: "restecg",
    label: "Resting ECG",
    options: [
      { value: "0", label: "Normal" },
      { value: "1", label: "ST-T wave abnormality" },
      { value: "2", label: "Left ventricular hypertrophy" },
    ],
  },
  {
    name: "exang",
    label: "Exercise-Induced Angina",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
  },
  {
    name: "slope",
    label: "ST Segment Slope",
    options: [
      { value: "1", label: "Upsloping" },
      { value: "2", label: "Flat" },
      { value: "3", label: "Downsloping" },
    ],
  },
  {
    name: "thal",
    label: "Thalassemia",
    options: [
      { value: "3", label: "Normal" },
      { value: "6", label: "Fixed defect" },
      { value: "7", label: "Reversible defect" },
    ],
  },
];

const numericalFields = [
  {
    name: "trestbps",
    label: "Resting Blood Pressure",
    unit: "mmHg",
    min: 1,
    max: 300,
    placeholder: "Example: 120",
  },
  {
    name: "chol",
    label: "Serum Cholesterol",
    unit: "mg/dL",
    min: 1,
    max: 1000,
    placeholder: "Example: 200",
  },
  {
    name: "thalach",
    label: "Maximum Heart Rate",
    unit: "bpm",
    min: 1,
    max: 300,
    placeholder: "Example: 150",
  },
  {
    name: "oldpeak",
    label: "ST Depression (Oldpeak)",
    unit: "",
    min: -5,
    max: 10,
    step: "0.1",
    placeholder: "Example: 1.5",
  },
];

function HeartAssessment() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const getNumber = (name) => {
      const value = formData.get(name);

      return value === "" || value === null
        ? null
        : Number(value);
    };

    const patient = {
      age: getNumber("age"),
      sex: getNumber("sex"),
      cp: getNumber("cp"),
      trestbps: getNumber("trestbps"),
      chol: getNumber("chol"),
      fbs: getNumber("fbs"),
      restecg: getNumber("restecg"),
      thalach: getNumber("thalach"),
      exang: getNumber("exang"),
      oldpeak: getNumber("oldpeak"),
      slope: getNumber("slope"),
      ca: getNumber("ca"),
      thal: getNumber("thal"),
    };

    try {
      const response = await fetch("/api/v1/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patient }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.detail)
          ? data.detail.map((item) => item.msg).join(", ")
          : data.detail || "Prediction request failed.";

        throw new Error(message);
      }

      console.log("Random Forest prediction:", data);

      navigate("/result", {
        state: {
          patient,
          prediction: data,
        },
      });
    } catch (err) {
      console.error("Prediction error:", err);

      setError(
        err.message || "Unable to connect to the prediction API."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="assessment-page">
      <header className="assessment-header">
        <h1>HeartCare</h1>
        <Link to="/dashboard">Back to Dashboard</Link>
      </header>

      <main className="assessment-container">
        <section className="assessment-heading">
          <h2>Heart Health Assessment</h2>
          <p>
            Enter the available clinical measurements and
            examination results for an educational heart
            disease prediction.
          </p>
        </section>

        <div className="emergency-warning">
          <strong>Important Emergency Notice</strong>
          <p>
            If you currently have severe or new chest pain,
            serious difficulty breathing, or fainting, seek
            emergency medical help immediately. Do not wait
            to complete this questionnaire.
          </p>
        </div>

        <form
          className="assessment-form"
          onSubmit={handleSubmit}
        >
          <section className="assessment-section">
            <h3>1. Personal Information</h3>

            <div className="assessment-grid">
              <div className="form-group">
                <label htmlFor="age">Age (years)</label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  placeholder="Enter your age"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sex">Sex</label>
                <select
                  id="sex"
                  name="sex"
                  defaultValue=""
                >
                  <option value="">Not provided</option>
                  <option value="0">Female</option>
                  <option value="1">Male</option>
                </select>
              </div>
            </div>
          </section>

          <section className="assessment-section">
            <h3>2. Clinical Measurements</h3>

            <p className="section-description">
              Enter measurements from clinical examinations.
              Leave a field empty if the measurement is unavailable.
            </p>

            <div className="assessment-grid">
              {numericalFields.map((field) => (
                <div
                  className="form-group"
                  key={field.name}
                >
                  <label htmlFor={field.name}>
                    {field.label}
                    {field.unit ? ` (${field.unit})` : ""}
                  </label>

                  <input
                    id={field.name}
                    type="number"
                    name={field.name}
                    min={field.min}
                    max={field.max}
                    step={field.step || "1"}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="assessment-section">
            <h3>3. Clinical Examination Results</h3>

            <p className="section-description">
              Select the recorded examination result where
              available. Do not guess values.
            </p>

            <div className="assessment-grid">
              {categoricalFields.map((field) => (
                <div
                  className="form-group"
                  key={field.name}
                >
                  <label htmlFor={field.name}>
                    {field.label}
                  </label>

                  <select
                    id={field.name}
                    name={field.name}
                    defaultValue=""
                  >
                    <option value="">Not provided</option>

                    {field.options.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="form-group">
                <label htmlFor="ca">
                  Number of Major Vessels (CA)
                </label>

                <select
                  id="ca"
                  name="ca"
                  defaultValue=""
                >
                  <option value="">Not provided</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
          </section>

          <div className="assessment-disclaimer">
            <strong>Medical Disclaimer</strong>
            <p>
              HeartGuard AI is an educational prototype.
              Its machine learning predictions are not a
              medical diagnosis, are not clinically validated,
              and must not replace professional medical
              evaluation.
            </p>
          </div>

          {error && (
            <div className="assessment-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="assessment-submit"
            disabled={loading}
          >
            {loading
              ? "Generating Prediction..."
              : "Generate Prediction Report →"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default HeartAssessment;
