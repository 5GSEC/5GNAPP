import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUser, FaCog, FaExclamationCircle, FaCheckCircle, FaCogs } from "react-icons/fa";
import logo from "../assets/PES_TransparentWhite_Alt_Logo_G443.png";

function MenuNavBar() {
  const menuItemStyle = {
    margin: "20px 0",
    cursor: "pointer"
  };

  const linkStyle = {
    color: "inherit",
    textDecoration: "none"
  };

  return (
    <div style={{ width: "200px", backgroundColor: "#11182E", padding: "20px", height: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img src={logo} alt="Logo" style={{ width: "200px", marginBottom: "10px" }} />
      </div>

      <ul style={{ listStyleType: "none", padding: 0, color: "white", fontFamily: "Inter, sans-serif" }}>
        {/* Dashboard now points to "/dashboard" */}
        <li style={menuItemStyle}>
          <Link to="/dashboard" style={linkStyle}>
            <FaHome /> Dashboard
          </Link>
        </li>
        <li style={menuItemStyle}>
          <Link to="/profile" style={linkStyle}>
            <FaUser /> Profile
          </Link>
        </li>
        <li style={menuItemStyle}>
          <Link to="/issues" style={linkStyle}>
            <FaExclamationCircle /> Issues
          </Link>
        </li>
        <li style={menuItemStyle}>
          <Link to="/compliance" style={linkStyle}>
            <FaCheckCircle /> Compliance
          </Link>
        </li>
        <li style={menuItemStyle}>
          <Link to="/xapps" style={linkStyle}>
            <FaCogs /> xApps
          </Link>
        </li>
        <li style={menuItemStyle}>
          <Link to="/settings" style={linkStyle}>
            <FaCog /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default MenuNavBar;
