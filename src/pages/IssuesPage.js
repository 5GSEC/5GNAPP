import React, { useState, useEffect, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Typography, Grid, Card, CardContent, FormControl, InputAdornment, OutlinedInput, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import { Paper, Slide, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Warning, Error, Info, SearchRounded as SearchRoundedIcon } from "@mui/icons-material";
import { fetchSdlEventData, sendLLMResumeCommand } from "../backend/fetchUserData";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReactMarkdown from 'react-markdown';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";


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
// const buildGenAIPrompt = (row) => `
// You are a cybersecurity expert focused on 5G network security. 
// Analyze the following event which is either an abnormal event or an attack event. 
// Provide the following information.
// 1. An explanation of the threat or anomaly beyond the given description, combine the analysis using the event data and associated MobiFlow data of the UE.
// 2. Based on the analysis report, try to classify the identified threats using the MiTRE fight techniques. For the output, please provide the MiTRE Fight technique ID (such as "FGT1588") that you believe the threat or anomaly belongs to.
// 3. If you have classified the threat or anomaly into a specific MiTRE Fight technique, report the corresponding mitigations in that MiTRE Fight technique.


// Event Details:
// - Source: ${row.source}
// - Name: ${row.name}
// - Cell ID: ${row.cellID}
// - UE ID: ${row.ueID}
// - Time: ${row.time}
// - Severity: ${row.severity}
// - Description: ${row.description}
// `;

const buildGenAIPrompt = (row) => `
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
  const [genaiInterrupted, setgenaiInterrupted] = useState(null);
  const [genaiInterruptPrompt, setgenaiInterruptPrompt] = useState(null);
  const [genaiActionStrategy, setgenaiActionStrategy] = useState(null);
  const [genaiUpdatedConfig, setgenaiUpdatedConfig] = useState(null);
  const [genaiActionResponse, setgenaiActionResponse] = useState(null);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editableConfig, setEditableConfig] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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
          // console.log(data);
          if (!res.ok) throw new Error(data.error || "Chat error");
          setGenaiResponse(data.output);
          setgenaiInterrupted(data.interrupted || false);
          setgenaiActionStrategy(data.action_strategy || null);
          setgenaiInterruptPrompt(data.interrupt_prompt || null);
          setgenaiUpdatedConfig(data.updated_config || null);
          genaiCache.current[cacheKey] = data.output; // Store in cache
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
          case "Warning":
            return (
              <>
                <Warning color="warning" /> {params.value}
              </>
            );
          case "Info":
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
          sx={{
            backgroundColor: '#23305a',
            color: '#fff',
            borderColor: '#11182E',
            '&:hover': {
              backgroundColor: '#2d3c6b',
              borderColor: '#11182E',
            },
          }}
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
              <FormControl
                sx={{
                  width: { xs: "100%", md: "25ch" },
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'white',
                    '& fieldset': {
                      borderColor: '#e0e4ef',
                    },
                    '&:hover fieldset': {
                      borderColor: '#2d3c6b',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#11182E',
                      borderWidth: 2,
                    },
                  },
                }}
                variant="outlined"
              >
                <OutlinedInput
                  size="small"
                  id="search"
                  placeholder="Search…"
                  sx={{
                    flexGrow: 1,
                    color: '#11182E',
                    fontWeight: 500,
                    '& input': { color: '#11182E' },
                  }}
                  startAdornment={
                    <InputAdornment position="start" sx={{ color: "#23305a" }}>
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  }
                  inputProps={{
                    "aria-label": "search",
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </FormControl>

              <div
                style={{
                  height: 600,
                  width: "100%",
                  marginTop: "16px",
                  background: "#f3f6fa",
                  borderRadius: 8,
                  border: "1px solid #e0e4ef",
                  boxShadow: "0 2px 8px rgba(35,48,90,0.04)",
                }}
              >
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
                  sx={{
                    bgcolor: "#f3f6fa",
                    border: "none",
                    color: "#11182E",
                    fontSize: 15,
                    '& .MuiDataGrid-columnHeaders': {
                      background: 'linear-gradient(90deg, #11182E 60%, #2d3c6b 100%)',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 16,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    },
                    '& .MuiDataGrid-row': {
                      bgcolor: "#fff",
                      '&.even': { bgcolor: "#f8fafd" },
                      '&:hover': { bgcolor: "#e0e4ef" },
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #e0e4ef',
                    },
                    '& .MuiCheckbox-root': {
                      color: '#11182E !important',
                    },
                    '& .MuiDataGrid-footerContainer': {
                      background: '#f3f6fa',
                      borderTop: '1px solid #e0e4ef',
                    },
                  }}
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
          width: 800,
          maxWidth: "90vw",
          height: 600,
          // zIndex: 1400,
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          boxShadow: 6,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(200,200,200,0.3)",
          resize: "both",           // <-- add this
          overflow: "auto",         // <-- and this
        }}
      >
        <Box
          sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(90deg, #11182E 60%, #2d3c6b 100%)',
              color: 'primary.contrastText',
              px: 2,
              py: 1.2,
              borderBottom: '1px solid #e3e3e3',
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
              <Box sx={{ fontSize: 15, color: "text.primary" }}>
                <ReactMarkdown
                  components={{
                    strong: ({node, ...props}) => <Typography component="span" sx={{ fontWeight: 'bold', color: '#11182E', display: 'inline' }} {...props} />
                  }}
                >
                  {genaiResponse}
                </ReactMarkdown>
              </Box>
            )}
            {/* Show Approve/Deny/Edit buttons if interrupted is true */}
            {insightRow && genaiInterrupted === true && (
              <>
                <Button
                  sx={{
                    ml: 2,
                    backgroundColor: '#11182E',
                    color: '#fff',
                    minWidth: 0,
                    px: 2,
                    borderRadius: 2,
                    boxShadow: 1,
                    '&:hover': {
                      backgroundColor: '#2d3c6b',
                    },
                  }}
                  variant="contained"
                  onClick={() => {
                    setEditableConfig(
                      typeof genaiUpdatedConfig === "object"
                        ? JSON.stringify(genaiUpdatedConfig, null, 2)
                        : (genaiUpdatedConfig || "")
                    );
                    setReviewDialogOpen(true);
                  }}
                >
                  Review Actions
                </Button>
                {/* <Button
                  sx={{
                    ml: 2,
                    backgroundColor: '#388e3c',
                    color: '#fff',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#2e7031' },
                  }}
                  variant="contained"
                  onClick={async () => {
                    setgenaiInterrupted(false);
                    try {
                      const resp = await sendLLMResumeCommand({ type: "accept" });
                      setgenaiActionResponse(resp.outcome);
                      console.log(resp.outcome);
                    } catch (e) {
                      console.error("Approve action failed:", e);
                    }
                  }}
                >
                  Approve
                </Button>
                <Button
                  sx={{
                    ml: 2,
                    backgroundColor: '#d32f2f',
                    color: '#fff',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#a31515' },
                  }}
                  variant="contained"
                  onClick={async () => {
                    setgenaiInterrupted(false);
                    try {
                      const resp = await sendLLMResumeCommand({ type: "deny" });
                      setgenaiActionResponse(resp.outcome);
                      console.log(resp.outcome);
                    } catch (e) {
                      console.error("Approve action failed:", e);
                    }
                  }}
                >
                  Deny
                </Button>
                <Button
                  sx={{
                    ml: 2,
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#115293' },
                  }}
                  variant="contained"
                  onClick={async () => {
                    let config_data = "test";
                    sendLLMResumeCommand({"type": "edit", "config_data": config_data});
                    setgenaiInterrupted(false);
                  }}
                >
                  Edit and Approve
                </Button> */}
              </>
            )}
        </Box>
        <Box sx={{ p: 1, borderTop: "1px solid #eee", textAlign: "right" }}>
          <Button 
            onClick={() => setInsightOpen(false)} 
            sx={{
              backgroundColor: '#11182E',
              color: '#fff',
              minWidth: 0,
              px: 2,
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': {
                backgroundColor: '#2d3c6b',
              },
            }}
            variant="outlined">
            Close
          </Button>
        </Box>
      </Paper>
    </Slide>

    {/* Review Actions Dialog */}
    <Dialog
      open={reviewDialogOpen}
      onClose={() => setReviewDialogOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          zIndex: 2000,
          borderRadius: 4,
          boxShadow: 6,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(200,200,200,0.3)",
          } // or any value higher than your Insight dialog
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", fontSize: 24 }}>
        <AutoAwesomeIcon sx={{ color: "#11182E", fontSize: 32, mr: 1 }} />
        RAN Configuration Update Review
      </DialogTitle>
      {/* Show prompt only if not loading and no response yet */}
      {!actionLoading && !genaiActionResponse && (
        <Typography sx={{ px: 3, pt: 1, pb: 1, color: "text.secondary" }}>
          {genaiInterruptPrompt || "Please review and edit the proposed RAN configuration below. Approve to apply, or deny to reject the changes."}
        </Typography>
      )}
      <DialogContent>
        {/* Loading spinner */}
        {actionLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 120 }}>
            <Typography color="text.secondary" sx={{ mr: 2 }}>Processing...</Typography>
            <span className="MuiCircularProgress-root MuiCircularProgress-indeterminate" style={{ width: 32, height: 32, display: "inline-block", borderWidth: 3, borderStyle: "solid", borderRadius: "50%", borderColor: "#11182E transparent #11182E transparent", animation: "mui-spin 1s linear infinite" }} />
            <style>
              {`@keyframes mui-spin { 100% { transform: rotate(360deg); } }`}
            </style>
          </Box>
        )}
        {/* Show response output if available */}
        {!actionLoading && genaiActionResponse && (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, display: "flex", alignItems: "center" }}>
              {/* Choose icon based on response content */}
              {genaiActionResponse.toLowerCase().includes("error") ? (
                <ErrorIcon color="error" sx={{ mr: 1, fontSize: 32 }} />
              ) : genaiActionResponse.toLowerCase().includes("success") ||
                genaiActionResponse.toLowerCase().includes("approve") ? (
                <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 32 }} />
              ) : (
                <InfoIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
              )}
              Action Outcome
            </Typography>
            <Typography sx={{ whiteSpace: "pre-line", color: "text.primary", fontSize: 18 }}>
              {genaiActionResponse}
            </Typography>
          </Box>
        )}
        {/* Show config editor only if not loading and no response yet */}
        {!actionLoading && !genaiActionResponse && (
          <TextField
            label="Updated RAN Config"
            multiline
            minRows={8}
            maxRows={20}
            fullWidth
            value={editableConfig}
            onChange={e => setEditableConfig(e.target.value)}
            variant="outlined"
            sx={{ mt: 2, fontFamily: "monospace" }}
            InputProps={{
              style: { fontFamily: "monospace" }
            }}
          />
        )}
      </DialogContent>
      {/* Hide actions if loading or response is shown */}
      {!actionLoading && !genaiActionResponse && (
        <DialogActions>
          <Button
            color="error"
            variant="contained"
            sx={{
              backgroundColor: '#641B25',
              color: '#fff',
              minWidth: 0,
              px: 2,
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': {
                backgroundColor: '#56161F',
              },
            }}
            onClick={async () => {
              setActionLoading(true);
              try {
                const resp = await sendLLMResumeCommand({"type": "deny"});
                setgenaiActionResponse(resp.outcome);
                // console.log(resp.outcome);
              } catch (e) {
                console.error("Deny action failed:", e);
                setgenaiActionResponse("Error: " + e.message);
              } finally {
                setActionLoading(false);
                setgenaiInterrupted(false);
                setReviewDialogOpen(true);
              }
            }}
          >
            Deny
          </Button>
          <Button
            color="primary"
            variant="contained"
            sx={{
              backgroundColor: '#11182E',
              color: '#fff',
              minWidth: 0,
              px: 2,
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': {
                backgroundColor: '#2d3c6b',
              },
            }}
            onClick={async () => {
              setActionLoading(true);
              try {
                const resp = await sendLLMResumeCommand({"type": "edit", "config_data": editableConfig});
                if (resp.interrupted == true) {
                  // the LLM further ask for reboot, deny the action
                  // console.log(resp.interrupt_prompt);
                  const final_resp = await sendLLMResumeCommand({"type": "deny"});
                  setgenaiActionResponse(final_resp.outcome);
                  // console.log(final_resp.outcome);
                }
                else {
                  // the LLM don't ask for reboot, probably something wrong happened
                  console.log("MobiLLM asks for config update but did not ask for reboot, please debug response below.");
                  console.log(resp.outcome);
                  setgenaiActionResponse(resp.outcome);
                }
              } catch (e) {
                console.error("Approve action failed:", e);
                setgenaiActionResponse("Error: " + e.message);
              } finally {
                setActionLoading(false);
                setgenaiInterrupted(false);
                setReviewDialogOpen(true);
              }
            }}
          >
            Approve (No Reboot)
          </Button>
          <Button
            color="primary"
            variant="contained"
            sx={{
              backgroundColor: '#11182E',
              color: '#fff',
              minWidth: 0,
              px: 2,
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': {
                backgroundColor: '#2d3c6b',
              },
            }}
            onClick={async () => {
              setActionLoading(true);
              try {
                const resp = await sendLLMResumeCommand({"type": "edit", "config_data": editableConfig});
                if (resp.interrupted == true) {
                  // the LLM further ask for reboot, accept the action
                  // console.log(resp.interrupt_prompt);
                  const final_resp = await sendLLMResumeCommand({"type": "accept"});
                  setgenaiActionResponse(final_resp.outcome);
                  // console.log(final_resp.outcome);
                }
                else {
                  // the LLM don't ask for reboot, probably something wrong happened
                  console.log("MobiLLM asks for config update but did not ask for reboot, please debug response below.");
                  console.log(resp.outcome);
                  setgenaiActionResponse(resp.outcome);
                }
              } catch (e) {
                console.error("Approve action failed:", e);
                setgenaiActionResponse("Error: " + e.message);
              } finally {
                setActionLoading(false);
                setgenaiInterrupted(false);
                setReviewDialogOpen(true);
              }
            }}
          >
            Approve and Reboot RAN
          </Button>
        </DialogActions>
      )}
    </Dialog>
    </>
  );
}

export default IssuesPage;