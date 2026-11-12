
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle patient login
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        }
      );

      // Read server response
      const data = await response.json();

      // Check login response
      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      // Validate authentication response
      if (!data.token || !data.patient) {
        throw new Error(
          "Invalid login response from server."
        );
      }

      // Save JWT authentication token
      sessionStorage.setItem(
        "heartcareToken",
        data.token
      );

      // Save logged-in patient information
      sessionStorage.setItem(
        "heartcarePatient",
        JSON.stringify(data.patient)
      );

      // Navigate to patient dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Login Error:", error);

      if (error instanceof TypeError) {
        setError(
          "Cannot connect to HeartCare server. Please check your internet and backend connection."
        );
      } else {
        setError(
          error.message || "Something went wrong. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <span>♥</span> HeartCare
        </div>

        {/* Heading */}
        <h2>Welcome Back!</h2>

        <p className="login-subtitle">
          Login to access your HeartCare account.
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

          </div>

          {/* Password */}
          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="password-field">

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                minLength={8}
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          {/* Login Options */}
          <div className="login-options">

            <label className="remember-me">
              <input type="checkbox" />
              Remember Me
            </label>

            <Link to="/forgot-password">
              Forgot Password?
            </Link>

          </div>

          {/* Error Message */}
          {error && (
            <p
              className="error-message"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            className="demo-login-btn"
            style={{
              marginTop: "12px",
              width: "100%",
              padding: "10px",
              background: "#f1f5f9",
              border: "1px dashed #0f766e",
              borderRadius: "8px",
              color: "#0f766e",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            onClick={() => {
              sessionStorage.setItem("heartcareToken", "demo-token");
              sessionStorage.setItem(
                "heartcarePatient",
                JSON.stringify({
                  id: "demo-patient",
                  name: "Demo Patient",
                  email: "patient@example.com",
                })
              );
              navigate("/dashboard");
            }}
          >
            Explore Dashboard as Demo Patient →
          </button>

        </form>

        {/* Registration Link */}
        <div className="register-link">
          Don't have an account?
          <Link to="/register">
            {" "}Register Now
          </Link>
        </div>

        {/* Home Link */}
        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

      </div>

    </div>
  );
}

export default Login;
