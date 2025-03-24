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

function deployXapp(XappName) {
  fetch("http://localhost:8080/deployXapp", {
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
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function undeployXapp(XappName) { 
}

function buildXapp(XappName) {
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
