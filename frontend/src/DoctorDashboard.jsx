
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  CheckCircle,
  Clock,
  Video,
  UserRound,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  LayoutDashboard,
  Users,
  Stethoscope,
  ChevronRight,
  Save,
  CalendarCheck,
  Phone,
  Mail,
  MapPin,
  Check,
  X,
  CircleUserRound,
  ClipboardList,
  ShieldAlert
} from "lucide-react";

import "./DoctorDashboard.css";

const STORAGE_KEY = "heartcare-appointments";
const AVAILABILITY_KEY = "heartcare-doctor-availability";

const initialAppointments = [
  {
    id: "DEMO-1",
    patient: "Aarav Sharma",
    age: 42,
    type: "Heart Consultation",
    date: "",
    time: "10:30 AM",
    status: "Pending",
    mode: "Video",
    doctorName: "Dr. Demo"
  },
  {
    id: "DEMO-2",
    patient: "Priya Das",
    age: 35,
    type: "Follow-up Visit",
    date: "",
    time: "11:30 AM",
    status: "Confirmed",
    mode: "Video",
    doctorName: "Dr. Demo"
  },
  {
    id: "DEMO-3",
    patient: "Rahul Sen",
    age: 51,
    type: "Cardiology Consultation",
    date: "",
    time: "02:00 PM",
    status: "Confirmed",
    mode: "In-person",
    doctorName: "Dr. Demo"
  },
  {
    id: "DEMO-4",
    patient: "Ananya Roy",
    age: 29,
    type: "General Consultation",
    date: "",
    time: "09:30 AM",
    status: "Pending",
    mode: "Video",
    doctorName: "Dr. Demo"
  }
];

const defaultAvailability = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  startTime: "09:00",
  endTime: "17:00",
  slotDuration: "30",
  acceptingBookings: true
};

const navigation = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Appointments", icon: CalendarDays },
  { name: "Patients", icon: Users },
  { name: "Availability", icon: Clock },
  { name: "Consultations", icon: Video },
  { name: "My Profile", icon: UserRound }
];

function readAppointments() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initialAppointments)
      );
      return initialAppointments;
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : initialAppointments;
  } catch {
    return initialAppointments;
  }
}

function readAvailability() {
  try {
    const saved = localStorage.getItem(AVAILABILITY_KEY);

    if (saved) {
      return {
        ...defaultAvailability,
        ...JSON.parse(saved)
      };
    }
  } catch {
    // Use default availability if saved data is invalid.
  }

  return defaultAvailability;
}

function formatDate(dateValue) {
  if (!dateValue) return "Date not specified";

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function DoctorDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState(readAppointments);
  const [activePage, setActivePage] = useState("Overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [availability, setAvailability] = useState(readAvailability);
  const [saveMessage, setSaveMessage] = useState("");

  // Refresh appointments when FindDoctors updates localStorage.
  useEffect(() => {
    const refreshAppointments = () => {
      setAppointments(readAppointments());
    };

    window.addEventListener(
      "heartcare:appointments-updated",
      refreshAppointments
    );

    window.addEventListener("storage", refreshAppointments);

    return () => {
      window.removeEventListener(
        "heartcare:appointments-updated",
        refreshAppointments
      );

      window.removeEventListener("storage", refreshAppointments);
    };
  }, []);

  const updateAppointment = (id, newStatus) => {
    const updated = appointments.map((appointment) =>
      appointment.id === id
        ? { ...appointment, status: newStatus }
        : appointment
    );

    setAppointments(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(
      new Event("heartcare:appointments-updated")
    );
  };

  const filteredAppointments = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return appointments;

    return appointments.filter((appointment) =>
      [
        appointment.patient,
        appointment.doctorName,
        appointment.type,
        appointment.status,
        appointment.mode
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [appointments, searchTerm]);

  const pendingCount = appointments.filter(
    (item) => item.status === "Pending"
  ).length;

  const confirmedCount = appointments.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const completedCount = appointments.filter(
    (item) => item.status === "Completed"
  ).length;

  const uniquePatients = useMemo(() => {
    const patientMap = new Map();

    appointments.forEach((appointment) => {
      const key = appointment.patient?.toLowerCase();

      if (key && !patientMap.has(key)) {
        patientMap.set(key, {
          name: appointment.patient,
          age: appointment.age,
          appointments: []
        });
      }

      if (key) {
        patientMap.get(key).appointments.push(appointment);
      }
    });

    return Array.from(patientMap.values());
  }, [appointments]);

  const handleAvailabilityChange = (field, value) => {
    setAvailability((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const toggleDay = (day) => {
    setAvailability((previous) => ({
      ...previous,
      days: previous.days.includes(day)
        ? previous.days.filter((item) => item !== day)
        : [...previous.days, day]
    }));
  };

  const saveAvailability = (event) => {
    event.preventDefault();

    if (availability.startTime >= availability.endTime) {
      setSaveMessage("Please select a valid working time range.");
      return;
    }

    if (availability.days.length === 0) {
      setSaveMessage("Please select at least one working day.");
      return;
    }

    localStorage.setItem(
      AVAILABILITY_KEY,
      JSON.stringify(availability)
    );

    setSaveMessage("Availability settings saved successfully.");

    window.setTimeout(() => {
      setSaveMessage("");
    }, 3000);
  };

  const joinMeeting = (appointment) => {
    const roomName = `HeartCare-${String(appointment.id).replace(
      /[^a-zA-Z0-9-]/g,
      ""
    )}`;

    window.open(
      `https://meet.jit.si/${roomName}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openPatientAppointments = (patientName) => {
    setSearchTerm(patientName);
    setActivePage("Appointments");
  };

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave the Doctor Dashboard?"
    );

    if (confirmed) {
      navigate("/login");
    }
  };

  const renderAppointmentTable = (items, showActions = true) => (
    <div className="doctor-table-wrapper">
      <table className="doctor-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Consultation</th>
            <th>Date & Time</th>
            <th>Mode</th>
            <th>Status</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {items.length > 0 ? (
            items.map((appointment) => (
              <tr key={appointment.id}>
                <td>
                  <div className="doctor-patient-cell">
                    <div className="doctor-patient-avatar">
                      {appointment.patient?.charAt(0)?.toUpperCase() || "P"}
                    </div>

                    <div>
                      <strong>{appointment.patient || "Patient"}</strong>
                      <span>
                        {appointment.age
                          ? `${appointment.age} years`
                          : "Patient"}
                      </span>
                    </div>
                  </div>
                </td>

                <td>{appointment.type || "Consultation"}</td>

                <td>
                  <div className="doctor-date-cell">
                    <strong>{formatDate(appointment.date)}</strong>
                    <span>{appointment.time || "Time not specified"}</span>
                  </div>
                </td>

                <td>
                  <span className="doctor-mode">
                    {appointment.mode === "Video" ? (
                      <Video size={15} />
                    ) : (
                      <MapPin size={15} />
                    )}
                    {appointment.mode || "Video"}
                  </span>
                </td>

                <td>
                  <span
                    className={`doctor-status ${appointment.status?.toLowerCase()}`}
                  >
                    {appointment.status}
                  </span>
                </td>

                {showActions && (
                  <td>
                    <div className="doctor-action-buttons">
                      {appointment.status === "Pending" && (
                        <>
                          <button
                            className="doctor-icon-button accept"
                            title="Accept appointment"
                            onClick={() =>
                              updateAppointment(appointment.id, "Confirmed")
                            }
                          >
                            <Check size={17} />
                          </button>

                          <button
                            className="doctor-icon-button reject"
                            title="Reject appointment"
                            onClick={() =>
                              updateAppointment(appointment.id, "Rejected")
                            }
                          >
                            <X size={17} />
                          </button>
                        </>
                      )}

                      {appointment.status === "Confirmed" &&
                        appointment.mode === "Video" && (
                          <button
                            className="doctor-join-button"
                            onClick={() => joinMeeting(appointment)}
                          >
                            <Video size={15} />
                            Join
                          </button>
                        )}

                      {appointment.status === "Confirmed" &&
                        appointment.mode !== "Video" && (
                          <button
                            className="doctor-complete-button"
                            onClick={() =>
                              updateAppointment(appointment.id, "Completed")
                            }
                          >
                            <CheckCircle size={15} />
                            Complete
                          </button>
                        )}

                      {appointment.status === "Confirmed" &&
                        appointment.mode === "Video" && (
                          <button
                            className="doctor-complete-icon"
                            title="Mark as completed"
                            onClick={() =>
                              updateAppointment(appointment.id, "Completed")
                            }
                          >
                            <CheckCircle size={17} />
                          </button>
                        )}

                      {["Completed", "Rejected"].includes(
                        appointment.status
                      ) && (
                        <span className="doctor-no-action">No action</span>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={showActions ? 6 : 5}
                className="doctor-empty-cell"
              >
                <ClipboardList size={28} />
                <strong>No appointments found</strong>
                <span>Appointments will appear here when available.</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderOverview = () => (
    <>
      <div className="doctor-demo-banner">
        <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <strong>Frontend Demonstration Workspace</strong>
          This workspace is a simulated frontend demonstration using sample appointments and browser local storage. It is not an authenticated clinician portal and is not connected to real hospital records or live patients.
        </div>
      </div>

      <section className="doctor-welcome">
        <div>
          <span className="doctor-eyebrow">DOCTOR WORKSPACE</span>
          <h1>Welcome back, Doctor!</h1>
          <p>
            Here is an overview of your appointments and patient activity.
          </p>
        </div>

        <div className="doctor-welcome-icon">
          <Stethoscope size={34} />
        </div>
      </section>

      <section className="doctor-stat-grid">
        <div className="doctor-stat-card">
          <div className="doctor-stat-icon blue">
            <CalendarDays size={23} />
          </div>
          <div>
            <p>Total Appointments</p>
            <h2>{appointments.length}</h2>
            <span>All appointments</span>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="doctor-stat-icon green">
            <CheckCircle size={23} />
          </div>
          <div>
            <p>Confirmed</p>
            <h2>{confirmedCount}</h2>
            <span>Confirmed appointments</span>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="doctor-stat-icon orange">
            <Clock size={23} />
          </div>
          <div>
            <p>Pending</p>
            <h2>{pendingCount}</h2>
            <span>Awaiting approval</span>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="doctor-stat-icon purple">
            <Users size={23} />
          </div>
          <div>
            <p>Patients</p>
            <h2>{uniquePatients.length}</h2>
            <span>Unique patients</span>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="doctor-stat-icon teal">
            <CheckCircle size={23} />
          </div>
          <div>
            <p>Completed</p>
            <h2>{completedCount}</h2>
            <span>Completed consultations</span>
          </div>
        </div>
      </section>

      <section className="doctor-panel">
        <div className="doctor-panel-heading">
          <div>
            <h2>Recent Appointments</h2>
            <p>Review and manage your latest patient appointments.</p>
          </div>

          <button
            className="doctor-text-button"
            onClick={() => setActivePage("Appointments")}
          >
            View all <ChevronRight size={17} />
          </button>
        </div>

        {renderAppointmentTable(appointments.slice(0, 5))}
      </section>
    </>
  );

  const renderAppointments = () => (
    <section className="doctor-panel">
      <div className="doctor-panel-heading doctor-appointments-heading">
        <div>
          <span className="doctor-eyebrow">PATIENT SCHEDULE</span>
          <h2>Appointments</h2>
          <p>Manage appointment requests and consultations.</p>
        </div>

        <div className="doctor-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search patient..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {renderAppointmentTable(filteredAppointments)}
    </section>
  );

  const renderPatients = () => (
    <section className="doctor-panel">
      <div className="doctor-panel-heading">
        <div>
          <span className="doctor-eyebrow">PATIENT DIRECTORY</span>
          <h2>My Patients</h2>
          <p>Patients who have appointments in this dashboard.</p>
        </div>

        <span className="doctor-total-label">
          {uniquePatients.length} Patients
        </span>
      </div>

      {uniquePatients.length > 0 ? (
        <div className="doctor-patient-grid">
          {uniquePatients.map((patient) => (
            <article className="doctor-patient-card" key={patient.name}>
              <div className="doctor-patient-card-top">
                <div className="doctor-large-avatar">
                  {patient.name.charAt(0).toUpperCase()}
                </div>

                <span className="doctor-patient-count">
                  {patient.appointments.length}{" "}
                  {patient.appointments.length === 1
                    ? "appointment"
                    : "appointments"}
                </span>
              </div>

              <h3>{patient.name}</h3>
              <p>
                {patient.age ? `${patient.age} years old` : "Age not provided"}
              </p>

              <button
                className="doctor-outline-button"
                onClick={() => openPatientAppointments(patient.name)}
              >
                View appointments <ChevronRight size={16} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="doctor-empty-state">
          <Users size={35} />
          <h3>No patients yet</h3>
          <p>Patient information will appear here after bookings are made.</p>
        </div>
      )}
    </section>
  );

  const renderAvailability = () => (
    <section className="doctor-panel doctor-form-panel">
      <div className="doctor-panel-heading">
        <div>
          <span className="doctor-eyebrow">SCHEDULE MANAGEMENT</span>
          <h2>My Availability</h2>
          <p>Set your preferred working days and consultation hours.</p>
        </div>
      </div>

      <form onSubmit={saveAvailability} className="doctor-availability-form">
        <div className="doctor-form-section">
          <h3>Working days</h3>
          <p>Select the days when you are available for consultations.</p>

          <div className="doctor-days-grid">
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            ].map((day) => (
              <label className="doctor-day-option" key={day}>
                <input
                  type="checkbox"
                  checked={availability.days.includes(day)}
                  onChange={() => toggleDay(day)}
                />
                <span>{day.slice(0, 3)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="doctor-form-row">
          <div className="doctor-form-group">
            <label htmlFor="doctor-start-time">Start time</label>
            <input
              id="doctor-start-time"
              type="time"
              value={availability.startTime}
              onChange={(event) =>
                handleAvailabilityChange("startTime", event.target.value)
              }
            />
          </div>

          <div className="doctor-form-group">
            <label htmlFor="doctor-end-time">End time</label>
            <input
              id="doctor-end-time"
              type="time"
              value={availability.endTime}
              onChange={(event) =>
                handleAvailabilityChange("endTime", event.target.value)
              }
            />
          </div>

          <div className="doctor-form-group">
            <label htmlFor="doctor-slot-duration">Slot duration</label>
            <select
              id="doctor-slot-duration"
              value={availability.slotDuration}
              onChange={(event) =>
                handleAvailabilityChange("slotDuration", event.target.value)
              }
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
        </div>

        <div className="doctor-booking-toggle">
          <div>
            <strong>Accept new bookings</strong>
            <p>Allow patients to request appointments.</p>
          </div>

          <label className="doctor-switch">
            <input
              type="checkbox"
              checked={availability.acceptingBookings}
              onChange={(event) =>
                handleAvailabilityChange(
                  "acceptingBookings",
                  event.target.checked
                )
              }
            />
            <span className="doctor-switch-slider" />
          </label>
        </div>

        {saveMessage && (
          <p className="doctor-save-message">{saveMessage}</p>
        )}

        <button className="doctor-primary-button" type="submit">
          <Save size={17} />
          Save Availability
        </button>
      </form>
    </section>
  );

  const renderConsultations = () => {
    const consultationAppointments = appointments.filter((item) =>
      ["Confirmed", "Completed"].includes(item.status)
    );

    return (
      <section className="doctor-panel">
        <div className="doctor-panel-heading">
          <div>
            <span className="doctor-eyebrow">CONSULTATION ROOM</span>
            <h2>Consultations</h2>
            <p>Access confirmed and completed patient consultations.</p>
          </div>
        </div>

        {consultationAppointments.length > 0 ? (
          <div className="doctor-consultation-list">
            {consultationAppointments.map((appointment) => (
              <article
                className="doctor-consultation-card"
                key={appointment.id}
              >
                <div className="doctor-consultation-icon">
                  {appointment.mode === "Video" ? (
                    <Video size={23} />
                  ) : (
                    <Stethoscope size={23} />
                  )}
                </div>

                <div className="doctor-consultation-info">
                  <h3>{appointment.patient}</h3>
                  <p>{appointment.type}</p>
                  <span>
                    {formatDate(appointment.date)} · {appointment.time}
                  </span>
                </div>

                <div className="doctor-consultation-actions">
                  <span
                    className={`doctor-status ${appointment.status.toLowerCase()}`}
                  >
                    {appointment.status}
                  </span>

                  {appointment.status === "Confirmed" &&
                    appointment.mode === "Video" && (
                      <button
                        className="doctor-join-button"
                        onClick={() => joinMeeting(appointment)}
                      >
                        <Video size={15} />
                        Join meeting
                      </button>
                    )}

                  {appointment.status === "Confirmed" && (
                    <button
                      className="doctor-complete-button"
                      onClick={() =>
                        updateAppointment(appointment.id, "Completed")
                      }
                    >
                      <CheckCircle size={15} />
                      Complete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="doctor-empty-state">
            <Video size={35} />
            <h3>No consultations available</h3>
            <p>Confirmed consultations will appear here.</p>
          </div>
        )}
      </section>
    );
  };

  const renderProfile = () => (
    <section className="doctor-panel">
      <div className="doctor-panel-heading">
        <div>
          <span className="doctor-eyebrow">ACCOUNT INFORMATION</span>
          <h2>My Profile</h2>
          <p>Doctor account information.</p>
        </div>
      </div>

      <div className="doctor-profile-card">
        <div className="doctor-profile-avatar">
          <Stethoscope size={36} />
        </div>

        <div>
          <h2>Dr. Demo</h2>
          <p>Cardiologist</p>
          <span className="doctor-profile-badge">
            <CheckCircle size={14} /> Doctor Dashboard
          </span>
        </div>
      </div>

      <div className="doctor-profile-details">
        <div>
          <Mail size={19} />
          <span>
            <small>Email</small>
            <strong>Not connected</strong>
          </span>
        </div>

        <div>
          <Phone size={19} />
          <span>
            <small>Phone</small>
            <strong>Not connected</strong>
          </span>
        </div>

        <div>
          <Stethoscope size={19} />
          <span>
            <small>Specialization</small>
            <strong>Cardiology</strong>
          </span>
        </div>

        <div>
          <MapPin size={19} />
          <span>
            <small>Location</small>
            <strong>Not provided</strong>
          </span>
        </div>
      </div>

      <p className="doctor-information-note">
        This is currently a demonstration profile. Connect your doctor
        account and backend API to display real profile information.
      </p>
    </section>
  );

  const renderSettings = () => (
    <section className="doctor-panel">
      <div className="doctor-panel-heading">
        <div>
          <span className="doctor-eyebrow">PREFERENCES</span>
          <h2>Settings</h2>
          <p>Manage dashboard preferences.</p>
        </div>
      </div>

      <div className="doctor-settings-list">
        <div className="doctor-setting-item">
          <div className="doctor-setting-icon">
            <Bell size={20} />
          </div>
          <div>
            <strong>Appointment notifications</strong>
            <p>Review new appointment requests in the dashboard.</p>
          </div>
          <button
            className="doctor-outline-button"
            onClick={() => setActivePage("Appointments")}
          >
            View appointments
          </button>
        </div>

        <div className="doctor-setting-item">
          <div className="doctor-setting-icon">
            <CalendarCheck size={20} />
          </div>
          <div>
            <strong>Availability settings</strong>
            <p>Update your working days and consultation hours.</p>
          </div>
          <button
            className="doctor-outline-button"
            onClick={() => setActivePage("Availability")}
          >
            Manage
          </button>
        </div>

        <div className="doctor-setting-item">
          <div className="doctor-setting-icon">
            <CircleUserRound size={20} />
          </div>
          <div>
            <strong>Doctor profile</strong>
            <p>View your current profile information.</p>
          </div>
          <button
            className="doctor-outline-button"
            onClick={() => setActivePage("My Profile")}
          >
            View profile
          </button>
        </div>
      </div>
    </section>
  );

  const renderPage = () => {
    switch (activePage) {
      case "Overview":
        return renderOverview();
      case "Appointments":
        return renderAppointments();
      case "Patients":
        return renderPatients();
      case "Availability":
        return renderAvailability();
      case "Consultations":
        return renderConsultations();
      case "My Profile":
        return renderProfile();
      case "Settings":
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="doctor-dashboard">
      {menuOpen && (
        <button
          className="doctor-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`doctor-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="doctor-brand">
          <div className="doctor-brand-icon">
            <Activity size={25} />
          </div>
          <div>
            <h2>HeartGuard AI</h2>
            <span>Doctor Portal</span>
          </div>
        </div>

        <div className="doctor-sidebar-profile">
          <div className="doctor-sidebar-avatar">D</div>
          <div>
            <strong>Dr. Demo</strong>
            <span>Cardiologist</span>
          </div>
        </div>

        <p className="doctor-nav-label">MAIN MENU</p>

        <nav className="doctor-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={
                  activePage === item.name ? "active" : ""
                }
                onClick={() => {
                  setActivePage(item.name);
                  setMenuOpen(false);
                  setSearchTerm("");
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
                {activePage === item.name && (
                  <ChevronRight size={17} className="doctor-nav-arrow" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="doctor-sidebar-bottom">
          <button
            className={activePage === "Settings" ? "active" : ""}
            onClick={() => {
              setActivePage("Settings");
              setMenuOpen(false);
            }}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <button className="doctor-logout-button" onClick={handleLogout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>

          <div className="doctor-sidebar-footer">
            <span>HeartGuard AI</span>
            <small>Doctor Portal · Frontend Demo</small>
          </div>
        </div>
      </aside>

      <main className="doctor-main">
        <header className="doctor-topbar">
          <div className="doctor-topbar-left">
            <button
              className="doctor-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="doctor-breadcrumb">HeartGuard AI /</span>
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="doctor-topbar-right">
            <button
              className="doctor-topbar-icon"
              title="Settings"
              onClick={() => setActivePage("Settings")}
            >
              <Bell size={19} />
            </button>

            <div className="doctor-topbar-user">
              <div className="doctor-topbar-avatar">D</div>
              <div>
                <strong>Dr. Demo</strong>
                <span>Cardiologist</span>
              </div>
            </div>
          </div>
        </header>

        <div className="doctor-content">
          {renderPage()}

          <footer className="doctor-footer">
            <span>© {new Date().getFullYear()} HeartGuard AI</span>
            <span>Doctor Portal</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default DoctorDashboard;
