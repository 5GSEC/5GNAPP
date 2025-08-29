import React, { useState, useRef, useContext, createContext } from 'react';
import './bs.css';
import UeIcon from '../ue/ue';
import bsIcon from '../assets/bs.png';
import { format } from 'date-fns';
import { Box } from '@mui/material';

const HoverContext = createContext();

export function parseTimestamp(raw) {
  if (!raw) return null;
  const n = Number(raw);
  if (isNaN(n)) return null;
  return n < 1e12 ? new Date(n * 1000) : new Date(n);
}

export function parseStatus(status) {
  if (!status) return null;
  if (status == 1)
    return "Connected";
  else if (status == 2)
    return "Disconnected";
  else
    return "Unknown"
}

function everyOtherDegree(index, length) {
  return index % 2 === 0
    ? (index / 2) * (360 / length)
    : 360 - (((index + 1) / 2) * (360 / length));
}

const BsIcon = ({ bsId, bsData, bsEvent, ueData = {} }) => {
  const [isHovered, setIsHovered]   = useState(false);
  const [mousePos, setMousePos]     = useState({ x: 0, y: 0 });
  const iconContainerRef            = useRef(null);

  const {
    hoveredBsId, setHoveredBsId,
    hoveredUeId, setHoveredUeId,
    click, setClick,
  } = useContext(HoverContext);

  const handleMouseEnter = () => { setIsHovered(true);  setHoveredBsId(bsId); };
  const handleMouseLeave = () => { setIsHovered(false); setHoveredBsId(null); };
  const handleMouseMove  = e  => { setMousePos({ x: e.clientX, y: e.clientY }); };

  return (
    <div
      ref={iconContainerRef}
      className={`icon-container ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onContextMenu={e => { e.preventDefault(); setClick(!click); }}
      // style={{ visibility: hoveredBsId && hoveredBsId !== bsId ? 'hidden' : 'visible' }}
    >
      <div className="bs-core"
        // make disconnected BS look more faded
        style={{ opacity: bsData.status == 2 ? 0.5 : 1 }}
      >
        <img src={bsIcon} alt="BS Icon" className="bs-icon" />
        <div className="bs-label">{bsId}</div>
      </div>

      {isHovered && !hoveredUeId && (
        <Box
          className="bs-showinfo"
          sx={{ background: "#f8fafd", transform: 'translate(50%, 35%)', maxHeight: 320, overflowY: "auto", borderRadius: 2, p: 2 }}
        >
          <p><strong>Base Station ID</strong>: {bsId}</p>
          <p><strong>MCC</strong>: {bsData.mcc}</p>
          <p><strong>MNC</strong>: {bsData.mnc}</p>
          <p><strong>TAC</strong>: {bsData.tac}</p>
          <p><strong>Report Period</strong>: {bsData.report_period}ms</p>
          <p><strong>Status</strong>: {parseStatus(bsData.status)}</p>
          <p><strong>Time Created</strong>: {parseTimestamp(bsData.timestamp)?.toLocaleString() || ''}</p>
        </Box>
      )}

      <div className="branches">
        {Object.keys(ueData).map((ueId, index) => {
          const angle = everyOtherDegree(index, Object.keys(ueData).length);
          return (
            <div
              key={ueId}
              className="branch"
              style={{
                position: 'absolute',
                // top:  `calc(39% + ${(isHovered ? 10 * Object.keys(ueData).length + 100 : 60) * Math.sin(angle * Math.PI / 180)}px)`,
                // left: `calc(39% + ${(isHovered ? 10 * Object.keys(ueData).length + 100 : 60) * Math.cos(angle * Math.PI / 180)}px)`,
                top:  `calc(36% + ${70 * Math.sin(angle * Math.PI / 180)}px)`,
                left: `calc(36% + ${60 * Math.cos(angle * Math.PI / 180)}px)`,
              }}
            >
              <UeIcon
                ueId={ueId}
                angle={angle} // Pass angle down
                isHovered={isHovered}
                click={click}
                ueData={ueData[ueId]}
                ueEvent={Object.fromEntries(
                  Object.entries(bsEvent).filter(([_, ev]) => ev.ueID === ueId)
                )}
                setHoveredUeId={setHoveredUeId}
                setIsBsHovered={setIsHovered}
                setBsHoverId={setHoveredBsId}
                // make UEs under disconnected BS look more faded 
                fade={bsData.status == 2} // pass a boolean or use opacity={0.5}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BsIconProvider = ({ children }) => {
  const [hoveredBsId, setHoveredBsId] = useState(null);
  const [hoveredUeId, setHoveredUeId] = useState(null);
  const [click, setClick]             = useState(true);

  return (
    <HoverContext.Provider value={{ hoveredBsId, setHoveredBsId, hoveredUeId, setHoveredUeId, click, setClick }}>
      {children}
    </HoverContext.Provider>
  );
};

export { everyOtherDegree, BsIcon, BsIconProvider, HoverContext };
