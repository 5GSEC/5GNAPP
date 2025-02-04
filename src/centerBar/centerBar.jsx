import React from 'react';
import styled from 'styled-components';
import { fetchCsvData } from '../fetchUserData';
import refreshIcond from './refresh.png'

const Wrapper = styled.div`
  display: flex;
  gap: 5em;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const fieldsToRender = [
    "Event Name",
    "Timestamp",
    "Affected base station ID",
    "Affected UE ID",
    "Level",
    "Description"
  ];

const CenterBar = ({ setEvent, bsevent, bsId, ueId }) => {
    return (
        <Wrapper>
        <div style={{ display: "flex", gap: "2em" }}>
            <div>
                <h2>Active Cell Information</h2>
                <div>
                    {Array.from(Object.keys(bsevent)).map((key, index) => (
                        <p key={index}>
                        Cell ID: {key} &nbsp;&nbsp;
                        Connected UEs: {
                            bsevent[key]?.ue
                            ? Array.from(Object.keys(bsevent[key].ue)).length
                            : 0
                        }
                        &nbsp;&nbsp; Report interval: {bsevent[key].report_period}ms
                        </p>
                    ))}
                    </div>
                </div>
            <div>
                <div style={{ display: 'flex' }}>
                    <h2 className='CenterBarTitle'>Event Information</h2>
                    <button style={{ background: 'transparent', border: 'transparent', cursor: 'pointer' }} onClick={() => {
                        fetchCsvData(setEvent)
                    }} className='CenterBarTitle'>
                        <img src={refreshIcond} alt="sync icon" style={{ width: '20px', height: '20px' }} />
                    </button>
                </div>
                <p><strong>BS ID:</strong> {bsId}</p>
                <p><strong>UE ID:</strong> {ueId}</p>
                <div>
                {bsevent[bsId] && bsevent[bsId].ue && bsevent[bsId].ue[ueId] ? (
                    <div>
                        {fieldsToRender.map((fld) => {
                        if (bsevent[bsId].ue[ueId][fld] === undefined) {
                            return null;
                        }
                        return (
                            <p key={fld}>
                            <strong>{fld}:</strong> {bsevent[bsId].ue[ueId][fld]}
                            </p>
                        );
                        })}
                    </div>
                    ) : (
                    <p>No events</p>
                    )}

                </div>
            </div>
        </div>
        </Wrapper>
    );
};


export default CenterBar;