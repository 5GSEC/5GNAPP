import React, { useState } from 'react';
import styled from 'styled-components';
import { fetchServiceStatus } from "../backend/fetchUserData";
import { deployXapp, undeployXapp, buildXapp } from '../backend/fetchUserData';
import refreshIcond from '../assets/refresh.png';
import './centerBar.css'; // Import the external CSS file for the banner, animations, etc.
import { FaArrowRight } from 'react-icons/fa'; // Import an icon from react-icons
import { Box } from "@mui/material/index.js"; // added .js 
import ServiceGrid from './servicegrid'; // Adjust the path based on the file location
import ActiveCellInfo from './cellinfocard'; // Adjust the path based on the file location


/**
 * Wrapper: main layout container.
 * We add 'padding-top' to avoid overlap if the banner was at top,
 * but since we place the banner at bottom, you could remove it if not needed.
 */
const Wrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 1em;
  padding-top: 0em;
`;

/**
 * Container: card-like boxes to display different sections.
 */
const Container = styled.div`
  padding: 1em;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
`;

/**
 * StatusIndicator: a small colored dot indicating service state.
 */
const StatusIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => (props.status === 'Running' ? 'green' : 'red')};
  margin-right: 8px;
`;

function CenterBar({ setNetwork, setService, setEvent, setTimeSeriesData, network, events, services, bsId, ueId, timeSeriesData }) {
  // Banner message and visibility
  const [bannerMessage, setBannerMessage] = useState("");
  const [showBanner, setShowBanner] = useState(false);

  // Optional: different banner styles for success/error/info
  const [bannerStyle, setBannerStyle] = useState("banner-info");

  // isFadingOut: if true, we'll apply a fadeOut class to the banner
  const [isFadingOut, setIsFadingOut] = useState(false);

  /**
   * showNotification: shows a banner, then after a delay triggers fadeOut
   * before finally removing it from DOM. The total time is 7s (6.6s visible + 0.4s fade).
   */
  const showNotification = (msg, styleClass = "banner-info") => {
    // Reset any fade-out state so we can start fresh
    setIsFadingOut(false);

    setBannerMessage(msg);
    setBannerStyle(styleClass);
    setShowBanner(true);

    // Wait 6.6s (adjust as needed) -> start fadeOut
    setTimeout(() => {
      setIsFadingOut(true);
    }, 6600);

    // At 7s, remove the banner from DOM
    setTimeout(() => {
      setShowBanner(false);
      setBannerMessage("");
      setIsFadingOut(false);
    }, 7000);
  };

  /**
   * handleDeploy: calls deployXapp, shows banner notifications.
   */
  const handleDeploy = async (svcName) => {
    showNotification(`Deploying ${svcName}...`, "banner-info");
    try {
      await deployXapp(svcName);
      showNotification(`Deploy of ${svcName} finished!`, "banner-success");
    } catch (e) {
      showNotification(`Deploy of ${svcName} failed: ${e.message}`, "banner-error");
    } finally {
      fetchServiceStatus(setService);
    }
  };

  /**
   * handleUndeploy: calls undeployXapp, shows banner notifications.
   */
  const handleUndeploy = async (svcName) => {
    showNotification(`Undeploying ${svcName}...`, "banner-info");
    try {
      await undeployXapp(svcName);
      showNotification(`Undeploy of ${svcName} finished!`, "banner-success");
    } catch (e) {
      showNotification(`Undeploy of ${svcName} failed: ${e.message}`, "banner-error");
    } finally {
      fetchServiceStatus(setService);
    }
  };

  /**
   * handleBuild: calls buildXapp, shows banner notifications.
   */
  const handleBuild = async (svcName) => {
    showNotification(`Building ${svcName}...`, "banner-info");
    try {
      await buildXapp(svcName);
      showNotification(`Build of ${svcName} finished successfully!`, "banner-success");
    } catch (e) {
      showNotification(`Build of ${svcName} failed: ${e.message}`, "banner-error");
    } finally {
      fetchServiceStatus(setService);
    }
  };

  return (
    <>
      {/* If showBanner is true, display our banner with fadeOut if needed */}
      {showBanner && (
        <div
          className={`banner-container ${bannerStyle} ${isFadingOut ? "fadeOut" : ""}`}
        >
          {bannerMessage}
        </div>
      )}

      <Box sx={{ display: "flex", gap: 2, padding: 0, width: "100%" }}>
        {/* First container: RIC Services */}
        <Box sx={{ flex: 1, width: "50%" }}>
          <ServiceGrid
            services={services}
            handleBuild={handleBuild}
            handleDeploy={handleDeploy}
            handleUndeploy={handleUndeploy}
          />
        </Box>

        {/* Second container: Active Cell & UE Information */}
        <Box sx={{ display: "flex", maxWidth: "70%", width: "45%" }}>
          <ActiveCellInfo
            network={network}
            events={events}
            timeSeriesData={timeSeriesData}
            bsId={bsId}
            setNetwork={setNetwork}
            setEvent={setEvent}
            setService={setService}
            setTimeSeriesData={setTimeSeriesData}
          />
        </Box>
      </Box>
    </>
  );
}

export default CenterBar;
