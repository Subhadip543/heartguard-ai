
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/useTheme";
import DashboardSidebar from "../DashboardSidebar";

import {
  Activity,
  ArrowLeft,
  HeartPulse,
  Droplets,
  Footprints,
  Moon,
  Watch,
  RefreshCw,
  ShieldCheck,
  Clock,
  Unplug,
  CheckCircle2,
  Bluetooth,
  TrendingUp,
  CalendarDays,
  Info,
  Smartphone
} from "lucide-react";

import "./LiveHealthMonitoring.css";

// ==========================================
// TRANSLATIONS
// ==========================================

const translations = {
  English: {
    back: "Back to Dashboard",
    demoMode: "DEMO MODE",
    title: "Live Health Monitoring",
    subtitle: "Monitor example health readings and activity information.",
    demoNotice: "Demonstration data only",
    demoDescription: "All readings are simulated for frontend testing. They are not collected from your phone, smartwatch or any medical device.",
    deviceConnection: "Device Connection",
    noDevice: "No demo device selected",
    demoSelected: "Demo Selected",
    notConnected: "Not Connected",
    disconnect: "Disconnect",
    connectDevice: "Connect a Device",
    connectDescription: "Choose a service to preview the connection interface.",
    selected: "Selected",
    selectDevice: "Select Device",
    google: "Google Health",
    googleDescription: "Preview Google health service connection",
    fitbit: "Fitbit",
    fitbitDescription: "Preview Fitbit account connection",
    pixel: "Pixel Watch",
    pixelDescription: "Preview Pixel Watch connection",
    ecgLive: "SIMULATED LIVE MONITORING",
    ecgTitle: "ECG Heartbeat Monitor",
    ecgDescription: "Animated illustrative heartbeat waveform",
    ecgSignal: "ECG SIGNAL: DEMO",
    waveform: "WAVEFORM: ANIMATED",
    simulated: "DATA: SIMULATED",
    animationActive: "Heartbeat animation active",
    illustrative: "Illustrative waveform only",
    overview: "Health Overview",
    overviewDescription: "Your simulated health measurements.",
    updating: "Updating...",
    refresh: "Refresh Data",
    heartRate: "Heart Rate",
    oxygen: "Blood Oxygen",
    steps: "Daily Steps",
    sleep: "Sleep",
    bpm: "BPM",
    stepUnit: "steps",
    hours: "hrs",
    pulseDescription: "Simulated pulse reading",
    oxygenDescription: "Simulated SpO₂ reading",
    stepsDescription: "Simulated daily activity",
    sleepDescription: "Example sleep duration",
    demo: "DEMO",
    additional: "Additional Measurements",
    additionalDescription: "More example activity information.",
    resting: "Resting Heart Rate",
    distance: "Walking Distance",
    goal: "Daily Activity Goal",
    source: "Data Source",
    frontendDemo: "Frontend Demo",
    trends: "Heart Rate Trends",
    trendsDescription: "Example heart rate readings throughout the day.",
    simulatedChart: "SIMULATED CHART",
    currentReading: "Current Demo Reading",
    today: "Today",
    recentHistory: "Recent Health History",
    recentDescription: "Recent simulated readings.",
    time: "Time",
    dataType: "Data Type",
    lastUpdated: "Demo data last updated at",
    privacy: "Health Data and Privacy",
    privacyDescription: "This page currently uses fictional demonstration data. No Google account, Fitbit account, Pixel Watch or real health device is connected. Do not use this information for medical decisions.",
    ecgAria: "Illustrative animated ECG waveform",
    chartAria: "Simulated heart rate trend"
  },

  Hindi: {
    back: "डैशबोर्ड पर वापस जाएं",
    demoMode: "डेमो मोड",
    title: "लाइव स्वास्थ्य निगरानी",
    subtitle: "उदाहरण के स्वास्थ्य माप और गतिविधियों की निगरानी करें।",
    demoNotice: "केवल प्रदर्शन डेटा",
    demoDescription: "सभी रीडिंग फ्रंटएंड परीक्षण के लिए बनाई गई हैं। ये आपके फोन, स्मार्टवॉच या किसी मेडिकल डिवाइस से प्राप्त नहीं की गई हैं।",
    deviceConnection: "डिवाइस कनेक्शन",
    noDevice: "कोई डेमो डिवाइस चयनित नहीं है",
    demoSelected: "डेमो चयनित",
    notConnected: "कनेक्ट नहीं है",
    disconnect: "डिस्कनेक्ट करें",
    connectDevice: "डिवाइस कनेक्ट करें",
    connectDescription: "कनेक्शन इंटरफेस देखने के लिए कोई सेवा चुनें।",
    selected: "चयनित",
    selectDevice: "डिवाइस चुनें",
    google: "Google Health",
    googleDescription: "Google स्वास्थ्य सेवा कनेक्शन का पूर्वावलोकन",
    fitbit: "Fitbit",
    fitbitDescription: "Fitbit अकाउंट कनेक्शन का पूर्वावलोकन",
    pixel: "Pixel Watch",
    pixelDescription: "Pixel Watch कनेक्शन का पूर्वावलोकन",
    ecgLive: "सिम्युलेटेड लाइव मॉनिटरिंग",
    ecgTitle: "ECG हार्टबीट मॉनिटर",
    ecgDescription: "एनिमेटेड उदाहरण हार्टबीट वेवफॉर्म",
    ecgSignal: "ECG सिग्नल: डेमो",
    waveform: "वेवफॉर्म: एनिमेटेड",
    simulated: "डेटा: सिम्युलेटेड",
    animationActive: "हार्टबीट एनिमेशन सक्रिय है",
    illustrative: "केवल उदाहरण वेवफॉर्म",
    overview: "स्वास्थ्य अवलोकन",
    overviewDescription: "आपके सिम्युलेटेड स्वास्थ्य माप।",
    updating: "अपडेट हो रहा है...",
    refresh: "डेटा रिफ्रेश करें",
    heartRate: "हृदय गति",
    oxygen: "रक्त ऑक्सीजन",
    steps: "दैनिक कदम",
    sleep: "नींद",
    bpm: "BPM",
    stepUnit: "कदम",
    hours: "घंटे",
    pulseDescription: "सिम्युलेटेड पल्स रीडिंग",
    oxygenDescription: "सिम्युलेटेड SpO₂ रीडिंग",
    stepsDescription: "सिम्युलेटेड दैनिक गतिविधि",
    sleepDescription: "उदाहरण नींद की अवधि",
    demo: "डेमो",
    additional: "अतिरिक्त माप",
    additionalDescription: "अन्य उदाहरण गतिविधि संबंधी जानकारी।",
    resting: "आराम की स्थिति में हृदय गति",
    distance: "चलने की दूरी",
    goal: "दैनिक गतिविधि लक्ष्य",
    source: "डेटा स्रोत",
    frontendDemo: "फ्रंटएंड डेमो",
    trends: "हृदय गति का रुझान",
    trendsDescription: "दिन भर की उदाहरण हृदय गति रीडिंग।",
    simulatedChart: "सिम्युलेटेड चार्ट",
    currentReading: "वर्तमान डेमो रीडिंग",
    today: "आज",
    recentHistory: "हाल का स्वास्थ्य इतिहास",
    recentDescription: "हाल की सिम्युलेटेड रीडिंग।",
    time: "समय",
    dataType: "डेटा प्रकार",
    lastUpdated: "डेमो डेटा अंतिम बार अपडेट हुआ",
    privacy: "स्वास्थ्य डेटा और गोपनीयता",
    privacyDescription: "यह पेज फिलहाल काल्पनिक प्रदर्शन डेटा का उपयोग करता है। कोई Google अकाउंट, Fitbit अकाउंट, Pixel Watch या वास्तविक स्वास्थ्य डिवाइस कनेक्ट नहीं है। इस जानकारी का उपयोग चिकित्सा संबंधी निर्णय लेने के लिए न करें।",
    ecgAria: "उदाहरण एनिमेटेड ECG वेवफॉर्म",
    chartAria: "सिम्युलेटेड हृदय गति का रुझान"
  },

  Bengali: {
    back: "ড্যাশবোর্ডে ফিরে যান",
    demoMode: "ডেমো মোড",
    title: "লাইভ স্বাস্থ্য পর্যবেক্ষণ",
    subtitle: "উদাহরণ স্বাস্থ্য পরিমাপ এবং দৈনন্দিন কার্যকলাপ পর্যবেক্ষণ করুন।",
    demoNotice: "শুধুমাত্র প্রদর্শনের তথ্য",
    demoDescription: "সমস্ত রিডিং ফ্রন্টএন্ড পরীক্ষার জন্য সিমুলেট করা হয়েছে। এগুলি আপনার ফোন, স্মার্টওয়াচ বা কোনো চিকিৎসা যন্ত্র থেকে সংগ্রহ করা হয়নি।",
    deviceConnection: "ডিভাইস সংযোগ",
    noDevice: "কোনো ডেমো ডিভাইস নির্বাচন করা হয়নি",
    demoSelected: "ডেমো নির্বাচন করা হয়েছে",
    notConnected: "সংযুক্ত নয়",
    disconnect: "সংযোগ বিচ্ছিন্ন করুন",
    connectDevice: "ডিভাইস সংযুক্ত করুন",
    connectDescription: "সংযোগের ইন্টারফেস দেখতে একটি পরিষেবা নির্বাচন করুন।",
    selected: "নির্বাচিত",
    selectDevice: "ডিভাইস নির্বাচন করুন",
    google: "Google Health",
    googleDescription: "Google স্বাস্থ্য পরিষেবা সংযোগের প্রিভিউ",
    fitbit: "Fitbit",
    fitbitDescription: "Fitbit অ্যাকাউন্ট সংযোগের প্রিভিউ",
    pixel: "Pixel Watch",
    pixelDescription: "Pixel Watch সংযোগের প্রিভিউ",
    ecgLive: "সিমুলেটেড লাইভ পর্যবেক্ষণ",
    ecgTitle: "ECG হার্টবিট মনিটর",
    ecgDescription: "অ্যানিমেটেড উদাহরণ হার্টবিট ওয়েভফর্ম",
    ecgSignal: "ECG সিগন্যাল: ডেমো",
    waveform: "ওয়েভফর্ম: অ্যানিমেটেড",
    simulated: "তথ্য: সিমুলেটেড",
    animationActive: "হার্টবিট অ্যানিমেশন সক্রিয়",
    illustrative: "শুধুমাত্র উদাহরণ ওয়েভফর্ম",
    overview: "স্বাস্থ্য সংক্ষিপ্ত বিবরণ",
    overviewDescription: "আপনার সিমুলেটেড স্বাস্থ্য পরিমাপ।",
    updating: "আপডেট হচ্ছে...",
    refresh: "তথ্য রিফ্রেশ করুন",
    heartRate: "হৃদস্পন্দনের হার",
    oxygen: "রক্তের অক্সিজেন",
    steps: "দৈনিক পদক্ষেপ",
    sleep: "ঘুম",
    bpm: "BPM",
    stepUnit: "পদক্ষেপ",
    hours: "ঘণ্টা",
    pulseDescription: "সিমুলেটেড পালস রিডিং",
    oxygenDescription: "সিমুলেটেড SpO₂ রিডিং",
    stepsDescription: "সিমুলেটেড দৈনিক কার্যকলাপ",
    sleepDescription: "উদাহরণ ঘুমের সময়কাল",
    demo: "ডেমো",
    additional: "অতিরিক্ত পরিমাপ",
    additionalDescription: "আরও উদাহরণ কার্যকলাপের তথ্য।",
    resting: "বিশ্রামকালীন হৃদস্পন্দনের হার",
    distance: "হাঁটার দূরত্ব",
    goal: "দৈনিক কার্যকলাপের লক্ষ্য",
    source: "তথ্যের উৎস",
    frontendDemo: "ফ্রন্টএন্ড ডেমো",
    trends: "হৃদস্পন্দনের প্রবণতা",
    trendsDescription: "সারাদিনের উদাহরণ হৃদস্পন্দনের রিডিং।",
    simulatedChart: "সিমুলেটেড চার্ট",
    currentReading: "বর্তমান ডেমো রিডিং",
    today: "আজ",
    recentHistory: "সাম্প্রতিক স্বাস্থ্য ইতিহাস",
    recentDescription: "সাম্প্রতিক সিমুলেটেড রিডিং।",
    time: "সময়",
    dataType: "তথ্যের ধরন",
    lastUpdated: "ডেমো তথ্য সর্বশেষ আপডেট হয়েছে",
    privacy: "স্বাস্থ্য তথ্য এবং গোপনীয়তা",
    privacyDescription: "এই পৃষ্ঠায় বর্তমানে কাল্পনিক প্রদর্শনী তথ্য ব্যবহার করা হচ্ছে। কোনো Google অ্যাকাউন্ট, Fitbit অ্যাকাউন্ট, Pixel Watch বা বাস্তব স্বাস্থ্য যন্ত্র সংযুক্ত নেই। চিকিৎসা সংক্রান্ত সিদ্ধান্ত নেওয়ার জন্য এই তথ্য ব্যবহার করবেন না।",
    ecgAria: "উদাহরণ অ্যানিমেটেড ECG ওয়েভফর্ম",
    chartAria: "সিমুলেটেড হৃদস্পন্দনের প্রবণতা"
  }
};

// ==========================================
// DEMO DATA ONLY
// ==========================================

const initialHealthData = {
  heartRate: 76,
  oxygen: 98,
  steps: 6240,
  sleep: 7.2,
  distance: 4.3,
  restingHeartRate: 68
};

const initialHistory = [
  { time: "6 AM", heartRate: 69, oxygen: 98 },
  { time: "8 AM", heartRate: 74, oxygen: 97 },
  { time: "10 AM", heartRate: 78, oxygen: 98 },
  { time: "12 PM", heartRate: 81, oxygen: 98 },
  { time: "2 PM", heartRate: 76, oxygen: 99 },
  { time: "4 PM", heartRate: 73, oxygen: 98 },
  { time: "6 PM", heartRate: 76, oxygen: 98 }
];

const devices = [
  {
    id: "google",
    name: "Google Health",
    descriptionKey: "googleDescription",
    nameKey: "google",
    icon: Activity
  },
  {
    id: "fitbit",
    name: "Fitbit",
    descriptionKey: "fitbitDescription",
    nameKey: "fitbit",
    icon: Watch
  },
  {
    id: "pixel",
    name: "Pixel Watch",
    descriptionKey: "pixelDescription",
    nameKey: "pixel",
    icon: Bluetooth
  }
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function LiveHealthMonitoring() {
  const navigate = useNavigate();
  const { language } = useTheme();

  const selectedLanguage =
    translations[language] ? language : "English";

  const t = translations[selectedLanguage];

  const [healthData, setHealthData] = useState(initialHealthData);
  const [history, setHistory] = useState(initialHistory);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("heartcareToken");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Generate new demo readings
  const updateDemoData = () => {
    setHealthData((previous) => {
      const nextHeartRate = Math.max(
        60,
        Math.min(
          100,
          previous.heartRate + Math.floor(Math.random() * 7) - 3
        )
      );

      const nextOxygen = Math.max(
        95,
        Math.min(
          100,
          previous.oxygen + Math.floor(Math.random() * 3) - 1
        )
      );

      const nextSteps =
        previous.steps + Math.floor(Math.random() * 20) + 5;

      return {
        ...previous,
        heartRate: nextHeartRate,
        oxygen: nextOxygen,
        steps: nextSteps,
        distance: Number((nextSteps / 1450).toFixed(1))
      };
    });

    setLastUpdated(new Date());

    setHistory((previous) => {
      const latest = previous[previous.length - 1];

      return [
        ...previous.slice(1),
        {
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          }),
          heartRate: Math.max(
            60,
            Math.min(
              100,
              latest.heartRate + Math.floor(Math.random() * 7) - 3
            )
          ),
          oxygen: Math.max(
            95,
            Math.min(
              100,
              latest.oxygen + Math.floor(Math.random() * 3) - 1
            )
          )
        }
      ];
    });
  };

  // Automatic demo update
  useEffect(() => {
    const interval = setInterval(updateDemoData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    if (refreshing) return;

    setRefreshing(true);
    updateDemoData();

    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  // Device selection (demo only)
  const handleConnect = (deviceId) => {
    setSelectedDevice(deviceId);
    setConnected(true);
  };

  const handleDisconnect = () => {
    setSelectedDevice(null);
    setConnected(false);
  };

  const updatedTime = lastUpdated.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  // Health metrics
  const metrics = [
    {
      title: t.heartRate,
      value: healthData.heartRate,
      unit: t.bpm,
      description: t.pulseDescription,
      icon: HeartPulse,
      className: "metric-heart"
    },
    {
      title: t.oxygen,
      value: healthData.oxygen,
      unit: "%",
      description: t.oxygenDescription,
      icon: Droplets,
      className: "metric-oxygen"
    },
    {
      title: t.steps,
      value: healthData.steps.toLocaleString(),
      unit: t.stepUnit,
      description: t.stepsDescription,
      icon: Footprints,
      className: "metric-steps"
    },
    {
      title: t.sleep,
      value: healthData.sleep,
      unit: t.hours,
      description: t.sleepDescription,
      icon: Moon,
      className: "metric-sleep"
    }
  ];

  const ecgPath =
    "M0 90 H180 L205 90 L225 75 L245 110 L270 25 L300 145 L325 90 H430 L455 90 L475 78 L495 105 L520 35 L550 140 L575 90 H700 L725 90 L745 75 L765 110 L790 25 L820 145 L845 90 H960 L985 90 L1005 75 L1025 110 L1050 25 L1080 145 L1105 90 H1200";

  return (
    <div className="live-health-page">
      <DashboardSidebar activeKey="/live-health" />

      <div className="live-health-page-main">
        {/* TOPBAR */}
        <div className="live-health-topbar">
        <Link to="/dashboard" className="live-back-link">
          <ArrowLeft size={18} />
          {t.back}
        </Link>

        <span className="demo-mode-badge">
          <Info size={14} />
          {t.demoMode}
        </span>
      </div>

      {/* PAGE HEADING */}
      <section className="live-health-heading">
        <div className="live-heading-icon">
          <Activity size={28} />
        </div>

        <div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </section>

      {/* DEMO NOTICE */}
      <div className="demo-notice">
        <Info size={20} />

        <div>
          <strong>{t.demoNotice}</strong>
          <p>{t.demoDescription}</p>
        </div>
      </div>

      {/* DEVICE CONNECTION */}
      <section className="health-connection-card">
        <div className="connection-left">
          <div className="connection-main-icon">
            <Watch size={28} />
          </div>

          <div>
            <h2>{t.deviceConnection}</h2>

            <p>
              {connected
                ? `${devices.find((device) => device.id === selectedDevice)?.name} demo selection`
                : t.noDevice}
            </p>

            <span
              className={
                connected
                  ? "connection-status connected"
                  : "connection-status disconnected"
              }
            >
              <span className="status-dot" />
              {connected ? t.demoSelected : t.notConnected}
            </span>
          </div>
        </div>

        {connected && (
          <button
            className="disconnect-health-btn"
            onClick={handleDisconnect}
          >
            <Unplug size={17} />
            {t.disconnect}
          </button>
        )}
      </section>

      {/* DEVICE OPTIONS */}
      <section className="device-section">
        <div className="section-heading">
          <div>
            <h2>{t.connectDevice}</h2>
            <p>{t.connectDescription}</p>
          </div>
        </div>

        <div className="device-grid">
          {devices.map((device) => {
            const Icon = device.icon;
            const isSelected = selectedDevice === device.id;

            return (
              <div className="device-card" key={device.id}>
                <div className="device-card-top">
                  <div className="device-icon">
                    <Icon size={25} />
                  </div>

                  {isSelected && (
                    <span className="device-selected">
                      <CheckCircle2 size={14} />
                      {t.selected}
                    </span>
                  )}
                </div>

                <h3>{t[device.nameKey]}</h3>
                <p>{t[device.descriptionKey]}</p>

                <button
                  className={
                    isSelected
                      ? "device-action-btn selected"
                      : "device-action-btn"
                  }
                  onClick={() => handleConnect(device.id)}
                >
                  {isSelected ? t.selected : t.selectDevice}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ECG MONITOR */}
      <section className="ecg-monitor-card">
        <div className="ecg-monitor-header">
          <div>
            <span className="ecg-live-label">
              <span className="ecg-live-dot" />
              {t.ecgLive}
            </span>

            <h2>{t.ecgTitle}</h2>
            <p>{t.ecgDescription}</p>
          </div>

          <div className="ecg-current-rate">
            <HeartPulse size={25} />

            <div>
              <strong>{healthData.heartRate}</strong>
              <span>{t.bpm}</span>
            </div>
          </div>
        </div>

        <div className="ecg-screen">
          <div className="ecg-grid" />

          <div className="ecg-wave-container">
            <svg
              className="ecg-wave-svg"
              viewBox="0 0 1200 180"
              preserveAspectRatio="none"
              role="img"
              aria-label={t.ecgAria}
            >
              <path className="ecg-wave-glow" d={ecgPath} />
              <path className="ecg-wave-line" d={ecgPath} />
            </svg>
          </div>

          <div className="ecg-scan-line" />

          <div className="ecg-screen-footer">
            <span>{t.ecgSignal}</span>
            <span>{t.waveform}</span>
            <span>{t.simulated}</span>
          </div>
        </div>

        <div className="ecg-bottom-info">
          <div>
            <span className="ecg-info-dot" />
            {t.animationActive}
          </div>

          <span>{t.illustrative}</span>
        </div>
      </section>

      {/* HEALTH OVERVIEW */}
      <section className="health-overview-section">
        <div className="section-heading overview-heading">
          <div>
            <h2>{t.overview}</h2>
            <p>{t.overviewDescription}</p>
          </div>

          <button
            className="refresh-health-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "refresh-spinning" : ""}
            />
            {refreshing ? t.updating : t.refresh}
          </button>
        </div>

        <div className="health-metric-grid">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <div className="health-metric-card" key={metric.title}>
                <div className="metric-card-top">
                  <div className={`metric-icon ${metric.className}`}>
                    <Icon size={23} />
                  </div>

                  <span className="metric-demo-label">
                    {t.demo}
                  </span>
                </div>

                <p className="metric-title">{metric.title}</p>

                <h3>
                  {metric.value}
                  <span>{metric.unit}</span>
                </h3>

                <p className="metric-description">
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ADDITIONAL MEASUREMENTS */}
      <section className="additional-health-card">
        <div className="section-heading">
          <div>
            <h2>{t.additional}</h2>
            <p>{t.additionalDescription}</p>
          </div>
        </div>

        <div className="additional-health-grid">
          <div className="additional-metric">
            <div className="additional-metric-icon">
              <HeartPulse size={21} />
            </div>

            <div>
              <span>{t.resting}</span>
              <strong>{healthData.restingHeartRate} {t.bpm}</strong>
            </div>
          </div>

          <div className="additional-metric">
            <div className="additional-metric-icon">
              <Footprints size={21} />
            </div>

            <div>
              <span>{t.distance}</span>
              <strong>{healthData.distance} km</strong>
            </div>
          </div>

          <div className="additional-metric">
            <div className="additional-metric-icon">
              <TrendingUp size={21} />
            </div>

            <div>
              <span>{t.goal}</span>
              <strong>10,000 {t.stepUnit}</strong>
            </div>
          </div>

          <div className="additional-metric">
            <div className="additional-metric-icon">
              <Smartphone size={21} />
            </div>

            <div>
              <span>{t.source}</span>
              <strong>{t.frontendDemo}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* HEART RATE CHART */}
      <section className="health-chart-card">
        <div className="section-heading">
          <div>
            <h2>{t.trends}</h2>
            <p>{t.trendsDescription}</p>
          </div>

          <span className="chart-demo-label">
            {t.simulatedChart}
          </span>
        </div>

        <div className="chart-summary">
          <div>
            <span>{t.currentReading}</span>

            <strong>
              {healthData.heartRate}
              <small> {t.bpm}</small>
            </strong>
          </div>

          <div className="chart-period">
            <CalendarDays size={16} />
            {t.today}
          </div>
        </div>

        <div className="health-chart">
          <div className="chart-y-labels">
            <span>110</span>
            <span>90</span>
            <span>70</span>
            <span>50</span>
          </div>

          <div className="chart-plot">
            <div className="chart-grid-lines">
              <span />
              <span />
              <span />
              <span />
            </div>

            <svg
              className="heart-rate-svg"
              viewBox="0 0 600 190"
              preserveAspectRatio="none"
              role="img"
              aria-label={t.chartAria}
            >
              <polyline
                points={history
                  .map((item, index) => {
                    const x =
                      (index / (history.length - 1)) * 600;

                    const y =
                      190 - ((item.heartRate - 50) / 60) * 190;

                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {history.map((item, index) => {
                const x =
                  (index / (history.length - 1)) * 600;

                const y =
                  190 - ((item.heartRate - 50) / 60) * 190;

                return (
                  <circle
                    key={`${item.time}-${index}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="currentColor"
                  />
                );
              })}
            </svg>

            <div className="chart-x-labels">
              {history.map((item, index) => (
                <span key={`${item.time}-${index}`}>
                  {item.time}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HEALTH HISTORY */}
      <section className="health-history-card">
        <div className="section-heading">
          <div>
            <h2>{t.recentHistory}</h2>
            <p>{t.recentDescription}</p>
          </div>
        </div>

        <div className="health-table-wrapper">
          <table className="health-history-table">
            <thead>
              <tr>
                <th>{t.time}</th>
                <th>{t.heartRate}</th>
                <th>{t.oxygen}</th>
                <th>{t.dataType}</th>
              </tr>
            </thead>

            <tbody>
              {[...history].reverse().map((item, index) => (
                <tr key={`${item.time}-${index}`}>
                  <td>{item.time}</td>
                  <td>{item.heartRate} {t.bpm}</td>
                  <td>{item.oxygen}%</td>
                  <td>
                    <span className="history-demo-tag">
                      {t.demo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* LAST UPDATED */}
      <div className="health-sync-info">
        <Clock size={17} />
        {t.lastUpdated} {updatedTime}
      </div>

      {/* PRIVACY NOTICE */}
      <section className="health-privacy-notice">
        <ShieldCheck size={24} />

        <div>
          <h3>{t.privacy}</h3>
          <p>{t.privacyDescription}</p>
        </div>
      </section>
      </div>

    </div>
  );
}
