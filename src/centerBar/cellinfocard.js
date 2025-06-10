import React from "react";
import { Card, CardContent, Typography, Button, Box, Grid } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

// Icons for each card
import CellTowerIcon from "@mui/icons-material/CellTower";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssessmentIcon from "@mui/icons-material/Assessment";

function ActiveCellInfo({ network, events, bsId, setNetwork, setEvent, setService, updateData }) {
  // Extract summary statistics from the event data
  const getSummaryStats = () => {
    const activeCells = Object.keys(network).length;
    let totalUEs = 0;
    let totalEvents = 0;
    let criticalEvents = 0;

    // Below are your event-counting helper functions, unchanged
    const getTotalEventsGlobal = () => {
      return Object.values(events).length;
    };

    const getCriticalEventsGlobal = () => {
      return Object.values(events).filter(ev => String(ev.severity) === "Critical").length;
    };

    for (const cell of Object.values(network)) {
      const ueMap = cell.ue || {};
      totalUEs += Object.keys(ueMap).length;

      // for (const ue of Object.values(ueMap)) {
      //   const events = Object.values(ue.event || {});
      //   totalEvents += events.length;
      //   criticalEvents += events.filter(ev => ev.Level === "Critical").length;
      // }
    }

    totalEvents = getTotalEventsGlobal();
    criticalEvents = getCriticalEventsGlobal();

    return { activeCells, totalUEs, criticalEvents, totalEvents };
  };

  const { activeCells, totalUEs, criticalEvents, totalEvents } = getSummaryStats();

  // Icons mapped to each summary label
  const iconMap = {
    "Active Cells": <CellTowerIcon fontSize="small" sx={{ mr: 1 }} />,
    "Active UEs": <PeopleAltIcon fontSize="small" sx={{ mr: 1 }} />,
    "Critical Events": <WarningAmberIcon fontSize="small" sx={{ mr: 1, color: "orange" }} />,
    "Total Events": <AssessmentIcon fontSize="small" sx={{ mr: 1 }} />,
  };

  const getTotalEvents = (cellId) => {
    if (!network[cellId] || !network[cellId].ue) return 0;
    return Object.values(network[cellId].ue).reduce(
      (sum, ueObj) => sum + Object.keys(ueObj.event).length,
      0
    );
  };

  const getCriticalEvents = (cellId) => {
    if (!network[cellId] || !network[cellId].ue) return 0;
    return Object.values(network[cellId].ue).reduce((sum, ueObj) => {
      return sum + Object.values(ueObj.event).filter(ev => ev.Level === 'Critical').length;
    }, 0);
  };

  return (
    <Card sx={{ width: "100%", marginBottom: 3 }}>
      <CardContent>
        {/* Header section with title and refresh button */}
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

        {/* Summary cards for stats */}
        <Grid container spacing={2}>
          {[
            { label: "Active Cells", value: activeCells },
            { label: "Active UEs", value: totalUEs },
            { label: "Critical Events", value: criticalEvents },
            { label: "Total Events", value: totalEvents },
          ].map(({ label, value }, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card
                variant="outlined"
                sx={{
                  minHeight: 120,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
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
                    {value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default ActiveCellInfo;
