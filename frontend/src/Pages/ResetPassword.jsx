import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  LockKeyhole,
  CheckCircle2,
  HeartPulse,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import "./ForgotPassword.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token.trim()) {
      setError("Reset token is missing from the URL. Please request a new reset link.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token.trim(),
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to reset password.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-page">
      <div className="forgot-background-shape forgot-shape-one" />
      <div className="forgot-background-shape forgot-shape-two" />

      <div className="forgot-container">
        {/* Brand section */}
        <div className="forgot-brand">
          <Link to="/" className="forgot-brand-logo">
            <div className="forgot-logo-icon">
              <HeartPulse size={25} />
            </div>

            <span>HeartCare</span>
          </Link>

          <div className="forgot-brand-content">
            <div className="forgot-brand-badge">
              <ShieldCheck size={15} />
              Account Security
            </div>

            <h1>
              Set your new
              <span> secure password.</span>
            </h1>

            <p>
              Choose a strong, unique password with at least 8 characters
              to ensure your HeartCare health records remain protected.
            </p>

            <div className="forgot-security-points">
              <div>
                <ShieldCheck size={19} />
                <span>Argon2 cryptographic protection</span>
              </div>

              <div>
                <LockKeyhole size={19} />
                <span>Single-use token verification</span>
              </div>
            </div>
          </div>

          <div className="forgot-brand-footer">
            HeartCare · Healthcare support platform
          </div>
        </div>

        {/* Form section */}
        <div className="forgot-form-section">
          <Link to="/login" className="forgot-back-link">
            <ArrowLeft size={17} />
            Back to Login
          </Link>

          <div className="forgot-form-content">
            {!success ? (
              <>
                <div className="forgot-main-icon">
                  <LockKeyhole size={29} />
                </div>

                <span className="forgot-eyebrow">NEW CREDENTIALS</span>

                <h2>Reset Password</h2>

                <p className="forgot-description">
                  Enter your new password below to update your account.
                </p>

                {!token.trim() && (
                  <div
                    style={{
                      padding: "12px 14px",
                      marginBottom: "18px",
                      borderRadius: "10px",
                      background: "rgba(220, 85, 85, 0.1)",
                      border: "1px solid var(--danger, #dc5555)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "var(--danger, #dc5555)",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    <ShieldAlert size={18} />
                    <span>No reset token detected in the URL. Please use the link sent to your email.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <label htmlFor="new-password">New Password</label>
                  <div className={`forgot-input-wrapper ${error ? "has-error" : ""}`}>
                    <LockKeyhole size={19} />
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(event) => {
                        setNewPassword(event.target.value);
                        setError("");
                      }}
                      disabled={loading || !token.trim()}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: 0,
                        display: "flex",
                      }}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <label htmlFor="confirm-password" style={{ marginTop: "16px" }}>
                    Confirm New Password
                  </label>
                  <div className={`forgot-input-wrapper ${error ? "has-error" : ""}`}>
                    <LockKeyhole size={19} />
                    <input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat your new password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setError("");
                      }}
                      disabled={loading || !token.trim()}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  {error && <p className="forgot-error">{error}</p>}

                  <button
                    type="submit"
                    className="forgot-submit-button"
                    disabled={loading || !token.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        Update Password
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                {!token.trim() && (
                  <div style={{ marginTop: "18px", textAlign: "center" }}>
                    <Link
                      to="/forgot-password"
                      style={{
                        color: "var(--forgot-primary)",
                        fontSize: "13px",
                        fontWeight: "600",
                        textDecoration: "none",
                      }}
                    >
                      Request a new password reset link
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="forgot-success">
                <div className="forgot-success-icon">
                  <CheckCircle2 size={42} />
                </div>

                <span className="forgot-eyebrow">SUCCESS</span>

                <h2>Password Reset!</h2>

                <p>
                  Your account password has been updated securely. You can now log in
                  with your new credentials.
                </p>

                <Link
                  to="/login"
                  className="forgot-submit-button"
                  style={{ textDecoration: "none", marginTop: "24px" }}
                >
                  Proceed to Login
                  <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </div>

          <div className="forgot-form-footer">
            <p>Need help? Contact the HeartCare support team.</p>
            <span>© 2026 HeartCare. All rights reserved.</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;
