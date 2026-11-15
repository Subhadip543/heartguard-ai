
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Settings,
  X,
  Sun,
  Moon,
  Bell,
  Accessibility,
  ShieldCheck,
  Globe,
  CalendarClock,
  UserRound,
  Info,
  Type,
  Contrast,
  Zap,
  RotateCcw,
  ChevronRight,
  Clock
} from "lucide-react";

import { useTheme } from "./context/useTheme";
import "./SettingsPanel.css";

// Default settings except global language and font size
const defaults = {
  notifications: true,
  healthAlerts: true,
  appointmentAlerts: true,
  reminders: false,
  reminderTime: "09:00",
  highContrast: false,
  reducedMotion: false
};

// Read saved settings
const readSetting = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);

    return saved === null ? fallback : JSON.parse(saved);
  } catch {
    return fallback;
  }
};

// Settings translations
const translations = {
  English: {
    title: "Settings",
    subtitle: "Personalize your HeartCare experience",
    appearance: "Appearance",
    appearanceDesc: "Choose how HeartCare looks",
    light: "Light Mode",
    dark: "Dark Mode",
    notifications: "Notifications",
    notificationsDesc: "Manage your notification preferences",
    enableNotifications: "Enable Notifications",
    healthAlerts: "Health Alerts",
    healthAlertsDesc: "Receive important health updates",
    appointmentAlerts: "Appointment Alerts",
    appointmentAlertsDesc: "Get appointment reminders",
    accessibility: "Accessibility",
    accessibilityDesc: "Make HeartCare easier to use",
    fontSize: "Font Size",
    small: "Small",
    normal: "Normal",
    large: "Large",
    extraLarge: "Extra Large",
    highContrast: "High Contrast",
    highContrastDesc: "Improve text visibility",
    reducedMotion: "Reduce Motion",
    reducedMotionDesc: "Minimize animations",
    privacy: "Privacy & Security",
    privacyDesc: "Manage your account information",
    profile: "View Account Profile",
    language: "Language",
    languageDesc: "Choose your preferred language",
    reminders: "Health Reminders",
    remindersDesc: "Set a daily health reminder",
    enableReminders: "Enable Daily Reminder",
    reminderTime: "Reminder Time",
    about: "About HeartCare",
    aboutDesc: "Your health matters. HeartCare provides health information and risk-assessment support. It does not replace professional medical advice or emergency care.",
    reset: "Reset Preferences",
    resetDesc: "Restore default settings",
    close: "Close settings",
    saved: "Your preferences have been saved.",
    resetDone: "Your preferences have been reset.",
    permissionDenied: "Notification permission was not granted.",
    unsupported: "Your browser does not support notifications.",
    permissionNeeded: "Please allow notifications in your browser.",
    footer: "HeartCare • Version 1.0.0"
  },

  Hindi: {
    title: "सेटिंग्स",
    subtitle: "अपने HeartCare अनुभव को व्यक्तिगत बनाएं",
    appearance: "दिखावट",
    appearanceDesc: "HeartCare की थीम चुनें",
    light: "लाइट मोड",
    dark: "डार्क मोड",
    notifications: "सूचनाएं",
    notificationsDesc: "सूचनाओं की प्राथमिकताएं प्रबंधित करें",
    enableNotifications: "सूचनाएं चालू करें",
    healthAlerts: "स्वास्थ्य अलर्ट",
    healthAlertsDesc: "महत्वपूर्ण स्वास्थ्य अपडेट प्राप्त करें",
    appointmentAlerts: "अपॉइंटमेंट अलर्ट",
    appointmentAlertsDesc: "अपॉइंटमेंट रिमाइंडर प्राप्त करें",
    accessibility: "सुगम्यता",
    accessibilityDesc: "HeartCare को उपयोग में आसान बनाएं",
    fontSize: "फ़ॉन्ट आकार",
    small: "छोटा",
    normal: "सामान्य",
    large: "बड़ा",
    extraLarge: "बहुत बड़ा",
    highContrast: "हाई कॉन्ट्रास्ट",
    highContrastDesc: "टेक्स्ट को अधिक स्पष्ट बनाएं",
    reducedMotion: "कम एनिमेशन",
    reducedMotionDesc: "एनिमेशन कम करें",
    privacy: "गोपनीयता और सुरक्षा",
    privacyDesc: "अपने अकाउंट की जानकारी प्रबंधित करें",
    profile: "प्रोफ़ाइल देखें",
    language: "भाषा",
    languageDesc: "अपनी पसंदीदा भाषा चुनें",
    reminders: "स्वास्थ्य रिमाइंडर",
    remindersDesc: "दैनिक स्वास्थ्य रिमाइंडर सेट करें",
    enableReminders: "दैनिक रिमाइंडर चालू करें",
    reminderTime: "रिमाइंडर का समय",
    about: "HeartCare के बारे में",
    aboutDesc: "आपका स्वास्थ्य महत्वपूर्ण है। HeartCare स्वास्थ्य जानकारी और जोखिम आकलन में सहायता करता है। यह डॉक्टर की सलाह या आपातकालीन देखभाल का विकल्प नहीं है।",
    reset: "सेटिंग्स रीसेट करें",
    resetDesc: "डिफ़ॉल्ट सेटिंग्स वापस लाएं",
    close: "सेटिंग्स बंद करें",
    saved: "आपकी सेटिंग्स सेव हो गई हैं।",
    resetDone: "आपकी सेटिंग्स रीसेट कर दी गई हैं।",
    permissionDenied: "नोटिफिकेशन की अनुमति नहीं मिली।",
    unsupported: "आपका ब्राउज़र नोटिफिकेशन सपोर्ट नहीं करता।",
    permissionNeeded: "कृपया ब्राउज़र में नोटिफिकेशन की अनुमति दें।",
    footer: "HeartCare • संस्करण 1.0.0"
  },

  Bengali: {
    title: "সেটিংস",
    subtitle: "আপনার HeartCare অভিজ্ঞতা নিজের মতো সাজান",
    appearance: "চেহারা",
    appearanceDesc: "HeartCare-এর থিম নির্বাচন করুন",
    light: "লাইট মোড",
    dark: "ডার্ক মোড",
    notifications: "নোটিফিকেশন",
    notificationsDesc: "নোটিফিকেশন পছন্দ পরিচালনা করুন",
    enableNotifications: "নোটিফিকেশন চালু করুন",
    healthAlerts: "স্বাস্থ্য সতর্কতা",
    healthAlertsDesc: "গুরুত্বপূর্ণ স্বাস্থ্য আপডেট পান",
    appointmentAlerts: "অ্যাপয়েন্টমেন্ট সতর্কতা",
    appointmentAlertsDesc: "অ্যাপয়েন্টমেন্টের রিমাইন্ডার পান",
    accessibility: "অ্যাক্সেসিবিলিটি",
    accessibilityDesc: "HeartCare ব্যবহার আরও সহজ করুন",
    fontSize: "ফন্টের আকার",
    small: "ছোট",
    normal: "স্বাভাবিক",
    large: "বড়",
    extraLarge: "অনেক বড়",
    highContrast: "হাই কনট্রাস্ট",
    highContrastDesc: "লেখা আরও স্পষ্ট করুন",
    reducedMotion: "অ্যানিমেশন কমান",
    reducedMotionDesc: "অ্যানিমেশন কমিয়ে দিন",
    privacy: "গোপনীয়তা ও নিরাপত্তা",
    privacyDesc: "আপনার অ্যাকাউন্টের তথ্য পরিচালনা করুন",
    profile: "প্রোফাইল দেখুন",
    language: "ভাষা",
    languageDesc: "আপনার পছন্দের ভাষা নির্বাচন করুন",
    reminders: "স্বাস্থ্য রিমাইন্ডার",
    remindersDesc: "প্রতিদিনের স্বাস্থ্য রিমাইন্ডার সেট করুন",
    enableReminders: "দৈনিক রিমাইন্ডার চালু করুন",
    reminderTime: "রিমাইন্ডারের সময়",
    about: "HeartCare সম্পর্কে",
    aboutDesc: "আপনার স্বাস্থ্য গুরুত্বপূর্ণ। HeartCare স্বাস্থ্য সম্পর্কিত তথ্য এবং ঝুঁকি মূল্যায়নে সহায়তা করে। এটি চিকিৎসকের পরামর্শ বা জরুরি চিকিৎসার বিকল্প নয়।",
    reset: "সেটিংস রিসেট করুন",
    resetDesc: "ডিফল্ট সেটিংসে ফিরে যান",
    close: "সেটিংস বন্ধ করুন",
    saved: "আপনার পছন্দগুলি সংরক্ষিত হয়েছে।",
    resetDone: "আপনার সেটিংস রিসেট করা হয়েছে।",
    permissionDenied: "নোটিফিকেশনের অনুমতি পাওয়া যায়নি।",
    unsupported: "আপনার ব্রাউজার নোটিফিকেশন সমর্থন করে না।",
    permissionNeeded: "অনুগ্রহ করে ব্রাউজারে নোটিফিকেশনের অনুমতি দিন।",
    footer: "HeartCare • সংস্করণ 1.0.0"
  }
};

// Reusable setting row
function SettingsRow({
  icon: Icon,
  title,
  description,
  children
}) {
  return (
    <div className="hc-settings-row">
      <div className="hc-settings-row-icon">
        <Icon size={19} />
      </div>

      <div className="hc-settings-row-content">
        <h4>{title}</h4>
        {description && <p>{description}</p>}
      </div>

      <div className="hc-settings-row-control">
        {children}
      </div>
    </div>
  );
}

// Reusable toggle switch
function Toggle({
  label,
  checked,
  disabled = false,
  onChange
}) {
  return (
    <label className="hc-switch">
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />

      <span className="hc-switch-slider" />
    </label>
  );
}

export default function SettingsPanel() {
  const navigate = useNavigate();

  // Global settings from ThemeProvider
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    fontSize,
    setFontSize
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  // Other preferences remain local to this panel
  const [preferences, setPreferences] = useState(() => ({
    notifications: readSetting("hc-notifications", defaults.notifications),
    healthAlerts: readSetting("hc-health-alerts", defaults.healthAlerts),
    appointmentAlerts: readSetting("hc-appointment-alerts", defaults.appointmentAlerts),
    reminders: readSetting("hc-reminders", defaults.reminders),
    reminderTime: readSetting("hc-reminder-time", defaults.reminderTime),
    highContrast: readSetting("hc-high-contrast", defaults.highContrast),
    reducedMotion: readSetting("hc-reduced-motion", defaults.reducedMotion)
  }));

  // Select translations using global language
  const t = translations[language] || translations.English;

  // Update notification and accessibility preferences
  const updatePreference = (key, value) => {
    setPreferences((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  // Save panel-specific preferences
  useEffect(() => {
    Object.entries(preferences).forEach(([key, value]) => {
      const storageKey = `hc-${key.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`
      )}`;

      localStorage.setItem(storageKey, JSON.stringify(value));
    });
  }, [preferences]);

  // Apply accessibility preferences globally
  useEffect(() => {
    const root = document.documentElement;

    root.dataset.hcHighContrast = String(preferences.highContrast);
    root.dataset.hcReducedMotion = String(preferences.reducedMotion);
  }, [preferences.highContrast, preferences.reducedMotion]);

  // Request browser notification permission
  const enableBrowserNotifications = async () => {
    if (!("Notification" in window)) {
      setMessage(t.unsupported);
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      setMessage(t.permissionNeeded);
      return false;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        return true;
      }

      setMessage(t.permissionDenied);
      return false;
    } catch {
      setMessage(t.permissionDenied);
      return false;
    }
  };

  // Master notification switch
  const handleMasterNotifications = async (enabled) => {
    if (enabled) {
      const allowed = await enableBrowserNotifications();

      if (!allowed) return;
    }

    updatePreference("notifications", enabled);
    setMessage(enabled ? t.saved : "");
  };

  // Daily reminder switch
  const handleReminders = async (enabled) => {
    if (enabled) {
      const allowed = await enableBrowserNotifications();

      if (!allowed) return;
    }

    updatePreference("reminders", enabled);
    setMessage(enabled ? t.saved : "");
  };

  // Listen for notifications from other pages
  useEffect(() => {
    const handleNotification = (event) => {
      const detail = event.detail || {};
      const type = detail.type;

      const categoryEnabled =
        type === "health"
          ? preferences.healthAlerts
          : type === "appointment"
          ? preferences.appointmentAlerts
          : false;

      if (
        !preferences.notifications ||
        !categoryEnabled ||
        !("Notification" in window) ||
        Notification.permission !== "granted"
      ) {
        return;
      }

      try {
        new Notification(detail.title || "HeartCare", {
          body: detail.body || "You have a new update.",
          icon: "/favicon.ico"
        });
      } catch {
        // Browser may block notifications.
      }
    };

    window.addEventListener(
      "heartcare:notification",
      handleNotification
    );

    return () => {
      window.removeEventListener(
        "heartcare:notification",
        handleNotification
      );
    };
  }, [
    preferences.notifications,
    preferences.healthAlerts,
    preferences.appointmentAlerts
  ]);

  // Daily reminder while the website is open
  useEffect(() => {
    if (!preferences.reminders || !preferences.notifications) {
      return;
    }

    const checkReminder = () => {
      const now = new Date();

      const currentTime =
        `${String(now.getHours()).padStart(2, "0")}:` +
        `${String(now.getMinutes()).padStart(2, "0")}`;

      const today =
        `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

      const alreadySent = localStorage.getItem(
        "hc-reminder-sent-date"
      );

      if (
        currentTime === preferences.reminderTime &&
        alreadySent !== today &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification("HeartCare Health Reminder", {
            body: "Take a moment to check your health and stay active.",
            icon: "/favicon.ico"
          });

          localStorage.setItem(
            "hc-reminder-sent-date",
            today
          );
        } catch {
          // Notification could not be displayed.
        }
      }
    };

    checkReminder();

    const timer = setInterval(checkReminder, 15000);

    return () => clearInterval(timer);
  }, [
    preferences.reminders,
    preferences.notifications,
    preferences.reminderTime
  ]);

  // Close drawer with Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Reset all preferences
  const resetSettings = () => {
    setPreferences({ ...defaults });

    setLanguage("English");
    setFontSize("normal");

    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("hc-") &&
        key !== "hc-reminder-sent-date"
      ) {
        localStorage.removeItem(key);
      }
    });

    setMessage(t.resetDone);
  };

  // Open profile
  const openProfile = () => {
    setIsOpen(false);
    navigate("/profile");
  };

  return (
    <>
      {/* Settings trigger */}
      {!isOpen && (
        <button
          type="button"
          className="hc-settings-trigger"
          onClick={() => setIsOpen(true)}
          aria-label="Open settings"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      )}

      {isOpen && (
        <div
          className="hc-settings-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <aside
            className="hc-settings-drawer"
            data-font-size={fontSize}
            data-high-contrast={String(preferences.highContrast)}
            data-reduced-motion={String(preferences.reducedMotion)}
            role="dialog"
            aria-modal="true"
            aria-label={t.title}
          >
            {/* Header */}
            <div className="hc-settings-header">
              <div className="hc-settings-heading">
                <div className="hc-settings-main-icon">
                  <Settings size={22} />
                </div>

                <div>
                  <h2>{t.title}</h2>
                  <p>{t.subtitle}</p>
                </div>
              </div>

              <button
                type="button"
                className="hc-settings-close"
                onClick={() => setIsOpen(false)}
                aria-label={t.close}
              >
                <X size={21} />
              </button>
            </div>

            <div className="hc-settings-body">

              {/* Appearance */}
              <section className="hc-settings-section">
                <div className="hc-settings-section-title">
                  <Sun size={17} />

                  <div>
                    <h3>{t.appearance}</h3>
                    <p>{t.appearanceDesc}</p>
                  </div>
                </div>

                <div className="hc-theme-options">
                  <button
                    type="button"
                    className={`hc-theme-option ${
                      theme === "light" ? "active" : ""
                    }`}
                    onClick={() => {
                      if (theme !== "light") toggleTheme();
                    }}
                  >
                    <Sun size={19} />
                    <span>{t.light}</span>
                  </button>

                  <button
                    type="button"
                    className={`hc-theme-option ${
                      theme === "dark" ? "active" : ""
                    }`}
                    onClick={() => {
                      if (theme !== "dark") toggleTheme();
                    }}
                  >
                    <Moon size={19} />
                    <span>{t.dark}</span>
                  </button>
                </div>
              </section>

              {/* Notifications */}
              <section className="hc-settings-section">
                <div className="hc-settings-section-title">
                  <Bell size={17} />

                  <div>
                    <h3>{t.notifications}</h3>
                    <p>{t.notificationsDesc}</p>
                  </div>
                </div>

                <SettingsRow
                  icon={Bell}
                  title={t.enableNotifications}
                >
                  <Toggle
                    label={t.enableNotifications}
                    checked={preferences.notifications}
                    onChange={handleMasterNotifications}
                  />
                </SettingsRow>

                <SettingsRow
                  icon={ActivityIcon}
                  title={t.healthAlerts}
                  description={t.healthAlertsDesc}
                >
                  <Toggle
                    label={t.healthAlerts}
                    checked={preferences.healthAlerts}
                    disabled={!preferences.notifications}
                    onChange={(value) =>
                      updatePreference("healthAlerts", value)
                    }
                  />
                </SettingsRow>

                <SettingsRow
                  icon={CalendarClock}
                  title={t.appointmentAlerts}
                  description={t.appointmentAlertsDesc}
                >
                  <Toggle
                    label={t.appointmentAlerts}
                    checked={preferences.appointmentAlerts}
                    disabled={!preferences.notifications}
                    onChange={(value) =>
                      updatePreference("appointmentAlerts", value)
                    }
                  />
                </SettingsRow>
              </section>

              {/* Accessibility */}
              <section className="hc-settings-section">
                <div className="hc-settings-section-title">
                  <Accessibility size={17} />

                  <div>
                    <h3>{t.accessibility}</h3>
                    <p>{t.accessibilityDesc}</p>
                  </div>
                </div>

                <SettingsRow
                  icon={Type}
                  title={t.fontSize}
                >
                  <select
                    className="hc-settings-select"
                    value={fontSize}
                    onChange={(event) =>
                      setFontSize(event.target.value)
                    }
                  >
                    <option value="small">{t.small}</option>
                    <option value="normal">{t.normal}</option>
                    <option value="large">{t.large}</option>
                    <option value="extra-large">{t.extraLarge}</option>
                  </select>
                </SettingsRow>

                <SettingsRow
                  icon={Contrast}
                  title={t.highContrast}
                  description={t.highContrastDesc}
                >
                  <Toggle
                    label={t.highContrast}
                    checked={preferences.highContrast}
                    onChange={(value) =>
                      updatePreference("highContrast", value)
                    }
                  />
                </SettingsRow>

                <SettingsRow
                  icon={Zap}
                  title={t.reducedMotion}
                  description={t.reducedMotionDesc}
                >
                  <Toggle
                    label={t.reducedMotion}
                    checked={preferences.reducedMotion}
                    onChange={(value) =>
                      updatePreference("reducedMotion", value)
                    }
                  />
                </SettingsRow>
              </section>

              {/* Privacy */}
              <section className="hc-settings-section">
                <div className="hc-settings-section-title">
                  <ShieldCheck size={17} />

                  <div>
                    <h3>{t.privacy}</h3>
                    <p>{t.privacyDesc}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="hc-settings-link-row"
                  onClick={openProfile}
                >
                  <span className="hc-settings-link-icon">
                    <UserRound size={18} />
                  </span>

                  <span>{t.profile}</span>

                  <ChevronRight size={18} />
                </button>
              </section>

              {/* Language */}
              <section className="hc-settings-section">
                <div className="hc-settings-section-title">
                  <Globe size={17} />

                  <div>
                    <h3>{t.language}</h3>
                    <p>{t.languageDesc}</p>
                  </div>
                </div>

                <SettingsRow
                  icon={Globe}
                  title={t.language}
                >
                  <select
                    className="hc-settings-select"
                    value={language}
                    onChange={(event) =>
                      setLanguage(event.target.value)
                    }
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिन्दी</option>
                    <option value="Bengali">বাংলা</option>
                  </select>
                </SettingsRow>
              </section>

              {/* Reminders */}
              <section className="hc-settings-section">
                <div className="hc-settings-section-title">
                  <CalendarClock size={17} />

                  <div>
                    <h3>{t.reminders}</h3>
                    <p>{t.remindersDesc}</p>
                  </div>
                </div>

                <SettingsRow
                  icon={Bell}
                  title={t.enableReminders}
                >
                  <Toggle
                    label={t.enableReminders}
                    checked={preferences.reminders}
                    onChange={handleReminders}
                  />
                </SettingsRow>

                {preferences.reminders && (
                  <div className="hc-settings-time">
                    <label htmlFor="hc-reminder-time">
                      <Clock size={16} />
                      {t.reminderTime}
                    </label>

                    <input
                      id="hc-reminder-time"
                      type="time"
                      value={preferences.reminderTime}
                      onChange={(event) =>
                        updatePreference(
                          "reminderTime",
                          event.target.value
                        )
                      }
                    />
                  </div>
                )}
              </section>

              {/* About */}
              <section className="hc-settings-about">
                <div className="hc-settings-about-icon">
                  <Info size={19} />
                </div>

                <div>
                  <h3>{t.about}</h3>
                  <p>{t.aboutDesc}</p>
                </div>
              </section>

              {/* Reset */}
              <button
                type="button"
                className="hc-settings-reset"
                onClick={resetSettings}
              >
                <RotateCcw size={17} />

                <span>
                  <strong>{t.reset}</strong>
                  <small>{t.resetDesc}</small>
                </span>
              </button>

              {message && (
                <p className="hc-settings-message" role="status">
                  {message}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="hc-settings-footer">
              {t.footer}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

// Reusable notification icon
function ActivityIcon(props) {
  return <Bell {...props} />;
}
