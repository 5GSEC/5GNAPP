import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createAppTheme } from "../theme/createAppTheme";

const STORAGE_KEY = "5gnapp_color_mode";

export const ColorModeContext = createContext({
  mode: "dark",
  isDarkMode: true,
  toggleColorMode: () => {},
  setMode: () => {},
});

function getInitialMode() {
  if (typeof window === "undefined") return "dark";

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch (e) {
    // localStorage may be unavailable (private mode, etc.)
  }

  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

/**
 * Provides the app-wide color mode plus the MUI ThemeProvider/CssBaseline.
 * The selected mode is persisted to localStorage and defaults to the OS
 * preference on first load.
 */
export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      // ignore persistence failures
    }
  }, [mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      isDarkMode: mode === "dark",
      toggleColorMode: () => setMode((prev) => (prev === "dark" ? "light" : "dark")),
      setMode,
    }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  return useContext(ColorModeContext);
}

export default ColorModeContext;
