import React from 'react';
import styled from 'styled-components';
import { fetchCsvData } from '../fetchUserData';
import { updateData } from '../App';
import refreshIcond from './refresh.png'


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
    return (
        <Wrapper>
            <Container style={{ width: '40%' }}>
                <h2>SE-RAN Service Status</h2>
                <div>
                {Object.keys(services).map((key, index) => {
                    const serviceData = services[key];
                    const status = serviceData ? serviceData.split(';')[2] : 'Inactive';
                    const uptime = serviceData ? serviceData.split(';')[4] : '0';
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
                <h2>Active Cell and UE Information</h2>
                <div>
                    {Array.from(Object.keys(bsevent)).map((key, index) => (
                        <p key={index}>
                        <strong>Cell ID:</strong> {key} &nbsp;&nbsp;
                        <strong>Connected UEs:</strong> {
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
                    <h2 className='CenterBarTitle'>Network Events</h2>
                    <button style={{ background: 'transparent', border: 'transparent', cursor: 'pointer' }} onClick={() => {
                        updateData(setEvent, setService);
                    }} className='CenterBarTitle'>
                        <img src={refreshIcond} alt="sync icon" style={{ width: '20px', height: '20px' }} />
                    </button>
                </div>
                <strong>Cell ID:</strong> {bsId}
                <p><strong>UE ID:</strong> {ueId}</p>
                <div>
                {bsevent[bsId] && bsevent[bsId].ue && bsevent[bsId].ue[ueId] ? (
                    <div>
                        {fieldsToRender.map((fld) => {
                        if (bsevent[bsId].ue[ueId].event[fld] === undefined) {
                            return null;
                        }
                        return (
                            <p key={fld}>
                            <strong>{fld}:</strong> {bsevent[bsId].ue[ueId].event[fld]}
                            </p>
                        );
                        })}
                    </div>
                    ) : (
                    <p>No events</p>
                    )}

                </div>
            </Container>
        </Wrapper>
    );
};


export default CenterBar;