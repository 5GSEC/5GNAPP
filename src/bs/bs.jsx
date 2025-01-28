import React, { useState, useRef, useContext, createContext } from 'react';
import './bs.css';
import UeIcon from '../ue/ue';
import BsSrc from './bs.png';

const HoverContext = createContext();

// TODO set up array using 

// does the degree math to allow everything to be rendered in a strange order
// the desired order with length 6 = 0, 300, 60, 210, 120, 180
function everyOtherDegree(index, length) {
    if (index % 2 === 0) {
        return index / 2 * (360 /length)
    } else {
        return 360 - ((index + 1) / 2 * (360/length))
    }
}

const BsIcon = ({ bsId, backendEvents }) => {
    if (!backendEvents) {
        console.log('no backend events')
        backendEvents = {}
    }
    const [isHovered, setIsHovered] = useState(false);
    const iconContainerRef = useRef(null);
    const { hoveredBsId, setHoveredBsId, setHoveredUeId, click, setClick } = useContext(HoverContext);
    //TODO dynamically pull from sql
    
    // console.log(backendEvents)
    const mouseHover = () => {
        setTimeout(() => {
            if (iconContainerRef.current && iconContainerRef.current.matches(':hover')) {
                setIsHovered(true);
                setHoveredBsId(bsId);
            } else if (click) {
                setIsHovered(false);
                setHoveredBsId(null);
            }
        }, 200)
    }

    const handleMouseEnter = (ueId) => {
        setHoveredUeId(ueId);
        console.log(ueId)
    };


    return (
        <div 
            ref={iconContainerRef}
            className={`icon-container ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => { setIsHovered(true); setHoveredBsId(bsId); }}
            onMouseLeave={() => mouseHover(false)}
            onContextMenu={(e) => { e.preventDefault(); click ? setClick(false) : setClick(true); }}
            style={{ visibility: hoveredBsId && hoveredBsId !== bsId ? 'hidden' : 'visible' }}
        >
            <img src={BsSrc} alt="BS Icon" className="bs-icon" />
            <div className="branches">
                {Array.from(Object.keys(backendEvents)).map((ueId, index) => (
                    <div key={index} className="branch" style={{ transform: `rotate(${everyOtherDegree(index, Object.keys(backendEvents).length)}deg) translate(${isHovered ? 10 * Object.keys(backendEvents).length + 100 : 50}px) rotate(-${everyOtherDegree(index, Object.keys(backendEvents).length)}deg)`, zIndex: `0`, width: '0px', height: '0px'}}>
                        <UeIcon ueId={ueId} isHovered={isHovered} click={click} backendEvent={backendEvents[ueId]} setHoveredUeId={setHoveredUeId} handleMouseEnter={handleMouseEnter} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const BsIconProvider = ({ children }) => {
    const [hoveredBsId, setHoveredBsId] = useState(null);
    const [hoveredUeId, setHoveredUeId] = useState(null);
    const [click, setClick] = useState(true); // Add click state here
    return (
        <HoverContext.Provider value={{ hoveredBsId, setHoveredBsId, hoveredUeId, setHoveredUeId, click, setClick }}>
            {children}
        </HoverContext.Provider>
    );
};

export { everyOtherDegree, BsIcon, BsIconProvider, HoverContext };
