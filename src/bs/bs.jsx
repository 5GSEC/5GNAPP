import React, { useState, useRef, useContext, createContext } from 'react';
import './bs.css';
import UeIcon from '../ue/ue';
import BsSrc from './bs.png';

const HoverContext = createContext();

// does the degree math to allow everything to be rendered in a strange order
// the desired order with length 6 = 0, 300, 60, 210, 120, 180
function everyOtherDegree(index, length) {
    if (index % 2 === 0) {
        return index / 2 * (360 /length)
    } else {
        return 360 - ((index + 1) / 2 * (360/length))
    }
}

const BsIcon = ({ bsId }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [worstBreak, setWorstBreak] = useState(0.0);
    const iconContainerRef = useRef(null);
    const { hoveredId, setHoveredId } = useContext(HoverContext);
    //TODO dynamically pull from sql
    let ueIds = ["a", "b", "c", "d", "e", "f"];
    const mouseHover = (val) => {
        setTimeout(() => {
            if (iconContainerRef.current && iconContainerRef.current.matches(':hover')) {
                setIsHovered(true);
                setHoveredId(bsId);
            } else {
                setIsHovered(val);
                setHoveredId(null);
            }
        }, 100)
    }

    return (
        <div 
            ref={iconContainerRef}
            className={`icon-container ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => { setIsHovered(true); setHoveredId(bsId); }}
            onMouseLeave={() => mouseHover(false)}
            style={{ visibility: hoveredId && hoveredId !== bsId ? 'hidden' : 'visible' }}
        >
            <img src={BsSrc} alt="BS Icon" className="bs-icon" />
            <div className="branches">
                {ueIds.map((ueId, index) => (
                    <div key={index} className="branch" style={{ transform: `rotate(${everyOtherDegree(index, ueIds.length)}deg) translate(${isHovered ? 10 * ueIds.length + 100 : 50}px) rotate(-${everyOtherDegree(index, ueIds.le)}deg)`, zIndex: `0`, width: '0px', height: '0px'}}>
                        <UeIcon worstBreak={worstBreak} setWorstBreak={setWorstBreak} ueId={`bs${bsId}-ue${ueId}`} isHovered={isHovered} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const BsIconProvider = ({ children }) => {
    const [hoveredId, setHoveredId] = useState(null);
    return (
        <HoverContext.Provider value={{ hoveredId, setHoveredId }}>
            {children}
        </HoverContext.Provider>
    );
};

export { everyOtherDegree, BsIcon, BsIconProvider };
