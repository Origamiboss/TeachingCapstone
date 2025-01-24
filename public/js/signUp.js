$(document).ready(function () {
    $('#SubmitButton').click(function (event) {
        // Get values from inputs
        var username = $('#username').val();
        var password = $('#password').val();
        var repassword = $('#repassword').val();
        var role;
        var validEntry = true;
        setErrorText("");
        if (repassword != password) {
            setErrorText("Password must be written twice");
            validEntry = false;
        }

        if ($("#studentBox").prop('checked')) {
            role = "student";
        } else if ($("#teacherBox").prop('checked')) {
            role = "teacher";
        } else {
            setErrorText("Select if the account is a teacher or student");
            validEntry = false;
        }
        // Display an alert with the values
        if (validEntry) {
            event.preventDefault();


            // Send the data to the server via a POST request
            fetch('/signUp/createAccount-click', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, role })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        setErrorText(data.error);
                    } else {
                        //go to main page becuase of succesful login
                        window.location.href = '/mainPage.html';
                    }
                })
                .catch(error => {
                    setErrorText(error);
                });
        }
    });
    $('#teacherBox').change(function (event) {
        //change student box to null
        if ($(this).prop('checked')) {
            $('#studentBox').prop('checked', false);
        }
    });
    $('#studentBox').change(function (event) {
        //change student box to null
        if ($(this).prop('checked')) {
            $('#teacherBox').prop('checked', false);
        }
    });
});
var setErrorText = function (text) {
    document.getElementById("errorText").innerText = text;
    if (text == "") {
        document.getElementById("error").style.visibility = "hidden";
    } else {
        document.getElementById("error").style.visibility = "visible";
    }
};