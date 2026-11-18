import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Code,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ClipboardList
} from "lucide-react";
import DashboardSidebar from "../DashboardSidebar";
import "./History.css";

const PARAMETER_CONFIG = [
  { key: "age", label: "Age", unit: "years" },
  { key: "sex", label: "Sex" },
  { key: "cp", label: "Chest Pain Type" },
  { key: "trestbps", label: "Resting Blood Pressure", unit: "mmHg" },
  { key: "chol", label: "Serum Cholesterol", unit: "mg/dL" },
  { key: "fbs", label: "Fasting Blood Sugar" },
  { key: "restecg", label: "Resting ECG" },
  { key: "thalach", label: "Maximum Heart Rate", unit: "bpm" },
  { key: "exang", label: "Exercise-Induced Angina" },
  { key: "oldpeak", label: "ST Depression" },
  { key: "slope", label: "ST Segment Slope" },
  { key: "ca", label: "Major Vessels (CA)" },
  { key: "thal", label: "Thalassemia" },
];

const formatParameterValue = (key, value) => {
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

// Patient-Friendly Clinical Assessment Health Analyzer
function analyzeAssessmentHealth(assessment) {
  const isPositive = assessment.prediction === 1;
  const scorePercent = typeof assessment.positive_probability === "number"
    ? (assessment.positive_probability * 100).toFixed(1)
    : null;

  const identifiedRisks = [];
  const healthyIndicators = [];

  // Blood Pressure (trestbps)
  if (assessment.trestbps != null && assessment.trestbps !== "") {
    const bp = Number(assessment.trestbps);
    if (bp >= 140) {
      identifiedRisks.push(`Elevated Blood Pressure (${bp} mmHg)`);
    } else if (bp >= 120) {
      identifiedRisks.push(`Borderline Blood Pressure (${bp} mmHg)`);
    } else {
      healthyIndicators.push(`Normal Blood Pressure (${bp} mmHg)`);
    }
  }

  // Cholesterol (chol)
  if (assessment.chol != null && assessment.chol !== "") {
    const chol = Number(assessment.chol);
    if (chol >= 240) {
      identifiedRisks.push(`High Serum Cholesterol (${chol} mg/dL)`);
    } else if (chol >= 200) {
      identifiedRisks.push(`Borderline Cholesterol (${chol} mg/dL)`);
    } else {
      healthyIndicators.push(`Desirable Cholesterol (${chol} mg/dL)`);
    }
  }

  // Fasting Blood Sugar (fbs)
  if (assessment.fbs != null && assessment.fbs !== "") {
    if (Number(assessment.fbs) === 1) {
      identifiedRisks.push("Elevated Blood Sugar (>120 mg/dL)");
    } else {
      healthyIndicators.push("Normal Fasting Blood Sugar");
    }
  }

  // Exercise-Induced Angina (exang)
  if (assessment.exang != null && assessment.exang !== "") {
    if (Number(assessment.exang) === 1) {
      identifiedRisks.push("Exercise-Induced Anginal Discomfort");
    } else {
      healthyIndicators.push("No Exercise-Induced Angina");
    }
  }

  // ST Depression (oldpeak)
  if (assessment.oldpeak != null && assessment.oldpeak !== "") {
    const st = Number(assessment.oldpeak);
    if (st >= 1.5) {
      identifiedRisks.push(`ST Wave Depression (${st})`);
    } else {
      healthyIndicators.push("Normal ST Wave Activity");
    }
  }

  // Resting ECG (restecg)
  if (assessment.restecg != null && assessment.restecg !== "") {
    if (Number(assessment.restecg) === 0) {
      healthyIndicators.push("Normal Resting ECG Pattern");
    } else {
      identifiedRisks.push("Atypical Resting ECG");
    }
  }

  // Explanation
  const explanation = isPositive
    ? "Based on your clinical parameters, the assessment noted elevated cardiovascular risk indicators. We recommend consulting a healthcare provider or certified cardiologist for clinical evaluation."
    : "Your clinical assessment reflects a low cardiovascular risk profile. Continue supporting your heart with healthy nutrition, consistent physical activity, and regular preventative checkups.";

  // Recommended Next Steps
  const nextSteps = isPositive
    ? [
        "Schedule a consultation with a cardiologist or primary doctor",
        "Monitor blood pressure and lipid profile periodically",
        "Discuss heart-healthy lifestyle changes with your physician"
      ]
    : [
        "Maintain regular heart-healthy physical exercise",
        "Follow a balanced diet low in saturated fats and excess sodium",
        "Continue routine annual preventative cardiovascular checkups"
      ];

  return {
    isPositive,
    riskLevel: isPositive ? "Elevated Risk" : "Low Risk",
    scorePercent,
    identifiedRisks,
    healthyIndicators,
    explanation,
    nextSteps
  };
}

function History() {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("user"); // "user" | "developer"
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = sessionStorage.getItem("heartcareToken");

      if (!token) {
        setError("Please log in to view your assessment history.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/v1/assessments?limit=100&offset=0", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          sessionStorage.removeItem("heartcareToken");
          sessionStorage.removeItem("heartcarePatient");
          throw new Error("Your session has expired. Please log in again.");
        }

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load assessment history.");
        }

        setAssessments(data.assessments || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("heartcareToken");
    sessionStorage.removeItem("heartcarePatient");
    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--";

    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleViewFullReport = (assessment) => {
    navigate("/result", {
      state: {
        patient: {
          age: assessment.age,
          sex: assessment.sex,
          cp: assessment.cp,
          trestbps: assessment.trestbps,
          chol: assessment.chol,
          fbs: assessment.fbs,
          restecg: assessment.restecg,
          thalach: assessment.thalach,
          exang: assessment.exang,
          oldpeak: assessment.oldpeak,
          slope: assessment.slope,
          ca: assessment.ca,
          thal: assessment.thal,
        },
        prediction: {
          prediction: assessment.prediction,
          positive_probability: assessment.positive_probability,
          threshold: assessment.threshold,
          model_name: assessment.model_name,
          model_version: assessment.model_version,
          saved: true,
          created_at: assessment.created_at,
        },
        assessmentId: assessment.id,
        isSaved: true
      }
    });
  };

  const handleCopyJson = (assessment) => {
    const featurePayload = {
      age: assessment.age,
      sex: assessment.sex,
      cp: assessment.cp,
      trestbps: assessment.trestbps,
      chol: assessment.chol,
      fbs: assessment.fbs,
      restecg: assessment.restecg,
      thalach: assessment.thalach,
      exang: assessment.exang,
      oldpeak: assessment.oldpeak,
      slope: assessment.slope,
      ca: assessment.ca,
      thal: assessment.thal,
      model_metadata: {
        id: assessment.id,
        model_name: assessment.model_name,
        model_version: assessment.model_version,
        prediction: assessment.prediction,
        positive_probability: assessment.positive_probability,
        threshold: assessment.threshold,
        created_at: assessment.created_at,
      },
    };

    navigator.clipboard
      .writeText(JSON.stringify(featurePayload, null, 2))
      .then(() => {
        setCopiedId(assessment.id);
        setTimeout(() => setCopiedId(null), 2000);
      });
  };

  const latestAssessment = assessments.length
    ? formatDate(assessments[0].created_at)
    : "--";

  return (
    <div className="history-container">
      {/* Unified Sidebar & Mobile Drawer */}
      <DashboardSidebar onLogout={handleLogout} activeKey="/history" />

      <main className="history-main">
        <header className="history-header">
          <div>
            <h1>Assessment History</h1>
            <p>View, inspect, and analyze all your previous heart assessments.</p>
          </div>

          <Link to="/assessment" className="new-assessment-btn">
            <Plus size={16} />
            <span>New Assessment</span>
          </Link>
        </header>

        <section className="history-summary">
          <div className="history-summary-card">
            <span>📋</span>
            <div>
              <h3>Total Assessments</h3>
              <h2>{loading ? "..." : total}</h2>
            </div>
          </div>

          <div className="history-summary-card">
            <span>📅</span>
            <div>
              <h3>Last Assessment</h3>
              <h2>{loading ? "..." : latestAssessment}</h2>
            </div>
          </div>
        </section>

        <section className="history-records">
          <div className="history-records-header">
            <h2>Previous Records</h2>

            {/* User Mode / Developer Mode Toggle */}
            <div
              className="history-mode-toggle"
              role="group"
              aria-label="History View Mode"
            >
              <button
                type="button"
                className={`mode-btn ${viewMode === "user" ? "active" : ""}`}
                onClick={() => setViewMode("user")}
                aria-pressed={viewMode === "user"}
              >
                <User size={15} />
                <span>Patient View</span>
              </button>
              <button
                type="button"
                className={`mode-btn ${
                  viewMode === "developer" ? "active" : ""
                }`}
                onClick={() => setViewMode("developer")}
                aria-pressed={viewMode === "developer"}
              >
                <Code size={15} />
                <span>Developer View</span>
              </button>
            </div>
          </div>

          {loading && (
            <div className="history-empty">
              <h3>Loading your assessments...</h3>
              <p>Please wait while we retrieve your records.</p>
            </div>
          )}

          {!loading && error && (
            <div className="history-empty">
              <div className="history-empty-icon">⚠️</div>
              <h3>Unable to Load History</h3>
              <p>{error}</p>
              <Link to="/login">Go to Login →</Link>
            </div>
          )}

          {!loading && !error && assessments.length === 0 && (
            <div className="history-empty">
              <div className="history-empty-icon">📊</div>
              <h3>No Assessment Records Found</h3>
              <p>
                You have not completed any saved heart assessments yet.
                Your saved records will appear here.
              </p>

              <Link to="/assessment">Start Your First Assessment →</Link>
            </div>
          )}

          {!loading && !error && assessments.length > 0 && (
            <div className="history-list">
              {assessments.map((assessment) => {
                const isExpanded = expandedIds.has(assessment.id);
                const health = analyzeAssessmentHealth(assessment);

                return (
                  <article key={assessment.id} className="history-item-card">
                    {/* Card Top: Title, Date & Risk Level Badge */}
                    <div className="history-item-header">
                      <div>
                        <h3>Heart Assessment #{assessment.id}</h3>
                        <p className="history-item-date">
                          📅 {formatDate(assessment.created_at)}
                        </p>
                      </div>

                      <span
                        className={`patient-risk-badge ${
                          health.isPositive ? "badge-elevated" : "badge-low"
                        }`}
                      >
                        {health.isPositive ? (
                          <>
                            <AlertTriangle size={15} aria-hidden="true" />
                            <span>Elevated Risk</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={15} aria-hidden="true" />
                            <span>Low Risk</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Patient-Friendly Health Information (User Mode) */}
                    {viewMode === "user" ? (
                      <div className="patient-health-summary-block">
                        {/* Key Metrics Row */}
                        <div className="patient-metrics-row">
                          <div className="patient-score-pill">
                            <span className="score-label">Risk Indicator</span>
                            <span className="score-value">
                              {health.scorePercent ? `${health.scorePercent}%` : "Evaluated"}
                            </span>
                          </div>

                          <div className="patient-factors-group">
                            <span className="factors-label">Important Risk Factors:</span>
                            <div className="factors-tag-list">
                              {health.identifiedRisks.length > 0 ? (
                                health.identifiedRisks.map((rf, idx) => (
                                  <span key={idx} className="health-tag tag-risk">
                                    {rf}
                                  </span>
                                ))
                              ) : (
                                <span className="health-tag tag-clear">
                                  ✓ No high-risk factors identified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Health Indicators */}
                        {health.healthyIndicators.length > 0 && (
                          <div className="patient-healthy-indicators">
                            <span className="factors-label">Health Indicators:</span>
                            <div className="factors-tag-list">
                              {health.healthyIndicators.map((hi, idx) => (
                                <span key={idx} className="health-tag tag-healthy">
                                  {hi}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* What This Result Means */}
                        <div className="patient-meaning-box">
                          <strong>What This Result Means:</strong>
                          <p>{health.explanation}</p>
                        </div>

                        {/* Recommended Next Steps */}
                        <div className="patient-next-steps-box">
                          <strong>Recommended Next Steps:</strong>
                          <ul>
                            {health.nextSteps.map((step, idx) => (
                              <li key={idx}>
                                <CheckCircle2 size={14} className="step-check-icon" aria-hidden="true" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      /* Developer Mode View: Technical ML Metadata */
                      <div className="developer-meta-summary">
                        <div className="dev-meta-row">
                          <span>
                            <code>model: {assessment.model_name}</code>
                          </span>
                          <span>
                            <code>threshold: {(assessment.threshold * 100).toFixed(0)}%</code>
                          </span>
                          <span>
                            <code>prob: {(assessment.positive_probability * 100).toFixed(2)}%</code>
                          </span>
                          <span>
                            <code>version: {assessment.model_version || "1.0"}</code>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Bar: View Full Report & Clinical Parameters Toggle */}
                    <div className="history-item-footer">
                      <div className="footer-action-left">
                        <button
                          type="button"
                          className="btn-view-full-report"
                          onClick={() => handleViewFullReport(assessment)}
                          title="Open full prediction and medical report"
                        >
                          <ClipboardList size={16} aria-hidden="true" />
                          <span>View Full Report</span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          className="btn-toggle-parameters"
                          onClick={() => toggleExpand(assessment.id)}
                          aria-expanded={isExpanded}
                        >
                          <span>
                            {isExpanded
                              ? "Hide Clinical Parameters"
                              : "View Clinical Parameters"}
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={16} aria-hidden="true" />
                          ) : (
                            <ChevronDown size={16} aria-hidden="true" />
                          )}
                        </button>
                      </div>

                      {viewMode === "developer" && (
                        <button
                          type="button"
                          className="btn-copy-raw-json"
                          onClick={() => handleCopyJson(assessment)}
                          title="Copy raw clinical parameters JSON"
                        >
                          {copiedId === assessment.id ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                          <span>
                            {copiedId === assessment.id
                              ? "Copied JSON!"
                              : "Copy JSON"}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Expandable Parameter Section */}
                    {isExpanded && (
                      <div className="history-expanded-body">
                        {viewMode === "user" ? (
                          /* User Mode Clinical Grid */
                          <div className="user-mode-parameters">
                            <h4 className="expanded-section-title">
                              Recorded Clinical Parameters
                            </h4>

                            <div className="history-params-grid">
                              {PARAMETER_CONFIG.map((param) => {
                                const val = formatParameterValue(
                                  param.key,
                                  assessment[param.key]
                                );

                                return (
                                  <div
                                    key={param.key}
                                    className="history-param-cell"
                                  >
                                    <span className="param-label">
                                      {param.label}
                                    </span>
                                    <strong className="param-value">
                                      {val}
                                      {param.unit && val !== "Not provided"
                                        ? ` ${param.unit}`
                                        : ""}
                                    </strong>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          /* Developer Mode View */
                          <div className="developer-mode-parameters">
                            <pre className="developer-json-block">
                              <code>
                                {JSON.stringify(
                                  {
                                    id: assessment.id,
                                    age: assessment.age,
                                    sex: assessment.sex,
                                    cp: assessment.cp,
                                    trestbps: assessment.trestbps,
                                    chol: assessment.chol,
                                    fbs: assessment.fbs,
                                    restecg: assessment.restecg,
                                    thalach: assessment.thalach,
                                    exang: assessment.exang,
                                    oldpeak: assessment.oldpeak,
                                    slope: assessment.slope,
                                    ca: assessment.ca,
                                    thal: assessment.thal,
                                    prediction: assessment.prediction,
                                    positive_probability:
                                      assessment.positive_probability,
                                    threshold: assessment.threshold,
                                    model_name: assessment.model_name,
                                  },
                                  null,
                                  2
                                )}
                              </code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="history-footer">
          © 2026 HeartGuard AI | Your Health, Our Priority
        </footer>
      </main>
    </div>
  );
}

export default History;
