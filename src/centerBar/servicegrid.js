import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";

// StatusIndicator component for visual indicators
const StatusIndicator = ({ status }) => {
  let color;
  switch (true) {
    case status.startsWith("Running"):
      color = "#8BA84B";
      break;
    case status.startsWith("ContainerCreating"):
      color = "#ECD05F";
      break;
    case status.startsWith("Terminating"):
      color = "#ECD05F";
      break;
    case status.startsWith("Inactive"):
      color = "#641B25";
      break;
    default:
      color = "gray";
  }

  return (
    <Box
      sx={{
        display: "inline-block",
        width: 10,
        height: 10,
        backgroundColor: color,
        marginRight: 1,
      }}
    />
  );
};

function ServiceGrid({ services, handleBuild, handleDeploy, handleUndeploy }) {
  // Define columns for the DataGrid
  const columns = [
    {
      field: "service",
      headerName: "Service",
      width: 220,
    },
    {
      field: "status",
      headerName: "Status",
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <StatusIndicator status={params.value} />
          {params.value}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            sx={{
              fontSize: "0.75rem",
              backgroundColor: "#11182E",
              color: "#fff",
              '&:hover': {
                backgroundColor: "#0E1326",
              },
            }}
            onClick={() => handleBuild(params.row.service)}
          >
            Build
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{
              fontSize: "0.75rem",
              backgroundColor: "#4E6A66",
              color: "#fff",
              '&:hover': {
                backgroundColor: "#435A57",
              },
            }}
            onClick={() => handleDeploy(params.row.service)}
          >
            Deploy
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{
              fontSize: "0.75rem",
              backgroundColor: "#641B25",
              color: "#fff",
              '&:hover': {
                backgroundColor: "#56161F",
              },
            }}
            onClick={() => handleUndeploy(params.row.service)}
          >
            Stop
          </Button>
        </Box>
      ),
    },
  ];

  // Map services to rows for the DataGrid
  const rows = Object.keys(services).map((svcName, idx) => {
    const rawData = services[svcName] || "";
    const parts = rawData.split(";");
    const status = parts[2] || "Inactive";
    const uptime = parts[4] || "";
    const displayStatus = status !== "Inactive" ? `${status} (${uptime})` : status;

    return { id: idx, service: svcName, status: displayStatus };
  });

  return (
    <Card sx={{ padding: 0, margin: "0px auto", width: "100%" }}>
      <CardContent>
        {/* Title with reduced font size */}
        <Typography variant="h6" sx={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: 2 }}>
          SE-RAN Service Status
        </Typography>
        {/* DataGrid Table */}
        <Box sx={{ height: 250, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            hideFooter // Hides the footer, including "Rows per page:"
            disableSelectionOnClick
            density="compact"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default ServiceGrid;