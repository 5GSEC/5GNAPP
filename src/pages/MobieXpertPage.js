/******************************************************
 * MobieXpertPage.js  – dedicated page for MobieXpert
 * Adds an in-page text-editor for editing rules.pbest
 ******************************************************/

import React, { useState, useEffect, useRef } from "react"; 
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
  <div
    style={{
      height: "100vh", // Fill the full viewport height
      display: "flex",
      flexDirection: "column",
      overflow: "hidden", // Don't overflow the main layout
      padding: "0 20px 20px",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box"
    }}
  >
    {/* Header / fixed top area */}
    <div style={{ flexShrink: 0 }}>
      <h3 style={{ marginTop: 0 }}>MobieXpert xApp Settings</h3>

      {status ? (
        <ul style={{ marginTop: 0 }}>
          <li>
            <strong>Version:</strong> {status.version}
          </li>
          <li>
            <strong>Last Deployed:</strong> {status.lastDeployed}
          </li>
        </ul>
      ) : (
        <p>Loading xApp status…</p>
      )}

      {loadError && (
        <>
          <p style={{ color: "tomato", fontWeight: "bold" }}>{loadError}</p>
          {errorHint && (
            <p style={{ color: "#ffd27d", marginTop: -10 }}>{errorHint}</p>
          )}
        </>
      )}
    </div>

    {/* Scrollable main content */}
    <div
      style={{
        flexGrow: 1,
        overflowY: "auto",
        paddingTop: 20,
        minHeight: 0 // <- important for flex layout to allow shrinking
      }}
    >
      <h4 style={{ marginTop: 0 }}>rules.pbest Editor</h4>

      {loadingRules ? (
        <p>Loading file…</p>
      ) : loadError ? (
        <p>Cannot edit until the file is available.</p>
      ) : (
        <>
          <textarea
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            style={{
              width: "100%",
              height: 400,
              fontFamily: "monospace",
              fontSize: 14,
              padding: 10,
              borderRadius: 6,
              border: "1px solid #888",
              background: "#151a1e",
              color: "#e7e7e7",
              boxSizing: "border-box",
              resize: "vertical"
            }}
          />
          <div style={{ marginTop: 10 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "6px 16px" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {saveMsg && <span style={{ marginLeft: 10 }}>{saveMsg}</span>}
          </div>
        </>
      )}

      <button disabled style={{ marginTop: 30 }}>
        Deploy (update coming soon)
      </button>
    </div>
  </div>
);

}

export default MobieXpertPage;
