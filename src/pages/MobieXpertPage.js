/******************************************************
 * MobieXpertPage.js  – dedicated page for MobieXpert
 * Adds an in-page text-editor for editing rules.pbest
 ******************************************************/

import React, { useState, useEffect, useRef } from "react"; 
import { Typography, Button, Box } from "@mui/material";
import { fetchRulesText, saveRulesText } from "../backend/fetchUserData"; // NEW: import helpers

/* ──────────────────────────────────────────────
   1)  xApp meta-info – stub, replace later
────────────────────────────────────────────── */
const fetchMobieXpertStatus = async () => {
  // TODO: replace with real backend call
  return { version: "v1.0.0", lastDeployed: "2025-04-20 14:30" };
};

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
  /* xApp status */
  const [status, setStatus] = useState(null);

  /* rules.pbest editor */
  const [rulesText, setRulesText] = useState("");    // textarea content
  const [loadingRules, setLoadingRules] = useState(true);
  const [loadError, setLoadError] = useState("");     // ← NEW: error message
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");


  // reference to clear the timer(ID, for 5s delay message)
  const hideTimer = useRef(null);

  /* fetch meta-info once */
  useEffect(() => {
    fetchMobieXpertStatus().then(setStatus);
  }, []);

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
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        MobieXpert xApp Settings
      </Typography>

      {status ? (
        <Box sx={{ mt: 0, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#11182E", minWidth: 110 }}>
              Version:
            </Typography>
            <Typography variant="body2" sx={{ ml: 1 }}>
              {status.version}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#11182E", minWidth: 110 }}>
              Last Deployed:
            </Typography>
            <Typography variant="body2" sx={{ ml: 1 }}>
              {status.lastDeployed}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Loading xApp status…
        </Typography>
      )}

      {loadError && (
        <>
          <Typography variant="body2" sx={{ color: "tomato", fontWeight: "bold" }}>
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
          <Box mt={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
              sx={{ px: 3, py: 1 }}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
            {saveMsg && (
              <Typography variant="body2" sx={{ ml: 2, display: "inline" }}>
                {saveMsg}
              </Typography>
            )}
          </Box>
        </>
      )}

      <Button disabled sx={{ mt: 4 }}>
        Deploy (update coming soon)
      </Button>
    </div>
  </Box>
);

}

export default MobieXpertPage;
