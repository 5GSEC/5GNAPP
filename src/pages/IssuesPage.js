import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Typography, Grid, Card, CardContent, FormControl, InputAdornment, OutlinedInput } from "@mui/material";
import { Warning, Error, Info, SearchRounded as SearchRoundedIcon } from "@mui/icons-material";

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
  { field: "id", headerName: "ID", width: 70 },
  { field: "source", headerName: "Source", width: 150 },
  { field: "type", headerName: "Type", width: 150 },
  { field: "description", headerName: "Description", width: 300 },
  {
    field: "severity",
    headerName: "Severity",
    width: 150,
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
];

function IssuesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter rows based on the search query
  const filteredRows = mockData.filter((row) =>
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
            <div style={{ height: 400, width: "100%", marginTop: "16px" }}>
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