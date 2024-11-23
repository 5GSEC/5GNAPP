import React, { useState, useEffect } from 'react';
import './ue.css';

const UeIcon = () => {
    const [showInfo, setShowInfo] = useState(false);

    const handleMouseEnter = () => {
        setShowInfo(true);
    };

    const handleMouseLeave = () => {
        setShowInfo(false);
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            const ueIcon = document.querySelector('.ue-icon');
            if (ueIcon) {
                ueIcon.style.color = 'blue';
                ueIcon.style.fontSize = '24px';
            }
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="ue-container">
            <div 
                className="ue-icon" 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
            >
                UE
            </div>
            {showInfo && (
                <div className="ue-info">
                    <p>UE Icon Information</p>
                    <p>Additional details about the UE icon.</p>
                </div>
            )}
        </div>
    );
};

export default UeIcon;