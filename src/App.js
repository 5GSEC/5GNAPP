import "./App.css";
import { useState, useEffect, useContext } from "react";
import { BsIcon, BsIconProvider, HoverContext } from "./bs/bs";
import { fetchCsvData, fetchSdlData} from "./fetchUserData";
import CenterBar from "./centerBar/centerBar";
import MenuNavBar from "./MenuNavBar";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f6f8;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  flex: 1;
  padding: 20px;
`;

const Header = styled.h2`
  color: #333;
  text-align: left;
  margin-bottom: 5px;
`;

const SubHeader = styled.h3`
  color: #555;
  text-align: left;
  font-weight: normal;
  margin-top: 0;
`;

const data_simulation = 1; // 0 for SDL data, 1 for CSV data (simulation)
const update_interval = 10000; // data update interval in milliseconds

function AppContent() {
  const [bevent, setEvent] = useState({});
  const { hoveredBsId, hoveredUeId } = useContext(HoverContext);

  useEffect(() => {
    const interval = setInterval(() => {
      if (data_simulation === 1)
        fetchCsvData(setEvent);
      else
        fetchSdlData(setEvent);

  }, update_interval); // in milliseconds

  if (data_simulation === 1)
    fetchCsvData(setEvent);
  else
    fetchSdlData(setEvent);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <Container>
      <MenuNavBar />
      <Content>
        <Header>5GNAPP - 5G-Native Management Platform</Header>
        <SubHeader>You cannot secure what you cannot see</SubHeader>
        <div style={{ height: "0em" }} /> {/* Add gap between CenterBar and the rest */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
          <CenterBar setEvent={setEvent} bsevent={bevent} bsId={hoveredBsId} ueId={hoveredUeId} />
        </div>
        <div className="App" style={{display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", width: "100%", gap: "200px" }}>
          {Array.from(Object.keys(bevent)).map((bsId, index) => (
            <BsIcon key={index} bsId={bsId} backendEvents={bevent[bsId]["ue"]} />
        ))}
        </div>
      </Content>
    </Container>
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
