
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./HeartAssessment.css";

function HeartAssessment() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // SUBMIT HEALTH ASSESSMENT TO GEMINI
  // ==========================================

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // Collect patient information
    const answers = {
      age: Number(formData.get("age")),
      gender: formData.get("gender"),

      symptoms: formData.getAll("symptoms"),
      symptomDuration: formData.get("symptomDuration"),
      symptomSeverity: formData.get("symptomSeverity"),
      symptomFrequency: formData.get("symptomFrequency"),
      otherSymptoms: formData.get("otherSymptoms"),

      bloodPressure: formData.get("bloodPressure")
        ? Number(formData.get("bloodPressure"))
        : null,

      cholesterol: formData.get("cholesterol")
        ? Number(formData.get("cholesterol"))
        : null,

      smoking: formData.get("smoking"),
      diabetes: formData.get("diabetes"),
      familyHistory: formData.get("familyHistory"),
      activity: formData.get("activity")
    };

    setLoading(true);
    setError("");

    try {
      // Send patient information to backend
      const response = await fetch(
        "http://localhost:5000/api/gemini/assess",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...answers,
            physicalActivity: answers.activity
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to generate AI assessment."
        );
      }

      // Navigate to the result page
      navigate("/result", {
        state: {
          ...answers,
          aiAssessment: data.assessment,
          aiDisclaimer: data.disclaimer
        }
      });

    } catch (error) {
      console.error("Assessment error:", error);

      setError(
        error.message ||
        "Unable to connect to Gemini. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="assessment-page">

      {/* ==================================
          HEADER
      ================================== */}

      <header className="assessment-header">

        <h1>HeartCare</h1>

        <Link to="/dashboard">
          Back to Dashboard
        </Link>

      </header>


      <main className="assessment-container">

        {/* ==================================
            PAGE HEADING
        ================================== */}

        <section className="assessment-heading">

          <h2>Heart Health Assessment</h2>

          <p>
            Answer the following questions to help us
            understand your symptoms and heart health.
            Our AI assistant will provide educational
            information based on your answers.
          </p>

        </section>


        {/* ==================================
            EMERGENCY WARNING
        ================================== */}

        <div className="emergency-warning">

          <strong>Important Emergency Notice</strong>

          <p>
            If you currently have severe or new chest pain,
            serious difficulty breathing, or fainting,
            seek emergency medical help immediately.
            Do not wait to complete this questionnaire.
          </p>

        </div>


        {/* ==================================
            ASSESSMENT FORM
        ================================== */}

        <form
          className="assessment-form"
          onSubmit={handleSubmit}
        >

          {/* ==================================
              1. PERSONAL INFORMATION
          ================================== */}

          <section className="assessment-section">

            <h3>1. Personal Information</h3>

            <div className="assessment-grid">

              <div className="form-group">

                <label>Age</label>

                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  placeholder="Enter your age"
                  required
                />

              </div>


              <div className="form-group">

                <label>Gender</label>

                <select
                  name="gender"
                  required
                  defaultValue=""
                >

                  <option value="" disabled>
                    Select gender
                  </option>

                  <option value="Male">Male</option>

                  <option value="Female">Female</option>

                  <option value="Other">Other</option>

                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>

                </select>

              </div>

            </div>

          </section>


          {/* ==================================
              2. SYMPTOMS
          ================================== */}

          <section className="assessment-section">

            <h3>
              2. Are You Experiencing Any of These Symptoms?
            </h3>

            <p className="section-description">
              Select all symptoms that apply. You can leave
              this section unselected if you have none
              of these symptoms.
            </p>


            <div className="symptom-grid">

              {[
                "Chest pain or discomfort",
                "Shortness of breath",
                "Irregular heartbeat or palpitations",
                "Dizziness or lightheadedness",
                "Fainting or loss of consciousness",
                "Unusual tiredness or fatigue",
                "Swelling in legs, ankles or feet",
                "Pain in arm, shoulder, jaw or back",
                "None of these symptoms"
              ].map((symptom) => (

                <label
                  className="symptom-option"
                  key={symptom}
                >

                  <input
                    type="checkbox"
                    name="symptoms"
                    value={symptom}
                  />

                  <span>{symptom}</span>

                </label>

              ))}

            </div>


            <div className="form-group">

              <label>Other symptoms (if any)</label>

              <textarea
                name="otherSymptoms"
                placeholder="Describe any other symptoms..."
                rows="3"
              />

            </div>

          </section>


          {/* ==================================
              3. SYMPTOM DETAILS
          ================================== */}

          <section className="assessment-section">

            <h3>3. Details About Your Symptoms</h3>

            <div className="assessment-grid">

              <div className="form-group">

                <label>
                  How long have you experienced them?
                </label>

                <select
                  name="symptomDuration"
                  defaultValue=""
                >

                  <option value="">
                    Select duration
                  </option>

                  <option value="Started today">
                    Started today
                  </option>

                  <option value="A few days">
                    A few days
                  </option>

                  <option value="A few weeks">
                    A few weeks
                  </option>

                  <option value="Several months">
                    Several months
                  </option>

                  <option value="Not applicable">
                    Not applicable
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>
                  How severe are your symptoms?
                </label>

                <select
                  name="symptomSeverity"
                  defaultValue=""
                >

                  <option value="">
                    Select severity
                  </option>

                  <option value="Mild">Mild</option>

                  <option value="Moderate">
                    Moderate
                  </option>

                  <option value="Severe">
                    Severe
                  </option>

                  <option value="Not applicable">
                    Not applicable
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>
                  How often do they occur?
                </label>

                <select
                  name="symptomFrequency"
                  defaultValue=""
                >

                  <option value="">
                    Select frequency
                  </option>

                  <option value="Occasionally">
                    Occasionally
                  </option>

                  <option value="Daily">
                    Daily
                  </option>

                  <option value="Several times a day">
                    Several times a day
                  </option>

                  <option value="During physical activity">
                    During physical activity
                  </option>

                  <option value="Not applicable">
                    Not applicable
                  </option>

                </select>

              </div>

            </div>

          </section>


          {/* ==================================
              4. MEDICAL INFORMATION
          ================================== */}

          <section className="assessment-section">

            <h3>4. Medical Information</h3>

            <div className="assessment-grid">


              <div className="form-group">

                <label>
                  Systolic Blood Pressure (mmHg)
                </label>

                <input
                  type="number"
                  name="bloodPressure"
                  min="1"
                  max="300"
                  placeholder="Example: 120"
                />

              </div>


              <div className="form-group">

                <label>
                  Total Cholesterol (mg/dL)
                </label>

                <input
                  type="number"
                  name="cholesterol"
                  min="1"
                  max="1000"
                  placeholder="Example: 180"
                />

              </div>


              <div className="form-group">

                <label>Do you smoke?</label>

                <select
                  name="smoking"
                  required
                  defaultValue=""
                >

                  <option value="" disabled>
                    Select an answer
                  </option>

                  <option value="Yes">Yes</option>

                  <option value="No">No</option>

                  <option value="Former smoker">
                    Former smoker
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>Do you have diabetes?</label>

                <select
                  name="diabetes"
                  required
                  defaultValue=""
                >

                  <option value="" disabled>
                    Select an answer
                  </option>

                  <option value="Yes">Yes</option>

                  <option value="No">No</option>

                  <option value="Not sure">
                    Not sure
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>
                  Family history of heart disease?
                </label>

                <select
                  name="familyHistory"
                  required
                  defaultValue=""
                >

                  <option value="" disabled>
                    Select an answer
                  </option>

                  <option value="Yes">Yes</option>

                  <option value="No">No</option>

                  <option value="Not sure">
                    Not sure
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>Physical Activity</label>

                <select
                  name="activity"
                  required
                  defaultValue=""
                >

                  <option value="" disabled>
                    Select activity level
                  </option>

                  <option value="Sedentary">
                    Sedentary
                  </option>

                  <option value="Lightly active">
                    Lightly active
                  </option>

                  <option value="Moderately active">
                    Moderately active
                  </option>

                  <option value="Very active">
                    Very active
                  </option>

                </select>

              </div>

            </div>

          </section>


          {/* ==================================
              MEDICAL DISCLAIMER
          ================================== */}

          <div className="assessment-disclaimer">

            <strong>
              Privacy and Medical Disclaimer
            </strong>

            <p>
              Your answers will be used for an educational,
              AI-assisted health assessment. This questionnaire
              cannot diagnose heart disease or replace a
              doctor's examination. AI-generated information
              must be reviewed by a qualified healthcare
              professional.
            </p>

          </div>


          {/* ==================================
              API ERROR MESSAGE
          ================================== */}

          {error && (

            <div className="assessment-error">
              {error}
            </div>

          )}


          {/* ==================================
              SUBMIT BUTTON
          ================================== */}

          <button
            type="submit"
            className="assessment-submit"
            disabled={loading}
          >

            {loading
              ? "Analysing Your Answers..."
              : "Submit Health Assessment →"}

          </button>

        </form>

      </main>

    </div>
  );
}

export default HeartAssessment;
