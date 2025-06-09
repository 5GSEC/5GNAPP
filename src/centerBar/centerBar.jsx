import React, { useState } from 'react';
import styled from 'styled-components';
import { updateData } from '../App';
import { deployXapp, undeployXapp, buildXapp } from '../backend/fetchUserData';
import refreshIcond from '../assets/refresh.png';
import './centerBar.css'; // Import the external CSS file for the banner, animations, etc.
import { FaArrowRight } from 'react-icons/fa'; // Import an icon from react-icons
import { Box } from "@mui/material";
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

function CenterBar({ setEvent, setService, bsevent, services, bsId, ueId }) {
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
      updateData(setEvent, setService);
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
      updateData(setEvent, setService);
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
      updateData(setEvent, setService);
    }
  };

  // Below are your event-counting helper functions, unchanged
  const getTotalEventsGlobal = () => {
    return Object.values(bsevent).reduce((total, bs) => {
      if (!bs.ue) return total;
      return total + Object.values(bs.ue).reduce(
        (ueTotal, ue) => ueTotal + Object.keys(ue.event).length,
        0
      );
    }, 0);
  };

  const getCriticalEventsGlobal = () => {
    return Object.values(bsevent).reduce((total, bs) => {
      if (!bs.ue) return total;
      return total + Object.values(bs.ue).reduce((ueTotal, ue) => {
        return ueTotal + Object.values(ue.event).filter(ev => ev.Level === 'Critical').length;
      }, 0);
    }, 0);
  };

  const getTotalEvents = (cellId) => {
    if (!bsevent[cellId] || !bsevent[cellId].ue) return 0;
    return Object.values(bsevent[cellId].ue).reduce(
      (sum, ueObj) => sum + Object.keys(ueObj.event).length,
      0
    );
  };

  const getCriticalEvents = (cellId) => {
    if (!bsevent[cellId] || !bsevent[cellId].ue) return 0;
    return Object.values(bsevent[cellId].ue).reduce((sum, ueObj) => {
      return sum + Object.values(ueObj.event).filter(ev => ev.Level === 'Critical').length;
    }, 0);
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
        <Box sx={{ flex: 1, maxWidth: "50%" }}>
          <ActiveCellInfo
            bsevent={bsevent}
            bsId={bsId}
            setEvent={setEvent}
            setService={setService}
            updateData={updateData}
          />
        </Box>
      </Box>

      {/* <Wrapper> */}
        {/* First container: RIC Services */}
        {/* <Container style={{ width: '50%' }}>
          <h2 style={{ marginTop: '0em' }}>SE-RAN AISecOps Services</h2>
          <div>
            {Object.keys(services).map((svcName, idx) => {
              const rawData = services[svcName] || "";
              const parts = rawData.split(';');
              const status = parts[2] || 'Inactive';
              const uptime = parts[4] || '';
              const displayStatus = (status !== 'Inactive')
                ? `${status} (${uptime})`
                : status;

              return (
                <div key={idx} style={{ marginBottom: '1em' }}>
                  <p style={{ margin: 0 }}>
                    <StatusIndicator status={status} />
                    <strong>Service:</strong> {svcName} &nbsp;&nbsp;
                    <strong>Status:</strong> {displayStatus}
                  </p>
                  <button onClick={() => handleBuild(svcName)}>Build</button>
                  <button onClick={() => handleDeploy(svcName)} style={{ marginLeft: '8px' }}>Deploy</button>
                  <button onClick={() => handleUndeploy(svcName)} style={{ marginLeft: '8px' }}>Undeploy</button>
                </div>
              );
            })}
          </div>
        </Container> */}

        {/* Second container: Active Cell & UE Information */}
        {/* <Container style={{ width: '50%' }}>
          <div style={{ display: 'flex' }}>
            <h2 style={{ margin: '0em' }}>Active Cell and UE Information</h2>
            <button
              style={{
                background: 'transparent',
                border: 'transparent',
                cursor: 'pointer',
                marginTop: '3px',
                height: '100%',
              }}
              onClick={() => updateData(setEvent, setService)}
              className='CenterBarTitle'
            >
              <img src={refreshIcond} alt="sync icon" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
          <div>
            {Object.keys(bsevent).map((cellId, index) => {
              const ueCount = bsevent[cellId]?.ue
                ? Object.keys(bsevent[cellId].ue).length
                : 0;
              const repPeriod = bsevent[cellId].report_period || 0;
              return (
                <div key={index}>
                  <p>
                    <strong>Total Events</strong>: {getTotalEvents(bsId)} &nbsp;&nbsp;
                    <strong>Critical Events</strong>: {getCriticalEvents(bsId)}
                  </p>
                  <p>
                    <strong>Cell ID:</strong> {cellId} &nbsp;&nbsp;
                    <strong>Active UEs:</strong> {ueCount} &nbsp;&nbsp;
                    <strong>Report interval:</strong> {repPeriod / 1000}s
                  </p>
                  {bsevent[cellId]?.ue &&
                    Object.keys(bsevent[cellId].ue).map((ueId) => (
                      <p key={ueId} style={{ display: 'flex', alignItems: 'center' }}>
                        <FaArrowRight style={{ marginRight: '8px', color: '#11182E' }} />
                        <strong>UE ID:</strong> {ueId} &nbsp;&nbsp;
                        <strong>S-TMSI:</strong> {bsevent[cellId].ue[ueId]?.s_tmsi || 'N/A'}
                      </p>
                    ))}
                </div>
              );
            })}
          </div>
        </Container> */}

        {/* Third container: Network Events
        <Container style={{ width: '20%' }}>
          <div style={{ display: 'flex' }}>
            <h2 style={{ marginTop: '0em' }}>Network Events</h2>
          </div>
          <strong>Current Cell:</strong> {bsId}
          <p><strong>Current UE:</strong> {ueId}</p>
          <div>
            {bsevent[bsId] && bsevent[bsId].ue && bsevent[bsId].ue[ueId] ? (
              <div>
                {bsId && ueId && (
                  <>
                    <strong>Total Events</strong>: {Object.keys(bsevent[bsId].ue[ueId].event).length}
                    <p>
                      <strong>Critical Events</strong>: {Object.values(bsevent[bsId].ue[ueId].event).filter(ev => ev.Level === 'Critical').length}
                    </p>
                  </>
                )}
              </div>
            ) : bsId && !ueId ? (
              <div>
                <strong>Total Events</strong>: {getTotalEvents(bsId)}
                <p>
                  <strong>Critical Events</strong>: {getCriticalEvents(bsId)}
                </p>
              </div>
            ) : (
              <div>
                <strong>Total Events</strong>: {getTotalEventsGlobal()}
                <p>
                  <strong>Critical Events</strong>: {getCriticalEventsGlobal()}
                </p>
              </div>
            )}
          </div>
        </Container> */}
      {/* </Wrapper> */}
    </>
  );
}

export default CenterBar;
