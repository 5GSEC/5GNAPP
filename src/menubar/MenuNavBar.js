import React from "react";
import { FaHome, FaUser, FaCog, FaExclamationCircle, FaCheckCircle, FaCogs } from "react-icons/fa";
import logo from "../assets/PES_TransparentWhite_Alt_Logo_G443.png";

// We'll accept a prop: setCurrentView
function MenuNavBar({ setCurrentView }) {
  // Simple style object for each menu item
  const menuItemStyle = {
    margin: "20px 0",
    cursor: "pointer"
  };

  return (
    <div style={{ width: "200px", backgroundColor: "#11182E", padding: "20px", height: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img src={logo} alt="Logo" style={{ width: "200px", marginBottom: "10px" }} />
      </div>
      <ul style={{ listStyleType: "none", padding: 0, color: "white", fontFamily: "Inter, sans-serif" }}>
        <li style={menuItemStyle} onClick={() => setCurrentView("dashboard")}>
          <FaHome /> Dashboard
        </li>
        <li style={menuItemStyle} onClick={() => { /* if you want a "profile" page or do something else */ }}>
          <FaUser /> Profile
        </li>
        <li style={menuItemStyle} onClick={() => { /* Issues page, if you'd like */ }}>
          <FaExclamationCircle /> Issues
        </li>
        <li style={menuItemStyle} onClick={() => { /* compliance page, etc. */ }}>
          <FaCheckCircle /> Compliance
        </li>
        {/* This is the new item that sets currentView to "xapps" */}
        <li style={menuItemStyle} onClick={() => setCurrentView("xapps")}>
          <FaCogs /> xApps
        </li>
        <li style={menuItemStyle} onClick={() => { /* settings or something else */ }}>
          <FaCog /> Settings
        </li>
      </ul>
    </div>
  );
}

export default MenuNavBar;
