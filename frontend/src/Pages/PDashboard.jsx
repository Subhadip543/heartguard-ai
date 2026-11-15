
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./PDashboard.css";

function PDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assessmentError, setAssessmentError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = sessionStorage.getItem("heartcareToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        // Fetch authenticated patient information.
        const patientResponse = await fetch("/api/v1/auth/me", {
          method: "GET",
          headers,
        });

        if (patientResponse.status === 401) {
          sessionStorage.removeItem("heartcareToken");
          sessionStorage.removeItem("heartcarePatient");
          navigate("/login", { replace: true });
          return;
        }

        if (!patientResponse.ok) {
          throw new Error("Unable to load your patient profile.");
        }

        const patientData = await patientResponse.json();

        setPatient(patientData);
        sessionStorage.setItem(
          "heartcarePatient",
          JSON.stringify(patientData)
        );

        // Fetch saved assessments for this patient.
        try {
          const historyResponse = await fetch(
            "/api/v1/assessments?limit=5&offset=0",
            {
              method: "GET",
              headers,
            }
          );

          if (historyResponse.status === 401) {
            sessionStorage.removeItem("heartcareToken");
            sessionStorage.removeItem("heartcarePatient");
            navigate("/login", { replace: true });
            return;
          }

          if (!historyResponse.ok) {
            throw new Error("Unable to load assessment history.");
          }

          const historyData = await historyResponse.json();

          setAssessments(historyData.assessments || []);
          setTotal(historyData.total || 0);
        } catch (err) {
          setAssessmentError(err.message);
        }
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("heartcareToken");
    sessionStorage.removeItem("heartcarePatient");
    navigate("/login", { replace: true });
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading Dashboard...</h2>
        <p>Please wait.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-loading">
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (!patient) return null;

  const patientInitial = patient.name
    ? patient.name.charAt(0).toUpperCase()
    : "P";

  const latestAssessment = assessments[0] || null;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <h2>HeartCare</h2>

        <nav>
          <Link to="/dashboard" className="active">
            Dashboard
          </Link>

          <Link to="/assessment">Heart Assessment</Link>
          <Link to="/find-doctors">Find Doctors</Link>
          <Link to="/history">Assessment History</Link>
          <Link to="/profile">My Profile</Link>
          <Link to="/emergency">Emergency Help</Link>
          <Link to="/">Home</Link>
        </nav>

        <button
          type="button"
          className="logout-link"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      {/* Main Dashboard */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>Patient Dashboard</h1>
            <p>Welcome to your HeartCare health portal.</p>
          </div>

          <div className="patient-avatar">{patientInitial}</div>
        </header>

        {/* Welcome Section */}
        <section className="welcome-card">
          <div>
            <h2>Welcome, {patient.name}! 👋</h2>

            <p>
              Take control of your heart health. Stay informed and
              monitor your health regularly.
            </p>

            <p className="patient-email">{patient.email}</p>

            <Link to="/assessment" className="assessment-btn">
              Start Heart Assessment →
            </Link>
          </div>

          <div className="heart-icon"></div>
        </section>

        {/* Risk Assessment Section */}
        <section className="risk-assessment-card">
          <div className="risk-assessment-content">
            <span className="risk-icon">♥</span>

            <div>
              <h2>Risk Assessment</h2>

              <p>
                Evaluate potential heart disease risk using relevant
                health parameters.
              </p>

              <Link to="/assessment" className="risk-assessment-btn">
                Start Risk Assessment →
              </Link>
            </div>
          </div>
        </section>

        {/* Find Doctors Section */}
        <section className="find-doctors-card">
          <div className="find-doctors-content">
            <div className="find-doctors-icon">✚</div>

            <div className="find-doctors-details">
              <h2>Find a Doctor</h2>

              <p>
                Explore doctors, check their specializations and find
                a suitable consultation option.
              </p>

              <Link to="/find-doctors" className="find-doctors-btn">
                Explore Doctors →
              </Link>
            </div>
          </div>
        </section>

        {/* Dynamic Statistics */}
        <section className="dashboard-stats">
          <div className="stat-card">
            <span>📋</span>
            <h3>Total Assessments</h3>
            <h2>{assessmentError ? "--" : total}</h2>
            <p>Saved assessments</p>
          </div>

          <div className="stat-card">
            <span>❤️</span>
            <h3>Latest Model Result</h3>
            <h2
              style={{
                color: latestAssessment
                  ? latestAssessment.prediction === 1
                    ? "#dc2626"
                    : "#15803d"
                  : "inherit",
              }}
            >
              {assessmentError
                ? "Unavailable"
                : latestAssessment
                  ? latestAssessment.prediction === 1
                    ? "Positive"
                    : "Negative"
                  : "Not Available"}
            </h2>
            <p>
              {latestAssessment
                ? `${(latestAssessment.positive_probability * 100).toFixed(2)}% model score`
                : "Complete an assessment first"}
            </p>
          </div>

          <div className="stat-card">
            <span>📅</span>
            <h3>Last Assessment</h3>
            <h2>
              {assessmentError
                ? "--"
                : latestAssessment
                  ? formatDate(latestAssessment.created_at)
                  : "--"}
            </h2>
            <p>
              {latestAssessment
                ? "Most recent saved assessment"
                : "No saved assessment yet"}
            </p>
          </div>
        </section>

        {/* Recent Assessments */}
        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Recent Assessments</h2>

            <Link to="/history">View All</Link>
          </div>

          {assessmentError && (
            <div className="empty-assessment">
              <span>⚠️</span>
              <h3>Unable to Load Assessments</h3>
              <p>{assessmentError}</p>
              <Link to="/history">Open Assessment History</Link>
            </div>
          )}

          {!assessmentError && assessments.length === 0 && (
            <div className="empty-assessment">
              <span>📊</span>
              <h3>No Assessments Yet</h3>
              <p>
                Your completed and saved heart assessments will appear here.
              </p>

              <Link to="/assessment">
                Take Your First Assessment
              </Link>
            </div>
          )}

          {!assessmentError && assessments.length > 0 && (
            <div>
              {assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  style={{
                    padding: "16px",
                    marginBottom: "12px",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <strong>Assessment #{assessment.id}</strong>

                    <strong
                      style={{
                        color:
                          assessment.prediction === 1
                            ? "#dc2626"
                            : "#15803d",
                      }}
                    >
                      {assessment.prediction === 1
                        ? "Positive model result"
                        : "Negative model result"}
                    </strong>
                  </div>

                  <p>{formatDate(assessment.created_at)}</p>

                  <p>
                    Model score:{" "}
                    {(assessment.positive_probability * 100).toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Health Tips */}
        <section className="dashboard-section">
          <h2>Heart Health Tips</h2>

          <div className="tips-grid">
            <div className="tip-card">
              <span>🥗</span>
              <h3>Eat Healthy</h3>
              <p>
                Choose balanced meals with fruits and vegetables.
              </p>
            </div>

            <div className="tip-card">
              <span>🚶</span>
              <h3>Stay Active</h3>
              <p>
                Include regular physical activity in your routine.
              </p>
            </div>

            <div className="tip-card">
              <span>💧</span>
              <h3>Stay Hydrated</h3>
              <p>
                Drink enough water throughout the day.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          © 2026 HeartCare | Your Health, Our Priority
        </footer>
      </main>
    </div>
  );
}

export default PDashboard;
