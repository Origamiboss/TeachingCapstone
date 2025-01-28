window.onload = function () {
    fetch('/gradeView/getGrades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                setErrorText("Invalid Assignment");
                return response.json().then(data => { throw data.error || 'Something went wrong.' });
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                // Handle successful login
                console.log("Login successful!");
                //load the grades
                showGrades(data.grades);
            }
        })
        .catch(error => {
            console.log('Error:', error);
            setErrorText("Invalid Assignment");
        });
}

function setErrorText(message) {
    console.log(message);
    alert(message);
}
function showGrades(grades) {
    //make a table for all the students every row is one student
    const container = document.getElementById("container");
    grades.forEach((grade) => {
        //generate the row
        const row = document.createElement("tr");
        const nameCol = document.createElement("td");
        const gradeCol = document.createElement("td");

        nameCol.textContent = grade.profileName;
        gradeCol.textContent = grade.grade;

        row.appendChild(nameCol);
        row.appendChild(gradeCol);
        container.appendChild(row);
    });

}