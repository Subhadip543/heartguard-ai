
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./Assessment.css";

function AssessmentResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};

  const patient = state.patient || {};
  const answers = state.answers || state.formData || {};

  const aiAssessment =
    state.aiAssessment ||
    state.assessment ||
    state.result ||
    "";

  const aiDisclaimer =
    state.aiDisclaimer ||
    "This AI-generated report is for educational purposes only. It is not a medical diagnosis. Please consult a qualified healthcare professional.";

  // Get the selected symptoms
  const symptoms = Array.isArray(answers.symptoms)
    ? answers.symptoms
    : answers.symptoms
      ? [answers.symptoms]
      : [];

  // Check for symptoms that may need urgent medical attention
  const emergencyKeywords = [
    "chest pain",
    "chest discomfort",
    "shortness of breath",
    "difficulty breathing",
    "irregular heartbeat",
    "palpitations",
    "fainting",
    "loss of consciousness"
  ];

  const symptomText = symptoms
    .map((item) => String(item).toLowerCase())
    .join(" ");

  const additionalSymptoms = String(
    answers.otherSymptoms || ""
  ).toLowerCase();

  const allSymptomsText = symptomText + " " + additionalSymptoms;

  const hasEmergencySymptoms = emergencyKeywords.some((keyword) =>
    allSymptomsText.includes(keyword)
  );

  // Remove Markdown formatting without using regular expressions
  const formatAssessment = (text) => {
    if (!text) return "";

    return String(text)
      .split("\n")
      .map((line) => {
        let cleanedLine = line.trim();

        cleanedLine = cleanedLine.replaceAll("**", "");
        cleanedLine = cleanedLine.replaceAll("__", "");

        // Remove Markdown heading symbols
        while (cleanedLine.startsWith("#")) {
          cleanedLine = cleanedLine.slice(1).trim();
        }

        // Remove Markdown horizontal lines
        if (
          cleanedLine === "---" ||
          cleanedLine === "***" ||
          cleanedLine === "___"
        ) {
          return "";
        }

        return cleanedLine;
      })
      .join("\n")
      .trim();
  };

  const cleanedAssessment = formatAssessment(aiAssessment);

  // Check whether a line is a numbered heading
  const isSectionHeading = (line) => {
    const firstSpace = line.indexOf(" ");

    if (firstSpace < 1) return false;

    const headingNumber = line.slice(0, firstSpace);
    const lastCharacter =
      headingNumber[headingNumber.length - 1];

    if (lastCharacter !== "." && lastCharacter !== ")") {
      return false;
    }

    const number = headingNumber.slice(0, -1);

    if (number.length === 0) return false;

    return [...number].every(
      (character) => character >= "0" && character <= "9"
    );
  };

  // Check whether a line is a normal heading
  const isTextHeading = (line) => {
    const headings = [
      "summary",
      "overview",
      "risk factors",
      "symptoms",
      "recommendations",
      "suggestions",
      "next steps",
      "conclusion",
      "important",
      "assessment",
      "possible concerns",
      "medical advice",
      "lifestyle recommendations"
    ];

    const headingText = line
      .replaceAll(":", "")
      .toLowerCase()
      .trim();

    return headings.includes(headingText);
  };

  // Display the AI report
  const renderAssessment = () => {
    if (!cleanedAssessment) {
      return (
        <p className="result-empty">
          No assessment report was received.
          Please complete your assessment again.
        </p>
      );
    }

    return cleanedAssessment.split("\n").map((line, index) => {
      const cleanedLine = line.trim();

      if (!cleanedLine) {
        return (
          <div className="report-space" key={index}></div>
        );
      }

      if (
        isSectionHeading(cleanedLine) ||
        isTextHeading(cleanedLine)
      ) {
        return (
          <h3 className="report-section-heading" key={index}>
            {cleanedLine}
          </h3>
        );
      }

      // Display bullet points
      const firstCharacter = cleanedLine.charAt(0);

      if (
        firstCharacter === "-" ||
        firstCharacter === "•" ||
        firstCharacter === "*"
      ) {
        return (
          <div className="report-bullet" key={index}>
            <span className="bullet-dot">•</span>
            <span>
              {cleanedLine.slice(1).trim()}
            </span>
          </div>
        );
      }

      return (
        <p className="report-paragraph" key={index}>
          {cleanedLine}
        </p>
      );
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewAssessment = () => {
    navigate("/assessment");
  };

  return (
    <div className="result-page">

      {/* Header */}
      <header className="result-header">
        <div className="result-header-content">

          <Link to="/dashboard" className="result-logo">
            HeartCare
          </Link>

          <Link to="/dashboard" className="result-back-link">
            Back to Dashboard
          </Link>

        </div>
      </header>

      <main className="result-container">

        {/* Report Title */}
        <section className="result-title-section">

          <div className="result-title-icon">
            ✓
          </div>

          <h1>Your Assessment Report</h1>

          <p>
            Your heart health assessment report is ready.
            Review the information below carefully.
          </p>

        </section>

        {/* Emergency Warning */}
        {hasEmergencySymptoms && (
          <section className="ai-emergency">

            <h2>Important Health Notice</h2>

            <p>
              You reported one or more symptoms that may require
              urgent medical attention.
            </p>

            <p>
              <strong>
                If you are experiencing chest pain, breathing
                difficulty, palpitations or fainting now, seek
                emergency medical care immediately. Do not wait
                for this AI report.
              </strong>
            </p>

            <p>
              In India, call 112 for emergency assistance or
              have someone take you to the nearest emergency
              department.
            </p>

          </section>
        )}

        {/* Patient Information */}
        <section className="result-card">

          <div className="result-card-heading">
            <h2>Patient Information</h2>
          </div>

          <div className="result-details-grid">

            <div className="result-detail">
              <span>Patient Name</span>
              <strong>
                {patient.name || answers.name || "Not provided"}
              </strong>
            </div>

            <div className="result-detail">
              <span>Age</span>
              <strong>
                {answers.age
                  ? `${answers.age} years`
                  : "Not provided"}
              </strong>
            </div>

            <div className="result-detail">
              <span>Gender</span>
              <strong>
                {answers.gender || "Not provided"}
              </strong>
            </div>

            <div className="result-detail">
              <span>Blood Pressure</span>
              <strong>
                {answers.bloodPressure
                  ? `${answers.bloodPressure} mmHg`
                  : "Not provided"}
              </strong>
            </div>

            <div className="result-detail">
              <span>Cholesterol</span>
              <strong>
                {answers.cholesterol
                  ? `${answers.cholesterol} mg/dL`
                  : "Not provided"}
              </strong>
            </div>

          </div>
        </section>

        {/* Symptoms */}
        <section className="result-card">

          <div className="result-card-heading">
            <h2>Reported Symptoms</h2>
          </div>

          {symptoms.length > 0 ? (
            <div className="result-symptoms">

              {symptoms.map((symptom, index) => (
                <span className="symptom-tag" key={index}>
                  {symptom}
                </span>
              ))}

            </div>
          ) : (
            <p>No symptoms were provided.</p>
          )}

          {answers.otherSymptoms && (
            <div className="result-other-symptoms">
              <strong>Additional Symptoms</strong>
              <p>{answers.otherSymptoms}</p>
            </div>
          )}

          {answers.symptomDuration && (
            <div className="result-detail">
              <span>Symptom Duration</span>
              <strong>{answers.symptomDuration}</strong>
            </div>
          )}

          {answers.symptomSeverity && (
            <div className="result-detail">
              <span>Symptom Severity</span>
              <strong>{answers.symptomSeverity}</strong>
            </div>
          )}

          {answers.symptomFrequency && (
            <div className="result-detail">
              <span>Symptom Frequency</span>
              <strong>{answers.symptomFrequency}</strong>
            </div>
          )}

        </section>

        {/* AI Assessment Report */}
        <section className="result-card ai-result-card">

          <div className="result-card-heading">

            <div>
              <span className="ai-label">
                AI GENERATED REPORT
              </span>

              <h2>Heart Health Assessment</h2>
            </div>

          </div>

          <div className="ai-response">
            {renderAssessment()}
          </div>

        </section>

        {/* Medical Disclaimer */}
        <section className="ai-disclaimer">

          <h3>Medical Disclaimer</h3>

          <p>{aiDisclaimer}</p>

          <p>
            AI-generated information may be incomplete or
            inaccurate. Only a qualified healthcare professional
            can evaluate your symptoms and provide a medical
            diagnosis.
          </p>

        </section>

        {/* Buttons */}
        <section className="result-actions">

          <button
            type="button"
            className="result-primary-btn"
            onClick={handleNewAssessment}
          >
            New Assessment
          </button>

          <button
            type="button"
            className="result-secondary-btn"
            onClick={handlePrint}
          >
            Print Report
          </button>

          <button
            type="button"
            className="result-secondary-btn"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>

        </section>

      </main>

      {/* Footer */}
      <footer className="result-footer">
        <p>
          HeartCare | Smart Heart Health Awareness Platform
        </p>
      </footer>

    </div>
  );
}

export default AssessmentResult;
