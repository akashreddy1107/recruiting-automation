
fetch('http://localhost:5000')
    .then(res => res.text())
    .then(text => {
        console.log("SUCCESS: Server is reachable.");
        console.log("Response:", text);
    })
    .catch(err => {
        console.error("FAILURE: Server is NOT reachable.");
        console.error("Error:", err.message);
    });
