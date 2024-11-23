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
    // detect break from backend
    

    useEffect(() => {
        const fetchData = () => {
            const ueIcon = document.querySelector('.ue-icon-img');
            if (ueIcon) {
                ueIcon.style.background = 'rgba(255, 0, 0, 0.25)';
            }
            // SQL request to backend 
            // fetch('https://example.com/api/sql-query', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         query: 'SELECT curBreak, worstBreak FROM breaks ORDER BY timestamp DESC LIMIT 1'
            //     }),
            // })
            //     .then(response => response.json())
            //     .then(data => {
            //         console.log(data);
            //         // all data decisions go here
            //         if (data.length > 0) {
            //             setCurBreak(data[0].curBreak);
            //             setWorstBreak(data[0].worstBreak);
            //             if (ueIcon) {
            //                 const redIntensity = Math.min(255, data[0].worstBreak * 10);
            //                 ueIcon.style.backgroundColor = `rgb(${redIntensity}, 0, 0)`;
            //             }
            //         }
            //     })
            //     .catch(error => console.error('Error fetching data:', error));
        };

        fetchData(); // Run once immediately

        const intervalId = setInterval(fetchData, 10000); // Run every 10 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="ue-container">
            <div 
                className="ue-icon" 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
            >
                <img src={cctvCamera} alt="UE Icon" className="ue-icon-img" />
            </div>
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