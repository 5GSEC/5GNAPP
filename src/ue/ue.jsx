import React, { useState, useEffect } from 'react';
import './ue.css';
import cctvCamera from './cctv3.png';

const UeIcon = ({ worstBreak, setWorstBreak, ueId }) => {
    const [showInfo, setShowInfo] = useState(false);
    const [curBreak, setCurBreak] = useState(0.0);

    const handleMouseEnter = () => {
        setShowInfo(true);
    };

    const handleMouseLeave = () => {
        setTimeout(() => {
            setShowInfo(false);
        }, 250); // .25 second delay to avoid the ui bouncing back and forth
    };
    

    useEffect(() => {
        const fetchData = () => {
            const ueIcon = document.querySelector('.ue-icon-img');
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
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
            >
                <img src={cctvCamera} alt="UE Icon" className="ue-icon-img" />
            </div>
            {/* when the info is shown then  */}
            {showInfo && (
                <div className="floating-window">
                    <p>UE Icon Information</p>
                    <p>Additional details about the UE icon.</p>
                    <p>Worst Break: {worstBreak}</p>
                </div>
            )}
        </div>
    );
};

export default UeIcon;