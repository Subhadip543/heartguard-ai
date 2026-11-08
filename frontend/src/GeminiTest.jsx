
import { useState } from "react";

function GeminiTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const testGemini = async () => {
    setLoading(true);
    setResult("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/gemini/assess",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            age: 45,
            gender: "Male",
            bloodPressure: 140,
            cholesterol: 220,
            smoking: "No",
            diabetes: "No",
            familyHistory: "Yes",
            physicalActivity: "Low",
            symptoms: "Occasional shortness of breath"
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gemini request failed");
      }

      setResult(data.assessment || "No assessment returned.");

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: "750px",
      margin: "50px auto",
      padding: "30px",
      fontFamily: "Arial, sans-serif"
    }}>

      <h1>HeartCare - Gemini AI Test</h1>

      <p>
        Test whether Gemini can analyse sample heart-health
        information and generate educational guidance.
      </p>

      <button
        onClick={testGemini}
        disabled={loading}
        style={{
          padding: "12px 24px",
          background: "#0d9488",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        {loading ? "Analysing..." : "Test Gemini AI"}
      </button>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {result && (
        <div style={{
          marginTop: "25px",
          padding: "20px",
          background: "#f0fdfa",
          borderRadius: "10px",
          whiteSpace: "pre-wrap",
          lineHeight: "1.7"
        }}>
          <h2>Gemini Response</h2>
          {result}
        </div>
      )}

      <p style={{ marginTop: "25px", color: "#666" }}>
        This is an educational demonstration using fictional
        sample information, not a medical diagnosis.
      </p>

    </div>
  );
}

export default GeminiTest;
