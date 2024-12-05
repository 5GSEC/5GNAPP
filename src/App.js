import { useState, useEffect } from "react";
import "./App.css";
import { BsIcon, BsIconProvider } from "./bs/bs";

function fetchUserData() {
	return {
		"a": {
			"a-a": {"level":"critical", "Event Name":"Null Cipher", "timestamp": 1731561443},
			"a-b":{},"a-c":{},"a-d":{},"a-e":{},"a-f":{},"a-g":{},"a-h":{},"a-i":{},"a-j":{}
		}, 
		"b": {
			"b-a":{},"b-b":{},"b-c":{},"b-d":{},"b-e":{},"b-f":{},"b-g":{},"b-h":{},"b-i":{},"b-j":{}
		},
		"c": {
			"c-a":{},"c-b":{},"c-c":{},"c-d":{},"c-e":{"level":"critical"},"c-f":{},"c-g":{},"c-h":{},"c-i":{},"c-j":{}
		},
		"d": {
			"d-a":{},"d-b":{},"d-c":{},"d-d":{},"d-e":{},"d-f":{},"d-g":{},"d-h":{},"d-i":{},"d-j":{}
		},
		"e": {
			"e-a":{},"e-b":{},"e-c":{},"e-d":{},"e-e":{},"e-f":{},"e-g":{},"e-h":{},"e-i":{},"e-j":{}
		},
	}
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
        {Array.from(Object.keys(bevent)).map((bsId, index) => (
          <BsIcon key={index} bsId={bsId} backendEvents={bevent[bsId]} />
        ))}
      </div>
    </BsIconProvider>
  );
}

export default App;
