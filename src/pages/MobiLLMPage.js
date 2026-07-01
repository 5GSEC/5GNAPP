// src/pages/MobiLLMPage.js
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Alert,
  useTheme,
} from "@mui/material";
import { getLLMConfig, saveLLMConfig, getLLMModels } from "../backend/fetchUserData";
import PageHeader from "../components/PageHeader";

export default function MobiLLMPage() {
  const theme = useTheme();
  const c = theme.custom;
  const [apiKey, setApiKey]       = useState("");
  const [model, setModel]         = useState("");
  const [status, setStatus]       = useState("");
  const [modelList, setModelList] = useState([]);

  const fieldSx = {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: c.border,
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: c.accentStrong,
      borderWidth: 2,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: c.accentStrong,
      borderWidth: 2,
    },
  };

  const labelSx = {
    color: c.textPrimary,
    '&.Mui-focused': { color: c.accentStrong },
  };

  // 1) Load existing config
  useEffect(() => {
    getLLMConfig()
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
  }, [apiKey]);

  // 3) Save settings (POST config) and re-fetch models
  const handleSave = async () => {
    setStatus("");
    try {
      await saveLLMConfig({ api_key: apiKey, model });
      setStatus("Settings saved");

      // Immediately reload models under the new key
      if (apiKey) {
        const mdata = await getLLMModels();
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
    <Box sx={{ p: 3 }}>
      <PageHeader title="MobiLLM API Settings" />

      <Box sx={{ maxWidth: 420, mt: 3 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel htmlFor="api-key" sx={labelSx}>
          
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
          sx={fieldSx}
          InputLabelProps={{
            style: { color: c.textPrimary }
          }}
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="model-label" sx={labelSx}>
          Model
        </InputLabel>
        <Select
          labelId="model-label"
          id="model"
          value={model}
          label="Model"
          onChange={e => setModel(e.target.value)}
          disabled={modelList.length === 0}
          sx={fieldSx}
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
          backgroundColor: c.primaryMain,
          color: '#fff',
          '&:hover': {
            backgroundColor: c.primaryHover,
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
    </Box>
  );
}
