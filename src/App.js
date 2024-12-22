import { useState, useEffect, useContext } from "react";
import "./App.css";
import { BsIcon, BsIconProvider, HoverContext } from "./bs/bs";
import CenterBar from "./centerBar/centerBar";
import parser  from "papaparse";

async function fetchUserData() {

  //how do I know how much middle layer(e.g. a-a, a-b) there will be for each outer layer(e.g. a, b)?
  const returned = {
    "a": {
      "a-a": {}, "a-b": {}, "a-c": {}, "a-d": {}, "a-e": {}
    },
    "b": {
      "b-a": {}, "b-b": {}, "b-c": {}, "b-d": {}, "b-e": {}, "b-f": {}, "b-g": {}, "b-h": {},
    },
    "c": {
      "c-a": {}, "c-b": {}, "c-c": {}, "c-d": {}, "c-e": { "level": "critical" }, "c-f": {}, "c-g": {}
    },
  }
  const nextChar = (char) => { return String.fromCharCode(char.charCodeAt(0) + 1);} //get next character. 'Z' overflows.
  let outerLayer = "a", middleLayer = "a"; //outerLayer and middleLayer letters
  try {
    const response = await fetch("db/5G-Sample-Data - Event.csv");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const blob = await response.blob();

    // Create a File object from the Blob
    const file = new File([blob], "event.csv", { type: blob.type });
    
    let max = Object.keys(returned[outerLayer]).length
    let count = 0

    parser.parse(file, { //get csv data
      download: true,
      header: true,
      worker: true, //open a worker thread to prevent browser from crashing from parsing large files
      step: (result, _) => { //for each row of data
        const data = result.data;
        if(count === max) {
          count = 0;
          outerLayer = nextChar(outerLayer); //get next outer layer
          middleLayer = "a"; //reset middle layer
          if (returned[outerLayer] !== undefined) {
            max = Object.keys(returned[outerLayer]).length - 1
          }
        }
        if (returned[outerLayer] !== undefined) {
        returned[outerLayer][`${outerLayer}-${middleLayer}`] = {
          "level": data["Level"],
          "Event Name": data["Event Name"],
          "timestamp": data["Timestamp"]
        }
      }
  
        middleLayer = nextChar(middleLayer);
        count++;
  
      },
      complete: (result, _) => {
        console.log(returned);
        return returned
      }
  
    });

  } catch (error) {
    console.error('Error:', error);
    alert("Error reading the csv event file. Check the console for details.");
  }
}

function AppContent() {
  const [bevent, setEvent] = useState({});
  const { hoveredBsId, hoveredUeId } = useContext(HoverContext);

  useEffect(() => {
    const interval = setInterval(() => {
      // setEvent(fetchUserData());
      setEvent({
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
    })
  }, 10000); // 10000 milliseconds = 10 seconds
    // setEvent(fetchUserData());
    setEvent({
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
  })
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
