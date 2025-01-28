import React, { useState, useEffect, useRef } from 'react';
import './ue.css';
import cctvCamera from './cctv3.png';

const UeIcon = ({ backendEvent, ueId, isHovered, click, setHoveredUeId }) => {
    const [showInfo, setShowInfo] = useState(false);
    const ueIconRef = useRef(null);

    useEffect(() => {
        if (backendEvent) {
            const ueIcon = document.querySelector(`#${ueId}`);
            if (ueIcon) {
                if (backendEvent["level"] === "critical") {
                    ueIcon.style.background = 'rgba(255, 0, 0, 0.25)';
                } else {
                    ueIcon.style.background = 'rgba(0,0,0,0)';
                }
            }
        }
    }, [backendEvent, ueId]);

    useEffect(() => {
        const handleMouseActions = () => {
            const interval = setInterval(() => {
                if (ueIconRef.current && ueIconRef.current.matches(':hover')) {
                    setShowInfo(true);
                    setHoveredUeId(ueId);
                } else if (click) {
                    setShowInfo(false);
                }
            }, 750);
            return interval;
        };
        const interval2 = handleMouseActions();

        return () => { clearInterval(interval2) };
    }, [click, ueId, setHoveredUeId]); // Reset handleMouseActions every time click changes

    return (
        <div className="ue-container">
            <div
                className="ue-icon"
                style={{ width: isHovered ? '100px' : '25px', height: isHovered ? '100px' : '25px' }}
                ref={ueIconRef}
                onMouseEnter={() => setHoveredUeId(ueId)}
            >
                <img src={cctvCamera} alt="UE Icon" className="ue-icon-img" id={ueId} style={{ width: '100%', height: '100%' }} />
            </div>
            {showInfo && (
                <div className="floating-window">
                    <p>{ueId} Information</p>
                    {Array.from(Object.keys(backendEvent)).map((key, index) => (
                        <p key={index}>{key}: {backendEvent[key]}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UeIcon;