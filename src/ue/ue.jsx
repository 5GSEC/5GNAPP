import React, { useState, useEffect, useRef } from 'react';
import './ue.css';
import cctvCamera from './cctv3.png';
import { format } from 'date-fns';

//TODO: add the timestamp to normal UE
//TODO: change the UE and BS icon

const fieldsToRender = [
    "Event Name",
    "Timestamp",
    // "Affected base station ID",
    "Affected UE ID",
    "Level",
    "Description"
  ];



function parseTimestamp(raw) {
    if (!raw) return null;
  
    const tsString = String(raw);        // Convert the raw value to string
    const tsNum = parseInt(tsString, 10); // Convert to integer
  
    if (tsString.length === 13) {
      // 13-digit likely "ms" timestamp
      
      return new Date(tsNum);
    } else if (tsString.length === 10) {
      // 10-digit likely "s" timestamp
      
      return new Date(tsNum * 1000);

    } else {
      // Otherwise, we might handle differently or just return null
      return null;
    }
  }

const UeIcon = ({ backendEvent, ueId, isHovered, click, setHoveredUeId }) => {
    const [showInfo, setShowInfo] = useState(false);
    const ueIconRef = useRef(null);

    useEffect(() => {
        // console.log("UeIcon debug => backendEvent:", backendEvent);
    
        const ueIcon = document.querySelector(`#_${ueId}`);
        if (!ueIcon) return;
    
        // if backendEvent["event"] exist，check "Level" === "Critical"
        let isCritical = false;
        if (backendEvent && backendEvent.event) {
          // event is an object, key=eventId
          for (const eventId of Object.keys(backendEvent.event)) {
            const singleEvent = backendEvent.event[eventId];
            if (singleEvent["Level"] === "Critical") {
              isCritical = true;
              break;
            }
          }
        }
    
        if (isCritical) {
          ueIcon.style.background = 'rgba(255, 0, 0, 0.25)';
        } else {
          ueIcon.style.background = 'rgba(0,0,0,0)';
        }
      }, [backendEvent, ueId]);

    useEffect(() => {
        const handleMouseActions = () => {
            const interval = setInterval(() => {
                if (ueIconRef.current && ueIconRef.current.matches(':hover')) {
                    setShowInfo(true);
                    setHoveredUeId(ueId);
                } else if (click) {
                    setShowInfo(false);
                }
            }, 750);
            return interval;
        };
        const interval2 = handleMouseActions();

        return () => { clearInterval(interval2) };
                    }, [click, ueId, setHoveredUeId]
            );


  // If there's no "event" or it's empty,
  // we define a "fallback" singleEvent with some default fields
  // so we still show something.
  const hasEvent = backendEvent?.event && Object.keys(backendEvent.event).length > 0;
           
  // We'll build an array of "renderable events".
  let eventsArray = [];
  if (hasEvent) {
    // Turn the event object into an array of { eventId, singleEvent } for convenience
    eventsArray = Object.keys(backendEvent.event).map(eventId => ({
      eventId,
      singleEvent: backendEvent.event[eventId]
    }));
  } else {
    // Provide a fallback "virtual event"
    eventsArray = [{
      eventId: "N/A",
      singleEvent: {
        "Event Name": "None",
        "Level": "normal",
        "Timestamp": Date.now(), // or some placeholder
        "Affected base station ID": backendEvent?.["Affected base station ID"] || "N/A",
        "Affected UE ID": ueId,
        "Description": "No event data"
      }
    }];
  }


    //const formattedTimestamp = backendEvent ? format(new Date(backendEvent.timestamp * 1000), 'PPpp') : '';
    // const formattedTimestamp = backendEvent ? format(new Date(backendEvent.timestamp), 'PPpp') : '';
    // let formattedTimestamp = '';
    // if (backendEvent && backendEvent.timestamp !== undefined) {
    //   const dateObj = parseTimestamp(backendEvent.timestamp);
    //   if (dateObj && !isNaN(dateObj.getTime())) {
    //     formattedTimestamp = format(dateObj, 'PPpp');
    //   } else {
    //     formattedTimestamp = '(Invalid timestamp)';
    //   }
    // }


    return (
        <div className="ue-container">
            <div
                className="ue-icon"
                style={{ width: isHovered ? '100px' : '50px', height: isHovered ? '100px' : '50px' }} // Adjusted size for unhovered state
                ref={ueIconRef}
                onMouseEnter={() => setHoveredUeId(ueId)}
            >
                <img src={cctvCamera} alt="UE Icon" className="ue-icon-img" id={`_${ueId}`} style={{ width: '100%', height: '100%' }} />
            </div>

            {showInfo && (
                <div className="floating-window">
                    <p><strong>UE ID:</strong> {ueId}</p>

          {/* Render each event or fallback event */}
          {eventsArray.map(({ eventId, singleEvent }) => (
            <div key={eventId} style={{ marginBottom: '0.5em' }}>


              {/* <p><em>Event ID: {eventId}</em></p> */}

              {fieldsToRender.map((fieldName) => {
                if (!Object.prototype.hasOwnProperty.call(singleEvent, fieldName)) {
                  return null;
                }

                if (fieldName === "Timestamp") {

                    console.log("Debug info: 444", singleEvent[fieldName]);
                  const rawTime = singleEvent["Timestamp"];
                  const dateObj = parseTimestamp(rawTime);
                  let displayTime = "(Invalid timestamp)";
                  if (dateObj && !isNaN(dateObj.getTime())) {
                    displayTime = format(dateObj, 'PPpp');
                  }
                  return (
                    <div key={fieldName} className="info-row">
                      <span className="info-label">{fieldName}:</span>
                      <span className="info-value">{displayTime}</span>
                    </div>
                  );
                } else {
                  // If it's an object, do JSON.stringify
                  let val = singleEvent[fieldName];
                  if (typeof val === 'object' && val !== null) {
                    val = JSON.stringify(val);
                  }
                  return (
                    <div key={fieldName} className="info-row">
                      <span className="info-label">{fieldName}:</span>
                      <span className="info-value">{val}</span>
                    </div>
                  );
                }
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UeIcon;