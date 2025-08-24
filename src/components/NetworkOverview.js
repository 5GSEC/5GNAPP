import React, { useState, useContext } from 'react';
import { Card, Typography, Box, IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails, Select, MenuItem, FormControl } from "@mui/material";

import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableChartIcon from '@mui/icons-material/TableChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BsIcon, HoverContext, parseTimestamp, parseStatus } from "../bs/bs";

function NetworkOverview({ network, events }) {
  const [viewMode, setViewMode] = useState('table'); // 'icon' or 'table'
  const [ueDeviceTypes, setUeDeviceTypes] = useState({}); // Store UE device types
  const { hoveredBsId, hoveredUeId } = useContext(HoverContext);

  return (
    <Card sx={{ padding: 0, marginTop: "20px", width: "99%", padding: "10px" }}>
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
              maxHeight: "600px"
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
                      '& .MuiAccordionSummary-content': {
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3
                      }
                    }}
                  >
                                         {/* BS ID with Base Station Icon and Status */}
                     <Box sx={{ 
                       minWidth: '200px', 
                       fontWeight: 600, 
                       color: statusColor,
                       fontSize: 15,
                       display: 'flex',
                       alignItems: 'center',
                       gap: 1.2
                     }}>
                       <img 
                         src={require('../assets/bs.png')} 
                         alt="Base Station Icon" 
                         style={{ width: 24, height: 24, marginRight: 8, verticalAlign: 'middle' }} 
                       />
                       <StatusIcon sx={{ fontSize: 20, color: statusColor, marginRight: 4 }} />
                       BS ID: {bsId}
                     </Box>
                    
                    {/* MCC */}
                    <Box sx={{ 
                      minWidth: '100px', 
                      color: '#666',
                      fontSize: 15
                    }}>
                      MCC: {bsData.mcc || 'N/A'}
                    </Box>
                    
                    {/* MNC */}
                    <Box sx={{ 
                      minWidth: '100px', 
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
                      minWidth: '120px', 
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
                      minWidth: '120px', 
                      color: '#666',
                      fontSize: 15
                    }}>
                      Time Created: {
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
                       minWidth: '120px', 
                       color: '#666',
                       fontSize: 15
                     }}>
                       Connected UEs: {ueCount}
                     </Box>

                                          {/* Show critical event number and total event number */}
                     <Box sx={{ 
                       minWidth: '200px', 
                    //    color: statusColor,
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
                                 Events: <span style={{ fontWeight: 600, color: statusColor }}>{criticalEvents}</span> <span style={{ fontWeight: 400, color: '#222' }}>Critical</span> / <span style={{ fontWeight: 600, color: statusColor }}>{totalEvents}</span> <span style={{ fontWeight: 400, color: '#222' }}>Total</span>
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
                                gap: 3
                              }}>
                                <Box sx={{ 
                                  minWidth: '200px', 
                                  fontWeight: 500, 
                                  color: '#11182E',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                  {/* UE Device Icon */}
                                  <img 
                                    src={ueDeviceTypes[ueId] === 'camera' ? require('../assets/cctv3.png') : require('../assets/ue-phone.png')}
                                    alt="UE Device Icon" 
                                    style={{ width: 16, height: 'auto', marginRight: 4 }} 
                                  />
                                  {/* UE Status Icon */}
                                  <UeStatusIcon sx={{ fontSize: 18, color: ueStatusColor }} />
                                  UE ID: {ueId}
                                </Box>
                                
                                {/* UE Device Type Dropdown */}
                                <Box sx={{ minWidth: '150px' }}>
                                  <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <Select
                                      value={ueDeviceTypes[ueId] || 'phone'}
                                      onChange={(e) => setUeDeviceTypes(prev => ({
                                        ...prev,
                                        [ueId]: e.target.value
                                      }))}
                                      displayEmpty
                                      sx={{
                                        fontSize: '14px',
                                        '& .MuiSelect-select': {
                                          padding: '4px 8px'
                                        }
                                      }}
                                    >
                                      <MenuItem value="phone">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <img 
                                            src={require('../assets/ue-phone.png')} 
                                            alt="Phone" 
                                            style={{ width: 10, height: 16 }} 
                                          />
                                          Phone
                                        </Box>
                                      </MenuItem>
                                      <MenuItem value="camera">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <img 
                                            src={require('../assets/cctv3.png')} 
                                            alt="Camera" 
                                            style={{ width: 16, height: 16 }} 
                                          />
                                          Camera
                                        </Box>
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                                <Box sx={{ 
                                  minWidth: '200px', 
                                  color: '#666'
                                }}>
                                  IMSI: {ue?.mobile_id || 'N/A'}
                                </Box>
                                <Box sx={{ 
                                  minWidth: '150px', 
                                  color: '#666'
                                }}>
                                  Status: {ue?.state || 'Connected'}
                                </Box>
                                <Box sx={{ 
                                  minWidth: '200px', 
                                  color: '#666'
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
                                <Box sx={{ minWidth: '220px', color: '#666' }}>
                                  Events: <span style={{ fontWeight: 600, color: ueStatusColor }}>{criticalUEEvents}</span> <span style={{ fontWeight: 400, color: '#222' }}>critical</span> / <span style={{ fontWeight: 600, color: ueStatusColor }}>{totalUEEvents}</span> <span style={{ fontWeight: 400, color: '#222' }}>total</span>
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
    </Card>
  );
}

export default NetworkOverview;
