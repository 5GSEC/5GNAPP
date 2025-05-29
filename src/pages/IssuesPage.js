import React, { useState, useEffect, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Typography, Grid, Card, CardContent, FormControl, InputAdornment, OutlinedInput, Button,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { Paper, Slide, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Warning, Error, Info, SearchRounded as SearchRoundedIcon } from "@mui/icons-material";
import { fetchSdlEventData } from "../backend/fetchUserData";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

function parseTimestamp(raw) {
  if (!raw) return null;
  const tsString = String(raw);
  const tsNum = parseInt(tsString, 10);
  if (tsString.length === 13) {
    return new Date(tsNum);
  } else if (tsString.length === 10) {
    return new Date(tsNum * 1000);
  } else {
    return null;
  }
}

// Function to build prompt template for genAI threat analysis
const buildGenAIPrompt = (row) => `
You are a cybersecurity expert focused on 5G network security. 
Analyze the following event which is either an abnormal event or an attack event. 
Provide the following information.
1. An explanation of the threat or anomaly beyond the given description, combine the analysis using the event data and associated MobiFlow data of the UE.
2. Based on the analysis report, try to classify the identified threats using the MiTRE fight techniques. For the output, please provide the MiTRE Fight technique ID (such as "FGT1588") that you believe the threat or anomaly belongs to.
3. If you have classified the threat or anomaly into a specific MiTRE Fight technique, report the corresponding mitigations in that MiTRE Fight technique.


Event Details:
- Source: ${row.source}
- Name: ${row.name}
- Cell ID: ${row.cellID}
- UE ID: ${row.ueID}
- Time: ${row.time}
- Severity: ${row.severity}
- Description: ${row.description}
`;

function IssuesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bevent, setEvent] = useState({});
  const [insightOpen, setInsightOpen] = useState(false);
  const [insightRow, setInsightRow] = useState(null);
  const update_interval = 10000;

  // New state for GenAI response
  const [genaiResponse, setGenaiResponse] = useState("");
  const [genaiLoading, setGenaiLoading] = useState(false);
  const [genaiError, setGenaiError] = useState(null);

  // Cache for GenAI responses
  const genaiCache = useRef({});

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSdlEventData(setEvent);
    }, update_interval);
    fetchSdlEventData(setEvent);
    return () => clearInterval(interval);
  }, []);

  // GenAI API call for insight with caching
  useEffect(() => {
    if (insightOpen && insightRow) {
      const cacheKey = insightRow.id; // or another unique identifier
      if (genaiCache.current[cacheKey]) {
        setGenaiResponse(genaiCache.current[cacheKey]);
        setGenaiLoading(false);
        setGenaiError(null);
        return;
      }
      const fetchGenAI = async () => {
        setGenaiLoading(true);
        setGenaiError(null);
        setGenaiResponse("");
        try {
          const prompt = buildGenAIPrompt(insightRow);
          const res = await fetch("http://localhost:8080/mobillm/security_analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: prompt }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Chat error");
          setGenaiResponse(data.reply);
          genaiCache.current[cacheKey] = data.reply; // Store in cache
        } catch (e) {
          setGenaiError(e.message || "Unknown error");
        } finally {
          setGenaiLoading(false);
        }
      };
      fetchGenAI();
    }
  }, [insightOpen, insightRow]);

  // load MobieXpert and MobiWatch event data
  const eventdata = Object.values(bevent).map((event) => ({
    id: event.id,
    cellID: event.cellID,
    ueID: event.ueID,
    source: event.source || "Unknown",
    name: event.name || "Unknown",
    time: parseTimestamp(event.timestamp) || "N/A",
    description: event.description || "No description available",
    severity: event.severity || "Medium",
  }));

  // Filter rows based on the search query
  const filteredRows = eventdata.filter((row) =>
    Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Handler for opening the insight dialog
  function handleInsightClick(row) {
    setInsightRow(row);
    setInsightOpen(true);
  }

  // Define columns INSIDE the component so it can access handleInsightClick
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
          <AutoAwesomeIcon sx={{ fontSize: 20, color: 'white', marginRight: 1 }} />
          MobiLLM Insight
        </Button>
      ),
    },
  ];

  return (
    <>
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
      {/* MobiLLM Insight Dialog */}
      <Slide direction="left" in={insightOpen} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          top: 80,
          right: 32,
          width: 500,
          maxWidth: "90vw",
          height: 500,
          zIndex: 1400,
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          boxShadow: 6,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(200,200,200,0.3)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.2,
            borderBottom: "1px solid #e3e3e3",
            background: "linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)",
          }}
        >
          <SmartToyIcon sx={{ fontSize: 28, color: 'white' }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "white" }}>
            MobiLLM Insight
          </Typography>
          <IconButton size="small" onClick={() => setInsightOpen(false)} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
          {!insightRow && (
              <Typography>No data selected.</Typography>
            )}
            {insightRow && genaiLoading && (
              <Typography color="text.secondary">Loading MobiLLM GenAI insight...</Typography>
            )}
            {insightRow && genaiError && (
              <Typography color="error">Error: {genaiError}</Typography>
            )}
            {insightRow && !genaiLoading && !genaiError && (
              <Typography
                component="pre"
                sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
              >
                {genaiResponse}
              </Typography>
            )}
        </Box>
        <Box sx={{ p: 1, borderTop: "1px solid #eee", textAlign: "right" }}>
          <Button onClick={() => setInsightOpen(false)} color="primary" variant="outlined">
            Close
          </Button>
        </Box>
      </Paper>
    </Slide>
    </>
  );
}

export default IssuesPage;