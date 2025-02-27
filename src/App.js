import "./App.css";
import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { BsIcon, BsIconProvider, HoverContext } from "./bs/bs";
import CenterBar from "./centerBar/centerBar";
import MenuNavBar from "./menubar/MenuNavBar";
import { fetchCsvData, fetchSdlData, fetchServiceStatus } from "./backend/fetchUserData";

import XApps from "./pages/XApps"; 

// ----------------------------------------
// Global config
// ----------------------------------------
const data_simulation = 1; 
const update_interval = 10000; 

export function updateData(setEvent, setService) {
  if (data_simulation === 1) {
    // Simulate CSV data
    fetchCsvData(setEvent);
    // Mock some service data
    setService({
      "mobiexpert-xapp": "",
      "mobiflow-auditor": "ricxapp-mobiflow-auditor-6f695ddc84-8n469;1/1;Running;0;95m",
      "mobiintrospect": "",
      "mobiwatch-xapp": "",
      "ricplt-e2mgr": "deployment-ricplt-e2mgr-b988db566-hrhj2;1/1;Running;2;4d20h"
    });
  } else {
    // Real data fetch
    fetchSdlData(setEvent);
    fetchServiceStatus(setService);
  }
}

// ----------------------------------------
// Dashboard page (path="/dashboard")
// ----------------------------------------
function DashboardPage() {
  const [bevent, setEvent] = useState({});
  const [services, setService] = useState({});
  const { hoveredBsId, hoveredUeId } = useContext(HoverContext);

  useEffect(() => {
    const interval = setInterval(() => {
      updateData(setEvent, setService);
    }, update_interval);
    updateData(setEvent, setService);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h2 className="header">5GNAPP - 5G-Native Management Platform</h2>
      <h3 className="subheader">You cannot secure what you cannot see</h3>
      <div style={{ height: "2em" }} />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
        <CenterBar
          setEvent={setEvent}
          setService={setService}
          bsevent={bevent}
          services={services}
          bsId={hoveredBsId}
          ueId={hoveredUeId}
        />
      </div>
      <div className="App">
        {Object.keys(bevent).map((bsId, index) => (
          <BsIcon
            key={index}
            bsId={bsId}
            backendEvents={bevent[bsId]["ue"]}
            backendData={bevent[bsId]}
          />
        ))}
      </div>
    </>
  );
}

// ----------------------------------------
// Profile (path="/profile")
// ----------------------------------------
function ProfilePage() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Profile Page</h2>
      <p>Placeholder for the Profile page.</p>
    </div>
  );
}

// ----------------------------------------
// Issues (path="/issues")
// ----------------------------------------
function IssuesPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Issues Page</h2>
      <p>Placeholder for the Issues page.</p>
    </div>
  );
}

// ----------------------------------------
// Compliance (path="/compliance")
// ----------------------------------------
function CompliancePage() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Compliance Page</h2>
      <p>Placeholder for the Compliance page.</p>
    </div>
  );
}



// ----------------------------------------
// Settings (path="/settings")
// ----------------------------------------
function SettingsPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Settings Page</h2>
      <p>Placeholder for the Settings page.</p>
    </div>
  );
}

// ----------------------------------------
// Root component
// ----------------------------------------
function App() {
  return (
    <BsIconProvider>
      <BrowserRouter>
        <div className="container" style={{ display: "flex" }}>
          <MenuNavBar />
          <div className="content" style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/issues" element={<IssuesPage />} />
              <Route path="/compliance" element={<CompliancePage />} />

              <Route path="/xapps" element={<XApps />} />

              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<div style={{ padding: 20 }}>Page Not Found</div>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </BsIconProvider>
  );
}

export default App;
