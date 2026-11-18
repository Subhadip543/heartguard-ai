/**
 * HeartGuard AI — Pure Client-Side PDF Medical Report Generator
 * Generates a clean, professional, single-page vector A4 PDF report
 * without any external web services or third-party dependencies.
 */

function escapePdfText(str) {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function generateMedicalPdf({
  patientName = "Guest Patient",
  assessmentId = "N/A",
  dateString = new Date().toLocaleString("en-IN"),
  modelName = "Random Forest Classifier",
  modelVersion = "1.0",
  prediction = 0,
  probability = 0,
  threshold = 0.5,
  parameters = {},
  explanation = ""
}) {
  const isPositive = prediction === 1;
  const probPercent = (probability * 100).toFixed(2);
  const threshPercent = (threshold * 100).toFixed(0);

  // PDF Page Size: A4 = 595.28 x 841.89 points
  // Coordinate origin: bottom-left (0, 0)
  // Top margin: 800, Left margin: 40, Right margin: 555
  
  const streamCommands = [];

  // Helper to add drawing commands
  const add = (cmd) => streamCommands.push(cmd);

  // Top header banner (Teal brand bar)
  add("0.05 0.58 0.53 rg"); // Teal #0d9488
  add("40 790 515 28 re f");

  // Header Title
  add("BT /F2 14 Tf 1 1 1 rg 50 800 Td (HEARTGUARD AI  -  CLINICAL SCREENING REPORT) Tj ET");

  // Subheader banner
  add("0.04 0.45 0.41 rg");
  add("40 770 515 20 re f");
  add("BT /F1 9 Tf 1 1 1 rg 50 776 Td (Automated Heart Disease Risk Evaluation  |  Confidential Medical Screening Document) Tj ET");

  // Metadata Card Background
  add("0.96 0.97 0.98 rg 0.85 0.88 0.91 RG 1 w");
  add("40 690 515 70 re B");

  // Metadata labels & values
  add("BT /F2 9 Tf 0.1 0.15 0.2 rg 52 744 Td (Patient Name:) Tj ET");
  add(`BT /F1 9 Tf 0.2 0.25 0.3 rg 125 744 Td (${escapePdfText(patientName)}) Tj ET`);

  add("BT /F2 9 Tf 0.1 0.15 0.2 rg 330 744 Td (Assessment ID:) Tj ET");
  add(`BT /F1 9 Tf 0.2 0.25 0.3 rg 410 744 Td (#${escapePdfText(assessmentId)}) Tj ET`);

  add("BT /F2 9 Tf 0.1 0.15 0.2 rg 52 724 Td (Date & Time:) Tj ET");
  add(`BT /F1 9 Tf 0.2 0.25 0.3 rg 125 724 Td (${escapePdfText(dateString)}) Tj ET`);

  add("BT /F2 9 Tf 0.1 0.15 0.2 rg 330 724 Td (Engine / Model:) Tj ET");
  add(`BT /F1 9 Tf 0.2 0.25 0.3 rg 410 724 Td (${escapePdfText(modelName)} v${escapePdfText(modelVersion)}) Tj ET`);

  add("BT /F2 9 Tf 0.1 0.15 0.2 rg 52 704 Td (Decision Boundary:) Tj ET");
  add(`BT /F1 9 Tf 0.2 0.25 0.3 rg 140 704 Td (${threshPercent}% Probability Threshold) Tj ET`);

  add("BT /F2 9 Tf 0.1 0.15 0.2 rg 330 704 Td (Report Security:) Tj ET");
  add("BT /F1 9 Tf 0.05 0.58 0.53 rg 410 704 Td (Verified Client-Side Synthesis) Tj ET");

  // Model Result Callout Box
  const resultBg = isPositive ? "0.99 0.92 0.92 rg 0.92 0.3 0.3 RG" : "0.92 0.98 0.95 rg 0.15 0.68 0.37 RG";
  add(`${resultBg} 1.5 w`);
  add("40 615 515 62 re B");

  const resultTitle = isPositive ? "PREDICTION: POSITIVE (Elevated Heart Disease Risk Detected)" : "PREDICTION: NEGATIVE (Low Heart Disease Risk Profile)";
  const resultTitleColor = isPositive ? "0.8 0.15 0.15 rg" : "0.08 0.5 0.25 rg";

  add(`BT /F2 12 Tf ${resultTitleColor} 55 656 Td (${escapePdfText(resultTitle)}) Tj ET`);
  add(`BT /F1 9.5 Tf 0.15 0.2 0.25 rg 55 640 Td (Estimated Probability: ${probPercent}%   |   Screening Baseline: ${threshPercent}%   |   Classification: ${isPositive ? "Above Threshold" : "Within Baseline Range"}) Tj ET`);
  add(`BT /F1 8.5 Tf 0.35 0.4 0.45 rg 55 626 Td (Notice: This probability expresses machine learning pattern correlation, not a deterministic clinical test.) Tj ET`);

  // Section Heading: Clinical Parameters Table
  add("0.05 0.58 0.53 rg");
  add("40 592 515 16 re f");
  add("BT /F2 9 Tf 1 1 1 rg 48 596 Td (SUBMITTED CLINICAL PARAMETERS) Tj ET");

  // 2-Column Table of 13 parameters
  // Table bounding box
  add("0.98 0.99 1.0 rg 0.85 0.88 0.91 RG 1 w");
  add("40 376 515 212 re B");

  // Grid line dividers
  add("0.88 0.90 0.93 RG 0.5 w");
  add("297 376 m 297 588 l S"); // vertical divider

  const paramList = [
    { label: "1. Age", val: parameters.age ? `${parameters.age} years` : "Not provided" },
    { label: "2. Sex", val: parameters.sex === 1 ? "Male" : parameters.sex === 0 ? "Female" : "Not provided" },
    { label: "3. Chest Pain Type", val: parameters.cpLabel || "Not provided" },
    { label: "4. Resting Blood Pressure", val: parameters.trestbps ? `${parameters.trestbps} mmHg` : "Not provided" },
    { label: "5. Serum Cholesterol", val: parameters.chol ? `${parameters.chol} mg/dL` : "Not provided" },
    { label: "6. Fasting Blood Sugar", val: parameters.fbsLabel || "Not provided" },
    { label: "7. Resting ECG", val: parameters.restecgLabel || "Not provided" },
    { label: "8. Max Heart Rate (thalach)", val: parameters.thalach ? `${parameters.thalach} bpm` : "Not provided" },
    { label: "9. Exercise Angina", val: parameters.exangLabel || "Not provided" },
    { label: "10. ST Depression (oldpeak)", val: parameters.oldpeak !== undefined && parameters.oldpeak !== null ? `${parameters.oldpeak}` : "Not provided" },
    { label: "11. ST Segment Slope", val: parameters.slopeLabel || "Not provided" },
    { label: "12. Major Vessels (CA)", val: parameters.ca !== undefined && parameters.ca !== null && parameters.ca !== "" ? `${parameters.ca}` : "Not provided" },
    { label: "13. Thalassemia", val: parameters.thalLabel || "Not provided" },
    { label: "14. Model Architecture", val: "Random Forest (Scikit-Learn)" }
  ];

  // Draw 7 rows in 2 columns
  for (let i = 0; i < 7; i++) {
    const yRow = 574 - (i * 28);
    // horizontal divider between rows
    if (i > 0) {
      add(`40 ${yRow + 14} m 555 ${yRow + 14} l S`);
    }

    // Left column item
    const leftItem = paramList[i * 2];
    if (leftItem) {
      add(`BT /F2 8.5 Tf 0.25 0.3 0.35 rg 48 ${yRow + 2} Td (${escapePdfText(leftItem.label)}:) Tj ET`);
      add(`BT /F1 8.5 Tf 0.1 0.1 0.1 rg 165 ${yRow + 2} Td (${escapePdfText(leftItem.val)}) Tj ET`);
    }

    // Right column item
    const rightItem = paramList[i * 2 + 1];
    if (rightItem) {
      add(`BT /F2 8.5 Tf 0.25 0.3 0.35 rg 305 ${yRow + 2} Td (${escapePdfText(rightItem.label)}:) Tj ET`);
      add(`BT /F1 8.5 Tf 0.1 0.1 0.1 rg 425 ${yRow + 2} Td (${escapePdfText(rightItem.val)}) Tj ET`);
    }
  }

  // Section Heading: Plain-Language Summary
  add("0.05 0.58 0.53 rg");
  add("40 354 515 16 re f");
  add("BT /F2 9 Tf 1 1 1 rg 48 358 Td (PLAIN-LANGUAGE CLINICAL EXPLANATION & SUMMARY) Tj ET");

  // Plain-Language Box
  add("0.97 0.98 0.99 rg 0.85 0.88 0.91 RG 1 w");
  add("40 216 515 134 re B");

  // Truncate/wrap plain explanation lines nicely
  const cleanExp = explanation || (
    isPositive
      ? "The HeartGuard AI model classified this profile as Positive (Elevated Risk) with a probability score of " + probPercent + "%, exceeding the 50% baseline screening threshold. Key clinical factors including submitted blood pressure, cholesterol levels, and exercise response patterns closely matched training profiles with coronary artery conditions. This screening suggests prioritizing cardiovascular wellness and scheduling a thorough clinical examination with a licensed healthcare provider."
      : "The HeartGuard AI model classified this profile as Negative (Low Risk) with an estimated risk score of " + probPercent + "%, remaining comfortably below the 50% baseline threshold. The submitted diagnostic parameters (including heart rate, blood pressure, and ECG indicators) are aligned with stable cardiac patterns in our reference population. Maintaining a heart-healthy diet, regular exercise, and periodic medical checkups is recommended."
  );

  // Simple word wrapper for 515 width (~95 characters per line at 8.5pt Helvetica)
  const words = cleanExp.replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let currentLine = "";
  for (const w of words) {
    if ((currentLine + " " + w).length <= 95) {
      currentLine = currentLine ? currentLine + " " + w : w;
    } else {
      lines.push(currentLine);
      currentLine = w;
      if (lines.length >= 7) break;
    }
  }
  if (currentLine && lines.length < 7) {
    lines.push(currentLine);
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const yLine = 334 - (idx * 16);
    add(`BT /F1 8.5 Tf 0.15 0.2 0.25 rg 50 ${yLine} Td (${escapePdfText(lines[idx])}) Tj ET`);
  }

  // Section Heading: Official Disclaimer
  add("0.85 0.2 0.2 rg");
  add("40 194 515 16 re f");
  add("BT /F2 8.5 Tf 1 1 1 rg 48 198 Td (CRITICAL LEGAL & MEDICAL DISCLAIMER - NOT A MEDICAL DIAGNOSIS) Tj ET");

  // Disclaimer Box
  add("0.99 0.95 0.95 rg 0.9 0.7 0.7 RG 1 w");
  add("40 82 515 108 re B");

  const disclaimerLines = [
    "1. HeartGuard AI is an automated statistical software tool designed exclusively for academic and screening demonstration.",
    "2. It DOES NOT provide medical diagnosis, clinical prognosis, treatment plans, or therapeutic prescriptions of any kind.",
    "3. The probability percentage is a mathematical output derived from historical machine learning benchmarks.",
    "4. Under no circumstances should medications be started, modified, or stopped based on this report.",
    "5. If you or someone you are assisting experiences chest pain, breathlessness, radiation of discomfort to arm or jaw,",
    "   or dizziness, IMMEDIATELY call emergency medical services (112 / 102 / 911) or visit the nearest emergency room."
  ];

  for (let idx = 0; idx < disclaimerLines.length; idx++) {
    const yLine = 174 - (idx * 14.5);
    add(`BT /F1 7.5 Tf 0.2 0.1 0.1 rg 48 ${yLine} Td (${escapePdfText(disclaimerLines[idx])}) Tj ET`);
  }

  // Footer
  add("BT /F1 8 Tf 0.4 0.45 0.5 rg 40 50 Td (HeartGuard AI Platform  |  Smart Heart Health Awareness System  |  https://heartguard.ai) Tj ET");
  add(`BT /F2 8 Tf 0.4 0.45 0.5 rg 440 50 Td (Page 1 of 1  |  Confidential) Tj ET`);

  const streamContent = streamCommands.join("\n");
  const streamLength = new TextEncoder().encode(streamContent).length;

  // Build PDF Objects
  const objects = [];
  
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>";
  objects[4] = `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`;
  objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[6] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let pdf = "%PDF-1.4\n";
  let offset = pdf.length;

  const xref = [0]; // 0th entry is free

  for (let i = 1; i <= 6; i++) {
    xref[i] = offset;
    const objStr = `${i} 0 obj\n${objects[i]}\nendobj\n`;
    pdf += objStr;
    offset += objStr.length;
  }

  const startXref = offset;
  pdf += "xref\n0 7\n0000000000 65535 f \n";
  for (let i = 1; i <= 6; i++) {
    const padded = String(xref[i]).padStart(10, "0");
    pdf += `${padded} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return pdf;
}

export function downloadMedicalPdfReport(reportData) {
  const pdfString = generateMedicalPdf(reportData);
  const blob = new Blob([pdfString], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeId = reportData.assessmentId ? String(reportData.assessmentId).replace(/[^a-zA-Z0-9_-]/g, "") : "report";
  link.download = `HeartGuard_Assessment_Report_${safeId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
