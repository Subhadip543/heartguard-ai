
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/useTheme";

import {
  HeartPulse, Menu, X, Activity, ShieldCheck, BrainCircuit,
  Stethoscope, ArrowRight, ChevronRight, Droplets, Wind, Pill,
  Syringe, Hospital, ClipboardList, Sparkles, PhoneCall, Users,
  HeartHandshake, CheckCircle2, Bot
} from "lucide-react";

import "./Home.css";

const translations = {
  English: {
    nav: ["Home", "About", "Features", "Lifeline", "Login", "Get Started"],
    heroBadge: "Your Partner in Heart Health",
    heroTitle: "Take Care of Your Heart.",
    heroTitle2: "Live a Healthier Life.",
    heroDescription: "HeartCare brings together heart-health awareness, intelligent assessment tools, healthcare resources and emergency support to help you make informed decisions about your health.",
    startAssessment: "Start Assessment",
    liveMonitoring: "Live Health Monitoring (Simulated)",
    explorePlatform: "Explore Platform",
    highlights: ["Health Awareness", "AI Assistance", "Emergency Support"],
    heartHealth: "Heart Health",
    understandHealth: "Understand your health",
    stayInformed: "Stay Informed",
    informedDecisions: "Make informed decisions",
    trust: ["Health Awareness", "AI Assistance", "Heart Monitoring", "Healthcare Resources"],
    aboutLabel: "ABOUT HEARTCARE",
    aboutTitle: "Bringing Heart Health",
    aboutTitle2: "Closer to Everyone",
    aboutP1: "HeartCare is a healthcare-focused platform designed to make heart-health information, assessment tools and essential healthcare resources easier to access.",
    aboutP2: "Our goal is to combine technology and healthcare awareness to help people understand potential risks, learn preventive practices and find relevant support.",
    aboutPoints: ["Accessible heart-health information", "Technology-assisted assessment", "Healthcare resource information"],
    exploreHeartCare: "Explore HeartCare",
    aiLabel: "HEARTWISE AI — PREVIEW",
    aiTitle: "Your Intelligent Heart Health Companion",
    aiDescription: "HeartWise AI is a frontend preview companion designed to showcase educational cardiovascular guidance. The backend chat service is not active on this system.",
    exploreAI: "Explore HeartWise AI (Preview)",
    aiDisclaimer: "AI guidance is informational and does not replace professional medical diagnosis or emergency care.",
    lifelineLabel: "HEARTCARE LIFELINE",
    lifelineTitle: "Essential Healthcare",
    lifelineTitle2: "Resources in One Place",
    lifelineDescription: "Find information about important heart-related medicines, emergency injections, medical equipment, blood resources and oxygen support across India.",
    lifelineCategories: ["Heart Medicines", "Emergency Injections", "Medical Equipment", "Blood Resources", "Oxygen Supply", "Healthcare Support"],
    lifelineButton: "Explore HeartCare Lifeline",
    lifelineNote: "Resource information is for reference. Verify availability directly with providers before travelling or purchasing.",
    lifelineCaption: "Care when it matters.",
    lifelineSubcaption: "Healthcare resource information in one place",
    services: "OUR SERVICES",
    featuresTitle: "Everything You Need for",
    featuresTitle2: "Better Heart Health",
    featuresDescription: "Explore the tools and services available through the HeartCare platform.",
    featureTitles: [
      "Heart Risk Assessment", "HeartWise AI (Preview)", "Health Awareness",
      "HeartCare Lifeline (Demo)", "Find Doctors (Demo)", "Emergency Support",
      "Patient Dashboard", "Doctor Portal (Demo)"
    ],
    featureDescriptions: [
      "Evaluate clinical parameters using our trained Random Forest model to understand potential heart-related risk factors.",
      "Explore a conceptual AI companion interface for cardiovascular health guidance (frontend preview mode).",
      "Learn about cardiovascular health, preventive habits, circulatory conditions, and important warning signs.",
      "Explore sample listings for heart-related medicines, emergency equipment, blood and oxygen resource directories.",
      "Discover sample doctor profiles and experience a local demonstration booking workflow.",
      "Access emergency assistance information and nearby hospital directions via interactive map.",
      "Access your personal health dashboard and manage your assessment records.",
      "A simulated appointment management dashboard preview for doctors and healthcare staff."
    ],
    featureLabels: [
      "Start Assessment", "Explore AI", "Learn More", "Explore Resources",
      "Find Doctors", "Get Assistance", "Open Dashboard", "Doctor Portal"
    ],
    emergencyLabel: "EMERGENCY SUPPORT",
    emergencyTitle: "Every Second Matters.",
    emergencyTitle2: "Know Where to Get Help.",
    emergencyDescription: "Access emergency assistance information and healthcare support when you need it. If someone has symptoms of a heart attack, contact local emergency services immediately.",
    emergencyButton: "Access Emergency Support",
    bottomLabel: "YOUR HEALTH MATTERS",
    bottomTitle: "Start Your Heart Health Journey Today",
    bottomDescription: "Explore HeartCare and take a more informed approach to understanding and caring for your heart.",
    footerDescription: "Technology-assisted heart-health awareness, assessment and healthcare resource information.",
    quickLinks: "Quick Links",
    aboutUs: "About Us",
    ourServices: "Our Services",
    riskAssessment: "Risk Assessment",
    account: "Account",
    register: "Register",
    patientDashboard: "Patient Dashboard",
    footerDisclaimer: "HeartCare provides informational support and is not a substitute for professional medical advice.",
    rights: "All Rights Reserved."
  },

  Bengali: {
    nav: ["হোম", "আমাদের সম্পর্কে", "বৈশিষ্ট্য", "লাইফলাইন", "লগইন", "শুরু করুন"],
    heroBadge: "আপনার হৃদ্‌স্বাস্থ্যের সঙ্গী",
    heroTitle: "আপনার হৃদয়ের যত্ন নিন।",
    heroTitle2: "সুস্থ জীবনযাপন করুন।",
    heroDescription: "HeartCare হৃদ্‌স্বাস্থ্য সচেতনতা, স্বাস্থ্য মূল্যায়ন, চিকিৎসা সংক্রান্ত তথ্য এবং জরুরি সহায়তা একসঙ্গে প্রদান করে, যাতে আপনি নিজের স্বাস্থ্য সম্পর্কে সচেতন সিদ্ধান্ত নিতে পারেন।",
    startAssessment: "মূল্যায়ন শুরু করুন",
    liveMonitoring: "লাইভ স্বাস্থ্য পর্যবেক্ষণ (সিমুলেটেড)",
    explorePlatform: "প্ল্যাটফর্ম দেখুন",
    highlights: ["স্বাস্থ্য সচেতনতা", "AI সহায়তা", "জরুরি সহায়তা"],
    heartHealth: "হৃদ্‌স্বাস্থ্য",
    understandHealth: "নিজের স্বাস্থ্য বুঝুন",
    stayInformed: "সচেতন থাকুন",
    informedDecisions: "সঠিক সিদ্ধান্ত নিন",
    trust: ["স্বাস্থ্য সচেতনতা", "AI সহায়তা", "হৃদ্‌স্বাস্থ্য পর্যবেক্ষণ", "চিকিৎসা সংক্রান্ত তথ্য"],
    aboutLabel: "HEARTCARE সম্পর্কে",
    aboutTitle: "হৃদ্‌স্বাস্থ্যকে",
    aboutTitle2: "সবার আরও কাছে নিয়ে আসা",
    aboutP1: "HeartCare একটি স্বাস্থ্যভিত্তিক প্ল্যাটফর্ম, যা হৃদ্‌স্বাস্থ্য সম্পর্কিত তথ্য, স্বাস্থ্য মূল্যায়ন এবং প্রয়োজনীয় চিকিৎসা সংক্রান্ত তথ্য সহজে পেতে সাহায্য করে।",
    aboutP2: "প্রযুক্তি ও স্বাস্থ্য সচেতনতার সমন্বয়ে সম্ভাব্য ঝুঁকি বোঝা, প্রতিরোধমূলক অভ্যাস শেখা এবং প্রয়োজনীয় সহায়তা খুঁজে পেতে সাহায্য করাই আমাদের লক্ষ্য।",
    aboutPoints: ["সহজে হৃদ্‌স্বাস্থ্য সংক্রান্ত তথ্য", "প্রযুক্তিনির্ভর স্বাস্থ্য মূল্যায়ন", "চিকিৎসা সংক্রান্ত তথ্য"],
    exploreHeartCare: "HeartCare দেখুন",
    aiLabel: "HEARTWISE AI — প্রিভিউ",
    aiTitle: "আপনার বুদ্ধিমান হৃদ্‌স্বাস্থ্য সহায়ক",
    aiDescription: "HeartWise AI একটি ফ্রন্টএন্ড প্রিভিউ সহায়ক যা হৃদ্‌স্বাস্থ্য শিক্ষা প্রদর্শনের জন্য তৈরি। এই সিস্টেমে ব্যাকএন্ড চ্যাট পরিষেবা সক্রিয় নয়।",
    exploreAI: "HeartWise AI দেখুন (প্রিভিউ)",
    aiDisclaimer: "AI-এর তথ্য শুধুমাত্র শিক্ষামূলক। এটি চিকিৎসকের রোগ নির্ণয় বা জরুরি চিকিৎসার বিকল্প নয়।",
    lifelineLabel: "HEARTCARE লাইফলাইন",
    lifelineTitle: "প্রয়োজনীয় চিকিৎসা",
    lifelineTitle2: "সংক্রান্ত তথ্য এক জায়গায়",
    lifelineDescription: "ভারতজুড়ে হৃদ্‌রোগের ওষুধ, জরুরি ইনজেকশন, চিকিৎসা সরঞ্জাম, রক্ত এবং অক্সিজেন সহায়তা সম্পর্কে তথ্য খুঁজুন।",
    lifelineCategories: ["হৃদ্‌রোগের ওষুধ", "জরুরি ইনজেকশন", "চিকিৎসা সরঞ্জাম", "রক্তের তথ্য", "অক্সিজেন সরবরাহ", "চিকিৎসা সহায়তা"],
    lifelineButton: "HeartCare লাইফলাইন দেখুন",
    lifelineNote: "এই তথ্য শুধুমাত্র রেফারেন্সের জন্য। যাওয়ার আগে বা কেনার আগে সরবরাহকারীর সঙ্গে যোগাযোগ করে প্রাপ্যতা যাচাই করুন।",
    lifelineCaption: "প্রয়োজনের সময় সহায়তা।",
    lifelineSubcaption: "চিকিৎসা সংক্রান্ত তথ্য এক জায়গায়",
    services: "আমাদের পরিষেবা",
    featuresTitle: "হৃদ্‌স্বাস্থ্যের জন্য",
    featuresTitle2: "আপনার প্রয়োজনীয় সবকিছু",
    featuresDescription: "HeartCare প্ল্যাটফর্মে উপলব্ধ পরিষেবা ও সরঞ্জামগুলি দেখুন।",
    featureTitles: ["হৃদ্‌রোগের ঝুঁকি মূল্যায়ন", "HeartWise AI (প্রিভিউ)", "স্বাস্থ্য সচেতনতা", "HeartCare লাইফলাইন (ডেমো)", "চিকিৎসক খুঁজুন (ডেমো)", "জরুরি সহায়তা", "রোগীর ড্যাশবোর্ড", "চিকিৎসক পোর্টাল (ডেমো)"],
    featureDescriptions: [
      "প্রশিক্ষিত র্যান্ডম ফরেস্ট মডেল ব্যবহার করে গুরুত্বপূর্ণ পরামিতি মূল্যায়নের মাধ্যমে সম্ভাব্য হৃদ্‌রোগের ঝুঁকি জানুন।",
      "হৃদ্‌স্বাস্থ্য বিষয়ক শিক্ষামূলক নির্দেশনার জন্য একটি নমুনা AI সহায়কের ইন্টারফেস দেখুন (ফ্রন্টএন্ড প্রিভিউ)।",
      "হৃদ্‌স্বাস্থ্য, প্রতিরোধমূলক অভ্যাস, সংবহনতন্ত্রের রোগ এবং সতর্কতামূলক লক্ষণ সম্পর্কে জানুন।",
      "হৃদ্‌রোগের ওষুধ, জরুরি সরঞ্জাম, রক্ত এবং অক্সিজেন সংক্রান্ত ডিরেক্টরির নমুনা তালিকা দেখুন।",
      "নমুনা বিশেষজ্ঞ চিকিৎসকের প্রোফাইল ব্রাউজ করুন এবং স্থানীয় ডেমো বুকিং পদ্ধতি পরীক্ষা করুন।",
      "জরুরি সহায়তা এবং মানচিত্রের মাধ্যমে কাছাকাছি হাসপাতালের দিকনির্দেশ পান।",
      "নিজের স্বাস্থ্য ড্যাশবোর্ড এবং মূল্যায়নের রেকর্ড পরিচালনা করুন।",
      "স্বাস্থ্যসেবা পেশাদারদের জন্য অ্যাপয়েন্টমেন্ট পরিচালনার একটি সিমুলেটেড ওয়ার্কস্পেস ডেমো।"
    ],
    featureLabels: ["মূল্যায়ন শুরু করুন", "AI প্রিভিউ", "আরও জানুন", "তথ্য দেখুন", "চিকিৎসক খুঁজুন", "সহায়তা নিন", "ড্যাশবোর্ড খুলুন", "চিকিৎসক পোর্টাল"],
    emergencyLabel: "জরুরি সহায়তা",
    emergencyTitle: "প্রতিটি সেকেন্ড গুরুত্বপূর্ণ।",
    emergencyTitle2: "কোথায় সাহায্য পাবেন জানুন।",
    emergencyDescription: "প্রয়োজনের সময় জরুরি সহায়তা এবং স্বাস্থ্যসেবার তথ্য পান। কারও হার্ট অ্যাটাকের লক্ষণ দেখা দিলে অবিলম্বে স্থানীয় জরুরি পরিষেবায় যোগাযোগ করুন।",
    emergencyButton: "জরুরি সহায়তা নিন",
    bottomLabel: "আপনার স্বাস্থ্য গুরুত্বপূর্ণ",
    bottomTitle: "আজই হৃদ্‌স্বাস্থ্যের যত্ন শুরু করুন",
    bottomDescription: "HeartCare ব্যবহার করে নিজের হৃদ্‌স্বাস্থ্য সম্পর্কে আরও সচেতন হোন।",
    footerDescription: "প্রযুক্তিনির্ভর হৃদ্‌স্বাস্থ্য সচেতনতা, মূল্যায়ন এবং চিকিৎসা সংক্রান্ত তথ্য।",
    quickLinks: "দ্রুত লিঙ্ক",
    aboutUs: "আমাদের সম্পর্কে",
    ourServices: "আমাদের পরিষেবা",
    riskAssessment: "ঝুঁকি মূল্যায়ন",
    account: "অ্যাকাউন্ট",
    register: "নিবন্ধন",
    patientDashboard: "রোগীর ড্যাশবোর্ড",
    footerDisclaimer: "HeartCare তথ্যভিত্তিক সহায়তা প্রদান করে। এটি পেশাদার চিকিৎসকের পরামর্শের বিকল্প নয়।",
    rights: "সর্বস্বত্ব সংরক্ষিত।"
  },

  Hindi: {
    nav: ["होम", "हमारे बारे में", "विशेषताएँ", "लाइफलाइन", "लॉगिन", "शुरू करें"],
    heroBadge: "आपके हृदय स्वास्थ्य का साथी",
    heroTitle: "अपने दिल का ख्याल रखें।",
    heroTitle2: "स्वस्थ जीवन जिएँ।",
    heroDescription: "HeartCare हृदय स्वास्थ्य जागरूकता, मूल्यांकन उपकरण, स्वास्थ्य सेवाओं की जानकारी और आपातकालीन सहायता को एक साथ लाता है, ताकि आप अपने स्वास्थ्य के बारे में सही निर्णय ले सकें।",
    startAssessment: "मूल्यांकन शुरू करें",
    liveMonitoring: "लाइव स्वास्थ्य निगरानी (सिम्युलेटेड)",
    explorePlatform: "प्लेटफ़ॉर्म देखें",
    highlights: ["स्वास्थ्य जागरूकता", "AI सहायता", "आपातकालीन सहायता"],
    heartHealth: "हृदय स्वास्थ्य",
    understandHealth: "अपने स्वास्थ्य को समझें",
    stayInformed: "जानकारी रखें",
    informedDecisions: "सोच-समझकर निर्णय लें",
    trust: ["स्वास्थ्य जागरूकता", "AI सहायता", "हृदय निगरानी", "स्वास्थ्य सेवाओं की जानकारी"],
    aboutLabel: "HEARTCARE के बारे में",
    aboutTitle: "हृदय स्वास्थ्य को",
    aboutTitle2: "हर किसी के करीब लाना",
    aboutP1: "HeartCare एक स्वास्थ्य-केंद्रित प्लेटफ़ॉर्म है, जो हृदय स्वास्थ्य की जानकारी, मूल्यांकन उपकरण और आवश्यक स्वास्थ्य सेवाओं की जानकारी को आसानी से उपलब्ध कराने के लिए बनाया गया है।",
    aboutP2: "हमारा उद्देश्य तकनीक और स्वास्थ्य जागरूकता को जोड़कर लोगों को संभावित जोखिम समझने, बचाव के तरीके सीखने और सही सहायता खोजने में मदद करना है।",
    aboutPoints: ["आसानी से उपलब्ध हृदय स्वास्थ्य जानकारी", "तकनीक-सहायता प्राप्त मूल्यांकन", "स्वास्थ्य सेवाओं की जानकारी"],
    exploreHeartCare: "HeartCare देखें",
    aiLabel: "HEARTWISE AI — पूर्वावलोकन (Preview)",
    aiTitle: "आपका बुद्धिमान हृदय स्वास्थ्य साथी",
    aiDescription: "HeartWise AI एक फ़्रंटएंड पूर्वावलोकन सहायक है जो हृदय स्वास्थ्य मार्गदर्शन प्रदर्शित करने के लिए बनाया गया है। इस सिस्टम पर चैट बैकएंड सेवा सक्रिय नहीं है।",
    exploreAI: "HeartWise AI देखें (Preview)",
    aiDisclaimer: "AI की जानकारी केवल शैक्षिक उद्देश्य के लिए है। यह डॉक्टर की जाँच या आपातकालीन चिकित्सा का विकल्प नहीं है।",
    lifelineLabel: "HEARTCARE लाइफलाइन",
    lifelineTitle: "आवश्यक स्वास्थ्य सेवाओं की",
    lifelineTitle2: "जानकारी एक ही जगह",
    lifelineDescription: "भारत में हृदय संबंधी दवाओं, आपातकालीन इंजेक्शन, चिकित्सा उपकरण, रक्त और ऑक्सीजन सहायता की जानकारी प्राप्त करें।",
    lifelineCategories: ["हृदय की दवाएँ", "आपातकालीन इंजेक्शन", "चिकित्सा उपकरण", "रक्त संसाधन", "ऑक्सीजन आपूर्ति", "स्वास्थ्य सहायता"],
    lifelineButton: "HeartCare लाइफलाइन देखें",
    lifelineNote: "यह जानकारी केवल संदर्भ के लिए है। यात्रा करने या खरीदने से पहले प्रदाता से उपलब्धता की पुष्टि करें।",
    lifelineCaption: "ज़रूरत के समय सहायता।",
    lifelineSubcaption: "स्वास्थ्य सेवाओं की जानकारी एक ही जगह",
    services: "हमारी सेवाएँ",
    featuresTitle: "बेहतर हृदय स्वास्थ्य के लिए",
    featuresTitle2: "आपकी ज़रूरत की हर सुविधा",
    featuresDescription: "HeartCare प्लेटफ़ॉर्म पर उपलब्ध सुविधाओं और सेवाओं को देखें।",
    featureTitles: ["हृदय जोखिम मूल्यांकन", "HeartWise AI (Preview)", "स्वास्थ्य जागरूकता", "HeartCare लाइफलाइन (डेमो)", "डॉक्टर खोजें (डेमो)", "आपातकालीन सहायता", "रोगी डैशबोर्ड", "डॉक्टर पोर्टल (डेमो)"],
    featureDescriptions: [
      "प्रशिक्षित रैंडम फ़ॉरेस्ट मॉडल द्वारा महत्वपूर्ण मापदंडों का मूल्यांकन करके संभावित जोखिम समझें।",
      "हृदय स्वास्थ्य मार्गदर्शन के लिए एक वैचारिक AI साथी इंटरफ़ेस का पूर्वावलोकन करें (फ़्रंटएंड मोड)।",
      "हृदय स्वास्थ्य, बचाव, परिसंचरण स्थितियों और चेतावनी संकेतों के बारे में विस्तार से जानें।",
      "हृदय दवाओं, आपातकालीन उपकरणों, रक्त और ऑक्सीजन प्रदाताओं की नमूना सूची देखें।",
      "विशेषज्ञ डॉक्टरों की प्रोफ़ाइल देखें और स्थानीय डेमो बुकिंग प्रक्रिया का अनुभव करें।",
      "आपातकालीन सहायता और इंटरैक्टिव मानचित्र के माध्यम से नजदीकी अस्पतालों की दिशा प्राप्त करें।",
      "अपने व्यक्तिगत स्वास्थ्य डैशबोर्ड में पिछले रैंडम फ़ॉरेस्ट मूल्यांकन रिकॉर्ड प्रबंधित करें।",
      "स्वास्थ्य पेशेवरों के लिए अपॉइंटमेंट प्रबंधन का एक सिम्युलेटेड वर्कस्पेस पूर्वावलोकन।"
    ],
    featureLabels: ["मूल्यांकन शुरू करें", "AI पूर्वावलोकन", "और जानें", "संसाधन देखें", "डॉक्टर खोजें", "सहायता प्राप्त करें", "डैशबोर्ड खोलें", "डॉक्टर पोर्टल"],
    emergencyLabel: "आपातकालीन सहायता",
    emergencyTitle: "हर सेकंड महत्वपूर्ण है।",
    emergencyTitle2: "जानें सहायता कहाँ मिलेगी।",
    emergencyDescription: "ज़रूरत पड़ने पर आपातकालीन सहायता और स्वास्थ्य सेवाओं की जानकारी प्राप्त करें। यदि किसी में हार्ट अटैक के लक्षण हों, तो तुरंत स्थानीय आपातकालीन सेवाओं से संपर्क करें।",
    emergencyButton: "आपातकालीन सहायता प्राप्त करें",
    bottomLabel: "आपका स्वास्थ्य महत्वपूर्ण है",
    bottomTitle: "आज ही अपने हृदय स्वास्थ्य की यात्रा शुरू करें",
    bottomDescription: "HeartCare देखें और अपने हृदय की देखभाल के बारे में अधिक जानकारी प्राप्त करें।",
    footerDescription: "तकनीक-सहायता प्राप्त हृदय स्वास्थ्य जागरूकता, मूल्यांकन और स्वास्थ्य सेवाओं की जानकारी।",
    quickLinks: "त्वरित लिंक",
    aboutUs: "हमारे बारे में",
    ourServices: "हमारी सेवाएँ",
    riskAssessment: "जोखिम मूल्यांकन",
    account: "खाता",
    register: "रजिस्टर करें",
    patientDashboard: "रोगी डैशबोर्ड",
    footerDisclaimer: "HeartCare जानकारी और सहायता प्रदान करता है। यह पेशेवर चिकित्सा सलाह का विकल्प नहीं है।",
    rights: "सर्वाधिकार सुरक्षित।"
  }
};

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language } = useTheme();

  const t = translations[language] || translations.English;

  useEffect(() => {
    const elements = document.querySelectorAll(".home-page .reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const features = [
    { icon: Activity, link: "/assessment" },
    { icon: BrainCircuit, link: "/heart-assistant" },
    { icon: ClipboardList, link: "/health-awareness" },
    { icon: HeartHandshake, link: "/heart-resources" },
    { icon: Stethoscope, link: "/find-doctors" },
    { icon: PhoneCall, link: "/emergency" },
    { icon: Users, link: "/dashboard" },
    { icon: Hospital, link: "/doctor-dashboard" }
  ];

  const trustIcons = [ShieldCheck, BrainCircuit, HeartPulse, Hospital];

  const lifelineIcons = [Pill, Syringe, Activity, Droplets, Wind, Hospital];

  const aboutIcons = [CheckCircle2, CheckCircle2, CheckCircle2];

  return (
    <div className="home-page">

      {/* NAVIGATION */}
      <nav className="navbar">
        <Link to="/" className="logo" onClick={closeMenu}>
          <HeartPulse size={31} strokeWidth={2.5} />
          <span>HeartCare</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <a href="#home" onClick={closeMenu}>{t.nav[0]}</a>
          <a href="#about" onClick={closeMenu}>{t.nav[1]}</a>
          <a href="#features" onClick={closeMenu}>{t.nav[2]}</a>
          <a href="#lifeline" onClick={closeMenu}>{t.nav[3]}</a>

          <Link to="/login" className="nav-login" onClick={closeMenu}>
            {t.nav[4]}
          </Link>

          <Link to="/register" className="nav-register" onClick={closeMenu}>
            {t.nav[5]}
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={15} />
            {t.heroBadge}
          </div>

          <h1>
            {t.heroTitle}
            <br />
            <span>{t.heroTitle2}</span>
          </h1>

          <p>{t.heroDescription}</p>

          <div className="hero-buttons">
            <Link to="/assessment" className="primary-btn">
              {t.startAssessment}
              <ArrowRight size={18} />
            </Link>

            <Link to="/live-health" className="live-health-home-btn">
              <Activity size={19} />
              {t.liveMonitoring}
              <ArrowRight size={17} />
            </Link>

            <a href="#features" className="secondary-btn">
              {t.explorePlatform}
              <ChevronRight size={18} />
            </a>
          </div>

          <div className="hero-highlights">
            {t.highlights.map((item) => (
              <div key={item}>
                <CheckCircle2 size={17} /> {item}
              </div>
            ))}
          </div>
        </div>

        <div className="hero-image">
          <img src="/heart.jpg" alt="Heart health and medical care" />

          <div className="hero-float-card one">
            <div className="float-icon"><Activity size={23} /></div>
            <div>
              <strong>{t.heartHealth}</strong>
              <span>{t.understandHealth}</span>
            </div>
          </div>

          <div className="hero-float-card two">
            <div className="float-icon"><ShieldCheck size={23} /></div>
            <div>
              <strong>{t.stayInformed}</strong>
              <span>{t.informedDecisions}</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="trust-strip">
        {trustIcons.map((Icon, index) => (
          <div className="trust-item" key={index}>
            <Icon />
            <span>{t.trust[index]}</span>
          </div>
        ))}
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div className="about-image reveal reveal-left">
          <img src="/heart.jpg" alt="HeartCare healthcare awareness" />

          <div className="about-image-badge">
            <HeartPulse size={25} />
            <div>
              <strong>HeartCare</strong>
              <span>Care. Awareness. Support.</span>
            </div>
          </div>
        </div>

        <div className="about-content reveal reveal-right">
          <span className="section-label">{t.aboutLabel}</span>

          <h2>
            {t.aboutTitle}
            <span> {t.aboutTitle2}</span>
          </h2>

          <p>{t.aboutP1}</p>
          <p>{t.aboutP2}</p>

          <div className="about-points">
            {t.aboutPoints.map((point, index) => {
              const Icon = aboutIcons[index];
              return (
                <div key={point}>
                  <Icon />
                  <span>{point}</span>
                </div>
              );
            })}
          </div>

          <Link to="/health-awareness" className="primary-btn">
            {t.exploreHeartCare}
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* HEARTWISE AI */}
      <section className="ai-section">
        <div className="ai-content reveal reveal-up">
          <div className="ai-icon"><Bot size={39} /></div>
          <span className="ai-label">{t.aiLabel}</span>
          <h2>{t.aiTitle}</h2>
          <p>{t.aiDescription}</p>

          <Link to="/heart-assistant" className="ai-button">
            {t.exploreAI}
            <ArrowRight size={18} />
          </Link>

          <div className="ai-disclaimer">
            <ShieldCheck size={16} />
            {t.aiDisclaimer}
          </div>
        </div>
      </section>

      {/* LIFELINE */}
      <section className="lifeline-section" id="lifeline">
        <div className="lifeline-content">
          <div className="lifeline-text reveal reveal-left">
            <span className="section-label">{t.lifelineLabel}</span>

            <h2>
              {t.lifelineTitle}
              <span> {t.lifelineTitle2}</span>
            </h2>

            <p>{t.lifelineDescription}</p>

            <div className="lifeline-categories">
              {lifelineIcons.map((Icon, index) => (
                <div className="lifeline-category" key={index}>
                  <Icon />
                  <span>{t.lifelineCategories[index]}</span>
                </div>
              ))}
            </div>

            <Link to="/heart-resources" className="lifeline-button">
              {t.lifelineButton}
              <ArrowRight size={18} />
            </Link>

            <small className="lifeline-note">{t.lifelineNote}</small>
          </div>

          <div className="lifeline-visual reveal reveal-right">
            <div className="lifeline-orbit lifeline-orbit-one"></div>
            <div className="lifeline-orbit lifeline-orbit-two"></div>

            <div className="lifeline-main-icon">
              <HeartPulse size={88} strokeWidth={1.6} />
            </div>

            <div className="lifeline-panel-caption">
              <span>HEARTCARE LIFELINE</span>
              <strong>{t.lifelineCaption}</strong>
              <small>{t.lifelineSubcaption}</small>
            </div>

            <div className="lifeline-float one"><Pill /></div>
            <div className="lifeline-float two"><Syringe /></div>
            <div className="lifeline-float three"><Droplets /></div>
            <div className="lifeline-float four"><Wind /></div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-heading reveal reveal-up">
          <span>{t.services}</span>
          <h2>
            {t.featuresTitle}
            <br />
            {t.featuresTitle2}
          </h2>
          <p>{t.featuresDescription}</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                className="feature-card reveal reveal-card"
                key={feature.link}
                style={{ "--delay": `${index * 100}ms` }}
              >
                <div className="feature-icon"><Icon size={27} /></div>
                <h3>{t.featureTitles[index]}</h3>
                <p>{t.featureDescriptions[index]}</p>
                <Link to={feature.link}>
                  {t.featureLabels[index]}
                  <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* EMERGENCY */}
      <section className="emergency-section">
        <div className="emergency-content reveal reveal-zoom">
          <div className="emergency-icon"><PhoneCall size={34} /></div>
          <span>{t.emergencyLabel}</span>

          <h2>
            {t.emergencyTitle}
            <br />
            {t.emergencyTitle2}
          </h2>

          <p>{t.emergencyDescription}</p>

          <Link to="/emergency" className="emergency-button">
            {t.emergencyButton}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bottom-cta reveal reveal-up">
        <span className="section-label">{t.bottomLabel}</span>
        <h2>{t.bottomTitle}</h2>
        <p>{t.bottomDescription}</p>

        <Link to="/register" className="primary-btn">
          {t.nav[5]}
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <HeartPulse size={29} />
              HeartCare
            </Link>

            <p>{t.footerDescription}</p>
          </div>

          <div>
            <h4>{t.quickLinks}</h4>
            <Link to="/">{t.nav[0]}</Link>
            <a href="#about">{t.aboutUs}</a>
            <a href="#features">{t.nav[2]}</a>
            <Link to="/heart-resources">{t.nav[3]}</Link>
          </div>

          <div>
            <h4>{t.ourServices}</h4>
            <Link to="/assessment">{t.riskAssessment}</Link>
            <Link to="/heart-assistant">HeartWise AI</Link>
            <Link to="/health-awareness">{t.nav[1]}</Link>
            <Link to="/find-doctors">{t.featureLabels[4]}</Link>
          </div>

          <div>
            <h4>{t.account}</h4>
            <Link to="/login">{t.nav[4]}</Link>
            <Link to="/register">{t.register}</Link>
            <Link to="/dashboard">{t.patientDashboard}</Link>
            <Link to="/emergency">{t.emergencyLabel}</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} HeartCare. {t.rights}
          </p>
          <p>{t.footerDisclaimer}</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
