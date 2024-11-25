import { useState, useEffect } from "react";
import "./App.css";
import { BsIcon, BsIconProvider } from "./bs/bs";

function fetchUserData() {
	return {"bs-a_ue-a": {"level":"critical", "Event Name":"Null Cipher", "timestamp": 1731561443}}
}

function App() {
  const [bevent, setEvent] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setEvent(fetchUserData());
    }, 10000); // 10000 milliseconds = 10 seconds
		setEvent(fetchUserData());
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // this will be dynamically pulled from sql
  let bsIds = ["a", "b", "c"];
  return (
    <BsIconProvider>
      <div
        className="App"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#ffffff",
          gap: "200px", // Adjust gap as needed
        }}
      >
        {bsIds.map((bsId, index) => (
          <BsIcon key={index} bsId={bsId} backendEvents={bevent} />
        ))}
        {/* <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header> */}
      </div>
    </BsIconProvider>
  );
}

export default App;
