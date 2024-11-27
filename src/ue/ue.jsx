import React, { useState, useEffect, useRef } from 'react';
import './ue.css';
import cctvCamera from './cctv3.png';

const UeIcon = ({ backendEvent, ueId, isHovered, click }) => {
    const [showInfo, setShowInfo] = useState(false);
    const ueIconRef = useRef(null);
    const [level, setLevel] = useState("normal")
    const [eventTimestamp, setEventTimestamp] = useState(0)

    const handleMouseActions = () => {
        const interval = setInterval(() => {
            if (ueIconRef.current && ueIconRef.current.matches(':hover')) {
                setShowInfo(true);
            } else if (click) {
                setShowInfo(false);
            }
        }, 750);
        return interval
    };

    useEffect(() => {
        if (backendEvent[ueId]) {
            const ueIcon = document.querySelector(`#${ueId}`);
            if (ueIcon) {
                ueIcon.style.background = 'rgba(255, 0, 0, 0.25)';
            }
            if (backendEvent[ueId]["level"]) setLevel(backendEvent[ueId]["level"]);
            if (backendEvent[ueId]["timestamp"]) setEventTimestamp(backendEvent[ueId]["timestamp"]);
        }
    }, [backendEvent]);

    useEffect(() => {
        const interval2 = handleMouseActions();

        return () => { clearInterval(interval2)};
    }, [click]); // Reset handleMouseActions every time click changes

    return (
        <div className="ue-container">
            {/* self explanatory, builds a div stores the ue */}
            <div 
                className="ue-icon" 
                style={{ width: isHovered ? '100px' : '25px', height: isHovered ? '100px' : '25px' }}
                ref={ueIconRef}
               
            >
                <img src={cctvCamera} alt="UE Icon" className="ue-icon-img" id={ueId} style={{ width: '100%', height: '100%' }} />
            </div>
            {/* when the info is shown then  */}
            {showInfo && (
                <div className="floating-window">
                    <p>{ueId.split("_")[1].slice(3)} Information</p>
                    <p>Last ping: </p>
                    <p>Event Timestamp: {eventTimestamp}</p>
                    <p>Vulnerability : {level}</p>
                </div>
            )}
        </div>
    );
};

export default UeIcon;