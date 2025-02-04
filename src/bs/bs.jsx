import React, { useState, useRef, useContext, createContext } from 'react';
import './bs.css';
import UeIcon from '../ue/ue';
import BsSrc from './bs.png';
import { format } from 'date-fns'; /* Added date-fns import */

const HoverContext = createContext();

// TODO set up array using 


const minimalEventFields = [
    "Event Name",
    "Level",
    "Timestamp"
  ];



function parseTimestamp(raw) {
    if (!raw) return null;
  
    const tsString = String(raw);
    const tsNum = parseInt(tsString, 10);
  
    if (tsString.length === 13) {
      return new Date(tsNum);      // already ms
    } else if (tsString.length === 10) {
      return new Date(tsNum * 1000); // convert s => ms
    } else {
      return null;
    }
  }



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
        // console.log('no backend events')
        backendEvents = {}
    }
    const [isHovered, setIsHovered] = useState(false);

    //added showinfo
    const [bsShowInfo, setBsShowInfo] = useState(false);
    //added user mouse position track
    const [userPos, setUserPos] = useState({ x : 0 , y: 0});




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
        // console.log(ueId)
    };


    //added handleClick to track where user has clicked
    const handleClick = (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        setUserPos({x: mouseX, y: mouseY});

        setBsShowInfo((prev) => !prev);
    }


    return (
        <div 
            ref={iconContainerRef}
            className={`icon-container ${isHovered ? 'hovered' : ''}`}

            

            onMouseEnter={() => { setIsHovered(true); setHoveredBsId(bsId); }}
            onMouseLeave={() => mouseHover(false)}

            //added click to show details of a bs
            onClick={handleClick}
            /*onClick={() => bsShowInfo((prev) => !prev)}*/

            onContextMenu={(e) => { e.preventDefault(); click ? setClick(false) : setClick(true); }}
            style={{ visibility: hoveredBsId && hoveredBsId !== bsId ? 'hidden' : 'visible' }}
        >
            <img src={BsSrc} alt="BS Icon" className="bs-icon" />

            {/*below is for details about the bsShowInfo part */}
            {bsShowInfo && (
            <div 
                className="bs-showinfo"
                style={{
                    position: "fixed", 
                    top: userPos.y + 10,
                    left: userPos.x + 10,
                }}
            >
          <p>BS ID:&nbsp;&nbsp;&nbsp; {bsId}</p>

{/**
 * For each UE under this BS, we want to either:
 * - Show real events, or
 * - If no event, show a fallback
 */}
{Object.keys(backendEvents).map((ueId) => {
  const ueData = backendEvents[ueId];

  // We'll build an array of { eventId, data } to render
  let eventsArray = [];
  if (!ueData.event || Object.keys(ueData.event).length === 0) {
    // Construct a fallback event
    eventsArray = [{
      eventId: 'fallback',
      data: {
        "Event Name": "None",
        "Level": "normal",
        "Timestamp": Date.now() // or some default
      }
    }];
  } else {
    // Turn each real event into an array entry
    eventsArray = Object.keys(ueData.event).map(eventId => ({
      eventId,
      data: ueData.event[eventId]
    }));
  }

  return (
    <div key={ueId} style={{ marginBottom: '1em' }}>
        <p>UE ID:&nbsp;&nbsp;&nbsp;{ueId}</p>

      {eventsArray.map(({ eventId, data }) => {
        return (
          <div key={eventId} style={{ marginLeft: '1.5em' }}>
            {/* minimalEventFields => "Event Name", "Level", "Timestamp" */}
            {minimalEventFields.map((field) => {
              if (!Object.prototype.hasOwnProperty.call(data, field)) {
                return null;
              }
              if (field === "Timestamp") {
                const rawTime = data["Timestamp"];
                const dateObj = parseTimestamp(rawTime);
                let displayTime = "(Invalid)";
                if (dateObj && !isNaN(dateObj.getTime())) {
                  displayTime = format(dateObj, 'PPpp');
                }
                return (
                //   <p key={field}>
                //     <strong>{field}:</strong> {displayTime}
                //   </p>
                    <div key={field} className="info-row">
                    <span className="info-label">{field}:</span>
                    <span className="info-value">{displayTime}</span>
                    </div>
                
                );
              } else {
                // for "Event Name", "Level"
                let val = data[field];
                if (typeof val === 'object' && val !== null) {
                  val = JSON.stringify(val);
                }
                return (
                //   <p key={field}>
                //     <strong>{field}:</strong> {val}
                //   </p>
                    <div key={field} className="info-row">
                    <span className="info-label">{field}:</span>
                    <span className="info-value">{val}</span>
                    </div>

                );
              }
            })}
          </div>
        );
      })}
    </div>
  );
})}
</div>
)}
            

      {/* Draw "branches" and the UEs around the BS */}
      <div className="branches">
        {Object.keys(backendEvents).map((ueId, index) => (
          <div
            key={ueId}
            className="branch"
            style={{
              transform: `rotate(${everyOtherDegree(index, Object.keys(backendEvents).length)}deg)
                          translate(${isHovered ? 10 * Object.keys(backendEvents).length + 100 : 50}px)
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
              handleMouseEnter={handleMouseEnter}
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
    const [click, setClick] = useState(true); // Add click state here
    return (
        <HoverContext.Provider value={{ hoveredBsId, setHoveredBsId, hoveredUeId, setHoveredUeId, click, setClick }}>
            {children}
        </HoverContext.Provider>
    );
};

export { everyOtherDegree, BsIcon, BsIconProvider, HoverContext };
