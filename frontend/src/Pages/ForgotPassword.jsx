import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  LockKeyhole,
  CheckCircle2,
  HeartPulse,
  ArrowRight,
  Loader2,
} from "lucide-react";

import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugToken, setDebugToken] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to process password reset request.");
      }

      setSubmitted(true);
      if (data.debug_token) {
        setDebugToken(data.debug_token);
      }
    } catch (err) {
      setError(
        err.message || "Failed to connect to the server. Please check your backend and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setSubmitted(false);
    setError("");
    setDebugToken("");
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

            <span>HeartGuard AI</span>
          </Link>

          <div className="forgot-brand-content">
            <div className="forgot-brand-badge">
              <ShieldCheck size={15} />
              Your health matters
            </div>

            <h1>
              Your health journey
              <span> starts with care.</span>
            </h1>

            <p>
              Your HeartGuard AI account helps you access your health
              information and healthcare support securely.
            </p>

            <div className="forgot-security-points">
              <div>
                <ShieldCheck size={19} />
                <span>Secure account access</span>
              </div>

              <div>
                <LockKeyhole size={19} />
                <span>Protected personal information</span>
              </div>
            </div>
          </div>

          <div className="forgot-brand-footer">
            HeartGuard AI · Healthcare support platform
          </div>
        </div>

        {/* Form section */}
        <div className="forgot-form-section">
          <Link to="/login" className="forgot-back-link">
            <ArrowLeft size={17} />
            Back to Login
          </Link>

          <div className="forgot-form-content">
            {!submitted ? (
              <>
                <div className="forgot-main-icon">
                  <LockKeyhole size={29} />
                </div>

                <span className="forgot-eyebrow">
                  ACCOUNT RECOVERY
                </span>

                <h2>Forgot Password?</h2>

                <p className="forgot-description">
                  Enter the email address associated with your HeartGuard AI account
                  to receive a secure password reset link.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <label htmlFor="forgot-email">
                    Email Address
                  </label>

                  <div className={`forgot-input-wrapper ${error ? "has-error" : ""}`}>
                    <Mail size={19} />

                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      autoComplete="email"
                      disabled={loading}
                      required
                    />
                  </div>

                  {error && (
                    <p className="forgot-error">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="forgot-submit-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating Link...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="forgot-help-box">
                  <ShieldCheck size={19} />

                  <p>
                    Your account information is important.
                    Never share your password or verification
                    codes with anyone.
                  </p>
                </div>
              </>
            ) : (
              <div className="forgot-success">
                <div className="forgot-success-icon">
                  <CheckCircle2 size={42} />
                </div>

                <span className="forgot-eyebrow">
                  REQUEST PROCESSED
                </span>

                <h2>Check Your Email</h2>

                <p>
                  If an account exists with the following email, password reset instructions have been generated:
                </p>

                <div className="forgot-email-display">
                  <Mail size={18} />
                  <strong>{email}</strong>
                </div>

                <p className="forgot-success-note">
                  For your security, reset links are single-use and expire in 15 minutes. If an email is not received, ensure your email address is registered or check spam.
                </p>

                {debugToken && (
                  <div
                    style={{
                      margin: "18px 0",
                      padding: "14px",
                      borderRadius: "11px",
                      border: "1px dashed var(--forgot-primary)",
                      background: "rgba(7, 139, 137, 0.08)",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "var(--forgot-primary)",
                        marginBottom: "6px",
                      }}
                    >
                      <ShieldCheck size={16} />
                      <span>Development Mode Link</span>
                    </div>

                    <p
                      style={{
                        margin: "0 0 10px",
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        lineHeight: "1.5",
                      }}
                    >
                      SMTP is unconfigured in local development. You can test the password reset flow directly using the token generated:
                    </p>

                    <Link
                      to={`/reset-password?token=${encodeURIComponent(debugToken)}`}
                      className="forgot-submit-button"
                      style={{
                        textDecoration: "none",
                        margin: "0",
                        minHeight: "44px",
                        fontSize: "13px",
                      }}
                    >
                      Reset Password Now
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )}

                <button
                  type="button"
                  className="forgot-submit-button"
                  onClick={handleResend}
                  style={debugToken ? { marginTop: "12px", background: "transparent", border: "1px solid var(--border)", color: "var(--text)" } : {}}
                >
                  Try Another Email
                  <ArrowRight size={18} />
                </button>

                <Link to="/login" className="forgot-success-login">
                  <ArrowLeft size={16} />
                  Return to Login
                </Link>
              </div>
            )}
          </div>

          <div className="forgot-form-footer">
            <p>
              Need help? Contact the HeartGuard AI support team.
            </p>

            <span>
              © 2026 HeartGuard AI. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
