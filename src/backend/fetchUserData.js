function fetchUserData(setEvent) {
  fetch("http://localhost:8080/fetchUserData", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      setEvent(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function fetchSdlData(setEvent) {
  fetch("http://localhost:8080/fetchSdlData", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      setEvent(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


// Return a promise from deployXapp
function deployXapp(xappName) {
  return fetch("http://localhost:8080/deployXapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xapp_name: xappName })
  })
    .then(response => {
      if (!response.ok) {
        // If not 2xx, read error JSON and throw
        return response.json().then(data => {
          throw new Error(`HTTP ${response.status} - ${data.error}\nLogs: ${JSON.stringify(data.logs)}`);
        });
      }
      // If 2xx, parse JSON
      return response.json();
    })
    .then(data => {
      // data might have { message, logs }
      console.log("Deploy success message:", data.message);
      console.log("Deploy logs:", data.logs);
      // Return data to the caller
      return data;
    })
    .catch(error => {
      console.error("Deploy error:", error);
      // Rethrow so the caller can catch in try/catch
      throw error;
    });
}


function buildXapp(xappName) {
  // IMPORTANT: return the Promise so caller can await it
  return fetch("http://localhost:8080/buildXapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xapp_name: xappName })
  })
    .then(response => {
      if (!response.ok) {
        // If not 2xx, read the error JSON and throw an Error
        return response.json().then(data => {
          throw new Error(
            `BuildXapp HTTP ${response.status} - ${data.error}\nLogs: ${JSON.stringify(data.logs)}`
          );
        });
      }
      // If 2xx, return the response body as JSON
      return response.json();
    })
    .then(data => {
      // data may have { message, logs }
      console.log("BuildXapp success message:", data.message);
      console.log("BuildXapp logs:", data.logs);
      // Return data upward so the caller (handleBuild) can use it
      return data;
    })
    .catch(error => {
      console.error("BuildXapp error:", error);
      // Rethrow so the caller can catch it in try...catch
      throw error;
    });
}


// Return a promise from undeployXapp
function undeployXapp(xappName) {
  return fetch("http://localhost:8080/unDeployXapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xapp_name: xappName })
  })
    .then(response => {
      if (!response.ok) {
        // If not 2xx, handle as error
        return response.json().then(data => {
          throw new Error(`HTTP ${response.status} - ${data.error}\nLogs: ${JSON.stringify(data.logs)}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("UndeployXapp response:", data);
      // Return data to the caller
      return data;
    })
    .catch(error => {
      console.error("UndeployXapp error:", error);
      throw error;
    });
}

function fetchServiceStatus(setService) {
  fetch("http://localhost:8080/fetchServiceStatus", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      setService(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function fetchCsvData(setEvent) {
  fetch("http://localhost:8080/fetchCsvData", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      setEvent(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


/* -------------------------------------------
   NEW: MobieXpert rules.pbest helpers
------------------------------------------- */
const RULES_API = "http://localhost:8080/api/mobieexpert/rules";


function fetchRulesText() {
  return fetch(RULES_API).then(res => {
    if (!res.ok) throw new Error("Failed to load rules.pbest");
    return res.text();
  });
}

function saveRulesText(newText) {
  return fetch(RULES_API, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: newText,
  }).then(res => {
    if (!res.ok) throw new Error("Failed to save rules.pbest");
  });
}



/**
 * Fetch a simple chat summary.
 * Returns a promise resolving to { base_station_count, ue_count }.
 */
function fetchChatSummary() {
  return fetch("http://localhost:8080/chat/summary", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    });
}



export { fetchUserData };
export { fetchSdlData };
export { fetchCsvData };
export { fetchServiceStatus };
export { deployXapp };
export { undeployXapp };
export { buildXapp };
export { fetchRulesText, saveRulesText };
export { fetchChatSummary };
