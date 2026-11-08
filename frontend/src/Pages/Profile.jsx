
import { Link } from "react-router-dom";
import "./Profile.css";

function Profile() {
  return (
    <div className="profile-container">

      {/* Sidebar */}
      <aside className="profile-sidebar">
        <h2> HeartCare</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/assessment">Heart Assessment</Link>
          <Link to="/history">Assessment History</Link>
          <Link to="/profile" className="active">My Profile</Link>
          <Link to="/">Home</Link>
        </nav>

        <Link to="/login" className="profile-logout">
          Logout
        </Link>
      </aside>

      {/* Main Content */}
      <main className="profile-main">

        <header className="profile-header">
          <div>
            <h1>My Profile</h1>
            <p>View your personal account information.</p>
          </div>
        </header>

        {/* Profile Card */}
        <section className="profile-card">

          <div className="profile-top">
            <div className="profile-avatar">P</div>

            <div>
              <h2>Patient Name</h2>
              <p>HeartCare Patient</p>
            </div>
          </div>

          <div className="profile-details">
            <h3>Personal Information</h3>

            <div className="profile-info-grid">
              <div className="profile-info">
                <label>Full Name</label>
                <p>Patient Name</p>
              </div>

              <div className="profile-info">
                <label>Email Address</label>
                <p>patient@example.com</p>
              </div>

              <div className="profile-info">
                <label>Phone Number</label>
                <p>Not Added</p>
              </div>

              <div className="profile-info">
                <label>Account Type</label>
                <p>Patient</p>
              </div>
            </div>
          </div>

          <div className="profile-note">
            <span>ℹ️</span>
            <p>
              Your personal information will be available here.
              Profile editing and database integration will be added later.
            </p>
          </div>

          <Link to="/dashboard" className="profile-back-btn">
            Back to Dashboard
          </Link>

        </section>

        <footer className="profile-footer">
          © 2026 HeartCare | Your Health, Our Priority
        </footer>

      </main>
    </div>
  );
}

export default Profile;
