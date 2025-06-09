import React, { useState, useRef, useContext, createContext } from 'react';
import './bs.css';
import UeIcon from '../ue/ue';
import bsIcon from '../assets/bs.png';
import { format } from 'date-fns';

/* ──────────────────────  shared hover context  ────────────────────── */
const HoverContext = createContext();

/* ───────────────────── helper functions ───────────────────────────── */
function parseTimestamp(raw) {
  if (!raw) return null;
  const s = String(raw);
  const n = parseInt(s, 10);
  if (s.length === 13) return new Date(n);
  if (s.length === 10) return new Date(n * 1000);
  return null;
}

function everyOtherDegree(index, length) {
  return index % 2 === 0
    ? (index / 2) * (360 / length)
    : 360 - (((index + 1) / 2) * (360 / length));
}

/* ──────────────────────  main BS icon component  ──────────────────── */
const BsIcon = ({ bsId, backendData, backendEvents = {} }) => {
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
        <div
          className="bs-showinfo"
          style={{ position: 'fixed', top: mousePos.y + 30, left: mousePos.x + 30 }}
        >
          <p><strong>BS ID</strong>: {bsId}</p>
          <p><strong>MCC</strong>: {backendData.mcc}</p>
          <p><strong>MNC</strong>: {backendData.mnc}</p>
          <p><strong>TAC</strong>: {backendData.tac}</p>
          <p><strong>Report Period</strong>: {backendData.report_period}</p>
          <p><strong>Time Created</strong>: {
            parseTimestamp(backendData.timestamp)?.toLocaleString() || ''
          }</p>
        </div>
      )}

      {/* UE / camera branches */}
      <div className="branches">
        {Object.keys(backendEvents).map((ueId, index) => (
          <div
            key={ueId}
            className="branch"
            style={{
              position: 'absolute',
              top:  `calc(39% + ${(isHovered ? 10 * Object.keys(backendEvents).length + 100 : 60)
                     * Math.sin(everyOtherDegree(index, Object.keys(backendEvents).length) * Math.PI / 180)}px)`,
              left: `calc(39% + ${(isHovered ? 10 * Object.keys(backendEvents).length + 100 : 60)
                     * Math.cos(everyOtherDegree(index, Object.keys(backendEvents).length) * Math.PI / 180)}px)`
            }}
          >
            <UeIcon
              ueId={ueId}
              isHovered={isHovered}
              click={click}
              backendEvent={backendEvents[ueId]}
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
