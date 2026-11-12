
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Clock,
  Video,
  UserRound,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Search,
  Bell,
  Menu
} from "lucide-react";
import "./DoctorDashboard.css";

const initialAppointments = [
  {
    id: 1,
    patient: "Aarav Sharma",
    age: 42,
    type: "Heart Consultation",
    date: "Today",
    time: "10:30 AM",
    status: "Pending",
    mode: "Video"
  },
  {
    id: 2,
    patient: "Priya Das",
    age: 35,
    type: "Follow-up Visit",
    date: "Today",
    time: "11:30 AM",
    status: "Confirmed",
    mode: "Video"
  },
  {
    id: 3,
    patient: "Rahul Sen",
    age: 51,
    type: "Cardiology Consultation",
    date: "Today",
    time: "02:00 PM",
    status: "Confirmed",
    mode: "In-person"
  },
  {
    id: 4,
    patient: "Ananya Roy",
    age: 29,
    type: "General Consultation",
    date: "Tomorrow",
    time: "09:30 AM",
    status: "Pending",
    mode: "Video"
  }
];

function DoctorDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [activePage, setActivePage] = useState("Overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const updateAppointment = (id, status) => {
    setAppointments((previous) =>
      previous.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status }
          : appointment
      )
    );
  };

  const filteredAppointments = appointments.filter((appointment) =>
    appointment.patient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "Confirmed"
  ).length;

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "Pending"
  ).length;

  const navigation = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Appointments", icon: CalendarDays },
    { name: "Patients", icon: Users },
    { name: "Availability", icon: Clock },
    { name: "Consultations", icon: Video },
    { name: "My Profile", icon: UserRound }
  ];

  const startVideoCall = (appointment) => {
    const roomName = `HeartCareConsultation${appointment.id}`;
    window.open(
      `https://meet.jit.si/${roomName}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="doctor-dashboard">

      {/* Sidebar */}
      <aside className={`doctor-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="doctor-brand">
          <div className="doctor-brand-icon">H</div>
          <div>
            <h2>HeartCare</h2>
            <span>Doctor Portal</span>
          </div>
        </div>

        <div className="doctor-sidebar-label">WORKSPACE</div>

        <nav className="doctor-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.name}
                className={`doctor-nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setActivePage(item.name);
                  setMenuOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="doctor-sidebar-bottom">
          <button
            type="button"
            className="doctor-nav-item"
            onClick={() => setActivePage("Settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <button
            type="button"
            className="doctor-nav-item doctor-logout"
            onClick={() => {
              navigate("/login");
            }}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="doctor-main">

        {/* Topbar */}
        <header className="doctor-topbar">
          <div className="doctor-topbar-left">
            <button
              type="button"
              className="doctor-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={23} />
            </button>

            <div>
              <h1>{activePage}</h1>
              <p>Welcome back, Doctor. Here's your practice overview.</p>
            </div>
          </div>

          <div className="doctor-topbar-right">
            <button
              type="button"
              className="doctor-notification"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span></span>
            </button>

            <div className="doctor-topbar-profile">
              <div className="doctor-avatar">DR</div>
              <div>
                <strong>Dr. Demo</strong>
                <small>Cardiologist</small>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="doctor-content">

          {activePage === "Overview" && (
            <>
              <section className="doctor-welcome">
                <div>
                  <span className="doctor-welcome-tag">DOCTOR WORKSPACE</span>
                  <h2>Your patients, your care.</h2>
                  <p>
                    Manage appointments and provide better patient care
                    through HeartCare.
                  </p>
                </div>

                <div className="doctor-welcome-icon">
                  <UserRound size={55} />
                </div>
              </section>

              {/* Statistics */}
              <section className="doctor-stat-grid">
                <div className="doctor-stat-card">
                  <div className="doctor-stat-icon blue">
                    <CalendarDays size={23} />
                  </div>
                  <div>
                    <p>Total Appointments</p>
                    <h2>{appointments.length}</h2>
                    <span>Demo appointment records</span>
                  </div>
                </div>

                <div className="doctor-stat-card">
                  <div className="doctor-stat-icon green">
                    <CheckCircle size={23} />
                  </div>
                  <div>
                    <p>Confirmed</p>
                    <h2>{confirmedCount}</h2>
                    <span>Confirmed bookings</span>
                  </div>
                </div>

                <div className="doctor-stat-card">
                  <div className="doctor-stat-icon orange">
                    <Clock size={23} />
                  </div>
                  <div>
                    <p>Pending Requests</p>
                    <h2>{pendingCount}</h2>
                    <span>Awaiting your decision</span>
                  </div>
                </div>

                <div className="doctor-stat-card">
                  <div className="doctor-stat-icon purple">
                    <Users size={23} />
                  </div>
                  <div>
                    <p>Patients</p>
                    <h2>{new Set(appointments.map((a) => a.patient)).size}</h2>
                    <span>Unique demo patients</span>
                  </div>
                </div>
              </section>

              {/* Appointments */}
              <section className="doctor-panel">
                <div className="doctor-panel-heading">
                  <div>
                    <h2>Appointment Management</h2>
                    <p>Review and manage patient booking requests.</p>
                  </div>

                  <button
                    type="button"
                    className="doctor-view-all"
                    onClick={() => setActivePage("Appointments")}
                  >
                    View All
                  </button>
                </div>

                <div className="doctor-table-wrapper">
                  <table className="doctor-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Consultation</th>
                        <th>Date & Time</th>
                        <th>Mode</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {appointments.slice(0, 4).map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            <div className="doctor-patient-cell">
                              <div className="patient-avatar">
                                {appointment.patient.charAt(0)}
                              </div>
                              <div>
                                <strong>{appointment.patient}</strong>
                                <small>{appointment.age} years</small>
                              </div>
                            </div>
                          </td>

                          <td>{appointment.type}</td>

                          <td>
                            <strong>{appointment.date}</strong>
                            <small className="doctor-time">
                              {appointment.time}
                            </small>
                          </td>

                          <td>{appointment.mode}</td>

                          <td>
                            <span
                              className={`appointment-status ${appointment.status.toLowerCase()}`}
                            >
                              {appointment.status}
                            </span>
                          </td>

                          <td>
                            <div className="doctor-action-buttons">
                              {appointment.status === "Pending" ? (
                                <>
                                  <button
                                    type="button"
                                    className="approve-button"
                                    title="Accept appointment"
                                    onClick={() =>
                                      updateAppointment(
                                        appointment.id,
                                        "Confirmed"
                                      )
                                    }
                                  >
                                    <CheckCircle size={17} />
                                  </button>

                                  <button
                                    type="button"
                                    className="reject-button"
                                    title="Reject appointment"
                                    onClick={() =>
                                      updateAppointment(
                                        appointment.id,
                                        "Rejected"
                                      )
                                    }
                                  >
                                    <XCircle size={17} />
                                  </button>
                                </>
                              ) : appointment.status === "Confirmed" &&
                                appointment.mode === "Video" ? (
                                <button
                                  type="button"
                                  className="join-call-button"
                                  onClick={() => startVideoCall(appointment)}
                                >
                                  <Video size={15} />
                                  Join
                                </button>
                              ) : (
                                <span className="doctor-no-action">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activePage === "Appointments" && (
            <section className="doctor-panel">
              <div className="doctor-panel-heading">
                <div>
                  <h2>All Appointments</h2>
                  <p>Manage all your patient bookings.</p>
                </div>

                <div className="doctor-search">
                  <Search size={17} />
                  <input
                    type="text"
                    placeholder="Search patient..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>

              <div className="doctor-appointment-list">
                {filteredAppointments.map((appointment) => (
                  <div className="doctor-appointment-card" key={appointment.id}>
                    <div>
                      <h3>{appointment.patient}</h3>
                      <p>{appointment.type}</p>
                      <p>
                        {appointment.date} · {appointment.time}
                      </p>
                      <span
                        className={`appointment-status ${appointment.status.toLowerCase()}`}
                      >
                        {appointment.status}
                      </span>
                    </div>

                    <div className="doctor-appointment-actions">
                      {appointment.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            className="approve-button"
                            onClick={() =>
                              updateAppointment(appointment.id, "Confirmed")
                            }
                          >
                            Accept
                          </button>

                          <button
                            type="button"
                            className="reject-button"
                            onClick={() =>
                              updateAppointment(appointment.id, "Rejected")
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {appointment.status === "Confirmed" &&
                        appointment.mode === "Video" && (
                          <button
                            type="button"
                            className="join-call-button"
                            onClick={() => startVideoCall(appointment)}
                          >
                            <Video size={16} />
                            Join Video Call
                          </button>
                        )}
                    </div>
                  </div>
                ))}

                {filteredAppointments.length === 0 && (
                  <p className="doctor-empty">
                    No matching appointments found.
                  </p>
                )}
              </div>
            </section>
          )}

          {activePage !== "Overview" &&
            activePage !== "Appointments" && (
              <section className="doctor-coming-soon">
                <div>
                  <Settings size={35} />
                </div>
                <h2>{activePage}</h2>
                <p>
                  This section will be developed in the next phase of
                  HeartCare.
                </p>
              </section>
            )}

          <footer className="doctor-footer">
            HeartCare Doctor Portal · Healthcare management interface
          </footer>

        </div>
      </main>
    </div>
  );
}

export default DoctorDashboard;
