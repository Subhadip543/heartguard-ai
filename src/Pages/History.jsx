
import { Link } from "react-router-dom";
import "./History.css";

function History() {
  return (
    <div className="history-container">

      {/* Sidebar */}
      <aside className="history-sidebar">
        <h2>❤️ HeartCare</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/assessment">Heart Assessment</Link>
          <Link to="/history" className="active">Assessment History</Link>
          <Link to="/profile">My Profile</Link>
          <Link to="/">Home</Link>
        </nav>

        <Link to="/login" className="history-logout">
          Logout
        </Link>
      </aside>

      {/* Main Content */}
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

        {/* History Summary */}
        <section className="history-summary">
          <div className="history-summary-card">
            <span>📋</span>
            <div>
              <h3>Total Assessments</h3>
              <h2>0</h2>
            </div>
          </div>

          <div className="history-summary-card">
            <span>📅</span>
            <div>
              <h3>Last Assessment</h3>
              <h2>--</h2>
            </div>
          </div>
        </section>

        {/* Assessment Records */}
        <section className="history-records">
          <h2>Previous Records</h2>

          <div className="history-empty">
            <div className="history-empty-icon">📊</div>
            <h3>No Assessment Records Found</h3>
            <p>
              You have not completed any heart assessments yet.
              Your saved records will appear here.
            </p>

            <Link to="/assessment">
              Start Your First Assessment →
            </Link>
          </div>
        </section>

        <footer className="history-footer">
          © 2026 HeartCare | Your Health, Our Priority
        </footer>

      </main>
    </div>
  );
}

export default History;
