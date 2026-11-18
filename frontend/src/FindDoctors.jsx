import { useTheme } from "./context/useTheme";
import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Stethoscope,
  CalendarDays,
  IndianRupee,
  ArrowLeft,
  X,
  UserRound
} from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";

import "./FindDoctors.css";

const STORAGE_KEY = "heartcare-appointments";

const doctors = [
  {
    id: 1,
    name: "Dr. Anirban Sen",
    specialization: "Cardiologist",
    experience: 12,
    fee: 800,
    rating: 4.8,
    availability: "Today",
    initials: "AS"
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialization: "Cardiologist",
    experience: 9,
    fee: 700,
    rating: 4.7,
    availability: "Tomorrow",
    initials: "PS"
  },
  {
    id: 3,
    name: "Dr. Rahul Das",
    specialization: "General Physician",
    experience: 8,
    fee: 500,
    rating: 4.6,
    availability: "Today",
    initials: "RD"
  },
  {
    id: 4,
    name: "Dr. Sneha Roy",
    specialization: "Cardiac Surgeon",
    experience: 15,
    fee: 1200,
    rating: 4.9,
    availability: "Tomorrow",
    initials: "SR"
  },
  {
    id: 5,
    name: "Dr. Arijit Ghosh",
    specialization: "Cardiologist",
    experience: 6,
    fee: 600,
    rating: 4.5,
    availability: "Today",
    initials: "AG"
  },
  {
    id: 6,
    name: "Dr. Meera Das",
    specialization: "General Physician",
    experience: 10,
    fee: 550,
    rating: 4.7,
    availability: "Tomorrow",
    initials: "MD"
  }
];

const translations = {
  English: {
    directory: "Doctor Directory",
    dashboard: "Patient Dashboard",
    eyebrow: "YOUR HEALTH MATTERS",
    heading: "Find the Right Doctor",
    intro: "Explore healthcare professionals and choose a doctor for your consultation.",
    search: "Search by doctor name or specialization...",
    specialization: "Specialization",
    allSpecializations: "All Specializations",
    cardiologist: "Cardiologist",
    cardiacSurgeon: "Cardiac Surgeon",
    generalPhysician: "General Physician",
    availableDoctors: "Available Doctors",
    doctorFound: "doctor(s) found",
    years: "years experience",
    fee: "consultation fee",
    available: "Available",
    today: "Today",
    tomorrow: "Tomorrow",
    book: "Book Appointment",
    noDoctors: "No doctors found",
    noDoctorsText: "Try another name or select a different specialization.",
    clear: "Clear Filters",
    demoNotice: "Demo directory: doctor profiles, fees, ratings and availability are sample information, not verified real-world listings.",
    close: "Close booking form",
    bookTitle: "Book an Appointment",
    patientName: "Patient Name",
    enterName: "Enter your full name",
    appointmentDate: "Appointment Date",
    preferredTime: "Preferred Time",
    consultationFee: "Consultation Fee:",
    submit: "Submit Booking Request",
    invalidDate: "Please select today or a future date.",
    saveError: "Unable to save the booking. Please try again.",
    savedTitle: "Booking Request Saved",
    savedMessage: (name, date, time) =>
      `Your request for ${name} on ${date} at ${time} has been saved.`,
    warning: "Demo notice: This request is saved in this browser's local storage only. Doctor profiles, ratings, fees and availability are sample data. This booking is for demonstration and has NOT been sent to or accepted by a real doctor.",
    done: "Done",
    consultation: "Consultation",
    pending: "Pending",
    video: "Video"
  },

  Bengali: {
    directory: "ডাক্তার তালিকা",
    dashboard: "রোগীর ড্যাশবোর্ড",
    eyebrow: "আপনার স্বাস্থ্য গুরুত্বপূর্ণ",
    heading: "সঠিক ডাক্তার খুঁজুন",
    intro: "স্বাস্থ্য বিশেষজ্ঞদের দেখুন এবং পরামর্শের জন্য একজন ডাক্তার বেছে নিন।",
    search: "ডাক্তারের নাম বা বিশেষজ্ঞতা দিয়ে খুঁজুন...",
    specialization: "বিশেষজ্ঞতা",
    allSpecializations: "সব বিশেষজ্ঞতা",
    cardiologist: "হৃদরোগ বিশেষজ্ঞ",
    cardiacSurgeon: "হৃদযন্ত্রের শল্যচিকিৎসক",
    generalPhysician: "সাধারণ চিকিৎসক",
    availableDoctors: "উপলব্ধ ডাক্তার",
    doctorFound: "জন ডাক্তার পাওয়া গেছে",
    years: "বছরের অভিজ্ঞতা",
    fee: "পরামর্শের ফি",
    available: "উপলব্ধ",
    today: "আজ",
    tomorrow: "আগামীকাল",
    book: "অ্যাপয়েন্টমেন্ট বুক করুন",
    noDoctors: "কোনো ডাক্তার পাওয়া যায়নি",
    noDoctorsText: "অন্য নাম দিয়ে খুঁজুন অথবা অন্য বিশেষজ্ঞতা নির্বাচন করুন।",
    clear: "ফিল্টার মুছুন",
    demoNotice: "ডেমো তালিকা: ডাক্তারদের প্রোফাইল, ফি, রেটিং এবং সময়সূচি নমুনা তথ্য; এগুলি যাচাই করা বাস্তব তালিকা নয়।",
    close: "বুকিং ফর্ম বন্ধ করুন",
    bookTitle: "অ্যাপয়েন্টমেন্ট বুক করুন",
    patientName: "রোগীর নাম",
    enterName: "আপনার পুরো নাম লিখুন",
    appointmentDate: "অ্যাপয়েন্টমেন্টের তারিখ",
    preferredTime: "পছন্দের সময়",
    consultationFee: "পরামর্শের ফি:",
    submit: "বুকিং অনুরোধ জমা দিন",
    invalidDate: "আজকের দিন অথবা ভবিষ্যতের কোনো তারিখ নির্বাচন করুন।",
    saveError: "বুকিং সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।",
    savedTitle: "বুকিং অনুরোধ সংরক্ষিত হয়েছে",
    savedMessage: (name, date, time) =>
      `${date} তারিখে ${time} সময়ে ${name}-এর জন্য আপনার অনুরোধ সংরক্ষিত হয়েছে।`,
    warning: "ডেমো তথ্য: এই অনুরোধটি শুধুমাত্র এই ব্রাউজারের লোকাল স্টোরেজে সংরক্ষিত হয়েছে। ডাক্তারদের প্রোফাইল, রেটিং, ফি ও সময়সূচি নমুনা ডেটা। এটি প্রদর্শনের জন্য এবং কোনো প্রকৃত ডাক্তারের কাছে পাঠানো বা গৃহীত হয়নি।",
    done: "সম্পন্ন",
    consultation: "পরামর্শ",
    pending: "অপেক্ষমাণ",
    video: "ভিডিও"
  },

  Hindi: {
    directory: "डॉक्टर सूची",
    dashboard: "मरीज़ डैशबोर्ड",
    eyebrow: "आपका स्वास्थ्य महत्वपूर्ण है",
    heading: "सही डॉक्टर खोजें",
    intro: "स्वास्थ्य विशेषज्ञों को देखें और परामर्श के लिए डॉक्टर चुनें।",
    search: "डॉक्टर का नाम या विशेषज्ञता खोजें...",
    specialization: "विशेषज्ञता",
    allSpecializations: "सभी विशेषज्ञताएँ",
    cardiologist: "हृदय रोग विशेषज्ञ",
    cardiacSurgeon: "हृदय शल्य चिकित्सक",
    generalPhysician: "सामान्य चिकित्सक",
    availableDoctors: "उपलब्ध डॉक्टर",
    doctorFound: "डॉक्टर मिले",
    years: "वर्षों का अनुभव",
    fee: "परामर्श शुल्क",
    available: "उपलब्ध",
    today: "आज",
    tomorrow: "कल",
    book: "अपॉइंटमेंट बुक करें",
    noDoctors: "कोई डॉक्टर नहीं मिला",
    noDoctorsText: "दूसरा नाम खोजें या कोई अन्य विशेषज्ञता चुनें।",
    clear: "फ़िल्टर हटाएँ",
    demoNotice: "डेमो सूची: डॉक्टरों की प्रोफ़ाइल, शुल्क, रेटिंग और उपलब्धता नमूना जानकारी है, सत्यापित वास्तविक सूची नहीं।",
    close: "बुकिंग फ़ॉर्म बंद करें",
    bookTitle: "अपॉइंटमेंट बुक करें",
    patientName: "मरीज़ का नाम",
    enterName: "अपना पूरा नाम दर्ज करें",
    appointmentDate: "अपॉइंटमेंट की तारीख",
    preferredTime: "पसंदीदा समय",
    consultationFee: "परामर्श शुल्क:",
    submit: "बुकिंग अनुरोध जमा करें",
    invalidDate: "कृपया आज या भविष्य की कोई तारीख चुनें।",
    saveError: "बुकिंग सेव नहीं हो सकी। कृपया पुनः प्रयास करें।",
    savedTitle: "बुकिंग अनुरोध सेव हो गया",
    savedMessage: (name, date, time) =>
      `${date} को ${time} बजे ${name} के लिए आपका अनुरोध सेव हो गया है।`,
    warning: "डेमो सूचना: यह अनुरोध केवल इस ब्राउज़र के लोकल स्टोरेज में सेव हुआ है। डॉक्टरों की प्रोफ़ाइल, रेटिंग, शुल्क और समय केवल नमूना डेटा हैं। यह बुकिंग केवल प्रदर्शन के लिए है और किसी वास्तविक डॉक्टर को नहीं भेजी गई है।",
    done: "हो गया",
    consultation: "परामर्श",
    pending: "लंबित",
    video: "वीडियो"
  }
};

function FindDoctors() {
  const navigate = useNavigate();
  const { language } = useTheme();
  const t = translations[language] || translations.English;

  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientName, setPatientName] = useState(() => {
    try {
      const cached = sessionStorage.getItem("heartcarePatient");
      return cached ? JSON.parse(cached).name || "" : "";
    } catch {
      return "";
    }
  });
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("heartcareToken");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const currentDay = String(now.getDate()).padStart(2, "0");
  const today = `${currentYear}-${currentMonth}-${currentDay}`;

  const specializationLabels = useMemo(() => ({
    Cardiologist: t.cardiologist,
    "Cardiac Surgeon": t.cardiacSurgeon,
    "General Physician": t.generalPhysician
  }), [t]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (specializationLabels[doctor.specialization] || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesSpecialization =
        specialization === "All" ||
        doctor.specialization === specialization;

      return matchesSearch && matchesSpecialization;
    });
  }, [searchTerm, specialization, specializationLabels]);

  function openBooking(doctor) {
    setSelectedDoctor(doctor);
    setConfirmation("");
    setPatientName("");
    setAppointmentDate("");
    setAppointmentTime("");
  }

  function closeBooking() {
    setSelectedDoctor(null);
    setConfirmation("");
  }

  function handleBooking(event) {
    event.preventDefault();

    if (
      !selectedDoctor ||
      !patientName.trim() ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return;
    }

    if (appointmentDate < today) {
      alert(t.invalidDate);
      return;
    }

    const newAppointment = {
      id: `HC-${Date.now()}`,
      patient: patientName.trim(),
      age: null,
      type: `${selectedDoctor.specialization} ${t.consultation}`,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialization: selectedDoctor.specialization,
      date: appointmentDate,
      time: appointmentTime,
      status: "Pending",
      mode: "Video",
      fee: selectedDoctor.fee,
      createdAt: new Date().toISOString()
    };

    try {
      const savedAppointments = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      if (!Array.isArray(savedAppointments)) {
        throw new Error("Invalid appointment data");
      }

      const updatedAppointments = [
        ...savedAppointments,
        newAppointment
      ];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedAppointments)
      );

      window.dispatchEvent(
        new Event("heartcare:appointments-updated")
      );

      setConfirmation(
        t.savedMessage(
          selectedDoctor.name,
          appointmentDate,
          appointmentTime
        )
      );
    } catch (error) {
      console.error("Could not save appointment:", error);
      alert(t.saveError);
    }
  }

  return (
    <div className="find-doctors-page">
      <DashboardSidebar activeKey="/find-doctors" />

      <div className="find-doctors-page-main">
        <header className="find-doctors-header">
          <div className="find-doctors-brand">
            <div className="find-doctors-brand-icon">
              <Stethoscope size={25} />
            </div>
            <div>
              <h2>HeartGuard AI</h2>
              <p>{t.directory}</p>
            </div>
          </div>

          <Link to="/dashboard" className="back-dashboard-link">
            <ArrowLeft size={17} />
            {t.dashboard}
          </Link>
        </header>

        <main className="find-doctors-main">
        <section className="doctors-intro">
          <span className="doctors-eyebrow">{t.eyebrow}</span>
          <h1>{t.heading}</h1>
          <p>{t.intro}</p>
        </section>

        <section className="doctor-search-panel">
          <div className="doctor-search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="doctor-filter-box">
            <label htmlFor="specialization-filter">
              {t.specialization}
            </label>
            <select
              id="specialization-filter"
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
            >
              <option value="All">{t.allSpecializations}</option>
              <option value="Cardiologist">{t.cardiologist}</option>
              <option value="Cardiac Surgeon">{t.cardiacSurgeon}</option>
              <option value="General Physician">{t.generalPhysician}</option>
            </select>
          </div>
        </section>

        <div className="doctors-results-heading">
          <div>
            <h2>{t.availableDoctors}</h2>
            <p>
              {filteredDoctors.length} {t.doctorFound}
            </p>
          </div>
        </div>

        <section className="doctors-grid">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <article className="doctor-card" key={doctor.id}>
                <div className="doctor-card-top">
                  <div className="doctor-avatar">
                    {doctor.initials}
                  </div>
                  <span className="doctor-rating">
                    ★ {doctor.rating}
                  </span>
                </div>

                <h3>{doctor.name}</h3>
                <p className="doctor-specialization">
                  {specializationLabels[doctor.specialization]}
                </p>

                <div className="doctor-details">
                  <div>
                    <Stethoscope size={16} />
                    <span>
                      {doctor.experience} {t.years}
                    </span>
                  </div>
                  <div>
                    <IndianRupee size={16} />
                    <span>
                      ₹{doctor.fee} {t.fee}
                    </span>
                  </div>
                  <div>
                    <CalendarDays size={16} />
                    <span>
                      {t.available}: {doctor.availability === "Today" ? t.today : t.tomorrow}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="book-appointment-btn"
                  onClick={() => openBooking(doctor)}
                >
                  {t.book}
                </button>
              </article>
            ))
          ) : (
            <div className="no-doctors-found">
              <UserRound size={35} />
              <h3>{t.noDoctors}</h3>
              <p>{t.noDoctorsText}</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSpecialization("All");
                }}
              >
                {t.clear}
              </button>
            </div>
          )}
        </section>

        <p className="doctors-demo-notice">
          {t.demoNotice}
        </p>
      </main>

      {selectedDoctor && (
        <div className="booking-overlay" onClick={closeBooking}>
          <div
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="booking-close-btn"
              onClick={closeBooking}
              aria-label={t.close}
            >
              <X size={21} />
            </button>

            {!confirmation ? (
              <>
                <div className="booking-modal-icon">
                  <CalendarDays size={27} />
                </div>

                <h2 id="booking-title">{t.bookTitle}</h2>
                <p className="booking-doctor-name">
                  {selectedDoctor.name}
                </p>
                <p className="booking-doctor-specialty">
                  {specializationLabels[selectedDoctor.specialization]}
                </p>

                <form onSubmit={handleBooking}>
                  <label htmlFor="patient-name">{t.patientName}</label>
                  <input
                    id="patient-name"
                    type="text"
                    placeholder={t.enterName}
                    value={patientName}
                    onChange={(event) => setPatientName(event.target.value)}
                    required
                  />

                  <label htmlFor="appointment-date">{t.appointmentDate}</label>
                  <input
                    id="appointment-date"
                    type="date"
                    min={today}
                    value={appointmentDate}
                    onChange={(event) => setAppointmentDate(event.target.value)}
                    required
                  />

                  <label htmlFor="appointment-time">{t.preferredTime}</label>
                  <input
                    id="appointment-time"
                    type="time"
                    value={appointmentTime}
                    onChange={(event) => setAppointmentTime(event.target.value)}
                    required
                  />

                  <div className="booking-fee">
                    {t.consultationFee} <strong>₹{selectedDoctor.fee}</strong>
                  </div>

                  <button type="submit" className="confirm-booking-btn">
                    {t.submit}
                  </button>
                </form>
              </>
            ) : (
              <div className="booking-confirmation">
                <div className="booking-success-icon">✓</div>
                <h2>{t.savedTitle}</h2>
                <p>{confirmation}</p>
                <p className="demo-booking-warning">
                  {t.warning}
                </p>
                <button
                  type="button"
                  className="confirm-booking-btn"
                  onClick={closeBooking}
                >
                  {t.done}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default FindDoctors;
