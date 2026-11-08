
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Ambulance,
  ArrowLeft,
  MapPin,
  Phone,
  ShieldAlert,
  UserRoundPlus
} from "lucide-react";
import "./Emergency.css";

function Emergency() {
  return (
    <div className="emergency-page">

      {/* Header */}
      <header className="emergency-header">
        <Link to="/dashboard" className="emergency-back">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <h2>HeartCare</h2>
      </header>

      {/* Main Content */}
      <main className="emergency-container">

        <section className="emergency-hero">
          <div className="emergency-alert-icon">
            <ShieldAlert size={42} />
          </div>

          <h1>Emergency Assistance</h1>

          <p>
            Get quick access to emergency services and ambulance support.
            If someone needs urgent medical attention, do not wait.
          </p>

          <span className="emergency-status">
            <span className="status-dot"></span>
            Emergency support information
          </span>
        </section>

        {/* Emergency Call Cards */}
        <section className="emergency-call-grid">

          <div className="emergency-card emergency-card-red">
            <div className="emergency-card-icon">
              <Phone size={28} />
            </div>

            <h2>Emergency Services</h2>
            <p>Call India's nationwide emergency response number.</p>

            <strong className="emergency-number">112</strong>

            <a href="tel:112" className="emergency-action red-action">
              <Phone size={18} />
              Call 112
            </a>
          </div>

          <div className="emergency-card emergency-card-orange">
            <div className="emergency-card-icon">
              <Ambulance size={30} />
            </div>

            <h2>Ambulance Service</h2>
            <p>Call the National Ambulance Service.</p>

            <strong className="emergency-number">102</strong>

            <a href="tel:102" className="emergency-action orange-action">
              <Phone size={18} />
              Call 102
            </a>
          </div>

        </section>

        {/* Nearby Hospitals */}
        <section className="emergency-info-card">
          <div className="info-icon">
            <MapPin size={25} />
          </div>

          <div className="emergency-info-content">
            <h2>Find Nearby Hospitals</h2>
            <p>
              Find hospitals and emergency medical facilities near your
              current location using Google Maps.
            </p>

            <a
              href="https://www.google.com/maps/search/?api=1&query=emergency+hospital+near+me"
              target="_blank"
              rel="noopener noreferrer"
              className="hospital-map-btn"
            >
              <MapPin size={18} />
              Find Nearby Hospitals
            </a>
          </div>
        </section>

        {/* Emergency Contacts */}
        <section className="emergency-info-card">
          <div className="info-icon">
            <UserRoundPlus size={25} />
          </div>

          <div className="emergency-info-content">
            <h2>Emergency Contacts</h2>
            <p>
              Keep a family member or trusted person's phone number
              accessible so you can contact them when needed.
            </p>
            <p className="contact-note">
              Personal emergency contact management will be added in a
              future update.
            </p>
          </div>
        </section>

        {/* Important Warning */}
        <section className="emergency-warning-card">
          <AlertTriangle size={25} />

          <div>
            <h2>Important Medical Warning</h2>
            <p>
              Severe chest pain, difficulty breathing, sudden fainting,
              or signs of a stroke require immediate medical attention.
              Call emergency services. Do not wait for a HeartCare AI
              assessment or attempt to drive yourself.
            </p>
          </div>
        </section>

        <footer className="emergency-footer">
          © 2026 HeartCare | Your Health, Our Priority
        </footer>

      </main>
    </div>
  );
}

export default Emergency;
