
import { Link } from "react-router-dom";
import { useTheme } from "../context/useTheme";
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  HeartPulse,
  Apple,
  Footprints,
  Cigarette,
  Stethoscope,
  AlertTriangle,
  Moon,
  ClipboardCheck,
  Droplets,
  ShieldCheck,
  Brain,
  Gauge,
  Heart,
  CheckCircle2
} from "lucide-react";

import HeartExplorer from "./HeartExplorer";
import DashboardSidebar from "../DashboardSidebar";
import "./HealthAwareness.css";

const translations = {
  English: {
    back: "Back to Home",
    heroLabel: "HEART HEALTH EDUCATION",
    heroTitle: "Take Care of Your",
    heart: "Heart",
    heroText: "Knowledge is the first step towards a healthier heart. Learn about cardiovascular diseases, understand warning signs and discover simple ways to protect your heart.",
    check: "Check Your Heart Health",
    explore: "Explore Heart Diseases",
    health: "Heart Health",
    prevention: "Prevention",
    early: "Early Awareness",
    basics: "THE BASICS",
    understanding: "Understanding Heart Health",
    understandingText: "Your heart continuously pumps blood, supplying oxygen and nutrients throughout your body. Looking after your cardiovascular health is important at every age.",
    bp: "Blood Pressure",
    bpText: "High blood pressure can put extra strain on your heart and blood vessels. Regular monitoring and appropriate medical care are important.",
    cholesterol: "Cholesterol",
    cholesterolText: "Unhealthy cholesterol levels can contribute to plaque buildup in arteries. Discuss your lipid profile and treatment options with your doctor.",
    sugar: "Blood Sugar",
    sugarText: "Diabetes can increase the risk of cardiovascular disease. Regular screening and proper diabetes management can help protect your health.",
    learn: "LEARN AND UNDERSTAND",
    diseases: "Cardiovascular and Circulatory Conditions",
    diseasesText: "Understanding common cardiovascular and related circulatory conditions can help you recognise symptoms and seek appropriate medical advice.",
    coronary: "Coronary Artery Disease",
    coronaryText: "A condition in which the arteries supplying blood to the heart become narrowed, often due to plaque buildup.",
    artery: "Artery Health",
    arrhythmia: "Arrhythmia",
    arrhythmiaText: "A problem with the rhythm of the heartbeat. The heart may beat too quickly, too slowly or irregularly.",
    rhythm: "Heart Rhythm",
    failure: "Heart Failure",
    failureText: "A condition in which the heart cannot pump blood as effectively as the body needs. It requires medical assessment and ongoing care.",
    function: "Heart Function",
    valve: "Heart Valve Disease",
    valveText: "Occurs when one or more heart valves do not open or close properly, affecting blood flow through the heart.",
    valves: "Heart Valves",
    stroke: "Stroke",
    strokeText: "A medical emergency that occurs when blood supply to part of the brain is interrupted or bleeding occurs in the brain.",
    brain: "Circulatory & Brain Health (Related Condition)",
    cardiomyopathy: "Cardiomyopathy",
    cardiomyopathyText: "A disease affecting the heart muscle, potentially making it harder for the heart to pump blood effectively.",
    muscle: "Heart Muscle",
    important: "IMPORTANT INFORMATION",
    warning: "Warning Signs You Should Never Ignore",
    warningText: "Some heart and circulation problems can cause symptoms that require immediate medical attention.",
    chest: "Chest Discomfort",
    chestText: "Pressure, tightness, squeezing or pain in the chest.",
    breathing: "Breathing Difficulty",
    breathingText: "Unexpected shortness of breath, including during rest.",
    sweating: "Cold Sweating",
    sweatingText: "Sudden cold sweating, particularly with chest discomfort or nausea.",
    weakness: "Sudden Weakness",
    weaknessText: "Sudden weakness, numbness or difficulty speaking may indicate a stroke.",
    emergency: "EMERGENCY AWARENESS",
    emergencyTitle: "Recognise a Medical Emergency",
    emergencyText: "Chest discomfort, difficulty breathing, fainting, sudden facial drooping, arm weakness or speech difficulty may indicate a serious medical emergency.",
    emergencyCall: "If you suspect a heart attack or stroke, call",
    emergencyExtra: "immediately. Do not wait for an online assessment or attempt to drive yourself to the hospital.",
    emergencyButton: "Open Emergency Assistance",
    risk: "KNOW YOUR RISK",
    riskTitle: "Common Heart Disease Risk Factors",
    riskText: "Some risk factors can be managed through lifestyle changes and appropriate medical care.",
    riskItems: [
      "High blood pressure",
      "High cholesterol",
      "Diabetes",
      "Smoking and tobacco use",
      "Physical inactivity",
      "Unhealthy eating habits",
      "Family history of heart disease",
      "Excessive alcohol consumption",
      "Increasing age"
    ],
    everyday: "EVERYDAY PREVENTION",
    lifestyle: "Build a Healthy Heart Lifestyle",
    lifestyleText: "Small, consistent lifestyle improvements can support better cardiovascular health.",
    diet: "Eat a Balanced Diet",
    dietText: "Include fruits, vegetables, whole grains and nutritious foods. Limit excess salt and highly processed foods.",
    active: "Stay Physically Active",
    activeText: "Aim for regular physical activity appropriate to your health and abilities. Start gradually if needed.",
    tobacco: "Avoid Tobacco",
    tobaccoText: "Smoking and tobacco use increase the risk of heart and blood vessel diseases.",
    sleep: "Sleep and Manage Stress",
    sleepText: "Maintain a regular sleep routine and use healthy stress-management practices.",
    checkups: "Regular Health Check-ups",
    checkupsText: "Discuss blood pressure, cholesterol and blood sugar screening with a healthcare professional.",
    advice: "Follow Medical Advice",
    adviceText: "Take prescribed medicines as directed and attend recommended follow-up appointments.",
    monitoring: "HEALTH MONITORING",
    measurements: "Know Your Important Health Measurements",
    measurementsText: "These measurements can help healthcare professionals understand your cardiovascular health.",
    lipid: "Lipid Profile",
    lipidText: "Measures different types of cholesterol and triglycerides in your blood.",
    ecg: "ECG / EKG",
    ecgText: "Records the electrical activity of the heart and can help clinicians investigate certain heart rhythm problems.",
    smart: "HEARTGUARD AI SMART ASSESSMENT",
    firstStep: "Take the First Step Towards Understanding Your Heart",
    assessmentText: "Answer questions about your health history, lifestyle and relevant health measurements to receive an informational cardiovascular risk assessment.",
    questionnaire: "Health questionnaire",
    review: "Risk factor review",
    feedback: "Personalised educational feedback",
    start: "Start Heart Assessment",
    screening: "This is a screening and educational feature, not a medical diagnosis.",
    disclaimer: "Medical Disclaimer",
    disclaimerText: "This page provides general health education only. It does not diagnose, prevent or treat any disease. HeartGuard AI's online assessment cannot replace a clinical examination. Consult a qualified healthcare professional for personal medical advice.",
    footerText: "Learn about your heart. Make informed health decisions.",
    copyright: "© 2026 HeartGuard AI | Your Health, Our Priority"
  },

  Bengali: {
    back: "হোমে ফিরে যান",
    heroLabel: "হৃদ্‌স্বাস্থ্য শিক্ষা",
    heroTitle: "আপনার হৃদয়ের",
    heart: "যত্ন নিন",
    heroText: "সুস্থ হৃদয়ের প্রথম ধাপ হল সঠিক জ্ঞান। হৃদ্‌রোগ সম্পর্কে জানুন, সতর্কতামূলক লক্ষণ বুঝুন এবং হৃদয় সুস্থ রাখার উপায় শিখুন।",
    check: "হৃদ্‌স্বাস্থ্য পরীক্ষা করুন",
    explore: "হৃদ্‌রোগ সম্পর্কে জানুন",
    health: "হৃদ্‌স্বাস্থ্য",
    prevention: "প্রতিরোধ",
    early: "প্রাথমিক সচেতনতা",
    basics: "মৌলিক বিষয়",
    understanding: "হৃদ্‌স্বাস্থ্য সম্পর্কে জানুন",
    understandingText: "আপনার হৃদয় সারা শরীরে অক্সিজেন ও পুষ্টি পৌঁছে দিতে ক্রমাগত রক্ত পাম্প করে। প্রতিটি বয়সেই হৃদ্‌স্বাস্থ্যের যত্ন নেওয়া গুরুত্বপূর্ণ।",
    bp: "রক্তচাপ",
    bpText: "উচ্চ রক্তচাপ হৃদয় ও রক্তনালির ওপর অতিরিক্ত চাপ সৃষ্টি করতে পারে। নিয়মিত পরীক্ষা ও উপযুক্ত চিকিৎসা গুরুত্বপূর্ণ।",
    cholesterol: "কোলেস্টেরল",
    cholesterolText: "অস্বাস্থ্যকর কোলেস্টেরলের মাত্রা ধমনিতে প্লাক জমাতে পারে। আপনার লিপিড প্রোফাইল ও চিকিৎসার বিকল্প সম্পর্কে চিকিৎসকের সঙ্গে কথা বলুন।",
    sugar: "রক্তে শর্করা",
    sugarText: "ডায়াবেটিস হৃদ্‌রোগের ঝুঁকি বাড়াতে পারে। নিয়মিত পরীক্ষা ও সঠিক নিয়ন্ত্রণ স্বাস্থ্য সুরক্ষায় সাহায্য করে।",
    learn: "জানুন ও বুঝুন",
    diseases: "হৃদযন্ত্র ও সংবহনতন্ত্রের সাধারণ অবস্থাসমূহ",
    diseasesText: "হৃদযন্ত্র এবং সম্পর্কিত সংবহনতন্ত্রের স্বাস্থ্য সমস্যা সম্পর্কে সচেতনতা লক্ষণ চিনতে এবং সময়মতো চিকিৎসা পরামর্শ নিতে সাহায্য করে।",
    coronary: "করোনারি আর্টারি ডিজিজ",
    coronaryText: "এই অবস্থায় হৃদয়ে রক্ত সরবরাহকারী ধমনিগুলি সরু হয়ে যায়, প্রায়ই প্লাক জমার কারণে।",
    artery: "ধমনির স্বাস্থ্য",
    arrhythmia: "অ্যারিদমিয়া",
    arrhythmiaText: "হৃদস্পন্দনের ছন্দের সমস্যা। হৃদয় খুব দ্রুত, খুব ধীরে বা অনিয়মিতভাবে স্পন্দিত হতে পারে।",
    rhythm: "হৃদস্পন্দনের ছন্দ",
    failure: "হার্ট ফেইলিউর",
    failureText: "এই অবস্থায় হৃদয় শরীরের প্রয়োজন অনুযায়ী কার্যকরভাবে রক্ত পাম্প করতে পারে না। চিকিৎসকের মূল্যায়ন ও নিয়মিত যত্ন প্রয়োজন।",
    function: "হৃদয়ের কার্যক্ষমতা",
    valve: "হার্টের ভালভের রোগ",
    valveText: "হৃদয়ের এক বা একাধিক ভালভ সঠিকভাবে খুলতে বা বন্ধ হতে না পারলে রক্তপ্রবাহে সমস্যা হয়।",
    valves: "হৃদয়ের ভালভ",
    stroke: "স্ট্রোক",
    strokeText: "মস্তিষ্কের কোনো অংশে রক্ত সরবরাহ বন্ধ হয়ে গেলে বা মস্তিষ্কে রক্তক্ষরণ হলে এই জরুরি অবস্থা তৈরি হয়।",
    brain: "মস্তিষ্ক ও রক্তনালী (সম্পর্কিত অবস্থা)",
    cardiomyopathy: "কার্ডিওমায়োপ্যাথি",
    cardiomyopathyText: "এটি হৃদপেশিকে প্রভাবিত করে এবং হৃদয়ের রক্ত পাম্প করার ক্ষমতা কমিয়ে দিতে পারে।",
    muscle: "হৃদপেশি",
    important: "গুরুত্বপূর্ণ তথ্য",
    warning: "যে সতর্কতামূলক লক্ষণগুলি উপেক্ষা করবেন না",
    warningText: "হৃদয় ও রক্ত সঞ্চালনের কিছু সমস্যায় এমন উপসর্গ দেখা দিতে পারে যার জন্য দ্রুত চিকিৎসা প্রয়োজন।",
    chest: "বুকে অস্বস্তি",
    chestText: "বুকে চাপ, টান, চেপে ধরা অনুভূতি বা ব্যথা।",
    breathing: "শ্বাসকষ্ট",
    breathingText: "বিশ্রামের সময়ও হঠাৎ শ্বাস নিতে অসুবিধা হওয়া।",
    sweating: "ঠান্ডা ঘাম",
    sweatingText: "হঠাৎ ঠান্ডা ঘাম হওয়া, বিশেষ করে বুকে অস্বস্তি বা বমি বমি ভাবের সঙ্গে।",
    weakness: "হঠাৎ দুর্বলতা",
    weaknessText: "হঠাৎ দুর্বলতা, অবশ ভাব বা কথা বলতে অসুবিধা স্ট্রোকের লক্ষণ হতে পারে।",
    emergency: "জরুরি স্বাস্থ্য সচেতনতা",
    emergencyTitle: "জরুরি চিকিৎসার পরিস্থিতি চিনুন",
    emergencyText: "বুকে অস্বস্তি, শ্বাসকষ্ট, অজ্ঞান হয়ে যাওয়া, মুখ বেঁকে যাওয়া, হাত দুর্বল হওয়া বা কথা বলতে অসুবিধা গুরুতর জরুরি অবস্থার লক্ষণ হতে পারে।",
    emergencyCall: "হার্ট অ্যাটাক বা স্ট্রোকের সন্দেহ হলে অবিলম্বে",
    emergencyExtra: "নম্বরে ফোন করুন। অনলাইন মূল্যায়নের জন্য অপেক্ষা করবেন না বা নিজে গাড়ি চালিয়ে হাসপাতালে যাবেন না।",
    emergencyButton: "জরুরি সহায়তা খুলুন",
    risk: "আপনার ঝুঁকি জানুন",
    riskTitle: "হৃদ্‌রোগের সাধারণ ঝুঁকির কারণ",
    riskText: "জীবনযাত্রার পরিবর্তন ও উপযুক্ত চিকিৎসার মাধ্যমে কিছু ঝুঁকি নিয়ন্ত্রণ করা যায়।",
    riskItems: [
      "উচ্চ রক্তচাপ",
      "উচ্চ কোলেস্টেরল",
      "ডায়াবেটিস",
      "ধূমপান ও তামাক ব্যবহার",
      "শারীরিক নিষ্ক্রিয়তা",
      "অস্বাস্থ্যকর খাদ্যাভ্যাস",
      "পরিবারে হৃদ্‌রোগের ইতিহাস",
      "অতিরিক্ত মদ্যপান",
      "বয়স বৃদ্ধি"
    ],
    everyday: "দৈনন্দিন প্রতিরোধ",
    lifestyle: "হৃদয় সুস্থ রাখার জীবনযাপন",
    lifestyleText: "ছোট ছোট নিয়মিত অভ্যাস হৃদ্‌স্বাস্থ্য ভালো রাখতে সাহায্য করে।",
    diet: "সুষম খাবার খান",
    dietText: "ফল, শাকসবজি, গোটা শস্য ও পুষ্টিকর খাবার খান। অতিরিক্ত লবণ ও প্রক্রিয়াজাত খাবার কমান।",
    active: "শারীরিকভাবে সক্রিয় থাকুন",
    activeText: "নিজের স্বাস্থ্য ও সামর্থ্য অনুযায়ী নিয়মিত শরীরচর্চা করুন। প্রয়োজনে ধীরে শুরু করুন।",
    tobacco: "তামাক এড়িয়ে চলুন",
    tobaccoText: "ধূমপান ও তামাক হৃদয় এবং রক্তনালির রোগের ঝুঁকি বাড়ায়।",
    sleep: "ঘুম ও মানসিক চাপ নিয়ন্ত্রণ করুন",
    sleepText: "নিয়মিত ঘুমের সময় বজায় রাখুন এবং স্বাস্থ্যকর উপায়ে মানসিক চাপ কমান।",
    checkups: "নিয়মিত স্বাস্থ্য পরীক্ষা",
    checkupsText: "রক্তচাপ, কোলেস্টেরল ও রক্তে শর্করা পরীক্ষার বিষয়ে স্বাস্থ্যকর্মীর সঙ্গে কথা বলুন।",
    advice: "চিকিৎসকের পরামর্শ মেনে চলুন",
    adviceText: "নির্দেশ অনুযায়ী ওষুধ খান এবং নির্ধারিত ফলো-আপে যান।",
    monitoring: "স্বাস্থ্য পর্যবেক্ষণ",
    measurements: "গুরুত্বপূর্ণ স্বাস্থ্য পরিমাপ সম্পর্কে জানুন",
    measurementsText: "এই পরিমাপগুলি চিকিৎসকদের আপনার হৃদ্‌স্বাস্থ্য বুঝতে সাহায্য করে।",
    lipid: "লিপিড প্রোফাইল",
    lipidText: "রক্তে বিভিন্ন ধরনের কোলেস্টেরল ও ট্রাইগ্লিসারাইডের মাত্রা পরিমাপ করে।",
    ecg: "ইসিজি / ECG",
    ecgText: "হৃদয়ের বৈদ্যুতিক কার্যকলাপ রেকর্ড করে এবং হৃদস্পন্দনের কিছু সমস্যা পরীক্ষা করতে সাহায্য করে।",
    smart: "হার্টকেয়ার স্মার্ট মূল্যায়ন",
    firstStep: "আপনার হৃদয়কে বোঝার প্রথম পদক্ষেপ নিন",
    assessmentText: "আপনার স্বাস্থ্য ইতিহাস, জীবনযাপন ও স্বাস্থ্য পরিমাপ সম্পর্কে প্রশ্নের উত্তর দিয়ে হৃদ্‌রোগের ঝুঁকি সম্পর্কে তথ্য পেতে পারেন।",
    questionnaire: "স্বাস্থ্য প্রশ্নাবলি",
    review: "ঝুঁকির কারণ পর্যালোচনা",
    feedback: "ব্যক্তিগত শিক্ষামূলক পরামর্শ",
    start: "হৃদ্‌স্বাস্থ্য মূল্যায়ন শুরু করুন",
    screening: "এটি একটি প্রাথমিক পরীক্ষা ও শিক্ষামূলক সুবিধা, চিকিৎসাগত রোগ নির্ণয় নয়।",
    disclaimer: "চিকিৎসা সংক্রান্ত সতর্কীকরণ",
    disclaimerText: "এই পৃষ্ঠায় শুধুমাত্র সাধারণ স্বাস্থ্য শিক্ষা দেওয়া হয়। এটি কোনো রোগ নির্ণয়, প্রতিরোধ বা চিকিৎসা করে না। হার্টকেয়ারের অনলাইন মূল্যায়ন চিকিৎসকের পরীক্ষার বিকল্প নয়। ব্যক্তিগত চিকিৎসা পরামর্শের জন্য যোগ্য স্বাস্থ্যকর্মীর সঙ্গে যোগাযোগ করুন।",
    footerText: "আপনার হৃদয় সম্পর্কে জানুন। সচেতন স্বাস্থ্য সিদ্ধান্ত নিন।",
    copyright: "© ২০২৬ হার্টকেয়ার | আপনার স্বাস্থ্য, আমাদের অগ্রাধিকার"
  },

  Hindi: {
    back: "होम पर वापस जाएं",
    heroLabel: "हृदय स्वास्थ्य शिक्षा",
    heroTitle: "अपने",
    heart: "दिल का ख्याल रखें",
    heroText: "स्वस्थ हृदय की दिशा में ज्ञान पहला कदम है। हृदय रोगों के बारे में जानें, चेतावनी के संकेत समझें और अपने दिल की सुरक्षा के तरीके सीखें।",
    check: "अपने हृदय स्वास्थ्य की जांच करें",
    explore: "हृदय रोगों के बारे में जानें",
    health: "हृदय स्वास्थ्य",
    prevention: "रोकथाम",
    early: "प्रारंभिक जागरूकता",
    basics: "मूल बातें",
    understanding: "हृदय स्वास्थ्य को समझें",
    understandingText: "आपका हृदय पूरे शरीर में ऑक्सीजन और पोषक तत्व पहुंचाने के लिए लगातार रक्त पंप करता है। हर उम्र में हृदय स्वास्थ्य का ध्यान रखना महत्वपूर्ण है।",
    bp: "रक्तचाप",
    bpText: "उच्च रक्तचाप आपके हृदय और रक्त वाहिकाओं पर अतिरिक्त दबाव डाल सकता है। नियमित निगरानी और उचित चिकित्सा देखभाल महत्वपूर्ण है।",
    cholesterol: "कोलेस्ट्रॉल",
    cholesterolText: "अस्वस्थ कोलेस्ट्रॉल का स्तर धमनियों में प्लाक जमा होने का कारण बन सकता है। अपने डॉक्टर से लिपिड प्रोफाइल और उपचार के विकल्पों पर चर्चा करें।",
    sugar: "ब्लड शुगर",
    sugarText: "मधुमेह हृदय रोग का जोखिम बढ़ा सकता है। नियमित जांच और मधुमेह का सही प्रबंधन स्वास्थ्य की रक्षा में मदद कर सकता है।",
    learn: "जानें और समझें",
    diseases: "हृदय एवं परिसंचरण संबंधी स्थितियाँ",
    diseasesText: "हृदय और संबंधित रक्त परिसंचरण स्थितियों को समझने से लक्षण पहचानने और समय पर चिकित्सा सलाह लेने में मदद मिल सकती है।",
    coronary: "कोरोनरी आर्टरी डिजीज",
    coronaryText: "इस स्थिति में हृदय को रक्त पहुंचाने वाली धमनियां संकरी हो जाती हैं, अक्सर प्लाक जमा होने के कारण।",
    artery: "धमनियों का स्वास्थ्य",
    arrhythmia: "अरिदमिया",
    arrhythmiaText: "यह हृदय की धड़कन की लय से जुड़ी समस्या है। हृदय बहुत तेज, बहुत धीमा या अनियमित रूप से धड़क सकता है।",
    rhythm: "हृदय की धड़कन",
    failure: "हार्ट फेल्योर",
    failureText: "इस स्थिति में हृदय शरीर की जरूरत के अनुसार प्रभावी ढंग से रक्त पंप नहीं कर पाता। इसके लिए चिकित्सा जांच और नियमित देखभाल जरूरी है।",
    function: "हृदय का कार्य",
    valve: "हृदय वाल्व रोग",
    valveText: "जब हृदय के एक या अधिक वाल्व ठीक से खुल या बंद नहीं होते, तो रक्त प्रवाह प्रभावित होता है।",
    valves: "हृदय के वाल्व",
    stroke: "स्ट्रोक",
    strokeText: "यह एक चिकित्सा आपात स्थिति है, जो मस्तिष्क के किसी हिस्से में रक्त की आपूर्ति रुकने या मस्तिष्क में रक्तस्राव होने पर होती है।",
    brain: "मस्तिष्क और रक्त वाहिकाएं (संबंधित स्थिति)",
    cardiomyopathy: "कार्डियोमायोपैथी",
    cardiomyopathyText: "यह हृदय की मांसपेशियों को प्रभावित करने वाली बीमारी है, जिससे हृदय के लिए रक्त पंप करना कठिन हो सकता है।",
    muscle: "हृदय की मांसपेशी",
    important: "महत्वपूर्ण जानकारी",
    warning: "इन चेतावनी संकेतों को कभी नजरअंदाज न करें",
    warningText: "हृदय और रक्त संचार की कुछ समस्याओं में ऐसे लक्षण हो सकते हैं जिनके लिए तुरंत चिकित्सा सहायता की जरूरत होती है।",
    chest: "सीने में परेशानी",
    chestText: "सीने में दबाव, जकड़न, सिकुड़न या दर्द।",
    breathing: "सांस लेने में कठिनाई",
    breathingText: "आराम करते समय भी अचानक सांस फूलना।",
    sweating: "ठंडा पसीना",
    sweatingText: "अचानक ठंडा पसीना आना, विशेषकर सीने में परेशानी या मतली के साथ।",
    weakness: "अचानक कमजोरी",
    weaknessText: "अचानक कमजोरी, सुन्नपन या बोलने में कठिनाई स्ट्रोक का संकेत हो सकती है।",
    emergency: "आपातकालीन जागरूकता",
    emergencyTitle: "चिकित्सा आपात स्थिति को पहचानें",
    emergencyText: "सीने में परेशानी, सांस लेने में कठिनाई, बेहोशी, चेहरे का अचानक झुकना, हाथ में कमजोरी या बोलने में कठिनाई गंभीर आपात स्थिति के संकेत हो सकते हैं।",
    emergencyCall: "यदि आपको हार्ट अटैक या स्ट्रोक का संदेह है, तो तुरंत",
    emergencyExtra: "पर कॉल करें। ऑनलाइन जांच का इंतजार न करें और खुद गाड़ी चलाकर अस्पताल जाने की कोशिश न करें।",
    emergencyButton: "आपातकालीन सहायता खोलें",
    risk: "अपने जोखिम को जानें",
    riskTitle: "हृदय रोग के सामान्य जोखिम कारक",
    riskText: "कुछ जोखिम कारकों को जीवनशैली में बदलाव और उचित चिकित्सा देखभाल से नियंत्रित किया जा सकता है।",
    riskItems: [
      "उच्च रक्तचाप",
      "उच्च कोलेस्ट्रॉल",
      "मधुमेह",
      "धूम्रपान और तंबाकू का उपयोग",
      "शारीरिक निष्क्रियता",
      "अस्वस्थ खान-पान",
      "परिवार में हृदय रोग का इतिहास",
      "अत्यधिक शराब का सेवन",
      "बढ़ती उम्र"
    ],
    everyday: "दैनिक रोकथाम",
    lifestyle: "स्वस्थ हृदय के लिए जीवनशैली अपनाएं",
    lifestyleText: "छोटे और नियमित जीवनशैली सुधार हृदय स्वास्थ्य को बेहतर बनाने में मदद कर सकते हैं।",
    diet: "संतुलित आहार लें",
    dietText: "फल, सब्जियां, साबुत अनाज और पौष्टिक भोजन शामिल करें। अधिक नमक और अत्यधिक प्रोसेस्ड भोजन सीमित करें।",
    active: "शारीरिक रूप से सक्रिय रहें",
    activeText: "अपने स्वास्थ्य और क्षमता के अनुसार नियमित शारीरिक गतिविधि करें। जरूरत पड़ने पर धीरे-धीरे शुरुआत करें।",
    tobacco: "तंबाकू से बचें",
    tobaccoText: "धूम्रपान और तंबाकू का उपयोग हृदय और रक्त वाहिकाओं की बीमारियों का जोखिम बढ़ाता है।",
    sleep: "नींद लें और तनाव संभालें",
    sleepText: "नियमित नींद का समय बनाए रखें और तनाव कम करने के स्वस्थ तरीके अपनाएं।",
    checkups: "नियमित स्वास्थ्य जांच",
    checkupsText: "रक्तचाप, कोलेस्ट्रॉल और ब्लड शुगर की जांच के बारे में स्वास्थ्य विशेषज्ञ से बात करें।",
    advice: "चिकित्सकीय सलाह का पालन करें",
    adviceText: "निर्देशानुसार दवाएं लें और सुझाई गई फॉलो-अप जांच में शामिल हों।",
    monitoring: "स्वास्थ्य निगरानी",
    measurements: "अपने महत्वपूर्ण स्वास्थ्य मापदंड जानें",
    measurementsText: "ये मापदंड स्वास्थ्य विशेषज्ञों को आपके हृदय स्वास्थ्य को समझने में मदद कर सकते हैं।",
    lipid: "लिपिड प्रोफाइल",
    lipidText: "यह आपके रक्त में विभिन्न प्रकार के कोलेस्ट्रॉल और ट्राइग्लिसराइड्स को मापता है।",
    ecg: "ईसीजी / ECG",
    ecgText: "यह हृदय की विद्युत गतिविधि रिकॉर्ड करता है और कुछ धड़कन संबंधी समस्याओं की जांच में मदद करता है।",
    smart: "हार्टकेयर स्मार्ट जांच",
    firstStep: "अपने हृदय को समझने की दिशा में पहला कदम उठाएं",
    assessmentText: "अपने स्वास्थ्य इतिहास, जीवनशैली और स्वास्थ्य मापदंडों से जुड़े सवालों के जवाब देकर हृदय जोखिम के बारे में जानकारी प्राप्त करें।",
    questionnaire: "स्वास्थ्य प्रश्नावली",
    review: "जोखिम कारकों की समीक्षा",
    feedback: "व्यक्तिगत शैक्षिक प्रतिक्रिया",
    start: "हृदय जांच शुरू करें",
    screening: "यह एक प्रारंभिक जांच और शैक्षिक सुविधा है, चिकित्सा निदान नहीं।",
    disclaimer: "चिकित्सा अस्वीकरण",
    disclaimerText: "यह पृष्ठ केवल सामान्य स्वास्थ्य शिक्षा प्रदान करता है। यह किसी बीमारी का निदान, रोकथाम या उपचार नहीं करता। हार्टकेयर की ऑनलाइन जांच चिकित्सकीय परीक्षण का विकल्प नहीं है। व्यक्तिगत चिकित्सा सलाह के लिए योग्य स्वास्थ्य विशेषज्ञ से परामर्श करें।",
    footerText: "अपने दिल के बारे में जानें। सोच-समझकर स्वास्थ्य संबंधी निर्णय लें।",
    copyright: "© २०२६ हार्टकेयर | आपका स्वास्थ्य, हमारी प्राथमिकता"
  }
};

function HealthAwareness() {
  const { language } = useTheme();
  const t = translations[language] || translations.English;

  const cards = [
    { icon: HeartPulse, title: t.bp, text: t.bpText },
    { icon: Activity, title: t.cholesterol, text: t.cholesterolText },
    { icon: Droplets, title: t.sugar, text: t.sugarText }
  ];

  const diseases = [
    { icon: HeartPulse, title: t.coronary, text: t.coronaryText, tag: t.artery },
    { icon: Activity, title: t.arrhythmia, text: t.arrhythmiaText, tag: t.rhythm },
    { icon: ShieldCheck, title: t.failure, text: t.failureText, tag: t.function },
    { icon: Heart, title: t.valve, text: t.valveText, tag: t.valves },
    { icon: Brain, title: t.stroke, text: t.strokeText, tag: t.brain },
    { icon: Stethoscope, title: t.cardiomyopathy, text: t.cardiomyopathyText, tag: t.muscle }
  ];

  const symptoms = [
    { icon: HeartPulse, title: t.chest, text: t.chestText },
    { icon: Activity, title: t.breathing, text: t.breathingText },
    { icon: Droplets, title: t.sweating, text: t.sweatingText },
    { icon: Brain, title: t.weakness, text: t.weaknessText }
  ];

  const habits = [
    { icon: Apple, title: t.diet, text: t.dietText },
    { icon: Footprints, title: t.active, text: t.activeText },
    { icon: Cigarette, title: t.tobacco, text: t.tobaccoText },
    { icon: Moon, title: t.sleep, text: t.sleepText },
    { icon: Stethoscope, title: t.checkups, text: t.checkupsText },
    { icon: ShieldCheck, title: t.advice, text: t.adviceText }
  ];

  const measurements = [
    { icon: Gauge, title: t.bp, text: t.bpText },
    { icon: Droplets, title: t.lipid, text: t.lipidText },
    { icon: Activity, title: t.ecg, text: t.ecgText }
  ];

  return (
    <div className="awareness-page">
      <DashboardSidebar activeKey="/health-awareness" />

      <div className="awareness-page-main">
        <header className="awareness-header">
          <Link to="/" className="awareness-brand">
            <span className="awareness-brand-icon">
              <HeartPulse size={25} />
            </span>
            <span>HeartGuard AI</span>
          </Link>

          <Link to="/" className="awareness-back">
            <ArrowLeft size={18} />
            {t.back}
          </Link>
        </header>

      <main className="awareness-container">
        <section className="awareness-hero">
          <span className="awareness-label">
            <HeartPulse size={15} />
            {t.heroLabel}
          </span>

          <h1>
            {t.heroTitle} <span>{t.heart}</span>
          </h1>

          <p>{t.heroText}</p>

          <div className="awareness-hero-actions">
            <Link to="/assessment" className="awareness-primary-btn">
              {t.check}
              <ArrowRight size={18} />
            </Link>

            <a href="#heart-diseases" className="awareness-secondary-btn">
              {t.explore}
            </a>
          </div>

          <div className="awareness-hero-stats">
            <div><HeartPulse size={21} /><span>{t.health}</span></div>
            <div><ShieldCheck size={21} /><span>{t.prevention}</span></div>
            <div><Activity size={21} /><span>{t.early}</span></div>
          </div>
        </section>

        <section className="awareness-section">
          <div className="awareness-heading">
            <span>{t.basics}</span>
            <h2>{t.understanding}</h2>
            <p>{t.understandingText}</p>
          </div>

          <div className="awareness-grid">
            {cards.map(({ icon: Icon, title, text }) => (
              <article className="awareness-card" key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* HeartExplorer has its own text and is not translated by this file. */}
        <HeartExplorer />

        <section className="awareness-section disease-section" id="heart-diseases">
          <div className="awareness-heading">
            <span>{t.learn}</span>
            <h2>{t.diseases}</h2>
            <p>{t.diseasesText}</p>
          </div>

          <div className="awareness-grid">
            {diseases.map(({ icon: Icon, title, text, tag }) => (
              <article className="awareness-card disease-card" key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="disease-tag">{tag}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="awareness-section symptoms-section">
          <div className="awareness-heading">
            <span>{t.important}</span>
            <h2>{t.warning}</h2>
            <p>{t.warningText}</p>
          </div>

          <div className="awareness-symptoms-grid">
            {symptoms.map(({ icon: Icon, title, text }) => (
              <div className="symptom-item" key={title}>
                <Icon />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="awareness-emergency">
          <AlertTriangle size={32} />
          <div className="awareness-emergency-content">
            <span>{t.emergency}</span>
            <h2>{t.emergencyTitle}</h2>
            <p>{t.emergencyText}</p>
            <p>
              {t.emergencyCall} <strong>112 in India</strong> {t.emergencyExtra}
            </p>
            <Link to="/emergency">
              {t.emergencyButton}
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section className="awareness-section risk-section">
          <div className="awareness-heading">
            <span>{t.risk}</span>
            <h2>{t.riskTitle}</h2>
            <p>{t.riskText}</p>
          </div>

          <div className="risk-grid">
            {t.riskItems.map((item) => (
              <div key={item}>
                <CheckCircle2 /> {item}
              </div>
            ))}
          </div>
        </section>

        <section className="awareness-section lifestyle-section">
          <div className="awareness-heading">
            <span>{t.everyday}</span>
            <h2>{t.lifestyle}</h2>
            <p>{t.lifestyleText}</p>
          </div>

          <div className="habit-list">
            {habits.map(({ icon: Icon, title, text }) => (
              <div className="habit-item" key={title}>
                <Icon />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="awareness-section measurements-section">
          <div className="awareness-heading">
            <span>{t.monitoring}</span>
            <h2>{t.measurements}</h2>
            <p>{t.measurementsText}</p>
          </div>

          <div className="awareness-grid">
            {measurements.map(({ icon: Icon, title, text }) => (
              <article className="awareness-card" key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="awareness-assessment">
          <div className="assessment-decoration">
            <HeartPulse size={110} />
          </div>

          <div className="assessment-content">
            <span className="assessment-label">
              <ClipboardCheck size={16} />
              {t.smart}
            </span>

            <h2>{t.firstStep}</h2>
            <p>{t.assessmentText}</p>

            <div className="assessment-benefits">
              <span><CheckCircle2 /> {t.questionnaire}</span>
              <span><CheckCircle2 /> {t.review}</span>
              <span><CheckCircle2 /> {t.feedback}</span>
            </div>

            <Link to="/assessment" className="awareness-assessment-btn">
              {t.start}
              <ArrowRight size={19} />
            </Link>

            <small>{t.screening}</small>
          </div>
        </section>

        <section className="awareness-disclaimer">
          <ShieldCheck size={24} />
          <div>
            <strong>{t.disclaimer}</strong>
            <p>{t.disclaimerText}</p>
          </div>
        </section>
      </main>

        <footer className="awareness-footer">
          <div className="awareness-footer-brand">
            <HeartPulse size={23} />
            HeartGuard AI
          </div>

          <p>{t.footerText}</p>
          <span>{t.copyright}</span>
        </footer>
      </div>
    </div>
  );
}

export default HealthAwareness;
