import "./App.css";
import React, { useState, useEffect, useContext } from "react";
import { BsIcon, BsIconProvider, HoverContext } from "./bs/bs";
import CenterBar from "./centerBar/centerBar";
import MenuNavBar from "./menubar/MenuNavBar";
import { fetchCsvData, fetchSdlData, fetchServiceStatus } from "./backend/fetchUserData";

const data_simulation = 1; // 0 for SDL data, 1 for CSV data (simulation)
const update_interval = 10000; // data update interval in milliseconds

export function updateData(setEvent, setService) {
  if (data_simulation === 1) {
    fetchCsvData(setEvent);
    // we set sample data for services
    setService({
      "mobiexpert-xapp": "",
      "mobiflow-auditor": "ricxapp-mobiflow-auditor-6f695ddc84-8n469;1/1;Running;0;95m",
      "mobiintrospect": "",
      "mobiwatch-xapp": "",
      "ricplt-e2mgr": "deployment-ricplt-e2mgr-b988db566-hrhj2;1/1;Running;2;4d20h"
    });
  } else {
    fetchSdlData(setEvent);
    fetchServiceStatus(setService);
  }
}

// Just a placeholder "XApps management" page
function XAppsPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>XApps Management</h2>
      <p>Here we can show or manage xApps or do something else.</p>
    </div>
  );
}

function AppContent() {
  // track data
  const [bevent, setEvent] = useState({});
  const [services, setService] = useState({});
  // track current view => "dashboard" or "xapps" or ...
  const [currentView, setCurrentView] = useState("dashboard");

  const { hoveredBsId, hoveredUeId } = useContext(HoverContext);

  useEffect(() => {
    const interval = setInterval(() => {
      updateData(setEvent, setService);
    }, update_interval);

    updateData(setEvent, setService);

    return () => clearInterval(interval); 
  }, []);

  // We'll create a small helper that decides what to render in "main content" 
  const renderMainContent = () => {
    if (currentView === "dashboard") {
      return (
        <>
          {/* The existing dashboard or "UE/BS" page */}
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
    } else if (currentView === "xapps") {
      return <XAppsPage />;
    } else {
      // default or fallback
      return <div>Not Found</div>;
    }
  };

  return (
    <div className="container" style={{ display: "flex" }}>
      {/* We pass setCurrentView to MenuNavBar so we can navigate */}
      <MenuNavBar setCurrentView={setCurrentView} />
      <div className="content" style={{ flex: 1 }}>
        {renderMainContent()}
      </div>
    </div>
  );
}

function App() {
  return (
    <BsIconProvider>
      <AppContent />
    </BsIconProvider>
  );
}

export default App;
