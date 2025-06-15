import React, { useState, useRef, useContext, createContext } from 'react';
import './bs.css';
import UeIcon from '../ue/ue';
import bsIcon from '../assets/bs.png';
import { format } from 'date-fns';
import { Box } from '@mui/material';

/* ──────────────────────  shared hover context  ────────────────────── */
const HoverContext = createContext();

/* ───────────────────── helper functions ───────────────────────────── */
function parseTimestamp(raw) {
  if (!raw) return null;
  const n = Number(raw);
  if (isNaN(n)) return null;
  // If the number is in seconds (10 digits), convert to ms
  if (n < 1e12) return new Date(n * 1000);
  // If the number is in ms (13+ digits), use as is
  return new Date(n);
}

function everyOtherDegree(index, length) {
  return index % 2 === 0
    ? (index / 2) * (360 / length)
    : 360 - (((index + 1) / 2) * (360 / length));
}

/* ──────────────────────  main BS icon component  ──────────────────── */
const BsIcon = ({ bsId, bsData, bsEvent, ueData = {} }) => {
  const [isHovered, setIsHovered]   = useState(false);
  const [mousePos, setMousePos]     = useState({ x: 0, y: 0 });
  const iconContainerRef            = useRef(null);

  const {
    hoveredBsId,   setHoveredBsId,
    hoveredUeId,   setHoveredUeId,
    click,         setClick,
  } = useContext(HoverContext);

  /* ────────────  hover / mouse handlers  ──────────── */
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
      style={{ visibility: hoveredBsId && hoveredBsId !== bsId ? 'hidden' : 'visible' }}
    >
      {/* core wrapper keeps label centered */}
      <div className="bs-core">
        <img src={bsIcon} alt="BS Icon" className="bs-icon" />
        <div className="bs-label">{bsId}</div>
      </div>

      {/* floating meta info card */}
      {isHovered && !hoveredUeId && (
        <Box
          className="bs-showinfo"
          // style={{ position: 'fixed', top: mousePos.y + 30, left: mousePos.x + 30 }}
          sx={{
            background: "#f8fafd",
            transform: 'translate(50%, 15%)', 
            maxHeight: 320,
            overflowY: "auto",
            borderRadius: 2,
            p: 2,
          }}
        >
          <p><strong>Base Station ID</strong>: {bsId}</p>
          <p><strong>MCC</strong>: {bsData.mcc}</p>
          <p><strong>MNC</strong>: {bsData.mnc}</p>
          <p><strong>TAC</strong>: {bsData.tac}</p>
          <p><strong>Report Period</strong>: {bsData.report_period}ms</p>
          <p><strong>Time Created</strong>: {
            parseTimestamp(bsData.timestamp)?.toLocaleString() || ''
          }</p>
        </Box>
      )}

      {/* UE / camera branches */}
      <div className="branches">
        {Object.keys(ueData).map((ueId, index) => (
          <div
            key={ueId}
            className="branch"
            style={{
              position: 'absolute',
              top:  `calc(39% + ${(isHovered ? 10 * Object.keys(ueData).length + 100 : 60)
                     * Math.sin(everyOtherDegree(index, Object.keys(ueData).length) * Math.PI / 180)}px)`,
              left: `calc(39% + ${(isHovered ? 10 * Object.keys(ueData).length + 100 : 60)
                     * Math.cos(everyOtherDegree(index, Object.keys(ueData).length) * Math.PI / 180)}px)`
            }}
          >
            <UeIcon
              ueId={ueId}
              isHovered={isHovered}
              click={click}
              ueData={ueData[ueId]}
              ueEvent={Object.fromEntries(
                Object.entries(bsEvent).filter(([_, ev]) => ev.ueID === ueId)
              )}
              setHoveredUeId={setHoveredUeId}
              setIsBsHovered={setIsHovered}
              setBsHoverId={setHoveredBsId}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ──────────────────────  provider (unchanged)  ───────────────────── */
const BsIconProvider = ({ children }) => {
  const [hoveredBsId, setHoveredBsId] = useState(null);
  const [hoveredUeId, setHoveredUeId] = useState(null);
  const [click, setClick]             = useState(true);

  return (
    <HoverContext.Provider value={{
      hoveredBsId, setHoveredBsId,
      hoveredUeId, setHoveredUeId,
      click, setClick,
    }}>
      {children}
    </HoverContext.Provider>
  );
};

export { everyOtherDegree, BsIcon, BsIconProvider, HoverContext };
