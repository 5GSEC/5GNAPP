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
  FaChevronUp      // ▲ icon for collapsible menu
} from "react-icons/fa";
import logo from "../assets/PES_TransparentWhite_Alt_Logo_G443.png";

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
    margin: "20px 0",
    cursor: "pointer"
  };

  const linkBaseStyle = {
    color: "inherit",
    textDecoration: "none",
    display: "block",          // make the whole line clickable
    padding: "4px 0"
  };

  /* `active` link = bold + accent colour */
  const accentColor = "#4FC3F7"; // choose any highlight colour you like
  const activeLink = { color: accentColor, fontWeight: "bold" };

  /* Indentation for sub‑items */
  const subItemStyle = {
    ...menuItemStyle,
    marginLeft: "30px"
  };

  return (
    <div
      style={{
        width: "200px",
        backgroundColor: "#11182E",
        padding: "20px",
        height: "100%"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img src={logo} alt="Logo" style={{ width: "200px", marginBottom: "10px" }} />
      </div>

      <ul
        style={{
          listStyleType: "none",
          padding: 0,
          color: "white",
          fontFamily: "Inter, sans-serif"
        }}
      >
        {/* Dashboard */}
        <li style={menuItemStyle}>
          <Link
            to="/dashboard"
            /* apply active style when pathname === "/dashboard" */
            style={{ ...linkBaseStyle, ...(pathname === "/dashboard" ? activeLink : {}) }}
          >
            <FaHome /> Dashboard
          </Link>
        </li>

        {/* Profile */}
        <li style={menuItemStyle}>
          <Link
            to="/profile"
            style={{ ...linkBaseStyle, ...(pathname === "/profile" ? activeLink : {}) }}
          >
            <FaUser /> Profile
          </Link>
        </li>

        {/* Issues */}
        <li style={menuItemStyle}>
          <Link
            to="/issues"
            style={{ ...linkBaseStyle, ...(pathname === "/issues" ? activeLink : {}) }}
          >
            <FaExclamationCircle /> Issues
          </Link>
        </li>

        {/* Compliance */}
        <li style={menuItemStyle}>
          <Link
            to="/compliance"
            style={{ ...linkBaseStyle, ...(pathname === "/compliance" ? activeLink : {}) }}
          >
            <FaCheckCircle /> Compliance
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
            <FaCogs /> xApps{" "}
            {xAppsOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </Link>
        </li>

        {/* Sub‑items (only rendered if xAppsOpen === true) */}
        {xAppsOpen && (
          <>
            <li style={subItemStyle}>
              <Link
                to="/xapps/mobiexpert"
                style={{ ...linkBaseStyle, ...(pathname === "/xapps/mobiexpert" ? activeLink : {}) }}
              >
                ▸ MobieXpert
              </Link>
            </li>
            <li style={subItemStyle}>
              <Link
                to="/xapps/mobiflow-auditor"
                style={{
                  ...linkBaseStyle,
                  ...(pathname === "/xapps/mobiflow-auditor" ? activeLink : {})
                }}
              >
                ▸ Mobiflow Auditor
              </Link>
            </li>
            {/* NEW: added mobillm page */}
            <li style={subItemStyle}>
              <Link
                to="/xapps/mobillm"
                style={{ ...linkBaseStyle, ...(pathname === "/xapps/mobillm" ? activeLink : {}) }}
              >
                ▸ MobiLLM
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
            <FaCog /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default MenuNavBar;
