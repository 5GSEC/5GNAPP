import React from 'react';
import { FaHome, FaUser, FaCog, FaExclamationCircle, FaCheckCircle, FaCogs } from 'react-icons/fa'; // Importing icons from react-icons
import logo from './assets/PES_TransparentWhite_Alt_Logo_G443.png'; // Importing the logo

const MenuNavBar = () => {
  return (
    <div style={{ width: '200px', backgroundColor: '#11182E', padding: '20px', height: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src={logo} alt="Logo" style={{ width: '200px', marginBottom: '10px' }} /> {/* Adding the logo */}
      </div>
      <ul style={{ listStyleType: 'none', padding: 0, color: 'white', fontFamily: 'Inter, sans-serif' }}> {/* Changing text color to white */}
        <li style={{ margin: '20px 0' }}>
          <FaHome /> Dashboard
        </li>
        <li style={{ margin: '20px 0' }}>
          <FaUser /> Profile
        </li>
        <li style={{ margin: '20px 0' }}>
          <FaExclamationCircle /> Issues
        </li>
        <li style={{ margin: '20px 0' }}>
          <FaCheckCircle /> Compliance
        </li>
        <li style={{ margin: '20px 0' }}>
          <FaCogs /> xApps
        </li>
        <li style={{ margin: '20px 0' }}>
          <FaCog /> Settings
        </li>
      </ul>
    </div>
  );
};

export default MenuNavBar;