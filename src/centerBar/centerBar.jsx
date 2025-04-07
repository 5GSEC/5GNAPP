import React, { useState } from 'react'; // useState is used to manage the state of the component
import styled from 'styled-components';
import { updateData } from '../App'; // We'll call this to refresh data from the backend
import { deployXapp, undeployXapp, buildXapp } from '../backend/fetchUserData';
import refreshIcond from '../assets/refresh.png';

// TODO:
// 1) change the window to a non-blocking window(maybe a banner) for notification
// 2) remove the confirmation button (change it to a 5 second timer banner)
// 3) improve the window UI (fonts, colors, etc.)
// 4) after build is initiated, if the xapp folder exists, go into the folder and checkout the correct branch and pull the latest code



// Using styled-components for layout and styling
const Wrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 1em;
`;

const Container = styled.div`
  padding: 1em;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => (props.status === 'Running' ? 'green' : 'red')};
  margin-right: 8px;
`;

// We'll show these fields in our pop-up or any detail area if needed
const fieldsToRender = [
  "Event Name",
  "Timestamp",
  "Affected base station ID",
  "Level",
  "Description"
];

/** A simple “overlay” style for a popup/modal */
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.3); 
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 2em;
  border-radius: 6px;
  max-width: 400px;
  text-align: center;
`;

// This component draws our control panel and a summary of events
function CenterBar({ setEvent, setService, bsevent, services, bsId, ueId }) {
  // 1) state for controlling the popup
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // optional: you can store logs or errors if you like
  // const [logs, setLogs] = useState("");

  const handleDeploy = async (svcName) => {
    setIsLoading(true);
    setShowModal(true);
    setModalMessage(`Deploying ${svcName}... please wait.`);
    try {
      // Wait for the fetch call to complete
      const result = await deployXapp(svcName);
      // setModalMessage(`Deploy of ${svcName} finished!\nLogs: ${JSON.stringify(result.logs)}`);
      setModalMessage(`Deploy of ${svcName} finished!\n`);
    } catch (e) {
      setModalMessage(`Deploy of ${svcName} failed: ${e.message}`);
    } finally {
      setIsLoading(false);
      updateData(setEvent, setService);
    }
  };
  
  const handleUndeploy = async (svcName) => {
    setIsLoading(true);
    setShowModal(true);
    setModalMessage(`Undeploying ${svcName}... please wait.`);
    try {
      const result = await undeployXapp(svcName);
      // setModalMessage(`Undeploy of ${svcName} finished!\nLogs: ${JSON.stringify(result.logs)}`);
      setModalMessage(`Undeploy of ${svcName} finished!\n`);
    } catch (e) {
      setModalMessage(`Undeploy of ${svcName} failed: ${e.message}`);
    } finally {
      setIsLoading(false);
      updateData(setEvent, setService);
    }
  };  


  const handleBuild = async (svcName) => {
    setIsLoading(true);
    setShowModal(true);
    setModalMessage(`Building ${svcName}... please wait.`);
    try {
      // This awaits the fetch call, so it won't proceed 
      // until the server has finished building
      const result = await buildXapp(svcName);
      setModalMessage(`Build of ${svcName} finished successfully!`);
      // If you want to see logs, they might be at result.logs
      // setModalMessage(`Build finished! Logs: ${JSON.stringify(result.logs)}`);
    } catch (e) {
      setModalMessage(`Build of ${svcName} failed: ${e.message}`);
    } finally {
      setIsLoading(false);
      updateData(setEvent, setService);
    }
  };


  const getTotalEventsGlobal = () => {
    return Object.values(bsevent).reduce((total, bs) => {
      if (!bs.ue) return total;
      return total + Object.values(bs.ue).reduce((ueTotal, ue) => ueTotal + Object.keys(ue.event).length, 0);
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
    return Object.values(bsevent[cellId].ue).reduce((sum, ueObj) => sum + Object.keys(ueObj.event).length, 0);
  };

  const getCriticalEvents = (cellId) => {
    if (!bsevent[cellId] || !bsevent[cellId].ue) return 0;
    return Object.values(bsevent[cellId].ue).reduce((sum, ueObj) => {
      return sum + Object.values(ueObj.event).filter(ev => ev.Level === 'Critical').length;
    }, 0);
  };

  return (
    <Wrapper>
      {/* if showModal is true，display the window */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <p>{modalMessage}</p>
            {/* if it is still loading , do not display closing window button until it is loaded or failed*/}
            {!isLoading && (
              <button onClick={() => setShowModal(false)}>OK</button>
            )}
          </ModalContent>
        </ModalOverlay>
      )}

      <Container style={{ width: '40%' }}>
        <h2 style={{marginTop: '0em'}}>Control-Plane RIC Services</h2>
        <div>
          {
            Object.keys(services).map((svcName, idx) => {
              const rawData = services[svcName] || "";
              const parts = rawData.split(';');
              const status = parts[2] || 'Inactive';
              const uptime = parts[4] || '';
              const displayStatus = (status !== 'Inactive') ? `${status} (${uptime})` : status;

              return (
                <div key={idx} style={{ marginBottom: '1em' }}>
                  <p style={{ margin: 0 }}>
                    <StatusIndicator status={status} />
                    <strong>Service:</strong> {svcName} &nbsp;&nbsp;
                    <strong>Status:</strong> {displayStatus}
                  </p>
                  <button onClick={() => handleDeploy(svcName)}>Deploy</button>
                  <button onClick={() => handleBuild(svcName)} style={{ marginLeft: '8px' }}>Build</button>
                  <button onClick={() => handleUndeploy(svcName)} style={{ marginLeft: '8px' }}>Undeploy</button>
                </div>
              );
            })
          }
        </div>
      </Container>

      <Container style={{ width: '40%' }}>
        <div style={{ display: 'flex'}}>
          <h2 style={{margin: '0em'}}>Active Cell and UE Information</h2>
          <button
            style={{
              background: 'transparent',
              border: 'transparent',
              cursor: 'pointer',
              marginTop: '3px',
              height: '100%'
            }}
            onClick={() => {
              updateData(setEvent, setService);
            }}
            className='CenterBarTitle'
          >
            <img src={refreshIcond} alt="sync icon" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
        <div>
          {
            Object.keys(bsevent).map((cellId, index) => {
              const ueCount = bsevent[cellId]?.ue
                ? Object.keys(bsevent[cellId].ue).length
                : 0;
              const repPeriod = bsevent[cellId].report_period || 0;
              return (
                <p key={index}>
                  <strong>Cell ID:</strong> {cellId} &nbsp;&nbsp;
                  <strong>Active UEs:</strong> {ueCount} &nbsp;&nbsp;
                  <strong>Report interval:</strong> {repPeriod/1000}s
                </p>
              );
            })
          }
        </div>
      </Container>

      <Container style={{ width: '20%' }}>
        <div style={{ display: 'flex' }}>
          <h2 style={{marginTop: '0em'}}>Network Events</h2>
        </div>
        <strong>Current Cell:</strong> {bsId}
        <p><strong>Current UE:</strong> {ueId}</p>
        <div>
          {
            bsevent[bsId] && bsevent[bsId].ue && bsevent[bsId].ue[ueId]
            ? (
              <div>
                {
                  bsId && ueId && (
                    <>
                      <strong>Total Events</strong>: {
                        Object.keys(bsevent[bsId].ue[ueId].event).length
                      }
                      <p>
                        <strong>Critical Events</strong>: {
                          Object.values(bsevent[bsId].ue[ueId].event).filter(ev => ev.Level === 'Critical').length
                        }
                      </p>
                    </>
                  )
                }
              </div>
            )
            : bsId && !ueId
            ? (
              <div>
                <strong>Total Events</strong>: {getTotalEvents(bsId)}
                <p><strong>Critical Events</strong>: {getCriticalEvents(bsId)}</p>
              </div>
            )
            : (
              <div>
                <strong>Total Events</strong>: {getTotalEventsGlobal()}
                <p><strong>Critical Events</strong>: {getCriticalEventsGlobal()}</p>
              </div>
            )
          }
        </div>
      </Container>
    </Wrapper>
  );
}

export default CenterBar;