
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
// Import doctor and appointment pages
import DoctorDashboard from "./DoctorDashboard";
import FindDoctors from "./FindDoctors.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        {/* Patient Pages */}
        <Route path="/dashboard" element={<PDashboard />} />
        <Route path="/assessment" element={<HeartAssessment />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />

        {/* Assessment Results */}
        <Route path="/result" element={<AssessmentResult />} />

        {/* Emergency Assistance */}
        <Route path="/emergency" element={<Emergency />} />

        {/* Health Awareness */}
        <Route
          path="/health-awareness"
          element={<HealthAwareness />}
        />

        {/* Gemini API Test */}
        <Route path="/gemini-test" element={<GeminiTest />} />

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

        {/* Forgot Password */}
        <Route
          path="/forgot-password"
          element={
            <div style={{ padding: "40px", textAlign: "center" }}>
              <h2>Forgot Password</h2>
              <p>Forgot password page will be developed soon.</p>
            </div>
          }
        />

        {/* Page Not Found */}
        <Route
          path="*"
          element={
            <div style={{ padding: "50px", textAlign: "center" }}>
              <h1>404</h1>
              <h2>Page Not Found</h2>
              <a href="/">Go to Home</a>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
