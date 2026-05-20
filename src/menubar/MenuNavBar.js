import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";   // NEW useLocation
import {
  FaHome,
  FaUser,
  FaCog,
  FaExclamationCircle,
  FaCheckCircle,
  FaCogs,
  FaChevronDown,   // ▼ icon for expandable menu
  FaChevronUp,     // ▲ icon for collapsible menu
  FaUserCircle
} from "react-icons/fa";
import logo from "../assets/SE-RAN-icon-3D-wide.png";

function MenuNavBar() {
  /* -------------------------------------------------
     NEW: read current route so we can highlight links
  ------------------------------------------------- */
  const location = useLocation();
  const pathname = location.pathname;           // e.g. "/xapps/mobiexpert"

  /* Keep xApps submenu open if the current URL is under /xapps */
  const [xAppsOpen, setXAppsOpen] = useState(pathname.startsWith("/xapps"));

  /* Auto‑open submenu every time we navigate to an /xapps/* page */
  useEffect(() => {
    if (pathname.startsWith("/xapps")) setXAppsOpen(true);
  }, [pathname]);

  /* ---------- styling helpers ---------- */
  const menuItemStyle = {
    margin: "10px 0",
    cursor: "pointer"
  };

  const linkBaseStyle = {
    alignItems: "center",
    borderRadius: "6px",
    color: "#b8cce4",
    display: "flex",
    fontSize: "0.94rem",
    fontWeight: 600,
    gap: "10px",
    lineHeight: 1.2,
    minHeight: "36px",
    padding: "0 10px",
    textDecoration: "none",
    transition: "background-color 140ms ease, color 140ms ease"
  };

  /* `active` link = bold + accent colour */
  const activeLink = {
    backgroundColor: "rgba(143, 190, 245, 0.14)",
    boxShadow: "inset 3px 0 0 #8fbfff",
    color: "#f3f8ff",
    fontWeight: 750
  };

  /* Indentation for sub‑items */
  const subItemStyle = {
    ...menuItemStyle,
    marginLeft: "18px"
  };

  const subLinkBaseStyle = {
    ...linkBaseStyle,
    color: "#9bb0c9",
    fontSize: "0.88rem",
    fontWeight: 600,
    minHeight: "32px",
    paddingLeft: "14px"
  };

  const texturePanelStyle = {
    flex: 1,
    minHeight: "80px",
    margin: "20px -10px 0",
    opacity: 0.92,
    backgroundColor: "#071528",
    backgroundImage: `
      radial-gradient(circle at 16% 42%, rgba(37, 165, 255, 0.95) 0 2px, transparent 3px),
      radial-gradient(circle at 42% 30%, rgba(37, 165, 255, 0.75) 0 2px, transparent 3px),
      radial-gradient(circle at 72% 54%, rgba(37, 165, 255, 0.65) 0 2px, transparent 3px),
      radial-gradient(circle at 28% 70%, rgba(37, 165, 255, 0.75) 0 2px, transparent 3px),
      linear-gradient(30deg, transparent 0 47%, rgba(86, 154, 210, 0.16) 48% 52%, transparent 53%),
      linear-gradient(150deg, transparent 0 47%, rgba(86, 154, 210, 0.13) 48% 52%, transparent 53%),
      linear-gradient(90deg, transparent 0 47%, rgba(86, 154, 210, 0.10) 48% 52%, transparent 53%),
      radial-gradient(circle at 50% 38%, rgba(28, 118, 205, 0.18), transparent 44%)
    `,
    backgroundSize: "92px 92px, 110px 110px, 120px 120px, 96px 96px, 64px 56px, 64px 56px, 64px 56px, 100% 100%",
    // borderTop: "1px solid rgba(143, 190, 245, 0.12)",
    // borderBottom: "1px solid rgba(143, 190, 245, 0.14)",
  };

  const profileBlockStyle = {
    alignItems: "center",
    background: "linear-gradient(180deg, rgba(9, 28, 50, 0.98), rgba(5, 16, 31, 0.98))",
    borderTop: "1px solid rgba(143, 190, 245, 0.18)",
    // borderRadius: "8px",
    boxShadow: "0 8px 22px rgba(0, 0, 0, 0.32)",
    color: "#f3f8ff",
    display: "flex",
    gap: "12px",
    margin: "0",
    padding: "14px 12px",
  };

  return (
    <div
      style={{
        width: "200px",
        backgroundColor: "#071528",
        height: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
        position: "sticky",
        top: 0,
        boxShadow: "0 8px 22px rgba(0, 0, 0, 0.32)",
        border: "1px solid rgba(143, 190, 245, 0.18)",
        // height: "100%"
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          minHeight: 0,
          padding: "10px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img src={logo} alt="Logo" style={{ width: "180px", marginBottom: "10px" }} />
        </div>

        <ul
          style={{
            listStyleType: "none",
            padding: 0,
            color: "#b8cce4",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            letterSpacing: 0,
            margin: 0,
            flex: "0 0 auto"
          }}
        >
        {/* Dashboard */}
        <li style={menuItemStyle}>
          <Link
            to="/dashboard"
            /* apply active style when pathname === "/dashboard" */
            style={{ ...linkBaseStyle, ...(pathname === "/dashboard" ? activeLink : {}) }}
          >
            <FaHome size={15} /> Dashboard
          </Link>
        </li>

        {/* Issues */}
        <li style={menuItemStyle}>
          <Link
            to="/issues"
            style={{ ...linkBaseStyle, ...(pathname === "/issues" ? activeLink : {}) }}
          >
            <FaExclamationCircle size={15} /> Issues
          </Link>
        </li>

        {/* Profile */}
        <li style={menuItemStyle}>
          <Link
            to="/profile"
            style={{ ...linkBaseStyle, ...(pathname === "/profile" ? activeLink : {}) }}
          >
            <FaUser size={15} /> Profile
          </Link>
        </li>

        {/* Compliance */}
        <li style={menuItemStyle}>
          <Link
            to="/compliance"
            style={{ ...linkBaseStyle, ...(pathname === "/compliance" ? activeLink : {}) }}
          >
            <FaCheckCircle size={15} /> Compliance
          </Link>
        </li>

        {/* ------------------------------
           xApps parent + collapsible list
        ------------------------------ */}
        <li style={menuItemStyle}>
          {/* 
            NEW: change <span> to <Link> so we can:
            - navigate to "/xapps" Overview
            - and also toggle submenu open/close
          */}
          <Link
            to="/xapps"
            onClick={() => setXAppsOpen((prev) => !prev)} // NEW: toggle submenu
            style={{
              ...linkBaseStyle,
              ...(pathname.startsWith("/xapps") ? activeLink : {})
            }}
          >
            <FaCogs size={15} /> <span style={{ flex: 1 }}>xApps</span>
            {xAppsOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </Link>
        </li>

        {/* Sub‑items (only rendered if xAppsOpen === true) */}
        {xAppsOpen && (
          <>
            <li style={subItemStyle}>
              <Link
                to="/xapps/mobiexpert"
                style={{ ...subLinkBaseStyle, ...(pathname === "/xapps/mobiexpert" ? activeLink : {}) }}
              >
                MobieXpert
              </Link>
            </li>
            {/* <li style={subItemStyle}>
              <Link
                to="/xapps/mobiflow-auditor"
                style={{
                  ...linkBaseStyle,
                  ...(pathname === "/xapps/mobiflow-auditor" ? activeLink : {})
                }}
              >
                ▸ Mobiflow Auditor
              </Link>
            </li> */}
            {/* NEW: added mobillm page */}
            <li style={subItemStyle}>
              <Link
                to="/xapps/mobillm"
                style={{ ...subLinkBaseStyle, ...(pathname === "/xapps/mobillm" ? activeLink : {}) }}
              >
                MobiLLM
              </Link>
            </li>
          </>
        )}

        {/* Settings */}
        <li style={menuItemStyle}>
          <Link
            to="/settings"
            style={{ ...linkBaseStyle, ...(pathname === "/settings" ? activeLink : {}) }}
          >
            <FaCog size={15} /> Settings
          </Link>
        </li>
        </ul>

        <div style={texturePanelStyle} aria-hidden="true" />
      </div>

      <div style={profileBlockStyle}>
        <div
          style={{
            alignItems: "center",
            background: "radial-gradient(circle at 35% 25%, #2ae4ff, #2464d8 72%)",
            border: "2px solid #4fd0ff",
            borderRadius: "50%",
            boxShadow: "0 0 0 3px rgba(79, 208, 255, 0.16), 0 0 18px rgba(79, 208, 255, 0.38)",
            display: "flex",
            flex: "0 0 auto",
            height: "42px",
            justifyContent: "center",
            width: "42px",
          }}
        >
          <FaUserCircle size={30} color="#06172b" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: "#f3f8ff", fontSize: "0.78rem", fontWeight: 750, lineHeight: 1.25 }}>
            System Admin
          </div>
          <div style={{ color: "#9bb0c9", fontSize: "0.66rem", fontWeight: 650, marginTop: "4px" }}>
            Super Admin
          </div>
        </div>
        <FaChevronDown size={13} color="#9bb0c9" />
      </div>
    </div>
  );
}

export default MenuNavBar;
