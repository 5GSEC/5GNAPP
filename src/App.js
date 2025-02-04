import { useState, useEffect, useContext } from "react";
import "./App.css";
import { BsIcon, BsIconProvider, HoverContext } from "./bs/bs";
import CenterBar from "./centerBar/centerBar";
import { fetchUserData } from "./fetchUserData";
import { fetchCsvData } from "./fetchUserData";
import { loadCsvData } from "./utils/csvLoader";
import { Parser } from "papaparse";

function AppContent() {
  // const data = loadCsvData();
  // console.log(data);
  const [bevent, setEvent] = useState({});
  const { hoveredBsId, hoveredUeId } = useContext(HoverContext);

  useEffect(() => {
    const interval = setInterval(() => {
      // setEvent(fetchUserData());

      // fetchUserData(setEvent)
       fetchCsvData(setEvent);
  }, 10000); // 10000 milliseconds = 10 seconds
  // fetchUserData(setEvent)
  fetchCsvData(setEvent)

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
      <div style={{ height: "10em" }} /> {/* Add gap between CenterBar and the rest */}
      <CenterBar setEvent={setEvent} bsevent={bevent} bsId={hoveredBsId} ueId={hoveredUeId} />
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
          // <BsIcon key={index} bsId={bsId} backendEvents={bevent[bsId]["stations"]} />
          //changed key from stations to ue
          <BsIcon key={index} bsId={bsId} backendEvents={bevent[bsId]["ue"]} />
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
