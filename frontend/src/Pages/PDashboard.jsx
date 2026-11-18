import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HeartPulse,
  Stethoscope,
  LifeBuoy,
  ClipboardCheck,
  Calendar,
  ArrowRight,
  Mail,
  ShieldCheck,
  Apple,
  Footprints,
  Droplets,
  Activity,
  AlertCircle
} from "lucide-react";
import DashboardSidebar from "../DashboardSidebar";
import "./PDashboard.css";

function PDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(() => {
    try {
      const cached = sessionStorage.getItem("heartcarePatient");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [assessments, setAssessments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(!patient);
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

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "P";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "P";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" aria-hidden="true" />
        <h2>Loading Dashboard...</h2>
        <p>Retrieving your health profile and clinical history.</p>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="dashboard-loading">
        <AlertCircle size={44} color="#ef4444" aria-hidden="true" />
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (!patient) return null;

  const latestAssessment = assessments[0] || null;
  const patientInitials = getInitials(patient?.name);

  return (
    <div className="dashboard-container">
      {/* Unified Sidebar & Mobile Drawer */}
      <DashboardSidebar
        patient={patient}
        onLogout={handleLogout}
        activeKey="/dashboard"
      />

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        {/* PART 2.A — Redesigned Welcome Hero with Avatar Glow & Background Orbs */}
        <section className="dashboard-welcome-hero" aria-label="Welcome Overview">
          {/* Subtle animated background orbs */}
          <div className="hero-bg-orb hero-bg-orb-1" aria-hidden="true" />
          <div className="hero-bg-orb hero-bg-orb-2" aria-hidden="true" />

          <div className="welcome-hero-content">
            <div className="welcome-hero-badge">
              <span className="badge-pulse-dot" aria-hidden="true" />
              <span>Patient Health Portal • Cardiovascular Overview</span>
            </div>

            <h1 className="welcome-hero-title">
              Welcome back, <span className="welcome-name">{patient.name || "Patient"}</span>! 👋
            </h1>

            <p className="welcome-hero-subtitle">
              Take proactive control of your heart health. Stay informed, track clinical risk factors, and monitor your cardiovascular parameters regularly.
            </p>

            <div className="welcome-hero-meta">
              {patient.email && (
                <div className="welcome-meta-pill" title="Registered Email">
                  <Mail size={14} aria-hidden="true" />
                  <span>{patient.email}</span>
                </div>
              )}
              <div className="welcome-meta-pill status-verified" title="Account Status">
                <ShieldCheck size={14} aria-hidden="true" />
                <span>Verified Patient Account</span>
              </div>
            </div>
          </div>

          {/* Patient Avatar Presentation - Clickable Link to /profile (No separate square tile) */}
          <Link
            to="/profile"
            className="welcome-hero-avatar-link"
            title="View My Profile"
            aria-label={`View profile for ${patient.name || "Patient"}`}
          >
            <div className="hero-avatar-glow-ring" aria-hidden="true" />
            <div className="hero-avatar-circle">
              <span className="hero-avatar-initials">{patientInitials}</span>
            </div>
            <div className="hero-avatar-status-pill">
              <span className="avatar-status-dot" aria-hidden="true" />
              <span>HeartGuard Active</span>
            </div>
          </Link>
        </section>

        {/* PART 2.B — Three Service Cards in One Row */}
        <section className="dashboard-services-section" aria-label="Core Healthcare Services">
          <div className="section-label-header">
            <h2>Core Services</h2>
            <span>Quick access to primary cardiovascular tools</span>
          </div>

          <div className="dashboard-services-grid">
            {/* Service 1: Heart Risk Assessment */}
            <Link
              to="/assessment"
              className="dashboard-service-card card-assessment"
              aria-label="Start Heart Risk Assessment"
            >
              <div className="service-card-top">
                <div className="service-icon-box icon-assessment">
                  <HeartPulse size={26} aria-hidden="true" />
                </div>
                <span className="service-tag tag-assessment">AI Diagnostic</span>
              </div>
              <div className="service-card-body">
                <h3>Heart Risk Assessment</h3>
                <p>
                  Evaluate potential cardiovascular risk using machine learning models trained on verified clinical parameters.
                </p>
              </div>
              <div className="service-card-footer">
                <span className="service-action-hint">
                  Launch Assessment <ArrowRight size={15} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* Service 2: Find Doctors */}
            <Link
              to="/find-doctors"
              className="dashboard-service-card card-doctors"
              aria-label="Find and consult heart doctors"
            >
              <div className="service-card-top">
                <div className="service-icon-box icon-doctors">
                  <Stethoscope size={26} aria-hidden="true" />
                </div>
                <span className="service-tag tag-doctors">Specialist Network</span>
              </div>
              <div className="service-card-body">
                <h3>Find Doctors</h3>
                <p>
                  Connect with certified cardiologists and cardiac surgeons, check credentials, and book specialized consultations.
                </p>
              </div>
              <div className="service-card-footer">
                <span className="service-action-hint">
                  Explore Doctors <ArrowRight size={15} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* Service 3: Healthcare Lifeline */}
            <Link
              to="/heart-resources"
              className="dashboard-service-card card-lifeline"
              aria-label="Access Healthcare Lifeline resources"
            >
              <div className="service-card-top">
                <div className="service-icon-box icon-lifeline">
                  <LifeBuoy size={26} aria-hidden="true" />
                </div>
                <span className="service-tag tag-lifeline">Essential Supplies</span>
              </div>
              <div className="service-card-body">
                <h3>Healthcare Lifeline</h3>
                <p>
                  Locate critical cardiac medicines, emergency injections, blood banks, and oxygen resources across India.
                </p>
              </div>
              <div className="service-card-footer">
                <span className="service-action-hint">
                  Access Lifeline Resources <ArrowRight size={15} aria-hidden="true" />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* PART 2.C — Assessment Statistics (Modern Glass Widgets) */}
        <section className="dashboard-stats-section" aria-label="Assessment Statistics">
          <div className="section-label-header">
            <h2>Assessment Metrics</h2>
            <span>Your historical model results and activity</span>
          </div>

          <div className="dashboard-stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-blue">
                <ClipboardCheck size={22} aria-hidden="true" />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Assessments</span>
                <h3 className="stat-value">{assessmentError ? "--" : total}</h3>
                <p className="stat-desc">Saved clinical assessments</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-heart">
                <Activity size={22} aria-hidden="true" />
              </div>
              <div className="stat-info">
                <span className="stat-label">Latest Model Result</span>
                <h3
                  className={`stat-value ${
                    latestAssessment
                      ? latestAssessment.prediction === 1
                        ? "result-positive"
                        : "result-negative"
                      : ""
                  }`}
                >
                  {assessmentError
                    ? "Unavailable"
                    : latestAssessment
                      ? latestAssessment.prediction === 1
                        ? "Positive"
                        : "Negative"
                      : "Not Available"}
                </h3>
                <p className="stat-desc">
                  {latestAssessment
                    ? `${(latestAssessment.positive_probability * 100).toFixed(2)}% model score`
                    : "Complete an assessment first"}
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-cal">
                <Calendar size={22} aria-hidden="true" />
              </div>
              <div className="stat-info">
                <span className="stat-label">Last Assessment</span>
                <h3 className="stat-value stat-value-date">
                  {assessmentError
                    ? "--"
                    : latestAssessment
                      ? formatDate(latestAssessment.created_at)
                      : "--"}
                </h3>
                <p className="stat-desc">
                  {latestAssessment
                    ? "Most recent saved assessment"
                    : "No saved assessment yet"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Assessments List */}
        <section className="dashboard-section" aria-label="Recent Assessments">
          <div className="section-heading">
            <div>
              <h2>Recent Assessments</h2>
              <p className="section-subtext">Recent cardiovascular assessments stored in your account</p>
            </div>
            <Link to="/history" className="view-all-link">
              View All History <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {assessmentError && (
            <div className="empty-assessment">
              <AlertCircle size={36} color="#ef4444" aria-hidden="true" />
              <h3>Unable to Load Assessments</h3>
              <p>{assessmentError}</p>
              <Link to="/history">Open Assessment History</Link>
            </div>
          )}

          {!assessmentError && assessments.length === 0 && (
            <div className="empty-assessment">
              <ClipboardCheck size={38} color="var(--primary)" aria-hidden="true" />
              <h3>No Assessments Yet</h3>
              <p>Your completed and saved heart assessments will appear here.</p>
              <Link to="/assessment">Take Your First Assessment</Link>
            </div>
          )}

          {!assessmentError && assessments.length > 0 && (
            <div className="recent-assessments-list">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="recent-assessment-item">
                  <div className="recent-assessment-top">
                    <span className="recent-assessment-id">
                      Assessment #{assessment.id}
                    </span>

                    <span
                      className={`recent-assessment-badge ${
                        assessment.prediction === 1
                          ? "badge-high-risk"
                          : "badge-low-risk"
                      }`}
                    >
                      {assessment.prediction === 1
                        ? "Positive model result"
                        : "Negative model result"}
                    </span>
                  </div>

                  <div className="recent-assessment-meta">
                    <span>{formatDate(assessment.created_at)}</span>
                    <span className="model-score-chip">
                      Model score: {(assessment.positive_probability * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PART 2.D — Heart Health Tips (Clickable to Health Awareness) */}
        <section className="dashboard-section" aria-label="Heart Health Tips">
          <div className="section-heading">
            <div>
              <h2>Heart Health Tips</h2>
              <p className="section-subtext">Actionable lifestyle guidelines for lifelong cardiovascular wellness</p>
            </div>
            <Link to="/health-awareness" className="view-all-link">
              Explore Education <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="tips-grid">
            <Link
              to="/health-awareness"
              className="tip-card"
              title="Learn about heart-healthy nutrition"
              aria-label="Eat Healthy - Learn more in Health Awareness"
            >
              <div className="tip-icon-box">
                <Apple size={24} aria-hidden="true" />
              </div>
              <div className="tip-content">
                <h3>Eat Heart-Healthy</h3>
                <p>
                  Choose balanced meals rich in fiber, leafy greens, and healthy fats while limiting sodium.
                </p>
                <span className="tip-learn-more">
                  Learn nutrition tips <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>

            <Link
              to="/health-awareness"
              className="tip-card"
              title="Learn about cardiovascular physical activity"
              aria-label="Stay Active - Learn more in Health Awareness"
            >
              <div className="tip-icon-box">
                <Footprints size={24} aria-hidden="true" />
              </div>
              <div className="tip-content">
                <h3>Stay Active</h3>
                <p>
                  Incorporate 30 minutes of moderate aerobic activity into your daily routine to strengthen heart muscle.
                </p>
                <span className="tip-learn-more">
                  View exercise tips <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>

            <Link
              to="/health-awareness"
              className="tip-card"
              title="Learn about hydration and cardiovascular health"
              aria-label="Stay Hydrated - Learn more in Health Awareness"
            >
              <div className="tip-icon-box">
                <Droplets size={24} aria-hidden="true" />
              </div>
              <div className="tip-content">
                <h3>Maintain Hydration</h3>
                <p>
                  Drink adequate water throughout the day to support optimal blood viscosity and healthy circulation.
                </p>
                <span className="tip-learn-more">
                  Read hydration guide <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Dashboard Footer */}
        <footer className="dashboard-footer">
          © 2026 HeartGuard AI | Your Health, Our Priority
        </footer>
      </main>
    </div>
  );
}

export default PDashboard;
