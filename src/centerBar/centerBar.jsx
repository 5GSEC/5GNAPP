import React from 'react';

const CenterBar = ({ bsevent, bsId, ueId }) => {
    return (
        <div>
            <h2>Event Information</h2>
            {/* <p><strong>Event:</strong> {bsevent}</p> */}
            <p><strong>BS ID:</strong> {bsId}</p>
            <p><strong>UE ID:</strong> {ueId}</p>
        </div>
    );
};

export default CenterBar;