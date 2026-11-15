
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./History.css";

function History() {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const latestAssessment = assessments.length
    ? formatDate(assessments[0].created_at)
    : "--";

  return (
    <div className="history-container">
      <aside className="history-sidebar">
        <h2>❤️ HeartCare</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/assessment">Heart Assessment</Link>
          <Link to="/history" className="active">
            Assessment History
          </Link>
          <Link to="/profile">My Profile</Link>
          <Link to="/">Home</Link>
        </nav>

        <button
          type="button"
          className="history-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <main className="history-main">
        <header className="history-header">
          <div>
            <h1>Assessment History</h1>
            <p>View and manage your previous heart assessments.</p>
          </div>

          <Link to="/assessment" className="new-assessment-btn">
            + New Assessment
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
          <h2>Previous Records</h2>

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

              <Link to="/assessment">
                Start Your First Assessment →
              </Link>
            </div>
          )}

          {!loading && !error && assessments.length > 0 && (
            <div>
              {assessments.map((assessment) => (
                <article
                  key={assessment.id}
                  style={{
                    padding: "18px",
                    marginBottom: "16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    background: "white",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <h3>Assessment #{assessment.id}</h3>
                      <p>{formatDate(assessment.created_at)}</p>
                    </div>

                    <strong
                      style={{
                        color:
                          assessment.prediction === 1 ? "#dc2626" : "#15803d",
                      }}
                    >
                      {assessment.prediction === 1
                        ? "Positive model result"
                        : "Negative model result"}
                    </strong>
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <p>
                      <strong>Model score:</strong>{" "}
                      {(assessment.positive_probability * 100).toFixed(2)}%
                    </p>

                    <p>
                      <strong>Threshold:</strong>{" "}
                      {(assessment.threshold * 100).toFixed(0)}%
                    </p>

                    <p>
                      <strong>Model:</strong> {assessment.model_name}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="history-footer">
          © 2026 HeartCare | Your Health, Our Priority
        </footer>
      </main>
    </div>
  );
}

export default History;
