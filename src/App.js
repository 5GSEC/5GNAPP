import "./App.css";
import { useState, useEffect, useContext } from "react";
import { BsIcon, BsIconProvider, HoverContext } from "./bs/bs";
import { fetchCsvData, fetchSdlData, fetchServiceStatus} from "./fetchUserData";
import CenterBar from "./centerBar/centerBar";
import MenuNavBar from "./menubar/MenuNavBar";

const data_simulation = 0; // 0 for SDL data, 1 for CSV data (simulation)
const update_interval = 10000; // data update interval in milliseconds

export function updateData (setEvent, setService) {
  if (data_simulation === 1) {
    fetchCsvData(setEvent);
    setService({"mobiexpert-xapp":"","mobiflow-auditor":"ricxapp-mobiflow-auditor-6f695ddc84-8n469;1/1;Running;0;95m","mobiintrospect":"","mobiwatch-xapp":"","ricplt-e2mgr":"deployment-ricplt-e2mgr-b988db566-hrhj2;1/1;Running;2;4d20h"}); // set sampele data
  } else {
    fetchSdlData(setEvent);
    fetchServiceStatus(setService);
  }
};

function AppContent() {
  const [bevent, setEvent] = useState({});
  const [services, setService] = useState({});
  const { hoveredBsId, hoveredUeId } = useContext(HoverContext);

  useEffect(() => {
    const interval = setInterval(() => {
      updateData(setEvent, setService);
    }, update_interval); // in milliseconds

    updateData(setEvent, setService);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="container">
      <MenuNavBar />
      <div className="content">
        <h2 className="header">5GNAPP - 5G-Native Management Platform</h2>
        <h3 className="subheader">You cannot secure what you cannot see</h3>
        <div style={{ height: "2em" }} /> {/* Add gap between CenterBar and the rest */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
          <CenterBar setEvent={setEvent} setService={setService} bsevent={bevent} services={services} bsId={hoveredBsId} ueId={hoveredUeId} />
        </div>
        <div className="App">
          {Array.from(Object.keys(bevent)).map((bsId, index) => (
            <BsIcon key={index} bsId={bsId} backendEvents={bevent[bsId]["ue"]} />
        ))}
        </div>
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
