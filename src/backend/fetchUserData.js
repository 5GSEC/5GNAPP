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