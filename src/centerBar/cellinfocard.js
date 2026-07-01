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
import { fetchAllData } from '../backend/fetchUserData';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

function ActiveCellInfo({ network, events, bsId, setNetwork, setEvent, setService, setTimeSeriesData, timeSeriesData }) {
  const theme = useTheme();
  const c = theme.custom;
  const isDarkMode = theme.palette.mode === "dark";
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

  const panelSx = {
    width: "100%",
    height: "100%",
    marginBottom: 0,
    backgroundColor: c.bgPanel,
    color: isDarkMode ? "#e8f1ff" : "inherit",
    border: isDarkMode ? `1px solid ${c.border}` : "1px solid transparent",
    boxShadow: isDarkMode ? c.panelShadow : undefined,
  };

  const titleColor = isDarkMode ? c.textTitle : "inherit";
  const iconColor = c.accent;
  const bodyTextColor = isDarkMode ? c.textPrimary : "inherit";
  const mutedTextColor = isDarkMode ? c.textMuted : "text.secondary";
  const metricCardSx = {
    minHeight: 180,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
    backgroundColor: isDarkMode ? c.bgSurface : "#ffffff",
    borderColor: isDarkMode ? c.border : "rgba(0, 0, 0, 0.12)",
    color: bodyTextColor,
  };
  const trendCardSx = {
    mt: 0.5,
    px: 1.5,
    py: 0,
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: isDarkMode
      ? "linear-gradient(180deg, rgba(18, 44, 78, 0.96), rgba(10, 27, 49, 0.96))"
      : "#f8fafd",
    border: isDarkMode ? "1px solid rgba(143, 190, 245, 0.22)" : "1px solid transparent",
    boxShadow: isDarkMode ? "inset 0 1px 0 rgba(255, 255, 255, 0.04)" : 0,
    minHeight: 30,
    minWidth: 0,
  };

  const iconMap = {
    "Active Cells": <CellTowerIcon fontSize="small" sx={{ mr: 1, color: iconColor }} />,
    "Active UEs": <SmartphoneIcon fontSize="small" sx={{ mr: 1, color: iconColor }} />,
    "Critical Events": <WarningAmberIcon fontSize="small" sx={{ mr: 1, color: isDarkMode ? "#ff8f8f" : "red" }} />,
    "Total Events": <AssessmentIcon fontSize="small" sx={{ mr: 1, color: iconColor }} />,
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
    <Card sx={panelSx}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <Typography variant="h6" sx={{ color: titleColor, fontSize: "1.25rem", fontWeight: "bold", marginBottom: 2, display: "flex", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", marginRight: 8 }}>
            {
              (() => {
                // You can replace with any other icon as needed
                return <CellTowerIcon sx={{ fontSize: 28, color: iconColor, mr: 0.5 }} />;
              })()
            }
          </span>
            Network Summary
          </Typography>
          {/* <Typography variant="subtitle2" color="text.secondary" sx={{ display: "block"}}>
            Last 15 minutes
          </Typography> */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon sx={{ color: isDarkMode ? "#d8eaff" : "#11182E" }} />}
            onClick={() => fetchAllData(setNetwork, setEvent, setService, setTimeSeriesData)}
            sx={{
              borderColor: isDarkMode ? "rgba(143, 190, 245, 0.58)" : '#11182E',
              color: isDarkMode ? "#d8eaff" : '#11182E',
              backgroundColor: isDarkMode ? "rgba(20, 48, 84, 0.72)" : "transparent",
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: isDarkMode ? "rgba(35, 79, 138, 0.72)" : '#f3f6fa',
                borderColor: isDarkMode ? "#9dccff" : '#2d3c6b',
                color: isDarkMode ? "#ffffff" : '#2d3c6b',
                '& .MuiSvgIcon-root': { color: isDarkMode ? "#ffffff" : '#2d3c6b' },
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
                    sx={metricCardSx}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        {iconMap[label]}
                        <Typography variant="subtitle2" sx={{ color: bodyTextColor, fontWeight: 600 }}>
                          {label}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ color: titleColor, fontWeight: "bold" }}>
                        {latest[key]}
                      </Typography>
                      <Typography variant="body2" color={mutedTextColor}>
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
              trendColor = '#B2281D'; // '#d32f2f'; // improved red (Material UI red[700])
            } else if ((trend === "down" || trend === "neutral") && isEvent) {
              trendColor = '#6FBA5F'; // '#388e3c'; // improved green (Material UI green[700])
            } else {
              trendColor = '#919BB0'; // '#888'; // neutral
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
                  sx={metricCardSx}
                >
                  <CardContent sx={{ paddingBottom: "8px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      {iconMap[label]}
                      <Typography variant="subtitle2" sx={{ color: bodyTextColor, fontWeight: 600 }}>
                        {label}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ color: titleColor, fontWeight: "bold" }}>
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
                        area: true,
                      }]}
                      sx={{
                        // Set area fill to a lighter, semi-transparent version of trendColor
                        "& .MuiAreaElement-root": {
                          fill: trendColor ? `${trendColor}22` : "rgba(0,0,0,0.10)", // 13% opacity if hex, fallback to light gray
                        },
                        "& .MuiChartsAxis-root text": {
                          fill: isDarkMode ? "#9bb0c9" : undefined,
                        },
                        // "& .MuiChartsAxisHighlight-root": {
                        //   strokeDasharray: 0,
                        //   strokeWidth: 2,
                        // },
                      }}
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
                      sx={trendCardSx}
                    >
                      {(() => {
                        // Clamp percent for display
                        const displayPercent = Math.abs(percent).toFixed(0);

                        // Choose color and icon
                        let color = isDarkMode ? '#9bb0c9' : '#919BB0';
                        let icon = null;

                        // Apply special trend color only for "Critical Events" or "Total Events"
                        const isEvent = key === "criticalEvents" || key === "totalEvents";
                        if (isEvent) {
                          if (trend === "up") {
                            color = isDarkMode ? '#ff6f87' : '#B2281D';
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
                            color = isDarkMode ? '#35d48b' : '#6FBA5F';
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
                            color = isDarkMode ? '#9bb0c9' : "#888";
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
                          color = isDarkMode ? '#9bb0c9' : "#888";
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
