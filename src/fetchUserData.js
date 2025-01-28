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

export { fetchUserData };