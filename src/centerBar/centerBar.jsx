import React from 'react';
import styled from 'styled-components';
import { updateData } from '../App'; // We'll call this to refresh data from the backend
import refreshIcond from '../assets/refresh.png';

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

// This component draws our control panel and a summary of events
function CenterBar({ setEvent, setService, bsevent, services, bsId, ueId }) {

  // This function simulates calling a backend endpoint to deploy an xApp
  // We'll do a console.log for now, then refresh data
  const handleDeploy = async (svcName) => {
    console.log("Deploying", svcName, "...");
    // If we have an actual backend, we might do:
    // const res = await fetch("/deployXApp", {
    //   method: "POST",
    //   headers: {"Content-Type":"application/json"},
    //   body: JSON.stringify({ xappName: svcName })
    // });
    updateData(setEvent, setService);
  };

  // This function simulates calling a backend endpoint to undeploy an xApp
  const handleUndeploy = async (svcName) => {
    console.log("Undeploying", svcName, "...");
    // If we have an actual backend, we might do:
    // const res = await fetch("/undeployXApp", {
    //   method: "POST",
    //   headers: {"Content-Type":"application/json"},
    //   body: JSON.stringify({ xappName: svcName })
    // });
    updateData(setEvent, setService);
  };

  // We'll add some helpers to count events across the entire network
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

  // We'll also count total events for a specific cell (bsId)
  const getTotalEvents = (cellId) => {
    if (!bsevent[cellId] || !bsevent[cellId].ue) return 0;
    return Object.values(bsevent[cellId].ue).reduce((sum, ueObj) => sum + Object.keys(ueObj.event).length, 0);
  };

  // We'll also count critical events for a specific cell
  const getCriticalEvents = (cellId) => {
    if (!bsevent[cellId] || !bsevent[cellId].ue) return 0;
    return Object.values(bsevent[cellId].ue).reduce((sum, ueObj) => {
      return sum + Object.values(ueObj.event).filter(ev => ev.Level === 'Critical').length;
    }, 0);
  };

  return (
    <Wrapper>
      <Container style={{ width: '40%' }}>
        <h2 style={{marginTop: '0em'}}>Control-Plane RIC Services</h2>
        <div>
          {
            // We'll list each service in 'services'
            Object.keys(services).map((svcName, idx) => {
              // The data might look like "ricxapp-mobiflow-auditor-xxx;1/1;Running;0;95m"
              // We'll split by ';' to get parts
              const rawData = services[svcName] || "";
              const parts = rawData.split(';');
              const status = parts[2] || 'Inactive';
              const uptime = parts[4] || '';
              const displayStatus = (status !== 'Inactive') ? `${status} (${uptime})` : status;
              const isRunning = (status === 'Running');

              return (
                <div key={idx} style={{ marginBottom: '1em' }}>
                  <p style={{ margin: 0 }}>
                    <StatusIndicator status={status} />
                    <strong>Service:</strong> {svcName} &nbsp;&nbsp;
                    <strong>Status:</strong> {displayStatus}
                  </p>
                  {
                    isRunning
                      ? <button onClick={() => handleUndeploy(svcName)}>Undeploy</button>
                      : <button onClick={() => handleDeploy(svcName)}>Deploy</button>
                  }
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
              // We'll refresh data
              updateData(setEvent, setService);
            }}
            className='CenterBarTitle'
          >
            <img src={refreshIcond} alt="sync icon" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
        <div>
          {
            // We'll list all cells in bsevent
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
            // If user has selected a cell and a UE
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
            // If user has selected only a cell
            : bsId && !ueId
            ? (
              <div>
                <strong>Total Events</strong>: {getTotalEvents(bsId)}
                <p><strong>Critical Events</strong>: {getCriticalEvents(bsId)}</p>
              </div>
            )
            // If no cell or UE is selected, show global
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
