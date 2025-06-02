import React from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh"; // MUI Refresh Icon
import { FaArrowRight } from "react-icons/fa"; // React Icons for arrow

function ActiveCellInfo({ bsevent, bsId, setEvent, setService, updateData }) {
  const getTotalEvents = (cellId) => {
    if (!bsevent[cellId] || !bsevent[cellId].ue) return 0;
    return Object.values(bsevent[cellId].ue).reduce(
      (sum, ueObj) => sum + Object.keys(ueObj.event).length,
      0
    );
  };

  const getCriticalEvents = (cellId) => {
    if (!bsevent[cellId] || !bsevent[cellId].ue) return 0;
    return Object.values(bsevent[cellId].ue).reduce((sum, ueObj) => {
      return sum + Object.values(ueObj.event).filter((ev) => ev.Level === "Critical").length;
    }, 0);
  };

  return (
    <Card sx={{ width: "100%", marginBottom: 3, height: "100%"}}>
      <CardContent>
        {/* Title and Refresh Button */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Active Cell and UE Information
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => updateData(setEvent, setService)}
          >
            Refresh
          </Button>
        </Box>

        {/* Cell and UE Information */}
        {Object.keys(bsevent).map((cellId, index) => {
          const ueCount = bsevent[cellId]?.ue ? Object.keys(bsevent[cellId].ue).length : 0;
          const repPeriod = bsevent[cellId].report_period || 0;

          return (
            <Box key={index} sx={{ marginBottom: 2 }}>
              <Typography variant="body1">
                <strong>Total Events:</strong> {getTotalEvents(cellId)} &nbsp;&nbsp;
                <strong>Critical Events:</strong> {getCriticalEvents(cellId)}
              </Typography>
              <Typography variant="body1" sx={{ marginTop: 1 }}>
                <strong>Cell ID:</strong> {cellId} &nbsp;&nbsp;
                <strong>Active UEs:</strong> {ueCount} &nbsp;&nbsp;
                <strong>Report Interval:</strong> {repPeriod / 1000}s
              </Typography>
              {bsevent[cellId]?.ue &&
                Object.keys(bsevent[cellId].ue).map((ueId) => (
                  <Typography
                    key={ueId}
                    variant="body1"
                    sx={{ display: "flex", alignItems: "center", marginLeft: 2, marginTop: 1 }}
                  >
                    <FaArrowRight style={{ marginRight: "8px", color: "#11182E" }} />
                    <strong>UE ID:</strong> {ueId} &nbsp;&nbsp;
                    <strong>S-TMSI:</strong> {bsevent[cellId].ue[ueId]?.s_tmsi || "N/A"}
                  </Typography>
                ))}
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default ActiveCellInfo;