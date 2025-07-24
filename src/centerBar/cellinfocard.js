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

function parseTimestamp(raw) {
  if (!raw) return null;
  const n = Number(raw);
  if (isNaN(n)) return null;
  return n < 1e12 ? new Date(n * 1000) : new Date(n);
}

function ActiveCellInfo({ network, events, bsId, setNetwork, setEvent, setService, updateData, timeSeriesData }) {
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
    <Card sx={{ width: "100%", height: "100%", marginBottom: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Network Summary
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon sx={{ color: '#11182E' }} />}
            onClick={() => updateData(setNetwork, setEvent, setService)}
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
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card variant="outlined" sx={{ minHeight: 160 }}>
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

            // trend color
            const trendColor = '#90a757'; // green
            // const trendColor = (data.length >= 2 && data[data.length - 1] <= data[0])
            //   ? '#90a757' // green
            //   : '#e53935'; // red

            return (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card variant="outlined" sx={{ minHeight: 160, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
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
                      }]}
                      yAxis={[{
                        min: yMin,
                        max: yMax,
                      }]}
                      leftAxis={null}
                      bottomAxis={null}
                      series={[{
                        data,
                        showMark: false,
                        color: trendColor,
                      }]}
                      height={80}
                      margin={{ top: 5, bottom: 5, left: 2, right: 0 }}
                      grid={{ horizontal: false, vertical: false }}
                      slotProps={{
                        legend: { hidden: true },
                        tooltip: {
                          sx: {
                            backgroundColor: 'white',
                            borderRadius: 1,
                            boxShadow: 3,
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            color: '#000',
                          },
                          content: ({ axisValue, series }) => (
                            <Box>
                              <Typography sx={{ fontWeight: 600, color: '#000' }}>
                                {new Date(axisValue).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </Typography>
                              {series.map(({ label, value, color }, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 12, height: 3, backgroundColor: color }} />
                                  <Typography variant="body2" sx={{ color: '#000' }}>
                                    {value}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          ),
                        },
                      }}

                    />
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
