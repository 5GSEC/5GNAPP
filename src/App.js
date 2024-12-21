import { useState, useEffect, useContext } from "react";
import "./App.css";
import { BsIcon, BsIconProvider, HoverContext } from "./bs/bs";
import CenterBar from "./centerBar/centerBar";

function fetchUserData() {
  return {
    "a": {
      "a-a": { "level": "critical", "Event Name": "Null Cipher", "timestamp": 1731561443 },
      "a-b": {}, "a-c": {}, "a-d": {}, "a-e": {}
    },
    "b": {
      "b-a": {}, "b-b": {}, "b-c": {}, "b-d": {}, "b-e": {}, "b-f": {}, "b-g": {}, "b-h": {},
    },
    "c": {
      "c-a": {}, "c-b": {}, "c-c": {}, "c-d": {}, "c-e": { "level": "critical" }, "c-f": {}, "c-g": {}
    },
  }
}

function AppContent() {
  const [bevent, setEvent] = useState({});
  const { hoveredBsId, hoveredUeId } = useContext(HoverContext);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvent(fetchUserData());
    }, 10000); // 10000 milliseconds = 10 seconds
    setEvent(fetchUserData());
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#ffffff",
      }}
    >
      <CenterBar bsevent={bevent} bsId={hoveredBsId} ueId={hoveredUeId} />
      <div
        className="App"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          gap: "200px", // Adjust gap as needed
        }}
      >
        {Array.from(Object.keys(bevent)).map((bsId, index) => (
          <BsIcon key={index} bsId={bsId} backendEvents={bevent[bsId]} />
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <BsIconProvider>
      <AppContent />
    </BsIconProvider>
  );
}

export default App;
