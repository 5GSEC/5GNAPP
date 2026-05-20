import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";

// StatusIndicator component for visual indicators
const StatusIndicator = ({ status, isDarkMode }) => {
  let color;
  switch (true) {
    case status.startsWith("Running"):
      color = isDarkMode ? "#35d48b" : "#8BA84B";
      break;
    case status.startsWith("ContainerCreating"):
      color = isDarkMode ? "#f4d35e" : "#ECD05F";
      break;
    case status.startsWith("Terminating"):
      color = isDarkMode ? "#f4d35e" : "#ECD05F";
      break;
    case status.startsWith("Inactive"):
      color = isDarkMode ? "#ff6f87" : "#641B25";
      break;
    default:
      color = isDarkMode ? "#9bb0c9" : "gray";
  }

  return (
    <Box
      sx={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: color,
        marginRight: 1,
      }}
    />
  );
};

function ServiceGrid({ services, handleBuild, handleDeploy, handleUndeploy, isDarkMode }) {
  const panelSx = {
    padding: 0,
    margin: "0px auto",
    width: "100%",
    backgroundColor: isDarkMode ? "#071528" : "#ffffff",
    color: isDarkMode ? "#e8f1ff" : "inherit",
    border: isDarkMode ? "1px solid rgba(123, 161, 207, 0.28)" : "1px solid transparent",
    boxShadow: isDarkMode ? "0 10px 24px rgba(0, 0, 0, 0.34)" : undefined,
  };

  const titleColor = isDarkMode ? "#f3f8ff" : "inherit";
  const iconColor = isDarkMode ? "#8fbfff" : "#23305a";
  const serviceIconColor = isDarkMode ? "#9db8d8" : "black";
  const gridTextColor = isDarkMode ? "#dbe8f7" : "#1d2633";
  const gridMutedColor = isDarkMode ? "#9bb0c9" : "#536274";

  const gridSx = {
    borderColor: isDarkMode ? "rgba(123, 161, 207, 0.26)" : "rgba(224, 224, 224, 1)",
    color: gridTextColor,
    backgroundColor: isDarkMode ? "#08182d" : "#ffffff",
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: isDarkMode ? "#0d2038" : "#f7f9fc",
      color: isDarkMode ? "#cfe0f5" : "#263447",
      borderBottomColor: isDarkMode ? "rgba(123, 161, 207, 0.28)" : "rgba(224, 224, 224, 1)",
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: 700,
    },
    "& .MuiDataGrid-cell": {
      borderBottomColor: isDarkMode ? "rgba(123, 161, 207, 0.16)" : "rgba(224, 224, 224, 1)",
      color: gridTextColor,
    },
    "& .MuiDataGrid-row:hover": {
      backgroundColor: isDarkMode ? "rgba(71, 137, 213, 0.12)" : "#f7fbff",
    },
    "& .MuiDataGrid-withBorderColor": {
      borderColor: isDarkMode ? "rgba(123, 161, 207, 0.2)" : undefined,
    },
    "& .MuiDataGrid-virtualScroller": {
      backgroundColor: isDarkMode ? "#08182d" : "#ffffff",
    },
    "& .MuiDataGrid-overlay": {
      color: gridMutedColor,
      backgroundColor: isDarkMode ? "#08182d" : "#ffffff",
    },
  };

  const buttonStyles = {
    build: {
      backgroundColor: isDarkMode ? "#234f8a" : "#11182E",
      color: "#fff",
      "&:hover": {
        backgroundColor: isDarkMode ? "#2f66ad" : "#0E1326",
      },
    },
    deploy: {
      backgroundColor: isDarkMode ? "#1d6b5d" : "#4E6A66",
      color: "#fff",
      "&:hover": {
        backgroundColor: isDarkMode ? "#248270" : "#435A57",
      },
    },
    stop: {
      backgroundColor: isDarkMode ? "#8c2f3d" : "#641B25",
      color: "#fff",
      "&:hover": {
        backgroundColor: isDarkMode ? "#a83a4a" : "#56161F",
      },
    },
  };

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
          <StatusIndicator status={params.value} isDarkMode={isDarkMode} />
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
              ...buttonStyles.build,
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
              ...buttonStyles.deploy,
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
              ...buttonStyles.stop,
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
    <Card sx={panelSx}>
      <CardContent>
        {/* Title with icon before the text */}
        <Typography variant="h6" sx={{ color: titleColor, fontSize: "1.25rem", fontWeight: "bold", marginBottom: 2, display: "flex", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", marginRight: 8 }}>
            {
              (() => {
                // You can replace with any other icon as needed
                const AppsIcon = require('@mui/icons-material/Apps').default;
                return <AppsIcon sx={{ fontSize: 24, color: iconColor, mr: 0.5 }} />;
              })()
            }
          </span>
          Service Control Panel
        </Typography>
        {/* DataGrid Table */}

        <Box sx={{ height: 250, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={[
              {
                field: "service",
                headerName: "Service",
                width: 230,
                renderCell: (params) => {
                  // Custom icon selection based on service name
                  // You can import more icons as needed
                  // Example icons from @mui/icons-material
                  // (Make sure to import these at the top of your file)
                  // import StorageIcon from '@mui/icons-material/Storage';
                  // import WifiIcon from '@mui/icons-material/Wifi';
                  // import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
                  // import SecurityIcon from '@mui/icons-material/Security';
                  // import AppsIcon from '@mui/icons-material/Apps';

                  let IconComponent = null;
                  let iconColor = serviceIconColor;
                  switch ((params.value || "").toLowerCase()) {
                    case "e2 manager":
                      IconComponent = require('@mui/icons-material/ManageAccounts').default;
                      break;
                    case "mobiflow agent":
                      IconComponent = require('@mui/icons-material/QueryStats').default;
                      break;
                    case "mobiflow auditor xapp":
                      IconComponent = require('@mui/icons-material/Analytics').default;
                      break;
                    case "mobiexpert xapp":
                      IconComponent = require('@mui/icons-material/Troubleshoot').default;
                      break;
                    case "mobiwatch xapp":
                      IconComponent = require('@mui/icons-material/Insights').default;
                      break;
                    default:
                      IconComponent = require('@mui/icons-material/Apps').default;
                  }
                  return (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <IconComponent sx={{ color: iconColor, fontSize: 22, mr: 1 }} />
                      <span>{params.value}</span>
                    </Box>
                  );
                }
              },
              ...columns.filter(col => col.field !== "service")
            ]}
            pageSize={5}
            hideFooter // Hides the footer, including "Rows per page:"
            disableSelectionOnClick
            density="compact"
            sx={gridSx}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default ServiceGrid;
