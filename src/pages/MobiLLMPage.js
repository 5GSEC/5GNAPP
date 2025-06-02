// src/pages/MobiLLMPage.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Alert,
} from "@mui/material";

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
    <Box sx={{ p: 3, maxWidth: 420 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        MobiLLM API Settings
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel
          htmlFor="api-key"
          sx={{
            color: '#11182E',
            '&.Mui-focused': { color: '#11182E' }
          }}
        >
          
        </InputLabel>
        <TextField
          id="api-key"
          type="password"
          label="API Key"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          variant="outlined"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e4ef',
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#11182E',
              borderWidth: 2,
            },
          }}
          InputLabelProps={{
            style: { color: '#11182E' }
          }}
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel
          id="model-label"
          sx={{
            color: '#11182E',
            '&.Mui-focused': { color: '#11182E' }
          }}
        >
          Model
        </InputLabel>
        <Select
          labelId="model-label"
          id="model"
          value={model}
          label="Model"
          onChange={e => setModel(e.target.value)}
          disabled={modelList.length === 0}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e4ef',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#11182E',
              borderWidth: 2,
            },
          }}
        >
          {modelList.length === 0 ? (
            <MenuItem value="">
              No models available
            </MenuItem>
          ) : (
            modelList.map(m => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        onClick={handleSave}
        sx={{
          px: 3,
          py: 1,
          mt: 1,
          backgroundColor: '#11182E',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#2d3c6b',
          },
        }}
      >
        Save Settings
      </Button>

      {status && (
        <Alert severity={status === "Settings saved" ? "success" : "error"} sx={{ mt: 2 }}>
          {status}
        </Alert>
      )}
    </Box>
  );
}
