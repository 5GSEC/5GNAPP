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
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { LineChart } from "@mui/x-charts/LineChart";

function parseTimestamp(raw) {
  if (!raw) return null;
  const n = Number(raw);
  if (isNaN(n)) return null;
  return n < 1e12 ? new Date(n * 1000) : new Date(n);
}

function ActiveCellInfo({ network, events, bsId, setNetwork, setEvent, setService, updateData }) {
  const theme = useTheme();
  const [timeSeries, setTimeSeries] = useState({
    activeCells: [],
    totalUEs: [],
    totalEvents: [],
    criticalEvents: []
  });

  useEffect(() => {
    const cellMap = {};
    const ueMap = {};
    const eventMap = {};
    const criticalMap = {};

    Object.values(network).forEach(cell => {
      const ts = parseTimestamp(cell.timestamp)?.getTime();
      if (!ts) return;
      cellMap[ts] = (cellMap[ts] || 0) + 1;
    });

    Object.values(network).forEach(cell => {
      Object.values(cell.ue || {}).forEach(ue => {
        const ts = parseTimestamp(ue.timestamp)?.getTime();
        if (!ts) return;
        ueMap[ts] = (ueMap[ts] || 0) + 1;
      });
    });

    if (events && typeof events === 'object') {
      Object.values(events).forEach(evt => {
        const ts = parseTimestamp(evt.timestamp)?.getTime();
        if (!ts) return;
        eventMap[ts] = (eventMap[ts] || 0) + 1;
        if ((evt.severity || '').toLowerCase() === 'critical') {
          criticalMap[ts] = (criticalMap[ts] || 0) + 1;
        }
      });
    }

    const makeSeries = (map) => {
      const keys = Object.keys(map).map(Number).sort((a, b) => a - b);
      const result = [];
      let acc = 0;
      for (const ts of keys) {
        acc += map[ts];
        result.push({ ts, val: acc });
      }
      return result;
    };

    setTimeSeries({
      activeCells: makeSeries(cellMap),
      totalUEs: makeSeries(ueMap),
      totalEvents: makeSeries(eventMap),
      criticalEvents: makeSeries(criticalMap)
    });
  }, [network, events]);

  const iconMap = {
    "Active Cells": <CellTowerIcon fontSize="small" sx={{ mr: 1 }} />,
    "Active UEs": <PeopleAltIcon fontSize="small" sx={{ mr: 1 }} />,
    "Critical Events": <WarningAmberIcon fontSize="small" sx={{ mr: 1, color: "orange" }} />,
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

            const minTs = Math.min(...timestamps);
            const maxTs = Math.max(...timestamps);

            // 新增：判断趋势颜色
            const trendColor = (data.length >= 2 && data[data.length - 1] < data[0])
              ? '#e53935' // 红色
              : '#90a757'; // 绿色

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
                        position: 'none',
                        ...(key === 'activeCells'
                          ? { min: minTs - 5, max: maxTs + 5 }
                          : key === 'totalUEs'
                          ? { min: minTs - 10000, max: maxTs + 10000 }
                          : key === 'totalEvents' || key === 'criticalEvents'
                          ? { min: minTs - 10000, max: maxTs + 10000 }
                          : { min: minTs - 10, max: maxTs + 10 }),
                        valueFormatter: (ts) =>
                          new Date(ts).toLocaleTimeString('en-US', { hour12: false }),
                      }]}
                      leftAxis={null}
                      bottomAxis={null}
                      series={[{
                        data,
                        showMark: false,
                        color: trendColor,
                      }]}
                      height={60}
                      margin={{ top: 5, bottom: 5, left: 0, right: 0 }}
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
