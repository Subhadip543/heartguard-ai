
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
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Registration Page */}
        <Route path="/register" element={<Registration />} />

        {/* Patient Dashboard */}
        <Route path="/dashboard" element={<PDashboard />} />

        {/* Heart Risk Assessment */}
        <Route path="/assessment" element={<HeartAssessment />} />

        {/* Assessment History */}
        <Route path="/history" element={<History />} />

        {/* Patient Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* Assessment Results */}
        <Route path="/result" element={<AssessmentResult />} />

        {/* Emergency Assistance */}
        <Route path="/emergency" element={<Emergency />} />

        {/* Forgot Password */}
        <Route
          path="/forgot-password"
          element={<h1>Forgot Password - Coming Soon</h1>}
        />
        <Route
  path="/health-awareness"
  element={<HealthAwareness />}
/>

<Route path="/gemini-test" element={<GeminiTest />} />
        {/* Page Not Found */}
        <Route
          path="*"
          element={<h1>404 - Page Not Found</h1>}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
