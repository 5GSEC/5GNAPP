/******************************************************
 * App.js  – 5GNAPP application shell (providers + layout)
 ******************************************************/

import "./App.css";
import React from "react";
import { BrowserRouter } from "react-router-dom";

import Chatbot from "./components/Chatbot";
import { BsIconProvider } from "./bs/bs";
import MenuNavBar from "./menubar/MenuNavBar";
import AppRoutes from "./routes";
import { GenAIProvider } from "./contexts/GenAIContext";
import { ColorModeProvider, useColorMode } from "./contexts/ColorModeContext";

/* Layout shell – reads the color mode so the container can toggle the
   dashboard chrome (`.theme-dark`) styles defined in App.css. */
function AppShell() {
  const { isDarkMode } = useColorMode();

  return (
    <div className={`container ${isDarkMode ? "theme-dark" : ""}`} style={{ display: "flex" }}>
      <MenuNavBar />
      <div className="content" style={{ flex: 1 }}>
        <AppRoutes />
        <Chatbot />
      </div>
    </div>
  );
}

function App() {
  return (
    <ColorModeProvider>
      <GenAIProvider>
        <BsIconProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </BsIconProvider>
      </GenAIProvider>
    </ColorModeProvider>
  );
}

export default App;
