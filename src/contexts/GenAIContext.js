import React, { createContext, useState } from "react";

/**
 * Holds shared MobiLLM GenAI state (analysis responses, interrupt/resume flow,
 * proposed config changes) keyed by thread id, so the Issues page and other
 * consumers can share a single source of truth.
 */
export const GenAIContext = createContext();

export function GenAIProvider({ children }) {
  const [genaiResponse, setGenaiResponse] = useState({});
  const [genaiInterrupted, setgenaiInterrupted] = useState({});
  const [genaiInterruptPrompt, setgenaiInterruptPrompt] = useState({});
  const [genaiActionStrategy, setgenaiActionStrategy] = useState({});
  const [genaiUpdatedConfig, setgenaiUpdatedConfig] = useState({});
  const [genaiOriginalConfig, setgenaiOriginalConfig] = useState({});
  const [genaiActionResponse, setgenaiActionResponse] = useState({});
  const [rowIdToThreadId, setRowIdToThreadId] = useState({});

  const genaiState = {
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
  };

  return (
    <GenAIContext.Provider value={genaiState}>
      {children}
    </GenAIContext.Provider>
  );
}

export default GenAIContext;
