import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  Download,
  Printer,
  RotateCcw,
  LayoutDashboard,
  Home,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { downloadMedicalPdfReport } from "../utils/generateMedicalPdf";
import DashboardSidebar from "../DashboardSidebar";
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
    sex: { 0: "Female", 1: "Male" },
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
    exang: { 0: "No", 1: "Yes" },
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

function generateLocalPlainExplanation(patient, prediction, isPositive, probability) {
  const threshold = (prediction.threshold * 100).toFixed(0);

  const riskStatement = isPositive
    ? `The HeartGuard AI model classified this assessment as **Positive (Elevated Heart Risk)** with a calculated probability of **${probability}%**, which exceeds the baseline screening threshold of **${threshold}%**.`
    : `The HeartGuard AI model classified this assessment as **Negative (Low Risk)** with a calculated probability of **${probability}%**, remaining safely below the baseline screening threshold of **${threshold}%**.`;

  const highlights = [];
  if (patient.trestbps) {
    if (patient.trestbps >= 140) {
      highlights.push(`**Resting Blood Pressure (${patient.trestbps} mmHg)**: In the Stage 2 hypertension range, placing continuous strain on blood vessels.`);
    } else if (patient.trestbps >= 120) {
      highlights.push(`**Resting Blood Pressure (${patient.trestbps} mmHg)**: Mildly elevated above the optimal 120 mmHg.`);
    } else {
      highlights.push(`**Resting Blood Pressure (${patient.trestbps} mmHg)**: Within healthy optimal range.`);
    }
  }

  if (patient.chol) {
    if (patient.chol >= 240) {
      highlights.push(`**Serum Cholesterol (${patient.chol} mg/dL)**: Elevated above desirable limits, indicating a potential risk factor for arterial plaque buildup.`);
    } else if (patient.chol >= 200) {
      highlights.push(`**Serum Cholesterol (${patient.chol} mg/dL)**: Borderline elevated, worth discussing dietary improvements.`);
    } else {
      highlights.push(`**Serum Cholesterol (${patient.chol} mg/dL)**: In a desirable healthy range.`);
    }
  }

  if (patient.thalach) {
    highlights.push(`**Maximum Heart Rate (${patient.thalach} bpm)**: Measures exercise capacity and cardiac workload.`);
  }

  if (patient.cp && String(patient.cp) !== "4") {
    highlights.push(`**Chest Pain Characteristics**: Non-asymptomatic chest pain was noted, which is a key symptom to review with a doctor.`);
  }

  return `### Plain-Language Assessment Summary

${riskStatement}

#### Key Factors Analyzed
${highlights.length > 0 ? highlights.map((h) => `- ${h}`).join("\n") : "- Standard cardiovascular biomarkers (blood pressure, cholesterol, resting ECG) were considered in this prediction."}

#### What This Result Means
HeartGuard AI uses statistical machine learning patterns to estimate screening risk. An elevated score is **not** a confirmation of heart disease, nor does a low score completely guarantee the absence of arterial conditions.

#### Recommended Next Steps
1. **Physician Review**: Share these parameters and report with your cardiologist or primary care doctor.
2. **Preventive Lifestyle**: Maintain heart-healthy habits — consistent daily physical exercise, low sodium, whole foods, and stress management.
3. **Regular Monitoring**: Track your blood pressure and cholesterol periodically.

> **Important**: This automated interpretation is for education only and is **not a clinical diagnosis**. Always consult a qualified medical professional.`;
}

function AssessmentResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const patient = state.patient || {};
  const prediction = state.prediction || null;

  const [showSimplifyModal, setShowSimplifyModal] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState("");
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAuthenticated = Boolean(
    sessionStorage.getItem("heartcareToken")
  );

  const destination = isAuthenticated ? "/dashboard" : "/";
  const destinationLabel = isAuthenticated
    ? "Go to Dashboard"
    : "Return to Home";

  const hasPrediction =
    prediction &&
    typeof prediction.prediction === "number" &&
    typeof prediction.positive_probability === "number" &&
    prediction.positive_probability >= 0 &&
    prediction.positive_probability <= 1;

  const isPositive =
    hasPrediction && prediction.prediction === 1;

  const probability = hasPrediction
    ? (prediction.positive_probability * 100).toFixed(2)
    : "0.00";

  const probabilityWidth = hasPrediction
    ? Math.min(100, Math.max(0, prediction.positive_probability * 100))
    : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleNewAssessment = () => {
    navigate("/assessment");
  };

  const handleDestination = () => {
    navigate(destination);
  };

  const handleSimplify = async () => {
    setShowSimplifyModal(true);
    if (simplifiedText) return;

    setIsSimplifying(true);

    const promptMessage = `Please provide a clear, plain-language, patient-friendly summary of this heart disease screening report.
Patient parameters:
- Age: ${patient.age || "Not provided"}
- Sex: ${formatValue("sex", patient.sex)}
- Chest Pain: ${formatValue("cp", patient.cp)}
- Resting Blood Pressure: ${patient.trestbps ? patient.trestbps + " mmHg" : "Not provided"}
- Serum Cholesterol: ${patient.chol ? patient.chol + " mg/dL" : "Not provided"}
- Fasting Blood Sugar: ${formatValue("fbs", patient.fbs)}
- Resting ECG: ${formatValue("restecg", patient.restecg)}
- Maximum Heart Rate: ${patient.thalach ? patient.thalach + " bpm" : "Not provided"}
- Exercise-Induced Angina: ${formatValue("exang", patient.exang)}
- ST Depression: ${patient.oldpeak ?? "Not provided"}
- ST Segment Slope: ${formatValue("slope", patient.slope)}
- Major Vessels (CA): ${patient.ca ?? "Not provided"}
- Thalassemia: ${formatValue("thal", patient.thal)}

Model Prediction Result:
- Classification: ${isPositive ? "Positive (Elevated Risk)" : "Negative (Low Risk)"}
- Model Probability: ${probability}%
- Threshold: ${(prediction.threshold * 100).toFixed(0)}%
- Model: ${prediction.model_name || "Random Forest Classifier"}

Please structure your response with:
1. Executive Summary in plain language (what the score and result mean without medical jargon).
2. Key Clinical Contributing Factors (explain in simple terms why the model came to this conclusion based on the submitted numbers).
3. Questions to discuss with a physician.
4. Reminder that this is an AI screening model and NOT a definitive medical diagnosis.`;

    try {
      const response = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptMessage,
          history: [],
          language: "English",
        }),
      });

      if (!response.ok) {
        throw new Error("AI service not responding");
      }

      const data = await response.json();
      if (data.reply) {
        setSimplifiedText(data.reply);
      } else {
        throw new Error("Empty response");
      }
    } catch {
      // Local fallback
      const fallback = generateLocalPlainExplanation(
        patient,
        prediction,
        isPositive,
        probability
      );
      setSimplifiedText(fallback);
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleDownloadPdf = () => {
    let storedPatientName = "Guest Patient";
    try {
      const cached = sessionStorage.getItem("heartcarePatient");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.name) storedPatientName = parsed.name;
      }
    } catch {
      // ignore
    }

    const paramLabels = {
      age: patient.age,
      sex: patient.sex,
      cpLabel: formatValue("cp", patient.cp),
      trestbps: patient.trestbps,
      chol: patient.chol,
      fbsLabel: formatValue("fbs", patient.fbs),
      restecgLabel: formatValue("restecg", patient.restecg),
      thalach: patient.thalach,
      exangLabel: formatValue("exang", patient.exang),
      oldpeak: patient.oldpeak,
      slopeLabel: formatValue("slope", patient.slope),
      ca: patient.ca,
      thalLabel: formatValue("thal", patient.thal),
    };

    downloadMedicalPdfReport({
      patientName: storedPatientName,
      assessmentId: state.assessmentId || (isAuthenticated ? "SAVED" : "GUEST"),
      dateString: new Date().toLocaleString("en-IN"),
      modelName: prediction.model_name || "Random Forest Classifier",
      modelVersion: prediction.model_version || "1.0",
      prediction: prediction.prediction,
      probability: prediction.positive_probability,
      threshold: prediction.threshold,
      parameters: paramLabels,
      explanation: simplifiedText || "",
    });
  };

  const handleCopyExplanation = () => {
    if (!simplifiedText) return;
    navigator.clipboard.writeText(simplifiedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!hasPrediction) {
    return (
      <div className="result-page">
        <DashboardSidebar activeKey="/assessment" />

        <div className="result-page-main">
          <header className="result-header">
            <div className="result-header-content">
              <Link to="/" className="result-logo">
                HeartGuard AI
              </Link>

              <Link to={destination} className="result-back-link">
                {destinationLabel}
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

              <div className="result-actions" style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="result-action-btn result-btn-primary"
                  onClick={handleNewAssessment}
                >
                  <RotateCcw size={17} aria-hidden="true" />
                  <span>Start Assessment</span>
                </button>

                <button
                  type="button"
                  className="result-action-btn result-btn-secondary"
                  onClick={handleDestination}
                >
                  {isAuthenticated ? (
                    <LayoutDashboard size={17} aria-hidden="true" />
                  ) : (
                    <Home size={17} aria-hidden="true" />
                  )}
                  <span>{destinationLabel}</span>
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="result-page">
      <DashboardSidebar activeKey="/assessment" />

      <div className="result-page-main">
        <header className="result-header">
          <div className="result-header-content">
            <Link to="/" className="result-logo">
              HeartGuard AI
            </Link>

            <Link to={destination} className="result-back-link">
              {isAuthenticated ? (
                <LayoutDashboard size={16} style={{ display: "inline", marginRight: "6px" }} />
              ) : (
                <Home size={16} style={{ display: "inline", marginRight: "6px" }} />
              )}
              {destinationLabel}
            </Link>
          </div>
        </header>

      <main className="result-container">
        <section className="result-title-section">
          <div className="result-title-icon">
            <CheckCircle2 size={32} />
          </div>

          <h1>Prediction Report</h1>

          <p>
            Your HeartGuard AI model prediction has been
            generated successfully.
          </p>
        </section>

        {/* Prediction Score Card */}
        <section className="result-card">
          <div className="result-card-heading">
            <h2>Random Forest Prediction</h2>
            <span
              className={`result-class-badge ${
                isPositive ? "badge-positive-risk" : "badge-negative-risk"
              }`}
            >
              {isPositive ? "Positive (Elevated Risk)" : "Negative (Low Risk)"}
            </span>
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
              <strong>{prediction.model_name || "Random Forest"}</strong>
            </div>
          </div>

          <div className="result-probability">
            <div className="result-card-heading">
              <h3>Positive-Class Probability Meter</h3>
            </div>

            <div className="probability-bar-track">
              <div
                className={`probability-bar-fill ${
                  isPositive ? "fill-high" : "fill-low"
                }`}
                style={{ width: `${probabilityWidth}%` }}
              />
            </div>

            <p>{probability}% positive-class probability</p>
          </div>

          {/* Action Row for Simplify & PDF Download */}
          <div className="result-feature-actions">
            <button
              type="button"
              className="btn-simplify-report"
              onClick={handleSimplify}
              aria-label="Request plain language explanation"
            >
              <Sparkles size={18} />
              <span>Simplify This Report</span>
            </button>

            <button
              type="button"
              className="btn-download-pdf"
              onClick={handleDownloadPdf}
              aria-label="Download one-page PDF medical report"
            >
              <Download size={18} />
              <span>Download Medical Report (PDF)</span>
            </button>
          </div>
        </section>

        {/* Submitted Features Card */}
        <section className="result-card">
          <div className="result-card-heading">
            <h2>Submitted Patient Features</h2>
          </div>

          <div className="result-details-grid">
            {patientFields.map((field) => {
              const value = formatValue(field.key, patient[field.key]);

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

        {/* Medical Disclaimer */}
        <section className="ai-disclaimer">
          <div className="disclaimer-header">
            <AlertTriangle size={20} className="disclaimer-icon" />
            <h3>Important Medical Disclaimer</h3>
          </div>

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

        {/* Standard Navigation Actions (Redesigned Cohesive Action Group) */}
        <section className="result-actions" aria-label="Assessment result actions">
          <button
            type="button"
            className="result-action-btn result-btn-primary"
            onClick={handleDestination}
            aria-label={destinationLabel}
          >
            {isAuthenticated ? (
              <LayoutDashboard size={18} aria-hidden="true" />
            ) : (
              <Home size={18} aria-hidden="true" />
            )}
            <span>{destinationLabel}</span>
          </button>

          <button
            type="button"
            className="result-action-btn result-btn-secondary"
            onClick={handleNewAssessment}
            aria-label="Start a new heart risk assessment"
          >
            <RotateCcw size={18} aria-hidden="true" />
            <span>New Assessment</span>
          </button>

          <button
            type="button"
            className="result-action-btn result-btn-secondary"
            onClick={handlePrint}
            aria-label="Print full assessment report"
          >
            <Printer size={18} aria-hidden="true" />
            <span>Print Report</span>
          </button>
        </section>
      </main>

      {/* Simplify Report Modal / Drawer */}
      {showSimplifyModal && (
        <div
          className="simplify-modal-backdrop"
          onClick={() => setShowSimplifyModal(false)}
          aria-hidden="true"
        >
          <div
            className="simplify-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="simplify-modal-title"
          >
            <header className="simplify-modal-header">
              <div className="simplify-modal-title-group">
                <div className="simplify-modal-icon">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 id="simplify-modal-title">Plain-Language Report Summary</h3>
                  <p>Clear, empathetic interpretation of your assessment</p>
                </div>
              </div>

              <button
                type="button"
                className="simplify-close-btn"
                onClick={() => setShowSimplifyModal(false)}
                aria-label="Close simplified report dialog"
              >
                <X size={20} />
              </button>
            </header>

            <div className="simplify-modal-body">
              {isSimplifying ? (
                <div className="simplify-loading-state">
                  <div className="simplify-spinner" />
                  <h4>Generating Plain-Language Explanation...</h4>
                  <p>
                    Analyzing clinical parameters and converting medical metrics into understandable everyday language.
                  </p>
                </div>
              ) : (
                <div className="simplify-content-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {simplifiedText}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            <footer className="simplify-modal-footer">
              <div className="simplify-disclaimer-pill">
                <ShieldCheck size={14} />
                <span>Educational AI explanation &bull; Not a diagnosis</span>
              </div>

              <div className="simplify-footer-buttons">
                {simplifiedText && (
                  <button
                    type="button"
                    className="btn-copy-explanation"
                    onClick={handleCopyExplanation}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? "Copied!" : "Copy Text"}</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-download-pdf"
                  onClick={() => {
                    setShowSimplifyModal(false);
                    handleDownloadPdf();
                  }}
                >
                  <Download size={16} />
                  <span>Download Full PDF</span>
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

        <footer className="result-footer">
          <p>HeartGuard AI | Smart Heart Health Awareness Platform</p>
        </footer>
      </div>
    </div>
  );
}

export default AssessmentResult;
