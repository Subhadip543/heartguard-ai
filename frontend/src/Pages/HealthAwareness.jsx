
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  HeartPulse,
  Apple,
  Footprints,
  Cigarette,
  Stethoscope,
  AlertTriangle,
  Moon
} from "lucide-react";
import "./HealthAwareness.css";

function HealthAwareness() {
  return (
    <div className="awareness-page">

      <header className="awareness-header">
        <Link to="/" className="awareness-back">
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <h2>HeartCare</h2>
      </header>

      <main className="awareness-container">

        <section className="awareness-hero">
          <span className="awareness-label">HEALTH EDUCATION</span>
          <h1>Take Care of Your Heart</h1>
          <p>
            Learn about heart health, understand common risk factors
            and build healthier everyday habits.
          </p>
        </section>

        <section className="awareness-section">
          <h2>Understanding Heart Health</h2>
          <p>
            Your heart circulates blood throughout your body.
            Healthy daily habits and regular medical check-ups
            can help reduce cardiovascular risk.
          </p>

          <div className="awareness-grid">
            <article className="awareness-card">
              <HeartPulse />
              <h3>Blood Pressure</h3>
              <p>
                High blood pressure can put extra strain on your heart.
                Monitor it regularly with guidance from a healthcare professional.
              </p>
            </article>

            <article className="awareness-card">
              <Activity />
              <h3>Cholesterol</h3>
              <p>
                Unhealthy cholesterol levels can contribute to plaque
                buildup in arteries. Discuss your lipid profile with a doctor.
              </p>
            </article>

            <article className="awareness-card">
              <Stethoscope />
              <h3>Blood Sugar</h3>
              <p>
                Diabetes can increase cardiovascular risk.
                Regular screening and proper medical care are important.
              </p>
            </article>
          </div>
        </section>

        <section className="awareness-section lifestyle-section">
          <h2>Healthy Heart Habits</h2>

          <div className="habit-list">
            <div className="habit-item">
              <Apple />
              <div>
                <h3>Eat a Balanced Diet</h3>
                <p>
                  Include fruits, vegetables, whole grains and other
                  nutritious foods. Limit excess salt and highly processed foods.
                </p>
              </div>
            </div>

            <div className="habit-item">
              <Footprints />
              <div>
                <h3>Stay Physically Active</h3>
                <p>
                  Aim for regular physical activity appropriate to your
                  health and abilities. Start gradually if needed.
                </p>
              </div>
            </div>

            <div className="habit-item">
              <Cigarette />
              <div>
                <h3>Avoid Tobacco</h3>
                <p>
                  Smoking and tobacco use increase the risk of heart
                  and blood vessel diseases.
                </p>
              </div>
            </div>

            <div className="habit-item">
              <Moon />
              <div>
                <h3>Sleep and Manage Stress</h3>
                <p>
                  Maintain a regular sleep routine and use healthy
                  stress-management practices.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="awareness-section risk-section">
          <h2>Common Heart Disease Risk Factors</h2>
          <ul>
            <li>High blood pressure</li>
            <li>High cholesterol</li>
            <li>Diabetes</li>
            <li>Smoking or tobacco use</li>
            <li>Physical inactivity</li>
            <li>Family history of cardiovascular disease</li>
          </ul>
        </section>

        <section className="awareness-emergency">
          <AlertTriangle size={30} />
          <div>
            <h2>Know the Warning Signs</h2>
            <p>
              Chest discomfort, difficulty breathing, fainting,
              sudden weakness or signs of stroke can indicate a
              medical emergency. Call 112 in India immediately.
              Do not wait for an online assessment.
            </p>
            <Link to="/emergency">Open Emergency Assistance →</Link>
          </div>
        </section>

        <section className="awareness-disclaimer">
          <strong>Medical Disclaimer</strong>
          <p>
            This page provides general health education only.
            It does not diagnose, prevent or treat any disease.
            Consult a qualified healthcare professional for
            personal medical advice.
          </p>
        </section>

      </main>

      <footer className="awareness-footer">
        © 2026 HeartCare | Your Health, Our Priority
      </footer>
    </div>
  );
}

export default HealthAwareness;
