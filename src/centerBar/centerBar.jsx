import React from 'react';
import { fetchUserData } from '../fetchUserData';
import refreshIcond from './refresh.png'

const CenterBar = ({ setEvent, bsevent, bsId, ueId }) => {
    return (
        
        <div style={{ display: "flex", gap: "2em" }}>
            <div>
                <h2>Base Station Information</h2>
                <div>
                    {Array.from(Object.keys(bsevent)).map((key, index) => (
                        <p>Station: {key}  &nbsp;&nbsp;&nbsp;&nbsp;  Connections: {Array.from(Object.keys(bsevent[key]["stations"])).length}   &nbsp;&nbsp;&nbsp;&nbsp; Report interval: {bsevent[key]["report-period"]}ms</p>
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
                    {bsevent[bsId] && bsevent[bsId]["stations"][ueId] ? Array.from(Object.keys(bsevent[bsId]["stations"][ueId])).map((key, index) => (
                        <p key={index}>{key}: {bsevent[bsId]["stations"][ueId][key]}</p>
                    )) : <p>No events</p>}
                </div>
            </div>
        </div>
    );
};


export default CenterBar;