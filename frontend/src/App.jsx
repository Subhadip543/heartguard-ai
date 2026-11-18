
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// Theme and Settings imports
import ThemeProvider from "./context/ThemeProvider";
import ThemeToggle from "./context/ThemeToggle";
import SettingsPanel from "./SettingsPanel";

// Import all pages
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Registration from "./Pages/Registration";
import PDashboard from "./Pages/PDashboard";
import HeartAssessment from "./Pages/HeartAssessment";
import History from "./Pages/History";
import Profile from "./Pages/Profile";
import AssessmentResult from "./Pages/AssessmentResult";
import Emergency from "./Emergency";
import HealthAwareness from "./Pages/HealthAwareness";
import GeminiTest from "./GeminiTest";

// Doctor and healthcare tools
import DoctorDashboard from "./DoctorDashboard";
import FindDoctors from "./FindDoctors.jsx";
import HeartAssistant from "./HeartAssistant";
import HeartResources from "./HeartResources";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import LiveHealthMonitoring from "./Pages/LiveHealthMonitoring";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        {/* Global Theme Toggle & Settings Drawer */}
        <div className="global-floating-controls" aria-label="Page controls">
          <ThemeToggle />
          <SettingsPanel />
        </div>

        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Patient Pages */}
          <Route path="/dashboard" element={<PDashboard />} />
          <Route path="/assessment" element={<HeartAssessment />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />

          {/* Assessment Results */}
          <Route path="/result" element={<AssessmentResult />} />

          {/* Emergency Assistance */}
          <Route path="/emergency" element={<Emergency />} />

          {/* Health Awareness & Education */}
          <Route
            path="/health-awareness"
            element={<HealthAwareness />}
          />

          {/* Healthcare Lifeline & Monitoring */}
          <Route
            path="/heart-resources"
            element={<HeartResources />}
          />
          <Route
            path="/live-health"
            element={<LiveHealthMonitoring />}
          />

          {/* AI Heart Assistant */}
          <Route
            path="/heart-assistant"
            element={<HeartAssistant />}
          />

          {/* Doctor Dashboard */}
          <Route
            path="/doctor-dashboard"
            element={<DoctorDashboard />}
          />

          {/* Find Doctors and Book Appointment */}
          <Route
            path="/find-doctors"
            element={<FindDoctors />}
          />

          {/* Gemini API Test */}
          <Route path="/gemini-test" element={<GeminiTest />} />

          {/* Page Not Found */}
          <Route
            path="*"
            element={
              <div style={{ padding: "50px", textAlign: "center", color: "var(--text)" }}>
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <Link to="/" style={{ color: "var(--primary)", textDecoration: "underline" }}>Go to Home</Link>
              </div>
            }
          />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
