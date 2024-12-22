import React from 'react';

const CenterBar = ({ bsevent, bsId, ueId }) => {
    return (
        <div>
            <h2>Event Information</h2>
            <p><strong>BS ID:</strong> {bsId}</p>
            <p><strong>UE ID:</strong> {ueId}</p>
            <div>

            {bsevent[bsId] && bsevent[bsId][ueId] ? Array.from(Object.keys(bsevent[bsId][ueId])).map((key, index) => (
                <p key={index}>{key}: {bsevent[bsId][ueId][key]}</p>
            )): <p>No events</p>}
            </div>
        </div>
    );
};

export default CenterBar;