$(document).ready(function () {
    $('#loginButton').click(function (event) {
        event.preventDefault();

        // Get values from inputs
        var username = $('#username').val();
        var password = $('#password').val();

        // Send the data to the server via a POST request
        fetch('/login/login-click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        })
            .then(response => {
                if (!response.ok) {
                    setErrorText("Invalid Username or Password");
                    return response.json().then(data => { throw data.error || 'Something went wrong.' });
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    // Handle successful login
                    console.log("Login successful!");
                    window.location.href = '/mainPage'; // Redirect on success
                }
            })
            .catch(error => {
                // Handle errors (e.g., invalid username/password)
                console.log('Error:', error);
                setErrorText("Invalid Username or Password");
            });
    });
});

var setErrorText = function (text) {
    document.getElementById("errorText").innerText = text;
    document.getElementById("error").style.visibility = "visible";
};