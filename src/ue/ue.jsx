import React, { useState, useEffect, useRef } from 'react';
import './ue.css';
import cctvCamera from './cctv3.png';

const UeIcon = ({ worstBreak, setWorstBreak, ueId, isHovered }) => {
    const [showInfo, setShowInfo] = useState(false);
    const [curBreak, setCurBreak] = useState(0.0);
    const ueIconRef = useRef(null);

    const handleMouseActions = () => {
        setInterval(() => {
            if (ueIconRef.current && ueIconRef.current.matches(':hover')) {
                setShowInfo(true);
            } else {
                setShowInfo(false);
            }
        }, 750)
    };

    useEffect(() => {
        handleMouseActions()
        const fetchData = () => {
            const ueIcon = document.querySelector(`#${ueId}`);
            if (ueIcon) {
                ueIcon.style.background = 'rgba(255, 0, 0, 0.25)';
            }
        };

        fetchData(); // Run once immediately

        const intervalId = setInterval(fetchData, 10000); // Run every 10 seconds

        return () => clearInterval(intervalId);
    }, []);

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
                    <p>UE Icon Information</p>
                    <p>Additional details about the UE icon. {ueId}</p>
                    <p>Worst Break: {worstBreak}</p>
                </div>
            )}
        </div>
    );
};

export default UeIcon;