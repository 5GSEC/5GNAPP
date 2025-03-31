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


function deployXapp(xappName) {
  fetch("http://localhost:8080/deployXapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xapp_name: xappName })
  })
    .then(response => {
      if (!response.ok) {
        // If status != 2xx, read the JSON first, then throw an error
        return response.json().then(data => {
          throw new Error(`HTTP ${response.status} - ${data.error}\nLogs: ${JSON.stringify(data.logs)}`);
        });
      }
      return response.json();
    })
    .then(data => {
      // data could have { message, logs }
      console.log("Deploy response message:", data.message);
      console.log("Detailed logs:", data.logs);
    })
    .catch(error => {
      // If there's an error or a non-2xx response
      console.error("Deploy error:", error);
    });
}


function buildXapp(xappName) {
  fetch("http://localhost:8080/buildXapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xapp_name: xappName })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          // data may have an "error" and "logs" array
          throw new Error(
            `BuildXapp HTTP ${response.status} - ${data.error}\nLogs: ${JSON.stringify(data.logs)}`
          );
        });
      }
      return response.json();
    })
    .then(data => {
      // data should have { message, logs }
      console.log("BuildXapp success message:", data.message);
      console.log("BuildXapp logs:", data.logs);
    })
    .catch(error => {
      console.error("BuildXapp error:", error);
    });
}


function undeployXapp(XappName) {
  fetch("http://localhost:8080/unDeployXapp", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ xapp_name: XappName })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("UndeployXapp response:", data);
    })
    .catch(error => {
      console.error('UndeployXapp error:', error);
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

export { fetchUserData };
export { fetchSdlData };
export { fetchCsvData };
export { fetchServiceStatus };
export { deployXapp };
export { undeployXapp };
export { buildXapp };
