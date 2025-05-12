import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Typography, Grid, Card, CardContent, FormControl, InputAdornment, OutlinedInput, Button } from "@mui/material";
import { Warning, Error, Info, SearchRounded as SearchRoundedIcon } from "@mui/icons-material";
import { fetchSdlEventData } from "../backend/fetchUserData";

function parseTimestamp(raw) {
    if (!raw) return null;
  
    const tsString = String(raw);        // Convert the raw value to string
    const tsNum = parseInt(tsString, 10); // Convert to integer
  
    if (tsString.length === 13) {
      // 13-digit likely "ms" timestamp
      
      return new Date(tsNum);
    } else if (tsString.length === 10) {
      // 10-digit likely "s" timestamp
      
      return new Date(tsNum * 1000);

    } else {
      // Otherwise, we might handle differently or just return null
      return null;
    }
}

function handleInsightClick(row) {
  console.log("MobiLLM Insight clicked for row:", row);
  // Add your logic here, e.g., open a modal, navigate to another page, etc.
}

// Mock data for detected events
const mockData = [
  { id: 1, source: "MobieXpert", type: "Threat", description: "Malware detected", severity: "High" },
  { id: 2, source: "MobiWatch", type: "Anomaly", description: "Unusual login pattern", severity: "Medium" },
  { id: 3, source: "MobieXpert", type: "Threat", description: "Phishing attempt", severity: "Critical" },
  { id: 4, source: "MobiWatch", type: "Anomaly", description: "Data exfiltration", severity: "High" },
  { id: 5, source: "MobieXpert", type: "Threat", description: "Ransomware detected", severity: "Critical" },
  { id: 6, source: "MobiWatch", type: "Anomaly", description: "Suspicious activity", severity: "Medium" },
];

// Define columns for the DataGrid
const columns = [
  { field: "id", headerName: "ID", width: 50 },
  { field: "source", headerName: "Source", width: 120 },
  { field: "name", headerName: "Name", width: 150 },
  { field: "cellID", headerName: "Cell ID", width: 100 },
  { field: "ueID", headerName: "UE ID", width: 80 },
  { field: "time", headerName: "Time", width: 200 },
  {
    field: "severity",
    headerName: "Severity",
    width: 120,
    renderCell: (params) => {
      switch (params.value) {
        case "Critical":
          return (
            <>
              <Error color="error" /> {params.value}
            </>
          );
        case "High":
          return (
            <>
              <Warning color="warning" /> {params.value}
            </>
          );
        case "Medium":
          return (
            <>
              <Info color="info" /> {params.value}
            </>
          );
        default:
          return params.value;
      }
    },
  },
  { field: "description", headerName: "Description", width: 500 },
  {
    field: "insight",
    headerName: "",
    width: 200,
    renderCell: (params) => (
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={() => handleInsightClick(params.row)}
      >
        MobiLLM Insight
      </Button>
    ),
  },
];

function IssuesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bevent, setEvent] = useState({});
  const update_interval = 10000;

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSdlEventData(setEvent);
    }, update_interval);
    fetchSdlEventData(setEvent);

    return () => clearInterval(interval);
  }, []);

  // load MobieXpert and MobiWatch event data
  const eventdata = Object.values(bevent).map((event) => ({
    id: event.id,
    cellID: event.cellID,
    ueID: event.ueID,
    source: event.source || "Unknown", // Default to "Unknown" if source is missing
    name: event.name || "Unknown", // Default to "Unknown" if name is missing
    time: parseTimestamp(event.timestamp) || "N/A", // Parse timestamp or default to "N/A"
    description: event.description || "No description available", // Default description
    severity: event.severity || "Medium", // Default severity
  }));

  // console.log("eventdata", bevent);
  

  // Filter rows based on the search query
  const filteredRows = eventdata.filter((row) =>
    Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Grid container spacing={3} sx={{ padding: "20px" }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Issues Page
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Security Threats and Anomalies Detected
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <FormControl sx={{ width: { xs: "100%", md: "25ch" } }} variant="outlined">
              <OutlinedInput
                size="small"
                id="search"
                placeholder="Search…"
                sx={{ flexGrow: 1 }}
                startAdornment={
                  <InputAdornment position="start" sx={{ color: "text.primary" }}>
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                }
                inputProps={{
                  "aria-label": "search",
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </FormControl>
            <div style={{ height: 600, width: "100%", marginTop: "16px" }}>
              <DataGrid
                rows={filteredRows}
                columns={columns}
                checkboxSelection
                getRowClassName={(params) =>
                  params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
                }
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
                pageSizeOptions={[5, 10, 25]}
                disableColumnResize
                density="compact"
              />
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default IssuesPage;