import React, { useState, useEffect, useRef } from 'react';
import './ue.css';
import cctvCamera from './cctv3.png';

const UeIcon = ({ backendEvent, ueId, isHovered, click }) => {
    const [showInfo, setShowInfo] = useState(false);
    const ueIconRef = useRef(null);


    

    useEffect(() => {
        if (backendEvent) {
            const ueIcon = document.querySelector(`#${ueId}`);
            if (ueIcon && backendEvent["level"] === "critical") {
                ueIcon.style.background = 'rgba(255, 0, 0, 0.25)';
            }
        }
    }, [backendEvent, ueId]);

    useEffect(() => {
        const handleMouseActions = () => {
            const interval = setInterval(() => {
                if (ueIconRef.current && ueIconRef.current.matches(':hover')) {
                    console.log(ueId, backendEvent);
                    setShowInfo(true);
                } else if (click) {
                    setShowInfo(false);
                }
            }, 750);
            return interval
        };
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
                    <p>{ueId} Information</p>
                    <p>Last ping: </p>
                    <p>Event Timestamp: {backendEvent["timestamp"]}</p>
                    <p>Vulnerability : {backendEvent["level"]}</p>
                </div>
            )}
        </div>
    );
};

export default UeIcon;