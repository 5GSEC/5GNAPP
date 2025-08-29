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
import ReactDOM from 'react-dom';

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

function parseUEStates(ueData) {
  if (!ueData || !ueData.mobiflow || ueData.mobiflow.length === 0) return "Unknown";

  const last = ueData.mobiflow[ueData.mobiflow.length - 1];

  const rrcState = parseUERRCState(last.rrc_state);
  const emmState = parseUENASState(last.nas_state);

  // return `${rrcState}, ${emmState}`;
  return `${rrcState}`;
}

function parseUERRCState(rrc_state) {
  const rrcMap = {
    0: "RRC_Inactive",
    1: "RRC_Idle",
    2: "RRC_Connected",
    3: "RRC_Reconfigured",
  };
  return rrcMap[rrc_state] ?? `${rrc_state}`;
}

function parseUENASState(nas_state) {
  const emmMap = {
    0: "EMM_Deregistered",
    1: "EMM_Registered_Init",
    2: "EMM_Registered",
  };
  return emmMap[nas_state] ?? "Unknown";
}

function parseUERRCSecState(rrc_sec_state) {
  const rrcSecMap = {
    0: "SEC_CONTEXT_NOT_EXIST",
    1: "RRC_SEC_CONTEXT_INTEGRITY_PROTECTED",
    2: "RRC_SEC_CONTEXT_CIPHERED",
    3: "RRC_SEC_CONTEXT_CIPHERED_AND_INTEGRITY_PROTECTED"
  };
  return rrcSecMap[rrc_sec_state] ?? "Unknown";
}

function parseUERRCCipherAlg(rrc_cipher_alg) {
  const rrcCipherMap = {
    0: "NEA0",
    1: "128-NEA1",
    2: "128-NEA2",
    3: "128-NEA3"
  };
  return rrcCipherMap[rrc_cipher_alg] ?? "Unknown";
}

function parseUERRCIntegrityAlg(rrc_integrity_alg) {
  const rrcIntegrityMap = {
    0: "NIA0",
    1: "128-NIA1",
    2: "128-NIA2",
    3: "128-NIA3"
  };
  return rrcIntegrityMap[rrc_integrity_alg] ?? "Unknown";
}

function parseUENASCipherAlg(nas_cipher_alg) {
  const nasCipherMap = {
    0: "5G-EA0",
    1: "128-5G-EA1",
    2: "128-5G-EA2",
    3: "128-5G-EA3",
    4: "5G-EA4",
    5: "5G-EA5",
    6: "5G-EA6",
    7: "5G-EA7",
  };
  return nasCipherMap[nas_cipher_alg] ?? `${nas_cipher_alg}`;
}

function parseUENASIntegrityAlg(nas_integrity_alg) {
  const nasIntegrityMap = {
    0: "5G-IA0",
    1: "128-5G-IA1",
    2: "128-5G-IA2",
    3: "128-5G-IA3",
    4: "5G-IA4",
    5: "5G-IA5",
    6: "5G-IA6",
    7: "5G-IA7",
  };
  return nasIntegrityMap[nas_integrity_alg] ?? "Unknown";
}



const UeIcon = ({ ueData, ueId, ueEvent, isHovered, click, setHoveredUeId, setIsBsHovered, setBsHoverId, angle, fade}) => {
    const [showInfo, setShowInfo] = useState(false);
    const [MouseClicked, setMouseClicked] = useState(false); // New state variable
    const ueIconRef = useRef(null);
    const [infoPos, setInfoPos] = useState({ top: 0, left: 0 });

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
    if (MouseClicked)
      return;
    setHoveredUeId(ueId);
    if (ueIconRef.current) {
      const rect = ueIconRef.current.getBoundingClientRect();
      setInfoPos({
        top: rect.bottom + window.scrollY + 8, // 8px below the icon
        left: rect.left + window.scrollX,      // align left edges
      });
    }
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
      {!labelOnBottom && (
        <div
          className="ue-label ue-label-top"
          style={{ opacity: fade ? 0.5 : 1 }}
        >
          {ueId}
        </div>
      )}
      <div
        className="ue-icon"
        // style={{ width: isHovered ? '100px' : '50px', height: isHovered ? '100px' : '50px' }}
        ref={ueIconRef}
        onClick={handleUeClick}
      >
        <img src={ue_cctvCamera} alt="UE Icon" className="ue-icon-img" id={`_${ueId}`} style={{ width: '100%', height: '100%' }} />
      </div>
      {labelOnBottom && (
        <div
          className="ue-label ue-label-bottom"
          style={{ opacity: fade ? 0.5 : 1 }}
        >
          {ueId}
        </div>
      )}


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

            {showInfo && ReactDOM.createPortal(
                <Box
                  className="floating-window"
                  sx={{
                    position: 'absolute',
                    top: infoPos.top - 10,
                    left: infoPos.left,
                    background: "#f8fafd",
                    maxHeight: 320,
                    overflowY: "auto",
                    borderRadius: 2,
                    p: 2,
                    zIndex: 9999
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
                        UE Status:
                      </Typography>{" "}
                      <Typography variant="body1" component="span">
                        {parseUEStates(ueData)}
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
                </Box>,
                document.body
            )}

      {/* showinfo window for clicking */}
        {showDetails && ReactDOM.createPortal(
          <Box
            sx={{
              position: 'fixed',
              top: '60%',
              left: '60%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#fff',
              padding: '16px',
              border: '2px solid #ccc',
              borderRadius: 2,
              width: '1000px',
              height: '450px',
              overflow: 'auto',
              zIndex: 9999
            }}
          >

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 1,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", marginTop: 0 }}>
                UE Metadata
              </Typography>
              <IconButton
                onClick={handleCloseDetailsWindow}
                sx={{
                  color: "black",
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
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
                    ].map((label) => {
                      let value = ueData?.[label];
                      if (label === "rrc_cipher_alg") {
                        value = value !== undefined && value !== null && value !== "" ? parseUERRCCipherAlg(value) : "N/A";
                      } else if (label === "rrc_integrity_alg") {
                        value = value !== undefined && value !== null && value !== "" ? parseUERRCIntegrityAlg(value) : "N/A";
                      } else if (label === "nas_cipher_alg") {
                        value = value !== undefined && value !== null && value !== "" ? parseUENASCipherAlg(value) : "N/A";
                      } else if (label === "nas_integrity_alg") {
                        value = value !== undefined && value !== null && value !== "" ? parseUENASIntegrityAlg(value) : "N/A";
                      } else {
                        value = value !== undefined && value !== null && value !== "" ? value : "N/A";
                      }
                      return <TableCell key={label}>{value}</TableCell>;
                    })}
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
                        <TableCell key={fld}>
                          {(() => {
                            if (fld === "rrc_state" && item[fld]) {
                              return parseUERRCState(item[fld]);
                            } else if (fld === "nas_state" && item[fld]) {
                              return parseUENASState(item[fld]);
                            } else if (fld === "rrc_sec_state" && item[fld]) {
                              return parseUERRCSecState(item[fld]);
                            } else if (item[fld] !== undefined && item[fld] !== null && item[fld] !== "") {
                              return item[fld];
                            } else {
                              return "N/A";
                            }
                          })()}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

          </Box>,
          document.body
        )}

      
    </div>
  );
};

// Export parsing functions for use in other components
export {
  parseTimestamp,
  parseUEStates,
  parseUERRCState,
  parseUENASState,
  parseUERRCSecState,
  parseUERRCCipherAlg,
  parseUERRCIntegrityAlg,
  parseUENASCipherAlg,
  parseUENASIntegrityAlg,
  metadataFields
};

export default UeIcon;
