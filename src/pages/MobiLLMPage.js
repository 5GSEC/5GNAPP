// src/pages/MobiLLMPage.js
import React, { useState, useEffect } from "react";

export default function MobiLLMPage() {
  const [apiKey, setApiKey]       = useState("");
  const [model, setModel]         = useState("");
  const [status, setStatus]       = useState("");
  const [modelList, setModelList] = useState([]);

  // 1) Load existing config
  useEffect(() => {
    fetch("http://localhost:8080/llm/config")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(cfg => {
        setApiKey(cfg.api_key || "");
        setModel(cfg.model   || "");
      })
      .catch(err => {
        console.error("Config load failed:", err);
      });
  }, []);

  // 2) Whenever apiKey changes, load model list
  useEffect(() => {
    if (!apiKey) {
      setModelList([]);
      return;
    }

    fetch("http://localhost:8080/llm/models")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        // If config not set, backend returns { error: "..."}; ignore that
        if (Array.isArray(data.models)) {
          setModelList(data.models);
        } else {
          console.warn("Model list error:", data.error);
          setModelList([]);
        }
      })
      .catch(err => {
        console.error("Model list load failed:", err);
        setModelList([]);
      });
  }, [apiKey]);

  // 3) Save settings (POST config) and re-fetch models
  const handleSave = async () => {
    setStatus("");
    try {
      const res = await fetch("http://localhost:8080/llm/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, model }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("Settings saved");

      // Immediately reload models under the new key
      if (apiKey) {
        const mres  = await fetch("http://localhost:8080/llm/models");
        const mdata = await mres.json();
        if (Array.isArray(mdata.models)) {
          setModelList(mdata.models);
        }
      }
    } catch (e) {
      console.error("Save failed:", e);
      setStatus("Save failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>mobiLLM Settings</h3>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>API Key:</label>
        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={{ width: 300, padding: 6 }}
          placeholder="Enter your API key"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Model:</label>
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          style={{ width: 300, padding: 6 }}
          disabled={modelList.length === 0}
        >
          {modelList.length === 0
            ? <option value="">No models available</option>
            : modelList.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))
          }
        </select>
      </div>

      <button onClick={handleSave} style={{ padding: "8px 16px" }}>
        Save Settings
      </button>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  );
}
