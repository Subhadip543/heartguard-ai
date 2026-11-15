
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem("heartcareToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch("/api/v1/patients/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          sessionStorage.removeItem("heartcareToken");
          sessionStorage.removeItem("heartcarePatient");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load your profile.");
        }

        setProfile(data);
        setName(data.name || "");
        setPhone(data.phone || "");

        sessionStorage.setItem(
          "heartcarePatient",
          JSON.stringify(data)
        );
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUpdate = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Name must contain between 2 and 100 characters.");
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    const token = sessionStorage.getItem("heartcareToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/v1/patients/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("heartcareToken");
        sessionStorage.removeItem("heartcarePatient");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Unable to update your profile.");
      }

      setProfile(data);
      setName(data.name || "");
      setPhone(data.phone || "");

      sessionStorage.setItem(
        "heartcarePatient",
        JSON.stringify(data)
      );

      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("heartcareToken");
    sessionStorage.removeItem("heartcarePatient");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="profile-main">
        <h2>Loading your profile...</h2>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-main">
        <h2>Unable to Load Profile</h2>
        <p>{error || "Please try logging in again."}</p>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  const initial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "P";

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <h2>HeartCare</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/assessment">Heart Assessment</Link>
          <Link to="/history">Assessment History</Link>
          <Link to="/profile" className="active">My Profile</Link>
          <Link to="/">Home</Link>
        </nav>

        <button
          type="button"
          className="profile-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="profile-main">
        <header className="profile-header">
          <div>
            <h1>My Profile</h1>
            <p>View and update your personal account information.</p>
          </div>
        </header>

        {/* Profile Card */}
        <section className="profile-card">
          <div className="profile-top">
            <div className="profile-avatar">{initial}</div>

            <div>
              <h2>{profile.name}</h2>
              <p>HeartCare Patient</p>
            </div>
          </div>

          <div className="profile-details">
            <h3>Personal Information</h3>

            <div className="profile-info-grid">
              <div className="profile-info">
                <label>Email Address</label>
                <p>{profile.email}</p>
              </div>

              <div className="profile-info">
                <label>Account Type</label>
                <p>Patient</p>
              </div>

              <div className="profile-info">
                <label>Registration Date</label>
                <p>
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "--"}
                </p>
              </div>
            </div>
          </div>

          <div className="profile-details">
            <h3>Edit Personal Information</h3>

            <form onSubmit={handleUpdate}>
              <div className="profile-info-grid">
                <div className="profile-info">
                  <label htmlFor="profile-name">Full Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="profile-info">
                  <label htmlFor="profile-phone">Phone Number</label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {error && (
                <p role="alert" style={{ color: "#dc2626", marginTop: "12px" }}>
                  {error}
                </p>
              )}

              {success && (
                <p role="status" style={{ color: "#15803d", marginTop: "12px" }}>
                  {success}
                </p>
              )}

              <button
                type="submit"
                className="profile-back-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="profile-note">
            <span>ℹ️</span>
            <p>
              Your profile information is stored securely in your
              HeartCare account. Your email address cannot be changed
              from this page.
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
