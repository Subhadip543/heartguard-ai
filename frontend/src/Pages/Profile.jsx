import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  HeartPulse,
  Activity,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowLeft,
  Lock,
} from "lucide-react";
import DashboardSidebar from "../DashboardSidebar";
import "./Profile.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() => {
    try {
      const cached = sessionStorage.getItem("heartcarePatient");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Core editable fields
  const [name, setName] = useState(() => profile?.name || "");
  const [phone, setPhone] = useState(() => profile?.phone || "");

  // Optional medical fields
  const [bloodGroup, setBloodGroup] = useState(() => profile?.blood_group || "");
  const [height, setHeight] = useState(() =>
    profile?.height !== null && profile?.height !== undefined ? String(profile.height) : ""
  );
  const [weight, setWeight] = useState(() =>
    profile?.weight !== null && profile?.weight !== undefined ? String(profile.weight) : ""
  );
  const [medicalConditions, setMedicalConditions] = useState(
    () => profile?.medical_conditions || ""
  );
  const [allergies, setAllergies] = useState(() => profile?.allergies || "");
  const [medications, setMedications] = useState(() => profile?.medications || "");

  // Optional emergency & location fields
  const [emergencyContact, setEmergencyContact] = useState(
    () => profile?.emergency_contact || ""
  );
  const [city, setCity] = useState(() => profile?.city || "");
  const [address, setAddress] = useState(() => profile?.address || "");

  const [loading, setLoading] = useState(!profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateStateFromData = (data) => {
    if (!data) return;
    setName(data.name || "");
    setPhone(data.phone || "");
    setBloodGroup(data.blood_group || "");
    setHeight(data.height !== null && data.height !== undefined ? String(data.height) : "");
    setWeight(data.weight !== null && data.weight !== undefined ? String(data.weight) : "");
    setMedicalConditions(data.medical_conditions || "");
    setAllergies(data.allergies || "");
    setMedications(data.medications || "");
    setEmergencyContact(data.emergency_contact || "");
    setCity(data.city || "");
    setAddress(data.address || "");
  };

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
        updateStateFromData(data);

        sessionStorage.setItem("heartcarePatient", JSON.stringify(data));
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Live BMI calculation
  const bmiInfo = useMemo(() => {
    const numHeight = parseFloat(height);
    const numWeight = parseFloat(weight);

    if (
      !isNaN(numHeight) &&
      numHeight >= 50 &&
      numHeight <= 280 &&
      !isNaN(numWeight) &&
      numWeight >= 15 &&
      numWeight <= 400
    ) {
      const heightInMeters = numHeight / 100;
      const score = numWeight / (heightInMeters * heightInMeters);
      const bmiValue = score.toFixed(1);

      if (score < 18.5) {
        return { value: bmiValue, category: "Underweight", tone: "blue" };
      } else if (score < 25) {
        return { value: bmiValue, category: "Normal Weight", tone: "green" };
      } else if (score < 30) {
        return { value: bmiValue, category: "Overweight", tone: "amber" };
      } else {
        return { value: bmiValue, category: "Obese", tone: "red" };
      }
    }

    return null;
  }, [height, weight]);

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

    const payload = {
      name: trimmedName,
      phone: trimmedPhone,
      blood_group: bloodGroup || null,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      medical_conditions: medicalConditions.trim() || null,
      allergies: allergies.trim() || null,
      medications: medications.trim() || null,
      emergency_contact: emergencyContact.trim() || null,
      city: city.trim() || null,
      address: address.trim() || null,
    };

    try {
      const response = await fetch("/api/v1/patients/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
      updateStateFromData(data);

      sessionStorage.setItem("heartcarePatient", JSON.stringify(data));
      setSuccess("Your profile has been updated successfully.");

      // Scroll to top of form smoothly to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  const getInitials = (patientName) => {
    if (!patientName || typeof patientName !== "string") return "P";
    const parts = patientName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "P";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-loading-state">
        <div className="profile-spinner" />
        <h2>Loading your profile...</h2>
        <p>Retrieving your secure medical account information.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-loading-state">
        <h2>Unable to Load Profile</h2>
        <p>{error || "Please try logging in again."}</p>
        <Link to="/login" className="profile-btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  const patientInitials = getInitials(profile.name);

  return (
    <div className="profile-container">
      {/* Unified Sidebar & Mobile Drawer */}
      <DashboardSidebar
        patient={profile}
        onLogout={handleLogout}
        activeKey="/profile"
      />

      {/* Main Content */}
      <main className="profile-main">
        <header className="profile-header">
          <div>
            <h1>My Patient Profile</h1>
            <p>Manage your account credentials, clinical records, and emergency preferences.</p>
          </div>

          <Link to="/dashboard" className="profile-back-link">
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
        </header>

        {/* Status Alerts */}
        {error && (
          <div className="profile-alert profile-alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="profile-alert profile-alert-success" role="status">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Identity Card */}
        <section className="profile-identity-card">
          <div className="profile-avatar-circle">{patientInitials}</div>

          <div className="profile-identity-info">
            <h2>{profile.name}</h2>
            <p className="profile-account-tag">HeartGuard AI Verified Patient</p>
            <p className="profile-meta-email">{profile.email}</p>
          </div>

          <div className="profile-meta-chips">
            <div className="meta-chip">
              <span className="chip-label">Registered</span>
              <strong className="chip-val">
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "--"}
              </strong>
            </div>

            <div className="meta-chip">
              <span className="chip-label">Blood Group</span>
              <strong className="chip-val">{bloodGroup || "Not set"}</strong>
            </div>
          </div>
        </section>

        {/* Profile Edit Form */}
        <form onSubmit={handleUpdate} className="profile-edit-form">
          {/* Section 1: Core Credentials */}
          <section className="profile-section-card">
            <div className="profile-section-header">
              <div className="section-icon-badge">
                <User size={18} />
              </div>
              <div>
                <h3>Core Account Information</h3>
                <p>Primary identification details associated with your portal.</p>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="form-group">
                <label htmlFor="profile-name">
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-phone">
                  Phone Number <span className="required-star">*</span>
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email">Email Address</label>
                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  disabled
                  title="Email cannot be changed"
                  className="input-disabled"
                />
                <span className="input-hint">
                  <Lock size={12} style={{ display: "inline", marginRight: "4px" }} />
                  Primary login email is locked for account security.
                </span>
              </div>
            </div>
          </section>

          {/* Section 2: Optional Medical Details */}
          <section className="profile-section-card">
            <div className="profile-section-header">
              <div className="section-icon-badge icon-medical">
                <HeartPulse size={18} />
              </div>
              <div>
                <h3>Medical & Biometric Profile <span className="optional-badge">Optional</span></h3>
                <p>Helps provide personalized screening insights and baseline comparisons.</p>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="form-group">
                <label htmlFor="profile-blood">Blood Group</label>
                <select
                  id="profile-blood"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="profile-height">Height (cm)</label>
                <input
                  id="profile-height"
                  type="number"
                  min="50"
                  max="280"
                  step="0.5"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Example: 172"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-weight">Weight (kg)</label>
                <input
                  id="profile-weight"
                  type="number"
                  min="15"
                  max="400"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Example: 70"
                />
              </div>

              {/* Live BMI Preview Card */}
              {bmiInfo && (
                <div className={`bmi-preview-card bmi-tone-${bmiInfo.tone}`}>
                  <div className="bmi-preview-header">
                    <Activity size={16} />
                    <span>Live Body Mass Index (BMI) Preview</span>
                  </div>
                  <div className="bmi-preview-metric">
                    <strong className="bmi-number">{bmiInfo.value}</strong>
                    <span className="bmi-unit">kg/m²</span>
                    <span className={`bmi-pill pill-${bmiInfo.tone}`}>
                      {bmiInfo.category}
                    </span>
                  </div>
                  <p className="bmi-note">
                    Calculated automatically from your height ({height} cm) and weight ({weight} kg).
                  </p>
                </div>
              )}

              <div className="form-group full-width">
                <label htmlFor="profile-conditions">Known Medical Conditions</label>
                <input
                  id="profile-conditions"
                  type="text"
                  maxLength={500}
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Hypertension, Diabetes Type 2, Asthma"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="profile-allergies">Known Allergies</label>
                <input
                  id="profile-allergies"
                  type="text"
                  maxLength={500}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Latex"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="profile-medications">Current Medications</label>
                <input
                  id="profile-medications"
                  type="text"
                  maxLength={500}
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g. Amlodipine 5mg daily, Atorvastatin 10mg nightly"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Emergency & Location */}
          <section className="profile-section-card">
            <div className="profile-section-header">
              <div className="section-icon-badge icon-emergency">
                <MapPin size={18} />
              </div>
              <div>
                <h3>Emergency & Location Details <span className="optional-badge">Optional</span></h3>
                <p>Used for nearby emergency assistance routing and rapid contact.</p>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="form-group">
                <label htmlFor="profile-emergency">Emergency Contact</label>
                <input
                  id="profile-emergency"
                  type="text"
                  maxLength={100}
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Name and Phone (e.g. Jane Doe - 9876543210)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-city">City / Region</label>
                <input
                  id="profile-city"
                  type="text"
                  maxLength={100}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kolkata, West Bengal"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="profile-address">Residential Address</label>
                <input
                  id="profile-address"
                  type="text"
                  maxLength={255}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, apartment or landmark"
                />
              </div>
            </div>
          </section>

          {/* Explicit Privacy & Security Notice */}
          <section className="profile-privacy-notice">
            <div className="privacy-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4>Medical Privacy & Strict Confidentiality Notice</h4>
              <p>
                HeartGuard AI treats your health information with utmost confidentiality.
                All optional medical and demographic details provided here are encrypted and stored
                securely in compliance with modern medical software guidelines. Your data is never sold,
                shared with commercial advertisers, or made publicly accessible.
              </p>
            </div>
          </section>

          {/* Form Actions */}
          <div className="profile-form-actions">
            <button
              type="submit"
              className="profile-save-btn"
              disabled={saving}
            >
              <Save size={18} />
              <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
            </button>

            <Link to="/dashboard" className="profile-cancel-btn">
              Cancel
            </Link>
          </div>
        </form>

        <footer className="profile-footer">
          © 2026 HeartGuard AI | Your Health, Our Priority
        </footer>
      </main>
    </div>
  );
}

export default Profile;
