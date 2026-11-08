
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./PDashboard.css";

function PDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch logged-in patient information
  useEffect(() => {
    const fetchPatient = async () => {
      const token = sessionStorage.getItem("heartcareToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          sessionStorage.removeItem("heartcareToken");
          sessionStorage.removeItem("heartcarePatient");

          navigate("/login", { replace: true });
          return;
        }

        setPatient(data.patient);

        sessionStorage.setItem(
          "heartcarePatient",
          JSON.stringify(data.patient)
        );

      } catch (error) {
        setError("Unable to connect to the backend server.");
        console.error("Dashboard error:", error);

      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem("heartcareToken");
    sessionStorage.removeItem("heartcarePatient");

    navigate("/login", { replace: true });
  };

  // Loading screen
  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading Dashboard...</h2>
        <p>Please wait.</p>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="dashboard-loading">
        <h2>Connection Error</h2>
        <p>{error}</p>

        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const patientInitial = patient.name
    ? patient.name.charAt(0).toUpperCase()
    : "P";

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">

        <h2>HeartCare</h2>

        <nav>
          <Link to="/dashboard" className="active">
            Dashboard
          </Link>

          <Link to="/assessment">
            Heart Assessment
          </Link>

          <Link to="/history">
            Assessment History
          </Link>

          <Link to="/profile">
            My Profile
          </Link>

  <Link to="/emergency">Emergency Help</Link>
  
          <Link to="/">
            Home
          </Link>
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
            <p>
              Welcome to your HeartCare health portal.
            </p>
          </div>

          <div className="patient-avatar">
            {patientInitial}
          </div>

        </header>

        {/* Welcome Section */}
        <section className="welcome-card">

          <div>

            <h2>Welcome, {patient.name}! 👋</h2>

            <p>
              Take control of your heart health.
              Stay informed and monitor your health regularly.
            </p>

            <p className="patient-email">
              {patient.email}
            </p>

            <Link
              to="/assessment"
              className="assessment-btn"
            >
              Start Heart Assessment →
            </Link>

          </div>

          <div className="heart-icon"></div>

        </section>

        {/* Risk Assessment Section */}
        <section className="risk-assessment-card">

          <div className="risk-assessment-content">

            <span className="risk-icon">
              ♥
            </span>

            <div>

              <h2>Risk Assessment</h2>

              <p>
                Evaluate potential heart disease risk using
                relevant health parameters.
              </p>

              <Link
                to="/assessment"
                className="risk-assessment-btn"
              >
                Start Risk Assessment →
              </Link>

            </div>

          </div>

        </section>

        {/* Statistics */}
        <section className="dashboard-stats">

          <div className="stat-card">
            <span>📋</span>
            <h3>Total Assessments</h3>
            <h2>0</h2>
            <p>Assessments completed</p>
          </div>

          <div className="stat-card">
            <span>❤️</span>
            <h3>Heart Health</h3>
            <h2>Not Available</h2>
            <p>Complete an assessment first</p>
          </div>

          <div className="stat-card">
            <span>📅</span>
            <h3>Last Assessment</h3>
            <h2>--</h2>
            <p>No assessment yet</p>
          </div>

        </section>

        {/* Recent Assessments */}
        <section className="dashboard-section">

          <div className="section-heading">

            <h2>Recent Assessments</h2>

            <Link to="/history">
              View All
            </Link>

          </div>

          <div className="empty-assessment">

            <span>📊</span>

            <h3>No Assessments Yet</h3>

            <p>
              Your completed heart assessments will appear here.
            </p>

            <Link to="/assessment">
              Take Your First Assessment
            </Link>

          </div>

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
