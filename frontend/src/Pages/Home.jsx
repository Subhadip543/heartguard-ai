
import { Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle.jsx";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">

      {/* ===============================
          NAVIGATION BAR
      =============================== */}
      <nav className="navbar">

        <div className="logo">
          <span className="logo-icon">♥</span>
          HeartCare
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
        </div>

        <div className="nav-buttons">

          <ThemeToggle />

          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/register" className="register-btn">
            Register
          </Link>

          <Link
            to="/doctor-dashboard"
            className="doctor-nav-btn"
          >
            Doctor Portal
          </Link>

        </div>

      </nav>


      {/* ===============================
          HERO SECTION
      =============================== */}
      <section className="hero" id="home">

        <div className="hero-content">

          <span className="tagline">
            YOUR HEART, YOUR HEALTH, OUR PRIORITY
          </span>

          <h1>
            Take Control of
            <span> Your Heart Health</span>
          </h1>

          <p>
            Understand your heart health better with our
            intelligent heart disease risk assessment system.
            Make informed decisions and take a step towards
            a healthier future.
          </p>

          <div className="hero-buttons">

            <Link to="/assessment" className="primary-btn">
              Start Assessment →
            </Link>

            <a href="#about" className="secondary-btn">
              Learn More
            </a>

          </div>

          <div className="trust-info">
            <span>♥</span>
            Your health matters. Early awareness matters more.
          </div>

        </div>


        {/* Hero Image */}
        <div className="hero-image">

          <img
            src="/heart.jpg"
            alt="Heart health illustration"
          />

        </div>

      </section>


      {/* ===============================
          FEATURES SECTION
      =============================== */}
      <section className="features" id="features">

        <h2>Why Choose HeartCare?</h2>

        <p className="section-description">
          Technology and awareness working together for better
          heart health.
        </p>

        <div className="feature-container">


          {/* 1. RISK ASSESSMENT */}
          <Link
            to="/assessment"
            className="feature-card feature-link"
          >

            <div className="feature-icon">
              ♥
            </div>

            <h3>Risk Assessment</h3>

            <p>
              Evaluate potential heart disease risk using
              relevant health parameters.
            </p>

            <span className="feature-action">
              Start Assessment →
            </span>

          </Link>


          {/* 2. HEALTH AWARENESS */}
          <Link
            to="/health-awareness"
            className="feature-card feature-link"
          >

            <div className="feature-icon">
              ✚
            </div>

            <h3>Health Awareness</h3>

            <p>
              Learn about important heart health indicators
              and healthy lifestyle habits.
            </p>

            <span className="feature-action">
              Explore Health Tips →
            </span>

          </Link>


          {/* 3. PERSONAL DASHBOARD */}
          <Link
            to="/dashboard"
            className="feature-card feature-link"
          >

            <div className="feature-icon">
              ▣
            </div>

            <h3>Personal Dashboard</h3>

            <p>
              Access your assessment history and health
              information in one place.
            </p>

            <span className="feature-action">
              Open Dashboard →
            </span>

          </Link>


          {/* 4. DOCTOR DASHBOARD */}
          <Link
            to="/doctor-dashboard"
            className="feature-card feature-link doctor-feature"
          >

            <div className="feature-icon doctor-icon">
              ✚
            </div>

            <h3>Doctor Dashboard</h3>

            <p>
              Manage patient appointments, review consultations
              and conduct online video visits.
            </p>

            <span className="feature-action">
              Open Doctor Portal →
            </span>

          </Link>


        </div>

      </section>


      {/* ===============================
          ABOUT SECTION
      =============================== */}
      <section className="about" id="about">

        <h2>About Our Project</h2>

        <p>
          HeartCare is a technology-based heart health
          awareness and risk assessment platform designed
          to encourage early awareness and informed
          healthcare decisions. It does not replace
          professional medical diagnosis.
        </p>

      </section>


      {/* ===============================
          FOOTER
      =============================== */}
      <footer>

        <p>
          © 2026 HeartCare | Heart Health Awareness System
        </p>

      </footer>

    </div>
  );
}

export default Home;
