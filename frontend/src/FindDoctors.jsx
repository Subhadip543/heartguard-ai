import "./FindDoctors.css";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Stethoscope,
  CalendarDays,
  IndianRupee,
  ArrowLeft,
  X,
  UserRound
} from "lucide-react";
import "./FindDoctors.css";

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

function FindDoctors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialization =
        specialization === "All" ||
        doctor.specialization === specialization;

      return matchesSearch && matchesSpecialization;
    });
  }, [searchTerm, specialization]);

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

    if (!selectedDoctor || !patientName.trim() || !appointmentDate || !appointmentTime) {
      return;
    }

    setConfirmation(
      `Demo appointment request created for ${selectedDoctor.name} on ${appointmentDate} at ${appointmentTime}.`
    );
  }

  return (
    <div className="find-doctors-page">
      <header className="find-doctors-header">
        <div className="find-doctors-brand">
          <div className="find-doctors-brand-icon">
            <Stethoscope size={25} />
          </div>
          <div>
            <h2>HeartCare</h2>
            <p>Doctor Directory</p>
          </div>
        </div>

        <Link to="/dashboard" className="back-dashboard-link">
          <ArrowLeft size={17} />
          Patient Dashboard
        </Link>
      </header>

      <main className="find-doctors-main">
        <section className="doctors-intro">
          <span className="doctors-eyebrow">YOUR HEALTH MATTERS</span>
          <h1>Find the Right Doctor</h1>
          <p>
            Explore healthcare professionals and choose a doctor for your
            consultation.
          </p>
        </section>

        <section className="doctor-search-panel">
          <div className="doctor-search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by doctor name or specialization..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="doctor-filter-box">
            <label htmlFor="specialization-filter">
              Specialization
            </label>
            <select
              id="specialization-filter"
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
            >
              <option value="All">All Specializations</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Cardiac Surgeon">Cardiac Surgeon</option>
              <option value="General Physician">General Physician</option>
            </select>
          </div>
        </section>

        <div className="doctors-results-heading">
          <div>
            <h2>Available Doctors</h2>
            <p>{filteredDoctors.length} doctor(s) found</p>
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
                  {doctor.specialization}
                </p>

                <div className="doctor-details">
                  <div>
                    <Stethoscope size={16} />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div>
                    <IndianRupee size={16} />
                    <span>₹{doctor.fee} consultation fee</span>
                  </div>
                  <div>
                    <CalendarDays size={16} />
                    <span>Available: {doctor.availability}</span>
                  </div>
                </div>

                <button
                  className="book-appointment-btn"
                  onClick={() => openBooking(doctor)}
                >
                  Book Appointment
                </button>
              </article>
            ))
          ) : (
            <div className="no-doctors-found">
              <UserRound size={35} />
              <h3>No doctors found</h3>
              <p>Try another name or select a different specialization.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSpecialization("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        <p className="doctors-demo-notice">
          Demo directory: doctor profiles, fees, ratings and availability
          are sample information, not verified real-world listings.
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
              className="booking-close-btn"
              onClick={closeBooking}
              aria-label="Close booking form"
            >
              <X size={21} />
            </button>

            {!confirmation ? (
              <>
                <div className="booking-modal-icon">
                  <CalendarDays size={27} />
                </div>

                <h2 id="booking-title">Book an Appointment</h2>
                <p className="booking-doctor-name">
                  {selectedDoctor.name}
                </p>
                <p className="booking-doctor-specialty">
                  {selectedDoctor.specialization}
                </p>

                <form onSubmit={handleBooking}>
                  <label htmlFor="patient-name">Patient Name</label>
                  <input
                    id="patient-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={patientName}
                    onChange={(event) => setPatientName(event.target.value)}
                    required
                  />

                  <label htmlFor="appointment-date">Appointment Date</label>
                  <input
                    id="appointment-date"
                    type="date"
                    value={appointmentDate}
                    onChange={(event) => setAppointmentDate(event.target.value)}
                    required
                  />

                  <label htmlFor="appointment-time">Preferred Time</label>
                  <input
                    id="appointment-time"
                    type="time"
                    value={appointmentTime}
                    onChange={(event) => setAppointmentTime(event.target.value)}
                    required
                  />

                  <div className="booking-fee">
                    Consultation Fee: <strong>₹{selectedDoctor.fee}</strong>
                  </div>

                  <button type="submit" className="confirm-booking-btn">
                    Submit Demo Booking
                  </button>
                </form>
              </>
            ) : (
              <div className="booking-confirmation">
                <div className="booking-success-icon">✓</div>
                <h2>Booking Request Created</h2>
                <p>{confirmation}</p>
                <p className="demo-booking-warning">
                  This is only a frontend demonstration. No appointment has
                  been sent to a doctor or saved to a database.
                </p>
                <button
                  className="confirm-booking-btn"
                  onClick={closeBooking}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FindDoctors;
