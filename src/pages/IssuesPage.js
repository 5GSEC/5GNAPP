import React, { useState, useEffect, useRef, useContext } from "react";
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
import { GenAIContext } from "../App";


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

function IssuesPage({ isDarkMode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bevent, setEvent] = useState({});
  const [insightOpen, setInsightOpen] = useState(false);
  const [insightRow, setInsightRow] = useState(null);
  const update_interval = 10000;

  // New state for GenAI response
  const [genaiLoading, setGenaiLoading] = useState(false);
  const [genaiError, setGenaiError] = useState(null);
  
  // Use context for GenAI state instead of local state
  const {
    genaiResponse,
    setGenaiResponse,
    genaiInterrupted,
    setgenaiInterrupted,
    genaiInterruptPrompt,
    setgenaiInterruptPrompt,
    genaiActionStrategy,
    setgenaiActionStrategy,
    genaiUpdatedConfig,
    setgenaiUpdatedConfig,
    genaiOriginalConfig,
    setgenaiOriginalConfig,
    genaiActionResponse,
    setgenaiActionResponse,
    rowIdToThreadId,
    setRowIdToThreadId,
  } = useContext(GenAIContext);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editableConfig, setEditableConfig] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showDiffView, setShowDiffView] = useState(false);
  const titleColor = isDarkMode ? "#f3f8ff" : "#182235";
  const eyebrowColor = isDarkMode ? "#89a4c5" : "#5a6b80";
  const subtitleColor = isDarkMode ? "#b8cce4" : "#536274";
  const dividerColor = isDarkMode ? "rgba(143, 172, 207, 0.26)" : "#d9e1ec";
  const panelBg = isDarkMode ? "#071528" : "#ffffff";
  const tableBg = isDarkMode ? "#08182d" : "#f3f6fa";
  const rowBg = isDarkMode ? "#0d2038" : "#ffffff";
  const rowAltBg = isDarkMode ? "#0a1b31" : "#f8fafd";
  const rowHoverBg = isDarkMode ? "rgba(71, 137, 213, 0.14)" : "#e0e4ef";
  const borderColor = isDarkMode ? "rgba(123, 161, 207, 0.24)" : "#e0e4ef";
  const gridTextColor = isDarkMode ? "#dbe8f7" : "#11182E";
  const mutedTextColor = isDarkMode ? "#9bb0c9" : "#536274";
  const inputBg = isDarkMode ? "#08182d" : "#ffffff";
  const headerBg = isDarkMode
    ? "linear-gradient(90deg, #0d2038 0%, #14345c 100%)"
    : "linear-gradient(90deg, #11182E 60%, #2d3c6b 100%)";

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

      // Check persistent state (localStorage) for this row
      // genaiResponse is a string, but we want to check if it matches this row
      // We'll assume that if genaiResponse is not empty and insightRow.id matches the last insightRow, it's valid
      // For more robust logic, you may want to store a mapping of rowId to response in persistent state
      // For now, if genaiResponse is not empty, use it
      let response = genaiResponse[rowIdToThreadId[insightRow.id]];
      if (response && typeof response === "string" && response.trim() !== "") {
        setGenaiLoading(false);
        setGenaiError(null);
        return;
      }

      // 3. Otherwise, fetch from API
      const fetchGenAI = async () => {
        setGenaiLoading(true);
        setGenaiError(null);
        setGenaiResponse(prev => ({ ...prev, [rowIdToThreadId[insightRow.id]]: "" }));
        try {
          const prompt = buildGenAIPrompt(insightRow);
          const res = await fetch("http://localhost:8080/mobillm/security_analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: prompt }),
          });
          const data = await res.json();
          const threadId = data.thread_id; // fallback if thread_id missing
          setRowIdToThreadId(prev => ({ ...prev, [insightRow.id]: threadId })); // update thread ID mapping
          if (!res.ok) throw new Error(data.error || "Chat error");
          setGenaiResponse(prev => ({ ...prev, [threadId]: data.output || "" }));
          setgenaiInterrupted(prev => ({ ...prev, [threadId]: data.interrupted || false }));
          setgenaiActionStrategy(prev => ({ ...prev, [threadId]: data.action_strategy || null }));
          setgenaiInterruptPrompt(prev => ({ ...prev, [threadId]: data.interrupt_prompt || null }));
          setgenaiUpdatedConfig(prev => ({ ...prev, [threadId]: data.updated_config || null }));
          setgenaiOriginalConfig(prev => ({ ...prev, [threadId]: data.original_config || null }));
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
    active: event.active || false,
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
    { field: "id", headerName: "ID", width: 70 },
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
            backgroundColor: isDarkMode ? '#234f8a' : '#23305a',
            color: '#fff',
            borderColor: isDarkMode ? 'rgba(143, 190, 245, 0.3)' : '#11182E',
            '&:hover': {
              backgroundColor: isDarkMode ? '#2f66ad' : '#2d3c6b',
              borderColor: isDarkMode ? '#8fbfff' : '#11182E',
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
      <Grid container spacing={3} sx={{ padding: "10px" }}>
        <Grid size={12}>
          <Box
            component="header"
            sx={{
              borderBottom: `1px solid ${dividerColor}`,
              pb: 1.75,
            }}
          >
            <Typography
              component="p"
              sx={{
                color: eyebrowColor,
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                lineHeight: 1.2,
                mb: 0.75,
                textTransform: "uppercase",
              }}
            >
              5G Native Security Operations
            </Typography>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                color: titleColor,
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: "clamp(1.45rem, 2.1vw, 2rem)",
                fontWeight: 760,
                letterSpacing: 0,
                lineHeight: 1.12,
                mb: 0.75,
              }}
            >
              Issues
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: subtitleColor,
                fontSize: "0.95rem",
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              Security Threats and Anomalies Detected
            </Typography>
          </Box>
        </Grid>
        <Grid size={12}>
          <Card
            sx={{
              backgroundColor: panelBg,
              border: isDarkMode ? `1px solid ${borderColor}` : "1px solid transparent",
              boxShadow: isDarkMode ? "0 10px 24px rgba(0, 0, 0, 0.34)" : undefined,
            }}
          >
            <CardContent>
              <FormControl
                sx={{
                  width: { xs: "100%", md: "25ch" },
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: inputBg,
                    color: gridTextColor,
                    '& fieldset': {
                      borderColor,
                    },
                    '&:hover fieldset': {
                      borderColor: isDarkMode ? '#8fbfff' : '#2d3c6b',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: isDarkMode ? '#8fbfff' : '#11182E',
                      borderWidth: 2,
                    },
                  },
                  '& input::placeholder': {
                    color: mutedTextColor,
                    opacity: 1,
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
                    color: gridTextColor,
                    fontWeight: 500,
                    '& input': { color: gridTextColor },
                  }}
                  startAdornment={
                    <InputAdornment position="start" sx={{ color: isDarkMode ? "#8fbfff" : "#23305a" }}>
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
                  background: tableBg,
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  boxShadow: isDarkMode ? "0 2px 10px rgba(0,0,0,0.26)" : "0 2px 8px rgba(35,48,90,0.04)",
                }}
              >
                <DataGrid
                  rows={filteredRows}
                  columns={columns}
                  // checkboxSelection
                  getRowClassName={(params) => {
                    const baseClass = params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd";
                    const isInactive = !params.row.active;
                    return isInactive ? `${baseClass} inactive` : baseClass;
                  }}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  disableColumnResize
                  density="compact"
                  sx={{
                    bgcolor: tableBg,
                    border: "none",
                    color: gridTextColor,
                    fontSize: 15,
                    '& .MuiDataGrid-columnHeaders': {
                      background: headerBg,
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 16,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      borderColor: borderColor
                    },
                    '& .MuiDataGrid-columnHeader': {
                      outline: 'none',
                    },
                    '& .MuiDataGrid-columnSeparator': {
                      color: isDarkMode ? 'rgba(143, 190, 245, 0.28)' : 'rgba(224, 228, 239, 0.8)',
                    },
                    '& .MuiDataGrid-row': {
                      bgcolor: rowBg,
                      color: gridTextColor,
                      '&.even': { bgcolor: rowAltBg },
                      '&:hover': { bgcolor: rowHoverBg },
                      '&.inactive': {
                        opacity: isDarkMode ? 0.45 : 0.4,
                        bgcolor: `${isDarkMode ? '#071528' : '#f5f5f5'} !important`,
                        '&:hover': { bgcolor: `${isDarkMode ? 'rgba(71, 137, 213, 0.10)' : '#e8e8e8'} !important` },
                        '&.even': { bgcolor: `${isDarkMode ? '#08182d' : '#f0f0f0'} !important` },
                        '&.odd': { bgcolor: `${isDarkMode ? '#071528' : '#f5f5f5'} !important` },
                      },
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: `1px solid ${borderColor}`,
                      color: gridTextColor,
                    },
                    '& .MuiCheckbox-root': {
                      color: `${isDarkMode ? '#8fbfff' : '#11182E'} !important`,
                    },
                    '& .MuiDataGrid-footerContainer': {
                      background: tableBg,
                      borderTop: `1px solid ${borderColor}`,
                      color: gridTextColor,
                    },
                    '& .MuiTablePagination-root, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      color: gridTextColor,
                    },
                    '& .MuiTablePagination-selectIcon, & .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIconButton': {
                      color: isDarkMode ? '#b8cce4' : '#536274',
                    },
                    '& .MuiIconButton-root.Mui-disabled': {
                      color: isDarkMode ? 'rgba(184, 204, 228, 0.32)' : undefined,
                    },
                    '& .MuiDataGrid-overlay': {
                      backgroundColor: tableBg,
                      color: mutedTextColor,
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
          boxShadow: isDarkMode ? "0 18px 48px rgba(0, 0, 0, 0.46)" : 6,
          background: isDarkMode ? "rgba(7, 21, 40, 0.96)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${isDarkMode ? "rgba(143, 190, 245, 0.24)" : "rgba(200,200,200,0.3)"}`,
          resize: "both",           // <-- add this
          overflow: "auto",         // <-- and this
        }}
      >
        <Box
          sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: headerBg,
              color: 'primary.contrastText',
              px: 2,
              py: 1.2,
              borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <SmartToyIcon sx={{ fontSize: 28, color: 'white' }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "white" }}>
            MobiLLM Insight
          </Typography>
          <IconButton size="small" onClick={() => setInsightOpen(false)} sx={{ color: "white", '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' } }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflowY: "auto",
            backgroundColor: isDarkMode ? "rgba(0, 10, 25, 0.28)" : "transparent",
            color: gridTextColor,
          }}
        >
          {!insightRow && (
              <Typography sx={{ color: gridTextColor }}>No data selected.</Typography>
            )}
            {insightRow && genaiLoading && (
              <Typography sx={{ color: mutedTextColor }}>MobiLLM is analyzing the event...</Typography>
            )}
            {insightRow && genaiError && (
              <Typography color="error">Error: {genaiError}</Typography>
            )}
            {insightRow && !genaiLoading && !genaiError && (
              <Box
                sx={{
                  color: gridTextColor,
                  fontSize: 15,
                  lineHeight: 1.55,
                  '& p': { marginTop: 0 },
                  '& h1, & h2, & h3': { color: titleColor },
                  '& ul, & ol': { paddingLeft: 3 },
                  '& code': {
                    backgroundColor: isDarkMode ? 'rgba(143, 190, 245, 0.12)' : 'rgba(17, 24, 46, 0.06)',
                    borderRadius: '4px',
                    color: isDarkMode ? '#d8eaff' : '#182235',
                    padding: '1px 4px',
                  },
                }}
              >
                <ReactMarkdown
                  components={{
                    strong: ({node, ...props}) => <Typography component="span" sx={{ fontWeight: 'bold', color: titleColor, display: 'inline' }} {...props} />
                  }}
                >
                  {genaiResponse[rowIdToThreadId[insightRow.id]]}
                </ReactMarkdown>
              </Box>
            )}
            {/* Show Approve/Deny/Edit buttons if interrupted is true */}
            {insightRow && genaiInterrupted[rowIdToThreadId[insightRow.id]] === true && (
              <>
                <Button
                  sx={{
                    ml: 2,
                    backgroundColor: isDarkMode ? '#234f8a' : '#11182E',
                    color: '#fff',
                    minWidth: 0,
                    px: 2,
                    borderRadius: 2,
                    boxShadow: 1,
                    '&:hover': {
                      backgroundColor: isDarkMode ? '#2f66ad' : '#2d3c6b',
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
        <Box sx={{ p: 1, borderTop: `1px solid ${borderColor}`, textAlign: "right", backgroundColor: isDarkMode ? "#071528" : "#f8fafd" }}>
          <Button
            onClick={() => {
              // Clear GenAI state for this row/thread
              if (insightRow) {
                const threadId = rowIdToThreadId[insightRow.id];
                setGenaiResponse(prev => ({ ...prev, [threadId]: "" }));
                setGenaiError(null);
                setGenaiLoading(true);
                setgenaiInterrupted(prev => ({ ...prev, [threadId]: undefined }));
                setgenaiActionStrategy(prev => ({ ...prev, [threadId]: undefined }));
                setgenaiInterruptPrompt(prev => ({ ...prev, [threadId]: undefined }));
                setgenaiUpdatedConfig(prev => ({ ...prev, [threadId]: undefined }));
                setgenaiOriginalConfig(prev => ({ ...prev, [threadId]: undefined }));
                setgenaiActionResponse(prev => ({ ...prev, [threadId]: undefined }));
                // Trigger reload by setting insightRow to itself (forces useEffect to rerun)
                setInsightRow({ ...insightRow });
              }
            }}
            sx={{
              backgroundColor: isDarkMode ? "rgba(20, 48, 84, 0.72)" : '#fff',
              color: isDarkMode ? "#d8eaff" : '#11182E',
              minWidth: 0,
              px: 2,
              borderRadius: 2,
              boxShadow: isDarkMode ? "none" : 1,
              border: `1px solid ${isDarkMode ? "rgba(143, 190, 245, 0.58)" : "#11182E"}`,
              mr: 1,
              '&:hover': {
                backgroundColor: isDarkMode ? "rgba(35, 79, 138, 0.72)" : '#e0e4ef',
                color: isDarkMode ? "#ffffff" : '#11182E',
              },
            }}
            variant="outlined"
          >
            Regenerate
          </Button>
          <Button 
            onClick={() => setInsightOpen(false)} 
            sx={{
              backgroundColor: isDarkMode ? '#234f8a' : '#11182E',
              color: '#fff',
              minWidth: 0,
              px: 2,
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': {
                backgroundColor: isDarkMode ? '#2f66ad' : '#2d3c6b',
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
          boxShadow: isDarkMode ? "0 18px 48px rgba(0, 0, 0, 0.46)" : 6,
          background: isDarkMode ? "rgba(7, 21, 40, 0.96)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${isDarkMode ? "rgba(143, 190, 245, 0.24)" : "rgba(200,200,200,0.3)"}`,
        }
      }}
    >
      <DialogTitle
        sx={{
          alignItems: "center",
          borderBottom: `1px solid ${borderColor}`,
          color: titleColor,
          display: "flex",
          fontSize: 24,
          fontWeight: 750,
        }}
      >
        <AutoAwesomeIcon sx={{ color: isDarkMode ? "#8fbfff" : "#11182E", fontSize: 32, mr: 1 }} />
        RAN Configuration Update Review
      </DialogTitle>
      {/* Show prompt only if not loading and no response yet */}
      {!actionLoading && insightRow && !genaiActionResponse[rowIdToThreadId[insightRow.id]] && (
        <Typography sx={{ px: 3, pt: 1, pb: 1, color: mutedTextColor }}>
          {genaiInterruptPrompt[rowIdToThreadId[insightRow.id]] || "Please review and edit the proposed RAN configuration below. Approve to apply, or deny to reject the changes."}
        </Typography>
      )}
      <DialogContent sx={{ backgroundColor: isDarkMode ? "rgba(0, 10, 25, 0.22)" : "transparent", color: gridTextColor }}>
        {/* Loading spinner */}
        {actionLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 120 }}>
            <Typography sx={{ color: mutedTextColor, mr: 2 }}>Executing actions...You may exit this dialog now and check the results later.</Typography>
            <span className="MuiCircularProgress-root MuiCircularProgress-indeterminate" style={{ width: 32, height: 32, display: "inline-block", borderWidth: 3, borderStyle: "solid", borderRadius: "50%", borderColor: `${isDarkMode ? "#8fbfff" : "#11182E"} transparent ${isDarkMode ? "#8fbfff" : "#11182E"} transparent`, animation: "mui-spin 1s linear infinite" }} />
            <style>
              {`@keyframes mui-spin { 100% { transform: rotate(360deg); } }`}
            </style>
          </Box>
        )}
        {/* Show response output if available */}
        {!actionLoading && insightRow && genaiActionResponse[rowIdToThreadId[insightRow.id]] && (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="h5" sx={{ color: titleColor, fontWeight: "bold", mb: 2, display: "flex", alignItems: "center" }}>
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
            <Typography sx={{ whiteSpace: "pre-line", color: gridTextColor, fontSize: 18 }}>
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
                backgroundColor: isDarkMode ? '#234f8a' : '#11182E',
                color: '#fff',
                minWidth: 0,
                px: 2,
                borderRadius: 2,
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: isDarkMode ? '#2f66ad' : '#2d3c6b',
                },
              }}
              onClick={() => setShowDiffView(prev => !prev)}
            >
              {showDiffView ? "Switch to Edit View" : "Show Diff"}
            </Button>
            {showDiffView ? (
              <Box sx={{
                border: `1px solid ${borderColor}`,
                borderRadius: 2,
                background: isDarkMode ? '#08182d' : '#f8fafd',
                p: 2,
                mb: 2,
                boxShadow: isDarkMode ? "0 4px 14px rgba(0, 0, 0, 0.26)" : 1,
              }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: isDarkMode ? "#8fbfff" : '#23305a', flex: 1, fontWeight: 600 }}>
                    Original Config
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: isDarkMode ? "#8fbfff" : '#23305a', flex: 1, fontWeight: 600 }}>
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
                        diffViewerBackground: isDarkMode ? '#08182d' : '#f8fafd',
                        diffViewerColor: isDarkMode ? '#dbe8f7' : '#11182E',
                        addedBackground: isDarkMode ? 'rgba(53, 212, 139, 0.42)' : '#e6ffed',
                        addedColor: isDarkMode ? '#dbe8f7' : '#11182E',
                        addedGutterColor: isDarkMode ? '#5f748a' : '#212529',
                        removedBackground: isDarkMode ? 'rgba(255, 111, 135, 0.44)' : '#ffeef0',
                        removedColor: isDarkMode ? '#dbe8f7' : '#11182E',
                        removedGutterColor: isDarkMode ? '#5f748a' : '#212529',
                        wordAddedBackground: isDarkMode ? 'rgba(52, 196, 129, 0.68)' : '#acf2bd',
                        wordRemovedBackground: isDarkMode ? 'rgba(255, 111, 135, 0.72)' : '#fdb8c0',
                        gutterBackground: isDarkMode ? '#071528' : '#f8fafd',
                        gutterColor: isDarkMode ? '#9bb0c9' : '#536274',
                        codeFoldGutterBackground: isDarkMode ? '#071528' : '#f8fafd',
                        codeFoldBackground: isDarkMode ? '#0d2038' : '#f8fafd',
                        emptyLineBackground: isDarkMode ? '#08182d' : '#f8fafd',
                      },
                    },
                    diffContainer: {
                      tableLayout: 'fixed',
                      width: '100%',
                    },
                    splitView: {
                      width: '100%',
                    },
                    line: {
                      width: '100%',
                    },
                    contentText: {
                      color: gridTextColor,
                      overflowWrap: 'anywhere',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    },
                    content: {
                      backgroundColor: isDarkMode ? '#08182d' : '#f8fafd',
                      maxWidth: 0,
                      overflow: 'hidden',
                      width: 'calc(50% - 24px)',
                    },
                    lineNumber: {
                      minWidth: '24px',
                      width: '24px',
                      padding: '0 4px',
                      fontSize: 12,
                      color: mutedTextColor,
                    },
                    gutter: {
                      minWidth: '24px',
                      width: '24px',
                      padding: '0 4px',
                      backgroundColor: isDarkMode ? '#071528' : undefined,
                    },
                    emptyGutter: {
                      backgroundColor: isDarkMode ? '#071528' : '#f8fafd',
                    },
                    emptyLine: {
                      backgroundColor: isDarkMode ? '#08182d' : '#f8fafd',
                    },
                    marker: {
                      backgroundColor: isDarkMode ? '#08182d' : undefined,
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
                sx={{
                  mt: 2,
                  fontFamily: "monospace",
                  '& .MuiInputLabel-root': {
                    color: mutedTextColor,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: isDarkMode ? '#8fbfff' : '#11182E',
                  },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: inputBg,
                    color: gridTextColor,
                    '& fieldset': {
                      borderColor,
                    },
                    '&:hover fieldset': {
                      borderColor: isDarkMode ? '#8fbfff' : '#2d3c6b',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: isDarkMode ? '#8fbfff' : '#11182E',
                    },
                  },
                }}
                InputProps={{
                  style: { fontFamily: "monospace", color: gridTextColor }
                }}
              />
            )}
          </>
        )}
      </DialogContent>
      {/* Hide actions if loading or response is shown */}
      {!actionLoading && insightRow && !genaiActionResponse[rowIdToThreadId[insightRow.id]] && (
        <DialogActions sx={{ backgroundColor: isDarkMode ? "#071528" : "#f8fafd", borderTop: `1px solid ${borderColor}`, px: 3, py: 2 }}>
          <Button
            color="error"
            variant="contained"
            sx={{
              backgroundColor: isDarkMode ? '#8c2f3d' : '#641B25',
              color: '#fff',
              minWidth: 0,
              px: 2,
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': {
                backgroundColor: isDarkMode ? '#a83a4a' : '#56161F',
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
              backgroundColor: isDarkMode ? '#234f8a' : '#11182E',
              color: '#fff',
              minWidth: 0,
              px: 2,
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': {
                backgroundColor: isDarkMode ? '#2f66ad' : '#2d3c6b',
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
              backgroundColor: isDarkMode ? '#1d6b5d' : '#11182E',
              color: '#fff',
              minWidth: 0,
              px: 2,
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': {
                backgroundColor: isDarkMode ? '#248270' : '#2d3c6b',
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
