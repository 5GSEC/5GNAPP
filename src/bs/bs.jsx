import React, { useState, useRef, useContext, createContext } from 'react';
import './bs.css';
import UeIcon from '../ue/ue';
import BsSrc from './bs.png';
import { format } from 'date-fns';

const HoverContext = createContext();

const minimalEventFields = ["Event Name", "Level", "Timestamp"];

function parseTimestamp(raw) {
  if (!raw) return null;
  const s = String(raw), n = parseInt(s, 10);
  if (s.length === 13) return new Date(n);
  if (s.length === 10) return new Date(n * 1000);
  return null;
}

function everyOtherDegree(index, length) {
  if (index % 2 === 0) {
    return (index / 2) * (360 / length);
  } else {
    return 360 - (((index + 1) / 2) * (360 / length));
  }
}

const BsIcon = ({ bsId, backendData, backendEvents }) => {
  if (!backendEvents) {
    backendEvents = {};
  }

  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // New: track mouse position
  const iconContainerRef = useRef(null);
  const { 
    hoveredBsId, 
    hoveredUeId, 
    setHoveredBsId, 
    setHoveredUeId, 
    click, 
    setClick 
  } = useContext(HoverContext);


  const handleClick = (e) => {
    // console.log('click111', click);
    setHoveredUeId(true);
    e.preventDefault();
    if (click) {
      // console.log('click222', click);
      setClick(false);
      setHoveredUeId(null);
    } else {
      // console.log('click333', click);
      setClick(true);

      setHoveredUeId(true);
    }
    // console.log('clickEXIT', click);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setHoveredBsId(bsId);
  };

  const handleMouseLeave = () => {

    setIsHovered(false);
    setHoveredBsId(null);
  };

  // New: Update mouse position as it moves over the BS icon
  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleUeMouseEnter = (ueId) => {
    setHoveredUeId(ueId);
  };

  return (
    <div
      ref={iconContainerRef}
      className={`icon-container ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove} // New: listen to mousemove
      style={{
        visibility: (hoveredBsId && hoveredBsId !== bsId) ? 'hidden' : 'visible'
      }}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        click ? setClick(false) : setClick(true);
      }}
    >
      <img src={BsSrc} alt="BS Icon" className="bs-icon" />

      {isHovered && !hoveredUeId  && (
        <div 
          className="bs-showinfo"
          style={{
            position: 'fixed', // Position fixed to follow mouse across the viewport
            top: mousePos.y + 100, // Offset by 10px for better visibility
            left: mousePos.x + 100
          }}
        >
          <p><strong>BS ID: &nbsp;&nbsp;&nbsp; </strong>{bsId}</p>
          <div className="backend-data">
            <div>MCC: {backendData.mcc}</div>
            <div>MNC: {backendData.mnc}</div>
            <div>TAC: {backendData.tac}</div>
            <div>Report Period: {backendData.report_period}</div>
            <div>
              Timestamp:{" "}
              {parseTimestamp(backendData.timestamp)
                ? parseTimestamp(backendData.timestamp).toLocaleString()
                : ""}
            </div>
          </div>
          {Object.keys(backendEvents).map((ueId) => {
            const ueData = backendEvents[ueId];
            let eventsArray = [];
            if (!ueData.event || !Object.keys(ueData.event).length) {
              eventsArray = [{
                eventId: 'fallback',
                data: { }
              }];
            } else {
              eventsArray = Object.keys(ueData.event).map(key => ({
                eventId: key,
                data: ueData.event[key]
              }));
            }
            
          })}
        </div>
      )}

      <div className="branches">
        {Object.keys(backendEvents).map((ueId, index) => (
          <div
            key={ueId}
            className="branch"
            style={{
              transform: `rotate(${everyOtherDegree(index, Object.keys(backendEvents).length)}deg)
                          translate(${
                            isHovered
                              ? 10 * Object.keys(backendEvents).length + 100
                              : 50
                          }px)
                          rotate(-${everyOtherDegree(index, Object.keys(backendEvents).length)}deg)`,
              zIndex: '0',
              width: '0px',
              height: '0px'
            }}
          >
            <UeIcon
              ueId={ueId}
              isHovered={isHovered}
              click={click}
              backendEvent={backendEvents[ueId]}
              setHoveredUeId={setHoveredUeId}
              handleMouseEnter={handleUeMouseEnter}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const BsIconProvider = ({ children }) => {
  const [hoveredBsId, setHoveredBsId] = useState(null);
  const [hoveredUeId, setHoveredUeId] = useState(null);
  const [click, setClick] = useState(true);

  return (
    <HoverContext.Provider value={{
      hoveredBsId, setHoveredBsId,
      hoveredUeId, setHoveredUeId,
      click, setClick
    }}>
      {children}
    </HoverContext.Provider>
  );
};

export { everyOtherDegree, BsIcon, BsIconProvider, HoverContext };