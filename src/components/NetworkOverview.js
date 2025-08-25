import React, { useState, useContext } from 'react';
import { Card, Typography, Box, IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails, Select, MenuItem, FormControl, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableChartIcon from '@mui/icons-material/TableChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { BsIcon, HoverContext, parseTimestamp, parseStatus } from "../bs/bs";
import { 
  parseUERRCState, 
  parseUENASState, 
  parseUERRCSecState, 
  parseUERRCCipherAlg,
  parseUERRCIntegrityAlg,
  parseUENASCipherAlg,
  parseUENASIntegrityAlg,
  metadataFields 
} from "../ue/ue";
import ReactDOM from 'react-dom';

function NetworkOverview({ network, events }) {
  const [viewMode, setViewMode] = useState('table'); // 'icon' or 'table'
  const [ueDeviceTypes, setUeDeviceTypes] = useState({}); // Store UE device types
  const [showUeDetails, setShowUeDetails] = useState({}); // Track which UEs show details
  const [ueDetailsPos, setUeDetailsPos] = useState({}); // Track position for details window
  const [showUeMetadata, setShowUeMetadata] = useState({}); // Track which UEs show metadata
  const [ueMetadataPos, setUeMetadataPos] = useState({}); // Track position for metadata window
  const { hoveredBsId, hoveredUeId } = useContext(HoverContext);

  return (
    <Card sx={{ padding: 0, marginTop: "20px", width: "99%", maxWidth: "100%", padding: "10px" }}>
      <Box sx={{ padding: "16px 16px 0 16px" }}>
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "16px"
        }}>
          <Typography variant="h6" component="h2" sx={{ 
            fontWeight: 600, 
            color: "#333"
          }}>
            Network Overview
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Table View">
              <IconButton
                onClick={() => setViewMode('table')}
                sx={{ 
                  color: viewMode === 'table' ? '#11182E' : '#666',
                  backgroundColor: viewMode === 'table' ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                }}
              >
                <TableChartIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Icon View">
              <IconButton
                onClick={() => setViewMode('icon')}
                sx={{ 
                  color: viewMode === 'icon' ? '#11182E' : '#666',
                  backgroundColor: viewMode === 'icon' ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                }}
              >
                <ViewModuleIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      {viewMode === 'icon' ? (
        <div className="App">
          {Object.keys(network).map((bsId, index) => (
            <BsIcon
              key={index}
              bsId={bsId}
              ueData={network[bsId]["ue"]}
              bsData={network[bsId]}
              bsEvent={Object.fromEntries(
                Object.entries(events).filter(([_, ev]) => ev.cellID === bsId)
              )}
            />
          ))}
        </div>
      ) : (
        <Box sx={{ padding: "16px" }}>
          <div
            style={{
              width: "100%",
              background: "#f3f6fa",
              borderRadius: 8,
              border: "1px solid #e0e4ef",
              boxShadow: "0 2px 8px rgba(35,48,90,0.04)",
              overflow: "auto",
              maxHeight: "600px",
              overflowX: "auto"
            }}
          >
            {/* Table Header */}
            {/* <Box sx={{
              background: 'linear-gradient(90deg, #11182E 60%, #2d3c6b 100%)',
              color: '#fff',
              padding: "16px",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 2
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 16 }}>
                Base Station Information
              </Typography>
            </Box> */}
            
            {/* BS Rows with Expandable UE Details */}
            {Object.keys(network).map((bsId, index) => {
              const bsData = network[bsId];
              const ueData = bsData["ue"] || {};
              const ueCount = Object.keys(ueData).length;
              
              // Calculate BS status based on events
              const bsEvents = Object.values(events || {}).filter(ev => ev.cellID === bsId);
              const totalEvents = bsEvents.length;
              const criticalEvents = bsEvents.filter(ev => 
                ev.severity === 'Critical' 
              ).length;
              
              // Determine BS status and styling
              let bsStatus = 'healthy';
              let statusColor = '#2e7d32'; // Green
              let StatusIcon = CheckCircleIcon;
              
              if (criticalEvents > 0) {
                bsStatus = 'critical';
                statusColor = '#d32f2f'; // Red
                StatusIcon = ErrorIcon;
              } else if (totalEvents > 0) {
                bsStatus = 'warning';
                statusColor = '#ed6c02'; // Orange
                StatusIcon = WarningIcon;
              }
              
              return (
                <Accordion 
                  key={bsId} 
                  sx={{ 
                    '&:before': { display: 'none' },
                    boxShadow: 'none',
                    borderBottom: '1px solid #e0e4ef',
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f8fafd",
                    '&:hover': { backgroundColor: "#e0e4ef" }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: '#11182E' }} />}
                    sx={{
                      backgroundColor: 'transparent',
                      overflow: 'auto',
                      '& .MuiAccordionSummary-content': {
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        minWidth: 'max-content'
                      }
                    }}
                  >
                                         {/* BS ID with Base Station Icon and Status */}
                     <Box sx={{ 
                       minWidth: '180px', 
                       fontWeight: 600, 
                       color: statusColor,
                       fontSize: 15,
                       display: 'flex',
                       alignItems: 'center',
                       gap: 1
                     }}>
                       <img 
                         src={require('../assets/bs.png')} 
                         alt="Base Station Icon" 
                         style={{ width: 20, height: 20, marginRight: 6, verticalAlign: 'middle' }} 
                       />
                       <StatusIcon sx={{ fontSize: 18, color: statusColor, marginRight: 3 }} />
                       BS ID: {bsId}
                     </Box>
                    
                    {/* MCC */}
                    <Box sx={{ 
                      minWidth: '70px', 
                      color: '#666',
                      fontSize: 15
                    }}>
                      MCC: {bsData.mcc || 'N/A'}
                    </Box>
                    
                    {/* MNC */}
                    <Box sx={{ 
                      minWidth: '70px', 
                      color: '#666',
                      fontSize: 15
                    }}>
                      MNC: {bsData.mnc || 'N/A'}
                    </Box>
                    
                    {/* TAC */}
                    {/* <Box sx={{ 
                      minWidth: '100px', 
                      color: '#666',
                      fontSize: 15
                    }}>
                      TAC: {bsData.tac || 'N/A'}
                    </Box> */}
                    
                    {/* Status */}
                    <Box sx={{ 
                      minWidth: '100px', 
                      color: '#666',
                      fontSize: 15
                    }}>
                      Status: {parseStatus(bsData.status) || 'Unknown'}
                    </Box>

                    {/* Report Period */}
                    {/* <Box sx={{ 
                      minWidth: '120px', 
                      color: '#666',
                      fontSize: 15
                    }}>
                      Report Period: {bsData.report_period || 'N/A'}
                    </Box> */}

                    {/* Time Created */}    
                    <Box sx={{ 
                      minWidth: '140px', 
                      color: '#666',
                      fontSize: 15
                    }}>
                      Time: {
                        (() => {
                          const dateObj = parseTimestamp(bsData.timestamp);
                          return dateObj && !isNaN(dateObj.getTime())
                            ? dateObj.toLocaleString()
                            : 'N/A';
                        })()
                      }
                    </Box>

                     
                     {/* UE Count */}
                     <Box sx={{ 
                      //  minWidth: '100px', 
                       color: '#666',
                       fontSize: 15
                     }}>
                       UEs: {ueCount}
                     </Box>

                    {/* Show critical event number and total event number */}
                     <Box sx={{ 
                       minWidth: '160px', 
                       fontSize: 15
                     }}>
                       {(() => {
                           // Find all events for this BS
                           const bsEvents = Object.values(events || {}).filter(ev => ev.cellID === bsId);
                           const totalEvents = bsEvents.length;
                           const criticalEvents = bsEvents.filter(ev => 
                           ev.severity === 'Critical'
                       ).length;
                       return (
                           <>
                               Events: <span style={{ fontWeight: 600, color: statusColor }}>{criticalEvents}</span> Critical / <span style={{ fontWeight: 600, color: statusColor }}>{totalEvents}</span> Total
                           </>
                       );
                       })()}
                     </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails sx={{ 
                    backgroundColor: '#f8fafd',
                    padding: '16px',
                    borderTop: '1px solid #e0e4ef'
                  }}>
                    {ueCount > 0 ? (
                      <Box>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600, 
                          color: '#11182E',
                          marginBottom: '12px'
                        }}>
                          Connected UEs ({ueCount})
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {Object.keys(ueData).map((ueId) => {
                            const ue = ueData[ueId];
                            
                            // Calculate UE status based on events (moved outside for reuse)
                            const ueEvents = Object.values(events || {}).filter(ev => ev.ueID === ueId);
                            const totalUEEvents = ueEvents.length;
                            const criticalUEEvents = ueEvents.filter(ev => ev.severity === 'Critical').length;
                            
                            // Determine UE status and styling
                            let ueStatusColor = '#2e7d32'; // Green
                            let UeStatusIcon = CheckCircleIcon;
                            
                            if (criticalUEEvents > 0) {
                              ueStatusColor = '#d32f2f'; // Red
                              UeStatusIcon = ErrorIcon;
                            } else if (totalUEEvents > 0) {
                              ueStatusColor = '#ed6c02'; // Orange
                              UeStatusIcon = WarningIcon;
                            }
                            
                            return (
                              <Box key={ueId} sx={{
                                backgroundColor: '#fff',
                                padding: '12px',
                                borderRadius: '6px',
                                border: '1px solid #e0e4ef',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                fontSize: 15
                              }}>
                                <Box sx={{ 
                                  // minWidth: '200px', 
                                  fontWeight: 500, 
                                  color: '#11182E',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  fontSize: 15,
                                  color: ueStatusColor
                                }}>
                                  {/* UE Device Icon */}
                                  {(() => {
                                    const iconMap = {
                                      camera: require('../assets/cctv-camera.png'),
                                      tablet: require('../assets/tablet.png'),
                                      drone: require('../assets/drone.png'),
                                      wearable: require('../assets/smartwatch.png'),
                                      phone: require('../assets/smartphone.png')
                                    };
                                    const type = ueDeviceTypes[ueId] || 'phone';
                                    const iconSrc = iconMap[type] || iconMap['phone'];
                                    return (
                                      <img
                                        src={iconSrc}
                                        alt="UE Device Icon"
                                        style={{ width: 20, height: 'auto', marginRight: 2 }}
                                      />
                                    );
                                  })()}
                                  {/* UE Status Icon */}
                                  <UeStatusIcon sx={{ fontSize: 18, color: ueStatusColor }} />
                                  UE ID: {ueId}
                                </Box>
                                
                                {/* UE Device Type Dropdown */}
                                <Box sx={{ minWidth: '130px', fontSize: 15 }}>
                                  <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <Select
                                      value={ueDeviceTypes[ueId] || 'phone'}
                                      onChange={(e) => setUeDeviceTypes(prev => ({
                                        ...prev,
                                        [ueId]: e.target.value
                                      }))}
                                      displayEmpty
                                      sx={{
                                        fontSize: '15px',
                                        '& .MuiSelect-select': {
                                          padding: '4px 8px'
                                        }
                                      }}
                                    >
                                      <MenuItem value="phone">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 15 }}>
                                          <img 
                                            src={require('../assets/smartphone.png')} 
                                            alt="Phone" 
                                            style={{ width: 14, height: 'auto' }} 
                                          />
                                          Phone
                                        </Box>
                                      </MenuItem>
                                      <MenuItem value="tablet">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 15 }}>
                                          <img 
                                            src={require('../assets/tablet.png')} 
                                            alt="Tablet" 
                                            style={{ width: 16, height: 'auto' }} 
                                          />
                                          Tablet
                                        </Box>
                                      </MenuItem>
                                      <MenuItem value="camera">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 15 }}>
                                          <img 
                                            src={require('../assets/cctv-camera.png')} 
                                            alt="Camera" 
                                            style={{ width: 16, height: 'auto' }} 
                                          />
                                          Camera
                                        </Box>
                                      </MenuItem>
                                      <MenuItem value="drone">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 15 }}>
                                          <img 
                                            src={require('../assets/drone.png')} 
                                            alt="Drone" 
                                            style={{ width: 16, height: 'auto' }} 
                                          />
                                          Drone
                                        </Box>
                                      </MenuItem>
                                      <MenuItem value="wearable">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 15 }}>
                                          <img 
                                            src={require('../assets/smartwatch.png')} 
                                            alt="wearable" 
                                            style={{ width: 16, height: 'auto' }} 
                                          />
                                          Wearable
                                        </Box>
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                                <Box sx={{ 
                                  // minWidth: '200px', 
                                  color: '#666',
                                  fontSize: 15
                                }}>
                                  IMSI: {ue?.mobile_id || 'N/A'}
                                </Box>
                                {/* <Box sx={{ 
                                  // minWidth: '150px', 
                                  color: '#666',
                                  fontSize: 15
                                }}>
                                  Status: {ue?.state || 'Connected'}
                                </Box> */}
                                <Box sx={{ 
                                  // minWidth: '200px', 
                                  color: '#666',
                                  fontSize: 15
                                }}>
                                  Last Update: {
                                    (() => {
                                      const dateObj = parseTimestamp(ue?.Timestamp);
                                      return dateObj && !isNaN(dateObj.getTime())
                                        ? dateObj.toLocaleString()
                                        : 'N/A';
                                    })()
                                  }
                                </Box>
                                {/* Show critical event number and total event number */}
                                <Box sx={{ minWidth: '220px', color: '#666', fontSize: 15 }}>
                                  Events: <span style={{ fontWeight: 600, color: ueStatusColor }}>{criticalUEEvents}</span> <span style={{ fontWeight: 400, color: '#222' }}>critical</span> / <span style={{ fontWeight: 600, color: ueStatusColor }}>{totalUEEvents}</span> <span style={{ fontWeight: 400, color: '#222' }}>total</span>
                                </Box>
                                
                                {/* Show Details Button */}
                                <Box sx={{ 
                                  minWidth: '120px',
                                  marginLeft: 'auto' // Push button to the right
                                }}>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    {/* Details Button */}
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<VisibilityIcon />}
                                      onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setUeMetadataPos(prev => ({
                                          ...prev,
                                          [ueId]: {
                                            top: rect.top + window.scrollY - 200,
                                            left: rect.left - 350
                                          }
                                        }));
                                        setShowUeMetadata(prev => ({
                                          ...prev,
                                          [ueId]: !prev[ueId]
                                        }));
                                      }}
                                      sx={{
                                        fontSize: '12px',
                                        padding: '4px 8px',
                                        minWidth: 'auto',
                                        borderColor: '#11182E',
                                        color: '#11182E',
                                        '&:hover': {
                                          borderColor: '#2d3c6b',
                                          backgroundColor: 'rgba(17, 24, 46, 0.04)'
                                        }
                                      }}
                                    >
                                      Details
                                    </Button>

                                    {/* Events Button */}
                                    {(() => {
                                      const ueEvents = Object.values(events || {}).filter(ev => ev.ueID === ueId);
                                      const hasEvents = ueEvents.length > 0;
                                      if (!hasEvents) return null;
                                      return (
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          startIcon={<InfoIcon/>}
                                          onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setUeDetailsPos(prev => ({
                                              ...prev,
                                              [ueId]: {
                                                top: rect.top + window.scrollY - 200,
                                                left: rect.left - 350
                                              }
                                            }));
                                            setShowUeDetails(prev => ({
                                              ...prev,
                                              [ueId]: !prev[ueId]
                                            }));
                                          }}
                                          sx={{
                                            fontSize: '12px',
                                            padding: '4px 8px',
                                            minWidth: 'auto',
                                            borderColor: '#11182E',
                                            color: '#11182E',
                                            '&:hover': {
                                              borderColor: '#2d3c6b',
                                              backgroundColor: 'rgba(17, 24, 46, 0.04)'
                                            }
                                          }}
                                        >
                                          Events
                                        </Button>
                                      );
                                    })()}
                                  </Box>
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                        No UEs connected to this base station
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </div>
        </Box>
      )}
      
      {/* UE Details Modal */}
      {Object.keys(showUeDetails).map((ueId) => 
        showUeDetails[ueId] && ueDetailsPos[ueId] && ReactDOM.createPortal(
          <Box
            key={ueId}
            className="ue-details-modal"
            sx={{
              position: 'absolute',
              top: ueDetailsPos[ueId].top - 10,
              left: ueDetailsPos[ueId].left,
              background: "#f8fafd",
              maxHeight: 400,
              overflowY: "auto",
              borderRadius: 2,
              p: 2,
              zIndex: 9999,
              border: '1px solid #e0e4ef',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '300px',
              maxWidth: '500px'
            }}
          >
            {/* Header with UE ID and Close Button */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
              pb: 1,
              borderBottom: '1px solid #e0e4ef'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#11182E' }}>
                UE Events: {ueId}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setShowUeDetails(prev => ({ ...prev, [ueId]: false }))}
                sx={{ color: '#666' }}
              >
                ×
              </IconButton>
            </Box>
            
            {/* Events Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#11182E', mb: 1 }}>
                Events ({(() => {
                  const ueEvents = Object.values(events || {}).filter(ev => ev.ueID === ueId);
                  return ueEvents.length;
                })()})
              </Typography>
              
              {(() => {
                const ueEvents = Object.values(events || {}).filter(ev => ev.ueID === ueId);
                if (ueEvents.length === 0) {
                  return (
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                      No events found for this UE
                    </Typography>
                  );
                }
                
                return ueEvents.map((event, index) => (
                  <Box key={index} sx={{ 
                    mb: 1, 
                    p: 1, 
                    backgroundColor: '#fff', 
                    borderRadius: 1,
                    border: '1px solid #e0e4ef'
                  }}>
                    <Box sx={{ mb: 0.5 }}>
                      <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                        Event {index + 1}:
                      </Typography>{" "}
                      <Typography variant="body2" component="span">
                        {event.name || 'Unnamed Event'}
                      </Typography>
                    </Box>
                    
                    {event.description && (
                      <Box sx={{ mb: 0.5 }}>
                        <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                          Description:
                        </Typography>{" "}
                        <Typography variant="body2" component="span">
                          {event.description}
                        </Typography>
                      </Box>
                    )}
                    
                    {event.severity && (
                      <Box sx={{ mb: 0.5 }}>
                        <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                          Severity:
                        </Typography>{" "}
                        <Typography variant="body2" component="span" sx={{ 
                          color: event.severity === 'Critical' ? '#d32f2f' : 
                                 event.severity === 'Warning' ? '#ed6c02' : '#2e7d32'
                        }}>
                          {event.severity}
                        </Typography>
                      </Box>
                    )}
                    
                    {event.timestamp && (
                      <Box sx={{ mb: 0.5 }}>
                        <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                          Timestamp:
                        </Typography>{" "}
                        <Typography variant="body2" component="span">
                          {(() => {
                            const dateObj = parseTimestamp(event.timestamp);
                            return dateObj && !isNaN(dateObj.getTime())
                              ? dateObj.toLocaleString()
                              : "N/A";
                          })()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ));
              })()}
            </Box>
          </Box>,
          document.body
        )
      )}
      
      {/* UE Metadata Modal */}
      {Object.keys(showUeMetadata).map((ueId) => 
        showUeMetadata[ueId] && ueMetadataPos[ueId] && ReactDOM.createPortal(
          <Box
            key={ueId}
            className="ue-metadata-modal"
            sx={{
              position: 'fixed',
              top: '60%',
              left: '60%',
              transform: 'translate(-40%, -50%)',
              background: "#f8fafd",
              padding: '16px',
              border: '1px solid #e0e4ef',
              borderRadius: 2,
              width: '1000px',
              height: '450px',
              overflow: 'auto',
              zIndex: 9999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {/* Header with UE ID and Close Button */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
              pb: 1,
              borderBottom: '1px solid #e0e4ef'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#11182E' }}>
                UE Metadata: {ueId}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setShowUeMetadata(prev => ({ ...prev, [ueId]: false }))}
                sx={{ color: '#666' }}
              >
                ×
              </IconButton>
            </Box>
            
            {/* UE Metadata Table */}
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
                      <TableCell key={label} sx={{ fontWeight: "bold", backgroundColor: "#e8f0fe", color: "#11182E" }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {(() => {
                      // Find UE data from network
                      const ueData = network[Object.keys(network).find(bsId => network[bsId].ue && network[bsId].ue[ueId])]?.ue[ueId];
                      
                      return [
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
                      });
                    })()}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* MobiFlow Telemetry Section */}
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", marginTop: 1, marginBottom: 1 }}>
              MobiFlow Telemetry
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {metadataFields.map((fld) => (
                      <TableCell key={fld} sx={{ fontWeight: "bold", backgroundColor: "#e8f0fe", color: "#11182E" }}>
                        {fld}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    // Find UE data from network
                    const ueData = network[Object.keys(network).find(bsId => network[bsId].ue && network[bsId].ue[ueId])]?.ue[ueId];
                    
                    if (!ueData || !ueData.mobiflow || ueData.mobiflow.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={metadataFields.length} sx={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                            No telemetry data available
                          </TableCell>
                        </TableRow>
                      );
                    }
                    
                    // Display MobiFlow telemetry data using the same format as ue.jsx
                    return ueData.mobiflow.map((item, index) => (
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
                    ));
                  })()}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>,
          document.body
        )
      )}
    </Card>
  );
}

export default NetworkOverview;
