// src/pages/XApps.js
import React, { useState } from "react";

/**
 * XApps page component.
 * In a real-world scenario, you'd probably fetch these rules from a backend
 * and then save them back after editing.
 */
export default function XApps() {
  // Example states for the rules (placeholders)
  const [DEBUG, setDEBUG] = useState(1);
  const [VERBOSE, setVERBOSE] = useState(0);
  const [UE_EXPIRE_TIME, setUE_EXPIRE_TIME] = useState(30000);
  const [BS_EXPIRE_TIME, setBS_EXPIRE_TIME] = useState(30000);
  const [EVENT_EXPIRE_TIME, setEVENT_EXPIRE_TIME] = useState(600000);
  const [BTS_DEPLETION_UE_THRESHOLD, setBTS_DEPLETION_UE_THRESHOLD] = useState(2);

  // Example "save" function
  const handleSave = () => {
    // In real projects, you'd call an API to save these updates
    console.log("Saving updated rules:", {
      DEBUG,
      VERBOSE,
      UE_EXPIRE_TIME,
      BS_EXPIRE_TIME,
      EVENT_EXPIRE_TIME,
      BTS_DEPLETION_UE_THRESHOLD
    });
    alert("Rules saved (check console).");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>XApps Management</h2>
      <p>Manage or display xApps. Below is an example of adjustable rules.</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "20px" }}>
        
        {/* Card 1: DEBUG */}
        <div style={{ border: "1px solid #ccc", padding: "1rem", width: "250px" }}>
          <h4>DEBUG</h4>
          <label>
            <input
              type="checkbox"
              checked={DEBUG === 1}
              onChange={(e) => setDEBUG(e.target.checked ? 1 : 0)}
            />
            {" "}Enable DEBUG
          </label>
        </div>

        {/* Card 2: VERBOSE */}
        <div style={{ border: "1px solid #ccc", padding: "1rem", width: "250px" }}>
          <h4>VERBOSE</h4>
          <label>
            <input
              type="checkbox"
              checked={VERBOSE === 1}
              onChange={(e) => setVERBOSE(e.target.checked ? 1 : 0)}
            />
            {" "}Enable VERBOSE
          </label>
        </div>

        {/* Card 3: UE_EXPIRE_TIME */}
        <div style={{ border: "1px solid #ccc", padding: "1rem", width: "250px" }}>
          <h4>UE_EXPIRE_TIME</h4>
          <input
            type="number"
            value={UE_EXPIRE_TIME}
            onChange={(e) => setUE_EXPIRE_TIME(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            (milliseconds)
          </p>
        </div>

        {/* Card 4: BS_EXPIRE_TIME */}
        <div style={{ border: "1px solid #ccc", padding: "1rem", width: "250px" }}>
          <h4>BS_EXPIRE_TIME</h4>
          <input
            type="number"
            value={BS_EXPIRE_TIME}
            onChange={(e) => setBS_EXPIRE_TIME(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            (milliseconds)
          </p>
        </div>

        {/* Card 5: EVENT_EXPIRE_TIME */}
        <div style={{ border: "1px solid #ccc", padding: "1rem", width: "250px" }}>
          <h4>EVENT_EXPIRE_TIME</h4>
          <input
            type="number"
            value={EVENT_EXPIRE_TIME}
            onChange={(e) => setEVENT_EXPIRE_TIME(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            (milliseconds)
          </p>
        </div>

        {/* Card 6: BTS_DEPLETION_UE_THRESHOLD */}
        <div style={{ border: "1px solid #ccc", padding: "1rem", width: "250px" }}>
          <h4>BTS_DEPLETION_UE_THRESHOLD</h4>
          <input
            type="number"
            value={BTS_DEPLETION_UE_THRESHOLD}
            onChange={(e) => setBTS_DEPLETION_UE_THRESHOLD(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            (UE count threshold)
          </p>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSave} style={{ padding: "10px 20px" }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
