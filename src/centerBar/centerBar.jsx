import React from 'react';
import styled from 'styled-components';
import { fetchCsvData } from '../backend/fetchUserData';
import { updateData } from '../App';
import refreshIcond from '../assets/refresh.png'


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

const fieldsToRender = [
    "Event Name",
    "Timestamp",
    "Affected base station ID",
    // "Affected UE ID",
    "Level",
    "Description"
  ];

const CenterBar = ({ setEvent, setService, bsevent, services, bsId, ueId }) => {
    const getTotalEventsGlobal = () => {
        return Object.values(bsevent).reduce((total, bs) => {
            if (!bs.ue) return total;
            return total + Object.values(bs.ue).reduce((ueTotal, ue) => ueTotal + Object.keys(ue.event).length, 0);
          }, 0);
    };

    const getCriticalEventsGlobal = () => {
        return Object.values(bsevent).reduce((total, bs) => {
            if (!bs.ue) return total;
            return total + Object.values(bs.ue).reduce((ueTotal, ue) => ueTotal + Object.values(ue.event).filter(event => event.Level === 'Critical').length, 0);
          }, 0);
    };

    const getTotalEvents = (bsId) => {
        if (!bsevent[bsId] || !bsevent[bsId].ue) return 0;
        return Object.values(bsevent[bsId].ue).reduce((total, ue) => total + Object.keys(ue.event).length, 0);
    };
    
    const getCriticalEvents = (bsId) => {
        if (!bsevent[bsId] || !bsevent[bsId].ue) return 0;
        return Object.values(bsevent[bsId].ue).reduce((total, ue) => total + Object.values(ue.event).filter(event => event.Level === 'Critical').length, 0);
    };

    return (
        <Wrapper>
            <Container style={{ width: '40%' }}>
                <h2 style={{marginTop: '0em'}}>Control-Plane RIC Services</h2>
                <div>
                {Object.keys(services).map((key, index) => {
                    const serviceData = services[key];
                    const status = serviceData ? serviceData.split(';')[2] : 'Inactive';
                    const uptime = serviceData ? serviceData.split(';')[4] : ' ';
                    const displayStatus = status !== 'Inactive' ? `${status} (${uptime})` : status;
                    return (
                    <p key={index}>
                        <StatusIndicator status={status} />
                        <strong>Service:</strong> {key} &nbsp;&nbsp; <strong>Status:</strong> {displayStatus}
                    </p>
                    );
                })}
                </div>
            </Container>
            <Container style={{ width: '40%' }}>
                <div style={{ display: 'flex'}}>
                    <h2 style={{margin: '0em'}}>Active Cell and UE Information</h2>
                    <button style={{ background: 'transparent', border: 'transparent', cursor: 'pointer', marginTop: '3px', height: '100%'}} onClick={() => {
                            updateData(setEvent, setService);
                        }} className='CenterBarTitle'>
                            <img src={refreshIcond} alt="sync icon" style={{ width: '20px', height: '20px' }} />
                    </button>
                </div>
                <div>
                    {Array.from(Object.keys(bsevent)).map((key, index) => (
                        <p key={index}>
                        <strong>Cell ID:</strong> {key} &nbsp;&nbsp;
                        <strong>Active UEs:</strong> {
                            bsevent[key]?.ue
                            ? Array.from(Object.keys(bsevent[key].ue)).length
                            : 0
                        }
                        &nbsp;&nbsp; <strong>Report interval:</strong> {bsevent[key].report_period/1000}s
                        </p>
                    ))}
                </div>
            </Container>
            <Container style={{ width: '20%' }}>
                <div style={{ display: 'flex' }}>
                    <h2 style={{marginTop: '0em'}}>Network Events</h2>
                </div>
                <strong>Current Cell:</strong> {bsId}
                <p><strong>Current UE:</strong> {ueId}</p>
                <div>
                {bsevent[bsId] && bsevent[bsId].ue && bsevent[bsId].ue[ueId] ? (
                    <div>
                        {bsId && ueId && (
                            <>
                            <strong>Total Events</strong>: {Object.keys(bsevent[bsId].ue[ueId].event).length}
                            <p><strong>Critical Events</strong>: {Object.values(bsevent[bsId].ue[ueId].event).filter(event => event.Level === 'Critical').length}</p>
                            </>
                        )}
                        {/* {fieldsToRender.map((fld) => {
                        if (bsevent[bsId].ue[ueId].event[fld] === undefined) {
                            return null;
                        }
                        return (
                            <p key={fld}>
                            <strong>{fld}:</strong> {bsevent[bsId].ue[ueId].event[fld]}
                            </p>
                        );
                        })} */}
                    </div>
                    ) : bsId && !ueId ? (
                        <div>
                          <strong>Total Events</strong>: {getTotalEvents(bsId)}
                          <p><strong>Critical Events</strong>: {getCriticalEvents(bsId)}</p>
                        </div>
                    ) : (
                    <div>
                        <strong>Total Events</strong>: {getTotalEventsGlobal()}
                        <p><strong>Critical Events</strong>: {getCriticalEventsGlobal()}</p>
                    </div>
                    )}
                </div>
            </Container>
        </Wrapper>
    );
};


export default CenterBar;