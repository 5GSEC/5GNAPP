import React from 'react';
import { fetchUserData } from '../fetchUserData';
import refreshIcond from './refresh.png'


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
        
        <div style={{ display: "flex", gap: "2em" }}>
            <div>
                <h2>Base Station Information</h2>
                <div>
                    {Array.from(Object.keys(bsevent)).map((key, index) => (
                        <p key={index}>
                        Station: {key} &nbsp;&nbsp;
                        Connections: {
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
                        fetchUserData(setEvent)
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
    );
};


export default CenterBar;