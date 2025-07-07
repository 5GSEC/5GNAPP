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
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const fieldsToRender = [
    "name",
    "timestamp",
    "severity",
    // "description"
  ];

const fieldRenderNames = {
  name: "Event Name",
  timestamp: "Time",
  severity: "Severity",
  // Add more mappings as needed
};

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

const UeIcon = ({ ueData, ueId, ueEvent, isHovered, click, setHoveredUeId, setIsBsHovered, setBsHoverId, angle, fade}) => {
    const [showInfo, setShowInfo] = useState(false);
    const [MouseClicked, setMouseClicked] = useState(false); // New state variable
    const ueIconRef = useRef(null);

    //for showing the detail metadata when clicking on the UE
    const [showDetails, setShowDetails] = useState(false);
    const [clickPos, setClickPos] = useState({ x: 0, y: 0 });

    useEffect(() => {

    
        const ueIcon = document.querySelector(`#_${ueId}`);
        if (!ueIcon) return;
    
        // Default to transparent
        let bgColor = 'rgba(0,0,0,0)';

        if (ueData && ueEvent) {
          let foundLevel = null;
          for (const eventId of Object.keys(ueEvent)) {
            const singleEvent = ueEvent[eventId];
            if (singleEvent["severity"] === "Critical") {
              foundLevel = "Critical";
              break;
            } else if (singleEvent["severity"] === "Warning") {
              foundLevel = "Warning";
            } else if (singleEvent["severity"] === "Info" && !foundLevel) {
              foundLevel = "Info";
            }
          }
          if (foundLevel === "Critical") {
            bgColor = 'rgba(255, 0, 0, 0.25)'; // Red
          } else if (foundLevel === "Warning") {
            bgColor = 'rgba(255, 215, 0, 0.25)'; // Yellow
          } else if (foundLevel === "Info") {
            bgColor = 'rgba(0, 255, 0, 0.18)'; // Green
          }
        }

        ueIcon.style.background = bgColor;
        ueIcon.style.opacity = fade ? 0.5 : 1;
      }, [ueData, ueId, ueEvent]);

  const handleUeMouseOnEnter = (e) => {
    setHoveredUeId(ueId);
    setShowInfo(true);
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
    setShowInfo(false);
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
  const hasEvent = Object.keys(ueEvent).length > 0;
           
  // We'll build an array of "renderable events".
  let eventsArray = [];
  let eventsCount = Object.keys(ueEvent).length;
  if (hasEvent) {
    // Turn the event object into an array of { eventId, singleEvent } for convenience
    eventsArray = Object.keys(ueEvent).map(eventId => ({
      eventId,
      singleEvent: ueEvent[eventId]
    }));
  } else {
    // Provide a fallback "virtual event"
    eventsArray = [{
      eventId: "N/A",
      singleEvent: {
        // "Event Name": "None",
        // "Level": "normal",
        // "Timestamp": Date.now(), // or some placeholder
        // "Affected base station ID": ueData?.["Affected base station ID"] || "N/A",
        // "Affected UE ID": ueId,
        // "Description": "No event data"
      }
    }];
  }



  /**
   * prepare clicking metadata
   * pretend that backend dats put “mobiflow” in ueData.mobiflow (array)
   * for example test, we take mobiflow[0] as metadata
   */
  let metadataObj = [];
  if (ueData && ueData.mobiflow && ueData.mobiflow.length > 0) {
    // metadataObj = ueData.mobiflow[0]; 
    ueData.mobiflow.forEach((item) => {
      metadataObj.push(item);
    });
  }


    //  Refined bottom label rule: only when angle is between 110 and 250
    const labelOnBottom = angle >= 50 && angle <= 150;

    return (
        <div className="ue-container"
          onMouseEnter={handleUeMouseOnEnter}
          onMouseLeave={handleUeMouseOnLeave}
        >

      {/* Show the UE ID label above or below the icon based on labelOnBottom prop */}
      {!labelOnBottom && <div className="ue-label ue-label-top">{ueId}</div>}
      <div
        className="ue-icon"
        style={{ width: isHovered ? '100px' : '50px', height: isHovered ? '100px' : '50px' }}
        ref={ueIconRef}
        onClick={handleUeClick}
      >
        <img src={ue_cctvCamera} alt="UE Icon" className="ue-icon-img" id={`_${ueId}`} style={{ width: '100%', height: '100%' }} />
      </div>
      {labelOnBottom && <div className="ue-label ue-label-bottom">{ueId}</div>}


            {/* NEW: permanent UE ID label above the icon */}
            {/* <div className="ue-label">{ueId}</div>

            <div
                className="ue-icon"
                style={{ width: isHovered ? '100px' : '50px', height: isHovered ? '100px' : '50px' }} // Adjusted size for unhovered state
                ref={ueIconRef}
                onClick={handleUeClick}  // clicking event
            >
                <img src={ue_cctvCamera} alt="UE Icon" className="ue-icon-img" id={`_${ueId}`} style={{ width: '100%', height: '100%' }} />
            </div> */}

            {showInfo && (
                <Box className="floating-window" 
                  sx={{
                    background: "#f8fafd",
                    transform: 'translate(50%, 15%)', 
                    maxHeight: 320,
                    overflowY: "auto",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                        UE ID:
                      </Typography>{" "}
                      <Typography variant="body1" component="span">
                        {ueId}
                      </Typography>
                      &nbsp;&nbsp;
                      <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                        IMSI:
                      </Typography>{" "}
                      <Typography variant="body1" component="span">
                        {ueData?.mobile_id || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                        Last Update Time:
                      </Typography>{" "}
                      <Typography variant="body1" component="span">
                        {(() => {
                          const dateObj = parseTimestamp(ueData?.Timestamp);
                          return dateObj && !isNaN(dateObj.getTime())
                            ? format(dateObj, 'PPpp')
                            : "N/A";
                        })()}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                        UE Events:
                      </Typography>{" "}
                      <Typography variant="body1" component="span">
                        {eventsCount}
                      </Typography>
                    </Box>

                    {/* Render each event or fallback event */}
                    {eventsArray.map(({ eventId, singleEvent }, eventIdx) => (
                        <Box key={eventId} sx={{ mb: 1 }}>

                        {eventsCount > 0 && <Divider sx={{my: 1}}></Divider>}

                        {/* <p><em>Event ID: {eventId}</em></p> */}

                        {fieldsToRender.map((fieldName) => {
                          if (!Object.prototype.hasOwnProperty.call(singleEvent, fieldName)) {
                            return null;
                          }

                          if (fieldName === "timestamp") {
                            const rawTime = singleEvent["timestamp"];
                            const dateObj = parseTimestamp(rawTime);
                            let displayTime = "(Invalid timestamp)";
                            if (dateObj && !isNaN(dateObj.getTime())) {
                              displayTime = format(dateObj, 'PPpp');
                            }
                            return (
                              <Box key={fieldName} sx={{ display: 'flex', alignItems: 'top', textAlign: 'left', mb: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 110, textAlign: 'left' }}>
                                  {fieldRenderNames[fieldName] || fieldName}:
                                </Typography>
                                <Typography variant="body2" sx={{ ml: 0, textAlign: 'left' }}>
                                  {displayTime}
                                </Typography>
                              </Box>
                            );
                          } else {
                            // If it's an object, do JSON.stringify
                            let val = singleEvent[fieldName];
                            if (typeof val === 'object' && val !== null) {
                              val = JSON.stringify(val);
                            }
                            let renderName = fieldRenderNames[fieldName] || fieldName
                            if (fieldName === "name")
                              renderName = "Event " + (eventIdx + 1);
                            return (
                              <Box key={fieldName} sx={{ display: 'flex', alignItems: 'top', textAlign: 'left', mb: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 110, textAlign: 'left' }}>
                                  {renderName}:
                                </Typography>
                                <Typography variant="body2" sx={{ ml: 0, textAlign: 'left' }}>
                                  {val}
                                </Typography>
                              </Box>
                            );
                          }
                        })}
                      </Box>
                    ))}
                  </Box>
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
                      <TableCell key={label}>{ueData?.[label] || "N/A"}</TableCell>
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
