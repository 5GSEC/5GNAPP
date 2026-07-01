import React, { useState, useEffect, useContext } from "react";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

import CenterBar from "../centerBar/centerBar";
import NetworkOverview from "../components/NetworkOverview";
import { HoverContext } from "../bs/bs";
import { fetchAllData } from "../backend/fetchUserData";
import { useColorMode } from "../contexts/ColorModeContext";

const update_interval = 10000;

function DashboardPage() {
  const [network, setNetwork] = useState({});
  const [services, setService] = useState({});
  const [events, setEvent] = useState({});
  const [timeSeriesData, setTimeSeriesData] = useState({});
  const { hoveredBsId, hoveredUeId } = useContext(HoverContext);
  const { isDarkMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData(setNetwork, setEvent, setService, setTimeSeriesData);
    }, update_interval);
    fetchAllData(setNetwork, setEvent, setService, setTimeSeriesData);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">5G Native Security Operations</p>
          <h1 className="dashboard-title">SE-RAN AISecOps Dashboard</h1>
        </div>
        <div className="dashboard-actions" aria-label="Dashboard actions">
          <span className="dashboard-status">Live RAN telemetry</span>
          <button className="dashboard-icon-button" type="button" aria-label="Notifications" title="Notifications">
            <NotificationsNoneOutlinedIcon fontSize="small" />
          </button>
          <button className="dashboard-icon-button" type="button" aria-label="FAQ and support" title="FAQ and support">
            <HelpOutlineOutlinedIcon fontSize="small" />
          </button>
          <button
            className="dashboard-theme-toggle"
            type="button"
            aria-label="Switch color mode"
            aria-pressed={isDarkMode}
            title="Switch color mode"
            onClick={toggleColorMode}
          >
            <LightModeOutlinedIcon className={!isDarkMode ? "theme-icon-active" : ""} fontSize="small" />
            <DarkModeOutlinedIcon className={isDarkMode ? "theme-icon-active" : ""} fontSize="small" />
          </button>
          <button className="dashboard-profile-button" type="button" aria-label="User profile" title="User profile">
            <AccountCircleOutlinedIcon fontSize="small" />
          </button>
        </div>
      </header>
      <div style={{ height: "2em" }} />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
        <CenterBar
          setNetwork={setNetwork}
          setEvent={setEvent}
          setService={setService}
          setTimeSeriesData={setTimeSeriesData}
          network={network}
          events={events}
          services={services}
          timeSeriesData={timeSeriesData}
          bsId={hoveredBsId}
          ueId={hoveredUeId}
        />
      </div>
      <NetworkOverview network={network} events={events} />
    </>
  );
}

export default DashboardPage;
