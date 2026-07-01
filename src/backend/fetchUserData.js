import { apiUrl } from "../config";

const JSON_HEADERS = { "Content-Type": "application/json" };

export function fetchUserData(setEvent) {
  fetch(apiUrl("/fetchUserData"), {
    method: 'GET',
    headers: JSON_HEADERS,
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

export function fetchSdlData() {
  return fetch(apiUrl("/fetchSdlData"), {
    method: 'GET',
    headers: JSON_HEADERS,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    });
}


export function fetchSdlEventData() {
  return fetch(apiUrl("/fetchSdlEventData"), {
    method: 'GET',
    headers: JSON_HEADERS,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    });
}

export function fetchTimeSeriesData() {
  return fetch(apiUrl("/fetchTimeSeriesData"), {
    method: 'GET',
    headers: JSON_HEADERS,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    });
}

/**
 * Orchestrates the periodic dashboard data refresh. Kept here (rather than in a
 * component) so both the dashboard and the cell info card can reuse it without
 * creating circular imports.
 */
export async function fetchAllData(setNetwork, setEvent, setService, setTimeSeriesData) {
  fetchServiceStatus(setService);
  try {
    // ensure fetch order in API calls
    const sdlData = await fetchSdlData();
    setNetwork(sdlData);

    const sdlEventData = await fetchSdlEventData();
    setEvent(sdlEventData);

    const timeSeriesData = await fetchTimeSeriesData();
    setTimeSeriesData(timeSeriesData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


// Return a promise from deployXapp
export function deployXapp(xappName) {
  return fetch(apiUrl("/deployXapp"), {
    method: "POST",
    headers: JSON_HEADERS,
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


export function buildXapp(xappName) {
  // IMPORTANT: return the Promise so caller can await it
  return fetch(apiUrl("/buildXapp"), {
    method: "POST",
    headers: JSON_HEADERS,
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
export function undeployXapp(xappName) {
  return fetch(apiUrl("/unDeployXapp"), {
    method: "POST",
    headers: JSON_HEADERS,
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

export function fetchServiceStatus(setService) {
  fetch(apiUrl("/fetchServiceStatus"), {
    method: 'GET',
    headers: JSON_HEADERS,
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

export function sendLLMResumeCommand(payload) {
  return fetch(apiUrl("/mobillm/sendLLMResumeCommand"), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
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
      // Return data to the caller
      return data;
    })
    .catch(error => {
      console.error("Send Resume command error:", error);
      // Rethrow so the caller can catch in try/catch
      throw error;
    });
}

/* -------------------------------------------
   NEW: MobieXpert rules.pbest helpers
------------------------------------------- */
const RULES_API = apiUrl("/api/mobieexpert/rules");


export function fetchRulesText() {
  return fetch(RULES_API).then(res => {
    if (!res.ok) throw new Error("Failed to load rules.pbest");
    return res.text();
  });
}

export function saveRulesText(newText) {
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
export function fetchChatSummary() {
  return fetch(apiUrl("/chat/summary"), {
    method: "GET",
    headers: JSON_HEADERS,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    });
}

/** 
 * Interface to chat with the MobiLLM Agent
*/
export function mobiLLMChat() {
  return fetch(apiUrl("/mobillm/chat"), {
    method: "GET",
    headers: JSON_HEADERS,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
  });
}

export function getComplianceData() {
  return fetch(apiUrl("/getComplianceData"), {
    method: "GET",
    headers: JSON_HEADERS,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    });
}

/**
 * Runs the MobiLLM security analysis for a single event prompt.
 * @param {string} message
 */
export function fetchSecurityAnalysis(message) {
  return fetch(apiUrl("/mobillm/security_analysis"), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ message }),
  }).then(async (res) => {
    const data = await res.json();
    return { res, data };
  });
}

/**
 * Sends a chat message to the MobiLLM agent.
 * @param {string} message
 */
export function sendChatMessage(message) {
  return fetch(apiUrl("/mobillm/chat"), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ message }),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Chat error");
    return data;
  });
}

/** Fetches the current MobiLLM/LLM configuration. */
export function getLLMConfig() {
  return fetch(apiUrl("/llm/config")).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

/** Saves the MobiLLM/LLM configuration. */
export function saveLLMConfig(payload) {
  return fetch(apiUrl("/llm/config"), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json().catch(() => ({}));
  });
}

/** Fetches the list of available LLM models. */
export function getLLMModels() {
  return fetch(apiUrl("/llm/models")).then((res) => res.json());
}
