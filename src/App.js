import { useState, useEffect, useContext } from "react";
import "./App.css";
import { BsIcon, BsIconProvider, HoverContext } from "./bs/bs";
import CenterBar from "./centerBar/centerBar";


function AppContent() {
  const [bevent, setEvent] = useState({});
  const { hoveredBsId, hoveredUeId } = useContext(HoverContext);

  useEffect(() => {
    const interval = setInterval(() => {
      // setEvent(fetchUserData());

      setEvent({
        "a": {
          "report-period": 100,
          "stations": {
            "a-a": { "level": "critical", "Event Name": "Null Cipher", "timestamp": 1731561443 },
            "a-b": {}, "a-c": {}, "a-d": {}, "a-e": {}
          },
        },
        "b": {
          "report-period": 200,
          "stations": {
            "b-a": {}, "b-b": {}, "b-c": {}, "b-d": {}, "b-e": {}, "b-f": {}, "b-g": {}, "b-h": {},
          },
        },
    })
  }, 1000); // 10000 milliseconds = 10 seconds
    // setEvent(fetchUserData());
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
      <CenterBar  setEvent={setEvent} bsevent={bevent} bsId={hoveredBsId} ueId={hoveredUeId} />
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
          <BsIcon key={index} bsId={bsId} backendEvents={bevent[bsId]["stations"]} />
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
