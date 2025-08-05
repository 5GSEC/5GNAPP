import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  useTheme
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CellTowerIcon from "@mui/icons-material/CellTower";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { LineChart } from "@mui/x-charts/LineChart";
import { fetchAllData } from '../App';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

function parseTimestamp(raw) {
  if (!raw) return null;
  const n = Number(raw);
  if (isNaN(n)) return null;
  return n < 1e12 ? new Date(n * 1000) : new Date(n);
}

function ActiveCellInfo({ network, events, bsId, setNetwork, setEvent, setService, setTimeSeriesData, timeSeriesData }) {
  const theme = useTheme();
  const [timeSeries, setTimeSeries] = useState({
    activeCells: [],
    totalUEs: [],
    totalEvents: [],
    criticalEvents: []
  });

  useEffect(() => {
    const makeSeries = (map) => {
      if (!map) return [];
      return Object.entries(map)
        .map(([ts, val]) => ({ ts: Number(ts), val }))
    }

    setTimeSeries({
      activeCells: makeSeries(timeSeriesData.active_bs),
      totalUEs: makeSeries(timeSeriesData.active_ue),
      totalEvents: makeSeries(timeSeriesData.total_event),
      criticalEvents: makeSeries(timeSeriesData.critical_event)
    });
  }, [timeSeriesData]);

  const iconMap = {
    "Active Cells": <CellTowerIcon fontSize="small" sx={{ mr: 1 }} />,
    "Active UEs": <SmartphoneIcon fontSize="small" sx={{ mr: 1 }} />,
    "Critical Events": <WarningAmberIcon fontSize="small" sx={{ mr: 1, color: "red" }} />,
    "Total Events": <AssessmentIcon fontSize="small" sx={{ mr: 1 }} />,
  };

  const dataKeys = {
    "Active Cells": "activeCells",
    "Active UEs": "totalUEs",
    "Critical Events": "criticalEvents",
    "Total Events": "totalEvents",
  };

  const latest = Object.fromEntries(
    Object.entries(timeSeries).map(([key, arr]) => [key, arr.length > 0 ? arr[arr.length - 1].val : 0])
  );

  return (
    <Card sx={{ width: "100%", height: "100%", marginBottom: 0 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Network Summary
          </Typography>
          {/* <Typography variant="subtitle2" color="text.secondary" sx={{ display: "block"}}>
            Last 15 minutes
          </Typography> */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon sx={{ color: '#11182E' }} />}
            onClick={() => fetchAllData(setNetwork, setEvent, setService, setTimeSeriesData)}
            sx={{
              borderColor: '#11182E',
              color: '#11182E',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#f3f6fa',
                borderColor: '#2d3c6b',
                color: '#2d3c6b',
                '& .MuiSvgIcon-root': { color: '#2d3c6b' },
              },
            }}
          >
            Refresh
          </Button>
        </Box>

        <Grid container spacing={2}>
          {Object.keys(dataKeys).map((label, idx) => {
            const key = dataKeys[label];
            const series = timeSeries[key] || [];
            const timestamps = series.map(d => d.ts);
            const data = series.map(d => d.val);

            let xMin = null, xMax = null;
            let yMin = null, yMax = null;
            if (timestamps.length > 0) {
              xMin = Math.min(...timestamps);
              xMax = Math.max(...timestamps);
            }
            if (data.length > 0) {
              yMin = Math.min(...data) == 0 ? -0.5 :(Math.min(...data)) * 0.9;
              yMax = Math.max(...data) == 0 ? 0.5 : (Math.max(...data)) * 1.1;
            }

            if (timestamps.length === 0) {
              return (
                <Grid item xs={12} sm={6} md={3} lg={3} xl={3} key={idx} sx={{
                  flex: '1 1 0',
                  minWidth: 0,
                  maxWidth: '100%',
                  display: 'flex'
                }}>
                  <Card
                    variant="outlined"
                    sx={{
                      minHeight: 180,
                      width: '100%',
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      flex: 1
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        {iconMap[label]}
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {label}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {latest[key]}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No data
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            }

            // Calculate trend: compare latest y value to yMin
            // Find the last data element in the array that is different from the current (last) one
            const lastVal = data.length > 0 ? data[data.length - 1] : 0;
            let firstVal = lastVal;
            if (data.length > 1) {
              // Search backwards for the last value that is different from lastVal
              for (let i = data.length - 2; i >= 0; i--) {
                if (data[i] !== lastVal) {
                  firstVal = data[i];
                  break;
                }
              }
            }
            let percent = 0;
            let trend = "neutral";
            if (firstVal === 0 && lastVal === 0) {
              percent = 0;
              trend = "neutral";
            } else if (firstVal === 0) {
              percent = 100;
              trend = "up";
            } else if (lastVal === firstVal) {
              percent = 0;
              trend = "neutral";
            } else {
              percent = ((lastVal - firstVal) / Math.abs(firstVal)) * 100;
              trend = percent > 0 ? "up" : "down";
            }

            // trend color
            let trendColor = '#888'; // green
            const isEvent = key === "criticalEvents" || key === "totalEvents";
            if (trend === "up" && isEvent) {
              trendColor = '#d32f2f'; // improved red (Material UI red[700])
            } else if ((trend === "down" || trend === "neutral") && isEvent) {
              trendColor = '#388e3c'; // improved green (Material UI green[700])
            } else {
              trendColor = '#888'; // neutral
            }

            return (
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} key={idx} sx={{
                flex: '1 1 0',
                minWidth: 0,
                maxWidth: '100%',
                display: 'flex'
              }}>
                <Card
                  variant="outlined"
                  sx={{
                    minHeight: 180,
                    width: '100%',
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    flex: 1
                  }}
                >
                  <CardContent sx={{ paddingBottom: "8px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      {iconMap[label]}
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {label}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {latest[key]}
                    </Typography>
                    <LineChart
                      xAxis={[{
                        scaleType: 'time',
                        data: timestamps,
                        valueFormatter: (ts) =>
                          new Date(ts * 1000).toLocaleTimeString('en-US', { hour12: false }),
                        min: xMin,
                        max: xMax,
                        position: 'none',
                      }]}
                      yAxis={[{
                        min: yMin,
                        max: yMax,
                        position: 'none',
                      }]}
                      series={[{
                        data,
                        showMark: false,
                        color: trendColor,
                        // area: true,
                      }]}
                      height={90}
                      // width={100}
                      margin={{ top: 5, bottom: 5, left: 2, right: 0 }}
                      grid={{ horizontal: false, vertical: false }}
                      // slotProps={{
                      //   legend: { hidden: true },
                      //   tooltip: {
                      //     sx: {
                      //       backgroundColor: 'white',
                      //       borderRadius: 1,
                      //       boxShadow: 3,
                      //       padding: '4px 8px',
                      //       fontSize: '0.75rem',
                      //       color: '#000',
                      //     },
                      //     content: ({ axisValue, series }) => (
                      //       <Box>
                      //         <Typography sx={{ fontWeight: 600, color: '#000' }}>
                      //           {new Date(axisValue).toLocaleDateString('en-US', {
                      //             month: 'short',
                      //             day: 'numeric',
                      //           })}
                      //         </Typography>
                      //         {series.map(({ label, value, color }, i) => (
                      //           <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      //             <Box sx={{ width: 12, height: 3, backgroundColor: color }} />
                      //             <Typography variant="body2" sx={{ color: '#000' }}>
                      //               {value}
                      //             </Typography>
                      //           </Box>
                      //         ))}
                      //       </Box>
                      //     ),
                      //   },
                      // }}
                    />
                    {/* Smart trend card below the chart */}
                    <Box
                      sx={{
                        mt: 0.5,
                        px: 1.5,
                        py: 0,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f8fafd",
                        boxShadow: 0,
                        minHeight: 30,
                        minWidth: 0,
                      }}
                    >
                      {(() => {
                        // Clamp percent for display
                        const displayPercent = Math.abs(percent).toFixed(0);

                        // Choose color and icon
                        let color = "#888";
                        let icon = null;

                        // Apply special trend color only for "Critical Events" or "Total Events"
                        const isEvent = key === "criticalEvents" || key === "totalEvents";
                        if (isEvent) {
                          if (trend === "up") {
                            color = "#d32f2f"; // improved green (Material UI green[700])
                            icon = (
                              <TrendingUpIcon
                                sx={{
                                  color,
                                  fontSize: 18,
                                  mr: 0.5,
                                  verticalAlign: "middle",
                                }}
                              />
                            );
                          } else if (trend === "down") {
                            color = "#388e3c"; // improved red (Material UI red[700])
                            icon = (
                              <TrendingDownIcon
                                sx={{
                                  color,
                                  fontSize: 18,
                                  mr: 0.5,
                                  verticalAlign: "middle",
                                }}
                              />
                            );
                          } else {
                            color = "#888";
                            icon = (
                              <TrendingFlatIcon
                                sx={{
                                  color,
                                  fontSize: 18,
                                  mr: 0.5,
                                  verticalAlign: "middle",
                                }}
                              />
                            );
                          }
                        } else {
                          // For all other items, always use #888 and neutral icon
                          color = "#888";
                          icon = (
                            trend === "up" ? (
                              <TrendingUpIcon
                                sx={{
                                  color,
                                  fontSize: 18,
                                  mr: 0.5,
                                  verticalAlign: "middle",
                                }}
                              />
                            ) : trend === "down" ? (
                              <TrendingDownIcon
                                sx={{
                                  color,
                                  fontSize: 18,
                                  mr: 0.5,
                                  verticalAlign: "middle",
                                }}
                              />
                            ) : (
                              <TrendingFlatIcon
                                sx={{
                                  color,
                                  fontSize: 18,
                                  mr: 0.5,
                                  verticalAlign: "middle",
                                }}
                              />
                            )
                          );
                        }

                        return (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {icon}
                            <Typography
                              variant="body2"
                              sx={{
                                color,
                                fontWeight: 600,
                                fontSize: "1rem",
                                mr: 0.5,
                              }}
                            >
                              {trend === "neutral"
                                ? "0%"
                                // : `${trend === "up" ? "+" : "-"}${displayPercent}%`}
                                : `${displayPercent}%`}
                            </Typography>
                          </Box>
                        );
                      })()}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default ActiveCellInfo;
