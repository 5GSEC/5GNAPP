import React, { useState, useRef } from 'react';
import './bs.css'; // Make sure to create this CSS file for styling
import UeIcon from '../ue/ue';
import BsSrc from './bs.png';


const BsIcon = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [worstBreak, setWorstBreak] = useState(0.0);
    const iconContainerRef = useRef(null);
    let numBranches = 6;
    const mouseHover = (val) => {
        setTimeout(() => {
            if (iconContainerRef.current && iconContainerRef.current.matches(':hover')) {
                setIsHovered(true);
            } else {
                setIsHovered(val);
            }
        }, 750)
    }

    return (
        <div 
            ref={iconContainerRef}
            className={`icon-container ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => mouseHover(false)}
        >
            <img src={BsSrc} alt="BS Icon" className="bs-icon" />
            {isHovered && (
                <>
                    <div className="branches">
                        {Array.from({ length: numBranches }).map((_, index) => (
                            <div key={index} className="branch" style={{ transform: `rotate(${index * (360 / numBranches)}deg) translate(125px) rotate(-${index * (360 / numBranches)}deg)` }}>
                                <UeIcon worstBreak={worstBreak} setWorstBreak={setWorstBreak} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BsIcon;
/* bs.css */
