import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  HeartPulse,
  History as HistoryIcon,
  Sparkles,
  Stethoscope,
  Bot,
  LifeBuoy,
  Activity,
  AlertTriangle,
  Settings,
  LogOut,
  LogIn,
  Menu,
  X,
  PanelLeftClose
} from "lucide-react";
import "./DashboardSidebar.css";

// MAIN Navigation Section (Items 1 to 5)
const MAIN_NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/assessment", label: "Heart Risk Assessment", icon: HeartPulse },
  { path: "/history", label: "Assessment History", icon: HistoryIcon },
  { path: "/health-awareness", label: "Health Awareness", icon: Sparkles }
];

// SERVICES Navigation Section (Items 6 to 10)
const SERVICES_NAV_ITEMS = [
  { path: "/find-doctors", label: "Find Doctors", icon: Stethoscope },
  { path: "/heart-assistant", label: "AI Heart Assistant", icon: Bot },
  { path: "/heart-resources", label: "Healthcare Lifeline", icon: LifeBuoy },
  { path: "/live-health", label: "Live Health Monitoring", icon: Activity },
  { path: "/emergency", label: "Emergency Assistance", icon: AlertTriangle, danger: true }
];

export default function DashboardSidebar({ patient: patientProp, onLogout, activeKey }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => {
    try {
      return localStorage.getItem("heartguard_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Resolve patient from props or sessionStorage fallback
  let patient = patientProp;
  let hasToken = false;
  try {
    hasToken = Boolean(sessionStorage.getItem("heartcareToken"));
    if (!patient) {
      const stored = sessionStorage.getItem("heartcarePatient");
      if (stored) {
        patient = JSON.parse(stored);
      }
    }
  } catch {
    patient = null;
  }

  const patientName = patient?.name || (hasToken ? "Patient" : "Guest User");
  const patientEmail = patient?.email || (hasToken ? "" : "Explore patient features");

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "P";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "P";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  const patientInitials = getInitials(patientName);

  // Close mobile drawer on route changes during render without cascading effect
  const [lastPath, setLastPath] = useState(location.pathname);
  if (location.pathname !== lastPath) {
    setLastPath(location.pathname);
    setIsMobileOpen(false);
  }

  // Synchronize data-sidebar-collapsed on documentElement for stationary layout
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-sidebar-collapsed",
      String(isDesktopCollapsed)
    );
  }, [isDesktopCollapsed]);

  // Sync collapsed state across tabs and components
  const toggleDesktopSidebar = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("heartguard_sidebar_collapsed", String(next));
      } catch {
        // ignore storage errors
      }
      window.dispatchEvent(
        new CustomEvent("heartguard-sidebar-toggle", { detail: { collapsed: next } })
      );
      return next;
    });
  }, []);

  useEffect(() => {
    const handleToggle = (e) => {
      if (e.detail && typeof e.detail.collapsed === "boolean") {
        setIsDesktopCollapsed(e.detail.collapsed);
      }
    };
    const handleStorage = (e) => {
      if (e.key === "heartguard_sidebar_collapsed") {
        setIsDesktopCollapsed(e.newValue === "true");
      }
    };

    window.addEventListener("heartguard-sidebar-toggle", handleToggle);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("heartguard-sidebar-toggle", handleToggle);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Lock body scroll when mobile drawer is open; clean up on unmount
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  const handleLogoutClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsMobileOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.removeItem("heartcareToken");
      sessionStorage.removeItem("heartcarePatient");
      navigate("/login", { replace: true });
    }
  };

  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  const handleOpenSettings = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsMobileOpen(false);
    window.dispatchEvent(new CustomEvent("heartguard-open-settings"));
  };

  const isCurrentActive = (path) => {
    if (activeKey) {
      return activeKey === path;
    }
    if (path === "/") {
      return location.pathname === "/";
    }
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const isProfileActive = isCurrentActive("/profile");

  return (
    <>
      {/* Desktop Expand Button (Visible when sidebar is collapsed on desktop >= 769px) */}
      {isDesktopCollapsed && (
        <button
          type="button"
          className="dashboard-desktop-expand-btn"
          onClick={toggleDesktopSidebar}
          title="Open navigation sidebar"
          aria-label="Open navigation sidebar"
          aria-expanded={false}
        >
          <Menu size={18} aria-hidden="true" />
          <span>Menu</span>
        </button>
      )}

      {/* Mobile Top Header (< 768px) */}
      <header className="dashboard-mobile-header" aria-label="Mobile Navigation Bar">
        <button
          type="button"
          className="dashboard-mobile-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileOpen(true);
          }}
          aria-label="Open navigation menu"
          aria-expanded={isMobileOpen}
          aria-controls="dashboard-sidebar-drawer"
        >
          <Menu size={24} aria-hidden="true" />
        </button>

        <Link to="/" className="dashboard-mobile-brand" onClick={handleLinkClick}>
          <div className="dashboard-brand-icon">
            <HeartPulse size={20} />
          </div>
          <span>HeartGuard AI</span>
        </Link>

        <Link
          to={hasToken ? "/profile" : "/login"}
          className="dashboard-mobile-avatar"
          title={hasToken ? "Go to profile" : "Log in"}
          aria-label={hasToken ? "My Profile" : "Log in"}
          onClick={handleLinkClick}
        >
          {patientInitials}
        </Link>
      </header>

      {/* Backdrop for mobile drawer */}
      {isMobileOpen && (
        <div
          className="dashboard-sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Stationary Sidebar (Desktop Fixed / Mobile Drawer) */}
      <aside
        id="dashboard-sidebar-drawer"
        className={`dashboard-sidebar-component ${
          isDesktopCollapsed ? "desktop-collapsed" : ""
        } ${isMobileOpen ? "mobile-open" : ""}`}
        role="navigation"
        aria-label="Patient portal navigation"
      >
        {/* Sidebar Header & Brand (Stationary) */}
        <div className="dashboard-sidebar-header">
          <Link to="/" className="dashboard-sidebar-brand" onClick={handleLinkClick}>
            <div className="dashboard-brand-icon">
              <HeartPulse size={22} />
            </div>
            <div className="dashboard-brand-text">
              <h2>HeartGuard AI</h2>
              <span>Patient Portal</span>
            </div>
          </Link>

          <div className="sidebar-header-controls">
            {/* Desktop collapse button */}
            <button
              type="button"
              className="dashboard-sidebar-collapse-btn"
              onClick={toggleDesktopSidebar}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={18} aria-hidden="true" />
            </button>

            {/* Mobile close button */}
            <button
              type="button"
              className="dashboard-drawer-close"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Primary Navigation List (The ONLY part that scrolls if viewport height is limited) */}
        <nav className="dashboard-sidebar-nav" aria-label="Dashboard primary routes">
          {/* Section 1: MAIN (Items 1 to 5) */}
          <div className="nav-section-label">MAIN</div>
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`dashboard-nav-item ${active ? "active" : ""}`}
                onClick={handleLinkClick}
                aria-current={active ? "page" : undefined}
              >
                <span className="nav-icon-wrapper" aria-hidden="true">
                  <Icon size={19} />
                </span>
                <span className="nav-label">{item.label}</span>
                {active && <span className="nav-active-pill" aria-hidden="true" />}
              </Link>
            );
          })}

          {/* Section 2: SERVICES (Items 6 to 10) */}
          <div className="nav-section-label" style={{ marginTop: "10px" }}>SERVICES</div>
          {SERVICES_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`dashboard-nav-item ${active ? "active" : ""} ${
                  item.danger ? "item-danger" : ""
                }`}
                onClick={handleLinkClick}
                aria-current={active ? "page" : undefined}
              >
                <span className="nav-icon-wrapper" aria-hidden="true">
                  <Icon size={19} />
                </span>
                <span className="nav-label">{item.label}</span>
                {active && <span className="nav-active-pill" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: ACCOUNT (Clickable Patient Profile Row + Settings + Logout) */}
        <div className="dashboard-sidebar-footer">
          <div className="nav-section-label">ACCOUNT</div>

          {/* Clickable Patient Identity Row -> /profile (No separate duplicate My Profile item) */}
          <Link
            to={hasToken ? "/profile" : "/login"}
            className={`dashboard-account-patient-row ${isProfileActive ? "active" : ""}`}
            onClick={handleLinkClick}
            title={hasToken ? "Manage Profile & Medical Records" : "Sign In to your account"}
            aria-label={hasToken ? `Patient Profile: ${patientName}` : "Sign In"}
            aria-current={isProfileActive ? "page" : undefined}
          >
            <div className="account-avatar-circle" aria-hidden="true">
              {patientInitials}
            </div>
            <div className="account-patient-meta">
              <span className="account-patient-name">{patientName}</span>
              {patientEmail && <span className="account-patient-email">{patientEmail}</span>}
            </div>
            {isProfileActive && <span className="nav-active-pill" aria-hidden="true" />}
          </Link>

          {/* Settings Trigger */}
          <button
            type="button"
            className="dashboard-nav-item dashboard-settings-item"
            onClick={handleOpenSettings}
            aria-label="Open Settings"
          >
            <span className="nav-icon-wrapper" aria-hidden="true">
              <Settings size={18} />
            </span>
            <span className="nav-label">Settings</span>
          </button>

          {/* Logout / Login CTA */}
          {hasToken ? (
            <button
              type="button"
              className="dashboard-logout-button"
              onClick={handleLogoutClick}
              aria-label="Log out of account"
            >
              <LogOut size={18} aria-hidden="true" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="dashboard-login-button"
              onClick={handleLinkClick}
            >
              <LogIn size={18} aria-hidden="true" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
