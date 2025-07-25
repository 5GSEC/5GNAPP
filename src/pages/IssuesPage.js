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
import DiffViewer from 'react-diff-viewer';


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

async function fetchEvents(setEvent) {
  try {
    const sdlEventData = await fetchSdlEventData();
    setEvent(sdlEventData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function IssuesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bevent, setEvent] = useState({});
  const [insightOpen, setInsightOpen] = useState(false);
  const [insightRow, setInsightRow] = useState(null);
  const update_interval = 10000;

  // New state for GenAI response
  const [genaiLoading, setGenaiLoading] = useState(false);
  const [genaiError, setGenaiError] = useState(null);
  // Use localStorage to persist these state values across page reloads/unmounts
  function usePersistentState(key, defaultValue) {
    const [state, setState] = useState(() => {
      try {
        const stored = localStorage.getItem(key);
        return stored !== null ? JSON.parse(stored) : defaultValue;
      } catch {
        return defaultValue;
      }
    });
    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
    return [state, setState];
  }

  const [genaiResponse, setGenaiResponse] = usePersistentState("genaiResponse", "");
  const [genaiInterrupted, setgenaiInterrupted] = usePersistentState("genaiInterrupted", {});
  const [genaiInterruptPrompt, setgenaiInterruptPrompt] = usePersistentState("genaiInterruptPrompt", {});
  const [genaiActionStrategy, setgenaiActionStrategy] = usePersistentState("genaiActionStrategy", {});
  const [genaiUpdatedConfig, setgenaiUpdatedConfig] = usePersistentState("genaiUpdatedConfig", {});
  const [genaiOriginalConfig, setgenaiOriginalConfig] = usePersistentState("genaiOriginalConfig", {});
  const [genaiActionResponse, setgenaiActionResponse] = usePersistentState("genaiActionResponse", {});

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editableConfig, setEditableConfig] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showDiffView, setShowDiffView] = useState(false);

  // Cache for GenAI responses
  const genaiCache = useRef({});

  const rowIdToThreadId = useRef({}); // Global mapping

  useEffect(() => {
    const interval = setInterval(() => {
      fetchEvents(setEvent);
    }, update_interval);
    fetchEvents(setEvent);
    return () => clearInterval(interval);
  }, []);

  // GenAI API call for insight with caching and persistent state check
  useEffect(() => {
    if (insightOpen && insightRow) {
      const cacheKey = insightRow.id;

      // 1. Check in-memory cache first
      if (genaiCache.current[cacheKey]) {
        setGenaiResponse(genaiCache.current[cacheKey]);
        setGenaiLoading(false);
        setGenaiError(null);
        return;
      }

      // 2. Check persistent state (localStorage) for this row
      // genaiResponse is a string, but we want to check if it matches this row
      // We'll assume that if genaiResponse is not empty and insightRow.id matches the last insightRow, it's valid
      // For more robust logic, you may want to store a mapping of rowId to response in persistent state
      // For now, if genaiResponse is not empty, use it
      if (genaiResponse && typeof genaiResponse === "string" && genaiResponse.trim() !== "") {
        setGenaiLoading(false);
        setGenaiError(null);
        // Optionally, update cache for this row
        genaiCache.current[cacheKey] = genaiResponse;
        return;
      }

      // 3. Otherwise, fetch from API
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
          const threadId = data.thread_id || cacheKey; // fallback if thread_id missing
          rowIdToThreadId[insightRow.id] = threadId; // update thread ID mapping
          if (!res.ok) throw new Error(data.error || "Chat error");
          setGenaiResponse(data.output);
          setgenaiInterrupted(prev => ({ ...prev, [threadId]: data.interrupted || false }));
          setgenaiActionStrategy(prev => ({ ...prev, [threadId]: data.action_strategy || null }));
          setgenaiInterruptPrompt(prev => ({ ...prev, [threadId]: data.interrupt_prompt || null }));
          setgenaiUpdatedConfig(prev => ({ ...prev, [threadId]: data.updated_config || null }));
          setgenaiOriginalConfig(prev => ({ ...prev, [threadId]: data.original_config || null }));
          genaiCache.current[cacheKey] = data.output; // Store in cache
        } catch (e) {
          setGenaiError(e.message || "Unknown error");
        } finally {
          setGenaiLoading(false);
        }
      };
      fetchGenAI();
    }
  // Add genaiResponse as a dependency so it is checked when it changes
  }, [insightOpen, insightRow, genaiResponse]);

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
              <Typography color="text.secondary">MobiLLM is analyzing the event...</Typography>
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
            {insightRow && genaiInterrupted[rowIdToThreadId[insightRow.id]] === true && (
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
                      typeof genaiUpdatedConfig[rowIdToThreadId[insightRow.id]] === "object"
                        ? JSON.stringify(genaiUpdatedConfig[rowIdToThreadId[insightRow.id]], null, 2)
                        : (genaiUpdatedConfig[rowIdToThreadId[insightRow.id]] || "")
                    );
                    setReviewDialogOpen(true);
                  }}
                >
                  Review Actions
                </Button>
              </>
            )}
        </Box>
        <Box sx={{ p: 1, borderTop: "1px solid #eee", textAlign: "right" }}>
          <Button
            onClick={() => {
              // Clear GenAI state for this row/thread
              if (insightRow) {
                const threadId = rowIdToThreadId[insightRow.id];
                setGenaiResponse("");
                setGenaiError(null);
                setGenaiLoading(true);
                setgenaiInterrupted(prev => ({ ...prev, [threadId]: undefined }));
                setgenaiActionStrategy(prev => ({ ...prev, [threadId]: undefined }));
                setgenaiInterruptPrompt(prev => ({ ...prev, [threadId]: undefined }));
                setgenaiUpdatedConfig(prev => ({ ...prev, [threadId]: undefined }));
                setgenaiOriginalConfig(prev => ({ ...prev, [threadId]: undefined }));
                setgenaiActionResponse(prev => ({ ...prev, [threadId]: undefined }));
                // Remove from in-memory cache
                if (genaiCache.current[insightRow.id]) {
                  delete genaiCache.current[insightRow.id];
                }
                // Trigger reload by setting insightRow to itself (forces useEffect to rerun)
                setInsightRow({ ...insightRow });
              }
            }}
            sx={{
              backgroundColor: '#fff',
              color: '#11182E',
              minWidth: 0,
              px: 2,
              borderRadius: 2,
              boxShadow: 1,
              border: '1px solid #11182E',
              mr: 1,
              '&:hover': {
                backgroundColor: '#e0e4ef',
                color: '#11182E',
              },
            }}
            variant="outlined"
          >
            Regenerate
          </Button>
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
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '75vw',
          maxWidth: '75vw',
          zIndex: 2000,
          borderRadius: 4,
          boxShadow: 6,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(200,200,200,0.3)",
        }
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", fontSize: 24 }}>
        <AutoAwesomeIcon sx={{ color: "#11182E", fontSize: 32, mr: 1 }} />
        RAN Configuration Update Review
      </DialogTitle>
      {/* Show prompt only if not loading and no response yet */}
      {!actionLoading && insightRow && !genaiActionResponse[rowIdToThreadId[insightRow.id]] && (
        <Typography sx={{ px: 3, pt: 1, pb: 1, color: "text.secondary" }}>
          {genaiInterruptPrompt[rowIdToThreadId[insightRow.id]] || "Please review and edit the proposed RAN configuration below. Approve to apply, or deny to reject the changes."}
        </Typography>
      )}
      <DialogContent>
        {/* Loading spinner */}
        {actionLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 120 }}>
            <Typography color="text.secondary" sx={{ mr: 2 }}>Executing actions...</Typography>
            <span className="MuiCircularProgress-root MuiCircularProgress-indeterminate" style={{ width: 32, height: 32, display: "inline-block", borderWidth: 3, borderStyle: "solid", borderRadius: "50%", borderColor: "#11182E transparent #11182E transparent", animation: "mui-spin 1s linear infinite" }} />
            <style>
              {`@keyframes mui-spin { 100% { transform: rotate(360deg); } }`}
            </style>
          </Box>
        )}
        {/* Show response output if available */}
        {!actionLoading && insightRow && genaiActionResponse[rowIdToThreadId[insightRow.id]] && (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, display: "flex", alignItems: "center" }}>
              {/* Choose icon based on response content */}
              {genaiActionResponse[rowIdToThreadId[insightRow.id]].toLowerCase().includes("error") ? (
                <ErrorIcon color="error" sx={{ mr: 1, fontSize: 32 }} />
              ) : genaiActionResponse[rowIdToThreadId[insightRow.id]].toLowerCase().includes("success") ||
                genaiActionResponse[rowIdToThreadId[insightRow.id]].toLowerCase().includes("approve") ? (
                <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 32 }} />
              ) : (
                <InfoIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
              )}
              Action Outcome
            </Typography>
            <Typography sx={{ whiteSpace: "pre-line", color: "text.primary", fontSize: 18 }}>
              {genaiActionResponse[rowIdToThreadId[insightRow.id]]}
            </Typography>
          </Box>
        )}
        {/* Show config editor only if not loading and no response yet */}
        {!actionLoading && insightRow && !genaiActionResponse[rowIdToThreadId[insightRow.id]] && (
          <>
            <Button
              variant="outlined"
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
              onClick={() => setShowDiffView(prev => !prev)}
            >
              {showDiffView ? "Switch to Edit View" : "Show Diff"}
            </Button>
            {showDiffView ? (
              <Box sx={{
                border: '1px solid #e0e4ef',
                borderRadius: 2,
                background: '#f8fafd',
                p: 2,
                mb: 2,
                boxShadow: 1,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#23305a', fontWeight: 600 }}>
                    Original Config
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#23305a', fontWeight: 600 }}>
                    Updated Config
                  </Typography>
                </Box>
                <DiffViewer
                  oldValue={typeof genaiOriginalConfig[rowIdToThreadId[insightRow.id]] === "object"
                    ? JSON.stringify(genaiOriginalConfig[rowIdToThreadId[insightRow.id]], null, 2)
                    : (genaiOriginalConfig[rowIdToThreadId[insightRow.id]] || "")}
                  newValue={typeof genaiUpdatedConfig[rowIdToThreadId[insightRow.id]] === "object"
                    ? JSON.stringify(genaiUpdatedConfig[rowIdToThreadId[insightRow.id]], null, 2)
                    : (genaiUpdatedConfig[rowIdToThreadId[insightRow.id]] || "")}
                  splitView={true}
                  showDiffOnly={false}
                  styles={{
                    variables: {
                      light: {
                        diffViewerBackground: '#f8fafd',
                        addedBackground: '#e6ffed',
                        removedBackground: '#ffeef0',
                        wordAddedBackground: '#acf2bd',
                        wordRemovedBackground: '#fdb8c0',
                      },
                    },
                    lineNumber: {
                      minWidth: '24px',
                      width: '24px',
                      padding: '0 4px',
                      fontSize: 12,
                    },
                    gutter: {
                      minWidth: '24px',
                      width: '24px',
                      padding: '0 4px',
                    },
                  }}
                />
              </Box>
            ) : (
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
          </>
        )}
      </DialogContent>
      {/* Hide actions if loading or response is shown */}
      {!actionLoading && insightRow && !genaiActionResponse[rowIdToThreadId[insightRow.id]] && (
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
              const threadId = rowIdToThreadId[insightRow.id];
              try {
                const resp = await sendLLMResumeCommand({"type": "deny", "thread_id": threadId});
                setgenaiActionResponse(prev => ({ ...prev, [threadId]: resp.outcome}));
                // console.log(resp.outcome);
              } catch (e) {
                console.error("Deny action failed:", e);
              } finally {
                setActionLoading(false);
                // setgenaiInterrupted(prev => ({ ...prev, [threadId]: false }));
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
              const threadId = rowIdToThreadId[insightRow.id];
              try {
                const resp = await sendLLMResumeCommand({"type": "edit", "config_data": editableConfig, "thread_id": threadId});
                if (resp.interrupted == true) {
                  // the LLM further ask for reboot, deny the action
                  // console.log(resp.interrupt_prompt);
                  const final_resp = await sendLLMResumeCommand({"type": "deny", "thread_id": threadId});
                  setgenaiActionResponse(prev => ({ ...prev, [threadId]: final_resp.outcome}));
                  // console.log(final_resp.outcome);
                }
                else {
                  // the LLM don't ask for reboot, probably something wrong happened
                  console.log("MobiLLM asks for config update but did not ask for reboot, please debug response below.");
                  console.log(resp.outcome);
                  setgenaiActionResponse(prev => ({ ...prev, [threadId]: resp.outcome}));
                }
              } catch (e) {
                console.error("Approve action failed:", e);
                // setgenaiActionResponse("Error: " + e.message);
              } finally {
                setActionLoading(false);
                // setgenaiInterrupted(prev => ({ ...prev, [threadId]: false }));
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
              const threadId = rowIdToThreadId[insightRow.id];
              try {
                const resp = await sendLLMResumeCommand({"type": "edit", "config_data": editableConfig, "thread_id": threadId});
                if (resp.interrupted == true) {
                  // the LLM further ask for reboot, accept the action
                  // console.log(resp.interrupt_prompt);
                  const final_resp = await sendLLMResumeCommand({"type": "accept", "thread_id": threadId});
                  setgenaiActionResponse(prev => ({ ...prev, [threadId]: final_resp.outcome}));
                  // console.log(final_resp.outcome);
                }
                else {
                  // the LLM don't ask for reboot, probably something wrong happened
                  console.log("MobiLLM asks for config update but did not ask for reboot, please debug response below.");
                  console.log(resp.outcome);
                  setgenaiActionResponse(prev => ({ ...prev, [threadId]: resp.outcome}));
                }
              } catch (e) {
                console.error("Approve action failed:", e);
                // setgenaiActionResponse("Error: " + e.message);
              } finally {
                setActionLoading(false);
                // setgenaiInterrupted(prev => ({ ...prev, [threadId]: false }));
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