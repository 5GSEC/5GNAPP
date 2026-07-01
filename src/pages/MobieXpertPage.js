/******************************************************
 * MobieXpertPage.js  – dedicated page for MobieXpert
 * Adds an in-page text-editor for editing rules.pbest
 ******************************************************/

import React, { useState, useEffect, useRef } from "react"; 
import { Typography, Button, Box, useTheme } from "@mui/material";
import { fetchRulesText, saveRulesText, deployXapp } from "../backend/fetchUserData"; // NEW: import deployXapp
import PageHeader from "../components/PageHeader";


/* ───── generate contextual hint for errors ───── */
const getHintForError = (msg) => {
  if (!msg) return "";
  if (msg.toLowerCase().includes("failed to load rules.pbest")) {
    return "Hint: Have you built the xApp yet? Or maybe the file was deleted?";
  }
  return "";
};


/* ──────────────────────────────────────────────
   3)  Page component
────────────────────────────────────────────── */
function MobieXpertPage() {
  const theme = useTheme();
  const c = theme.custom;
  /* rules.pbest editor */
  const [rulesText, setRulesText] = useState("");    // textarea content
  const [loadingRules, setLoadingRules] = useState(true);
  const [loadError, setLoadError] = useState("");     // ← NEW: error message
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [deploying, setDeploying] = useState(false);  // NEW: deploy state
  const [deployMsg, setDeployMsg] = useState("");     // NEW: deploy message


  // reference to clear the timer(ID, for 5s delay message)
  const hideTimer = useRef(null);

  /* fetch rules.pbest once */
  useEffect(() => {
    fetchRulesText()
      .then(text => setRulesText(text))
      .catch(err => setLoadError(err.message)) // set error message (record)
      .finally(() => setLoadingRules(false));
  }, []);

  // after clicking "Save", show a message for 5 seconds
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");

    // clear any existing timer
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    try {
      await saveRulesText(rulesText);
      setSaveMsg("✅ Saved!");

      // initiate a new timer
      hideTimer.current = setTimeout(() => {
        setSaveMsg("");
        hideTimer.current = null;
      }, 5000);
    } catch (err) {
      setSaveMsg("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // NEW: handleDeploy function for deploying the MobieXpert xApp
  const handleDeploy = async () => {
    setDeploying(true);
    setDeployMsg("");

    // clear any existing timer
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    try {
      await deployXapp("MobieXpert xApp");
      setDeployMsg("✅ MobieXpert xApp deployed successfully!");

      // initiate a new timer to hide the message
      hideTimer.current = setTimeout(() => {
        setDeployMsg("");
        hideTimer.current = null;
      }, 5000);
    } catch (error) {
      setDeployMsg("❌ Deploy failed: " + error.message);
    } finally {
      setDeploying(false);
    }
  };


  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  /* hint for specific error */
  const errorHint = getHintForError(loadError);

return (
  <Box sx={{ p: 3, width: "80%" }}>
    {/* Header / fixed top area */}
    <Box flexShrink={0}>
      <PageHeader title="MobieXpert xApp Settings" />
      <Box sx={{ mb: 2 }} />

      {loadError && (
        <>
          <Typography variant="body2" sx={{ color: c.error, fontWeight: "bold" }}>
            {loadError}
          </Typography>
          {errorHint && (
            <Typography variant="body2" sx={{ color: "#ffd27d", mt: -1 }}>
              {errorHint}
            </Typography>
          )}
        </>
      )}
    </Box>

    {/* Scrollable main content */}
    <div
      style={{
        flexGrow: 1,
        overflowY: "auto",
        paddingTop: 20,
        maxWidth: "100%",
        minHeight: 0,
        boxSizing: "border-box"
      }}
    >
      <Typography variant="h6" sx={{ mt: 0, mb: 2, fontWeight: "bold" }}>
        P-Best Rule Editor
      </Typography>

      {loadingRules ? (
        <Typography variant="body2" color="text.secondary">
          Loading file…
        </Typography>
      ) : loadError ? (
        <Typography variant="body2" color="text.secondary">
          Cannot edit until the file is available.
        </Typography>
      ) : (
        <>
          <textarea
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "100%",
              height: 400,
              fontFamily: "monospace",
              fontSize: 14,
              padding: 20,
              borderRadius: 6,
              border: "1px solid #888",
              background: "#151a1e",
              color: "#e7e7e7",
              boxSizing: "border-box",
              resize: "both"
            }}
          />
          <Box mt={1} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="contained"
              size="small"
              sx={{
                fontSize: "0.75rem",
                backgroundColor: c.primaryMain,
                color: "#fff",
                '&:hover': {
                  backgroundColor: c.primaryHover,
                },
                px: 3, py: 1
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              disabled={deploying}
              variant="contained"
              size="small"
              sx={{
                fontSize: "0.75rem",
                backgroundColor: c.successBtn,
                color: "#fff",
                '&:hover': {
                  backgroundColor: c.successBtnHover,
                },
                px: 3, py: 1
              }}
              onClick={handleDeploy}
            >
              {deploying ? "Deploying…" : "Deploy"}
            </Button>
            {saveMsg && (
              <Typography variant="body2" sx={{ ml: 2, display: "inline" }}>
                {saveMsg}
              </Typography>
            )}
            {deployMsg && (
              <Typography variant="body2" sx={{ ml: 2, display: "inline" }}>
                {deployMsg}
              </Typography>
            )}
          </Box>
        </>
      )}
    </div>
  </Box>
);

}

export default MobieXpertPage;
