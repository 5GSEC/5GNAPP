import React, { useState, useEffect, useRef } from 'react';
import './ue.css';
import ue_cctvCamera from '../assets/cctv3.png';
import ue_phone from '../assets/ue-phone.png';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

//TODO: add the timestamp to normal UE
//TODO: change the UE and BS icon

const fieldsToRender = [
    "Event Name",
    "Timestamp",
    // "Affected base station ID",
    // "Affected UE ID",
    "Level",
    "Description"
  ];

  const metadataFields = [
    "msg_id",
    "rrc_msg",
    "nas_msg",
    "rrc_state",
    "nas_state",
    "rrc_sec_state",
    // "reserved_field_1",
    // "reserved_field_2",
    // "reserved_field_3"
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

const UeIcon = ({ backendEvent, ueId, isHovered, click, setHoveredUeId, setIsBsHovered, setBsHoverId}) => {
    const [showInfo, setShowInfo] = useState(false);
    const [MouseClicked, setMouseClicked] = useState(false); // New state variable
    const ueIconRef = useRef(null);

    //for showing the detail metadata when clicking on the UE
    const [showDetails, setShowDetails] = useState(false);
    const [clickPos, setClickPos] = useState({ x: 0, y: 0 });

    useEffect(() => {

    
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

  const handleUeMouseOnEnter = (e) => {
    setHoveredUeId(ueId);
  };

  const handleUeMouseOnLeave = (e) => {
    setShowInfo(false);
    if (!MouseClicked) {
      setHoveredUeId(null);
      setShowDetails(false);
    }
  };

  /**
   * clicked on UE => toggle showDetails
   */
  const handleUeClick = (e) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the parent
    setClickPos({ x: e.clientX, y: e.clientY });
    setHoveredUeId(ueId);
    setMouseClicked(true);
    setShowDetails((prev) => !prev);
  };

  const handleCloseDetailsWindow = () => {
    setMouseClicked(false);
    setIsBsHovered(false);
    setShowDetails(false);
    setBsHoverId(null);
  };


  // If there's no "event" or it's empty,
  // we define a "fallback" singleEvent with some default fields
  // so we still show something.
  const hasEvent = backendEvent?.event && Object.keys(backendEvent.event).length > 0;
           
  // We'll build an array of "renderable events".
  let eventsArray = [];
  let eventsCount = Object.keys(backendEvent.event).length;
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
        // "Event Name": "None",
        // "Level": "normal",
        // "Timestamp": Date.now(), // or some placeholder
        // "Affected base station ID": backendEvent?.["Affected base station ID"] || "N/A",
        // "Affected UE ID": ueId,
        // "Description": "No event data"
      }
    }];
  }



  /**
   * prepare clicking metadata
   * pretend that backend dats put “mobiflow” in backendEvent.mobiflow (array)
   * for example test, we take mobiflow[0] as metadata
   */
  let metadataObj = [];
  if (backendEvent && backendEvent.mobiflow && backendEvent.mobiflow.length > 0) {
    // metadataObj = backendEvent.mobiflow[0]; 
    backendEvent.mobiflow.forEach((item) => {
      metadataObj.push(item);
    });
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
                onMouseEnter={handleUeMouseOnEnter}
                onMouseLeave={handleUeMouseOnLeave}
                onClick={handleUeClick}  // clicking event
            >
                <img src={ue_cctvCamera} alt="UE Icon" className="ue-icon-img" id={`_${ueId}`} style={{ width: '100%', height: '100%' }} />
            </div>

            {showInfo && (
                <div className="floating-window">
                    <p>
                      <strong>UE ID:</strong> {ueId} &nbsp;&nbsp;
                      <strong>Events:</strong> {eventsCount} &nbsp;&nbsp;
                      <strong>IMSI: </strong> {backendEvent?.mobile_id || "N/A"} 
                    </p>

                    {/* Render each event or fallback event */}
                    {eventsArray.map(({ eventId, singleEvent }) => (
                      <div key={eventId} style={{ marginBottom: '0.5em' }}>


                        {/* <p><em>Event ID: {eventId}</em></p> */}

                        {fieldsToRender.map((fieldName) => {
                          if (!Object.prototype.hasOwnProperty.call(singleEvent, fieldName)) {
                            return null;
                          }

                          if (fieldName === "Timestamp") {


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

      {/* showinfo window for clicking */}
        {showDetails && (
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)', 
              backgroundColor: '#fff',
              // color: '#000',
              padding: '16px',
              border: '1px solid #000', // Added black border
              width: '900px', // Increased width
              height: '400px', // Added height
              overflow: 'auto', // Added overflow for scroll
              zIndex: 9999
            }}
          >

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 0,
              }}
            >
            {/* Close Button */}
            <IconButton
              onClick={handleCloseDetailsWindow}
              sx={{
                color: "black",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

            {/* replaced single row with a table for metadata in two rows */}
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", marginTop: 0, marginBottom: 1 }}>
              UE Metadata
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[
                      "gnb_cu_ue_f1ap_id",
                      "rnti",
                      "s_tmsi",
                      "rrc_cipher_alg",
                      "rrc_integrity_alg",
                      "nas_cipher_alg",
                      "nas_integrity_alg",
                    ].map((label) => (
                      <TableCell key={label} sx={{ fontWeight: "bold", backgroundColor: "#f2f2f2" }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {[
                      "gnb_cu_ue_f1ap_id",
                      "rnti",
                      "s_tmsi",
                      "rrc_cipher_alg",
                      "rrc_integrity_alg",
                      "nas_cipher_alg",
                      "nas_integrity_alg",
                    ].map((label) => (
                      <TableCell key={label}>{backendEvent?.[label] || "N/A"}</TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>


            {/* rest of the content, e.g. rrc_msg, nas_msg etc. */}
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", marginTop: 1, marginBottom: 1 }}>
              MobiFlow Telemetry
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {metadataFields.map((fld) => (
                      <TableCell key={fld} sx={{ fontWeight: "bold", backgroundColor: "#f2f2f2" }}>
                        {fld}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metadataObj.map((item, index) => (
                    <TableRow key={index}>
                      {metadataFields.map((fld) => (
                        <TableCell key={fld}>{item[fld] || "N/A"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

          </Box>
          )}

      
    </div>
  );
};

export default UeIcon;
