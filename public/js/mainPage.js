//set up the role
var role = `${role}`;
var globalClassName = `${globalClassName}`;
console.log(role);

//Auto select a class
window.onload = function () {
    console.log(globalClassName);
    resetPage();
}
function resetPage() {
    if (globalClassName == "") {
        //Make sure they know that no class is selected
        var container = document.getElementById("assignmentHolder");
        container.innerHTML = 'No Class Selected';
    } else {
        //select the class
        selectClass(globalClassName, true);
    }
}
function logOut() {
    fetch('/mainPage/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Handle error
                console.log("Error can't log out");
            } else {
                //success
                window.location.href = '/';
            }
        });
}
function findClass() {
    var popup = document.getElementById("changeClassOverlay");
    popup.classList.toggle("show");
    // Fill it up with classes
    const container = document.getElementById('classHolder');
    container.innerHTML = '';  // Clear any previous buttons
    // Send the data to the server via a POST request
    fetch('/mainPage/findClasses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Handle error
                let errorText = document.createElement('p');
                errorText.innerHTML = data.error;
                container.appendChild(errorText);
            } else {
                // Successful response
                const classNames = data.classes;

                if (classNames.length === 0) {
                    // Handle case where no classes are returned
                    let noClassesMessage = document.createElement('p');
                    noClassesMessage.innerHTML = 'No classes found';
                    container.appendChild(noClassesMessage);
                } else {
                    // Create buttons for each class
                    for (let i = 0; i < classNames.length; i++) {
                        let button = document.createElement('button');
                        button.innerHTML = classNames[i];
                        button.classList.add("btn-class");
                        button.onclick = function () {
                            selectClass(classNames[i], true);
                            //set class id for the selected class if your a teacher
                            if (role === "teacher") {
                                const ids = data.ids;
                                document.getElementById("classIdDisplay").innerHTML = "Class ID: " + ids[i];
                            }
                            togglePopupChange();
                        };
                        container.appendChild(button);
                    }
                }
            }
        })
        .catch(error => {
            // Handle fetch error
            let errorText = document.createElement('p');
            errorText.innerHTML = error;
            container.appendChild(errorText);
        });
}
function togglePopup() {
    if (role == 'student') {
        var popup = document.getElementById("addClassOverlay");
        popup.classList.toggle("show");
    } else if (role == 'teacher') {
        var popup = document.getElementById("createClassOverlay");
        popup.classList.toggle("show");
    }
}
function togglePopupChange() {
    var popup = document.getElementById("changeClassOverlay");
    popup.classList.toggle("show");
}
function createClass() {
    //create a class with the information in classIdInput and classNameInput
    var className = $('#classNameInput').val();

    // Send the data to the server via a POST request
    fetch('/mainPage/addClass', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ className })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Handle error
                let errorText = document.getElementById("errorText");
                errorText.innerHTML = data.error;
            } else {
                // Successful response
                console.log(data.classes);
                togglePopup();
            }
        })
        .catch(error => {
            // Handle fetch error
            let errorText = document.getElementById("errorText");
            errorText.innerHTML = error;
        });

}
function addClass() {
    var classId = $('#classIdInput').val();
    //add the class to the database
    fetch('/mainPage/addClassConnection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Handle error
                let errorText = document.getElementById("errorText");
                errorText.innerHTML = data.error;
            } else {
                // Successful response
                console.log(data.classes);
                togglePopup();
            }
        })
        .catch(error => {
            // Handle fetch error
            let errorText = document.getElementById("errorText");
            errorText.innerHTML = error;
        });
}
function selectClass(className, preventDefault = false) {
    if (preventDefault) {
        event.preventDefault();
    }
    globalClassName = className;
    fetch('/mainPage/findAssignments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ className })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Handle error
                console.log(data.error);
            } else {
                // Successful response
                //find assignments
                const assignments = data.assignments;
                var container = document.getElementById("assignmentHolder");
                container.innerHTML = '';

                //add the headers
                var row = document.createElement('tr');
                if (role === "teacher") {
                    const headers = ["Assignment Name", "Due Date", "Edit", "See Grades"];
                    headers.forEach(text => {
                        const th = document.createElement('th');
                        th.textContent = text; // Use textContent instead of innerHTML for safety
                        row.appendChild(th);
                    });
                } else {
                    const headers = ["Assignment Name", "Due Date", "Grades"];
                    headers.forEach(text => {
                        const th = document.createElement('th');
                        th.textContent = text; // Use textContent instead of innerHTML for safety
                        row.appendChild(th);
                    });
                }
                container.appendChild(row);

                if (assignments.length === 0) {
                    const holder = document.createElement('tr');
                    let noAssignmentsMessage = document.createElement('td');
                    holder.appendChild(noAssignmentsMessage);
                    noAssignmentsMessage.innerHTML = 'No assignments found';
                    container.appendChild(holder);
                } else {
                    for (let i = 0; i < assignments.length; i++) {
                        //create the row
                        const holder = document.createElement('tr');

                        const assignmentButton = document.createElement('td');
                        let button = document.createElement('button');
                        button.classList.add("btn-assignment");
                        if (role == 'student') {
                            button.innerHTML = assignments[i].name;
                            assignmentButton.appendChild(button);
                            holder.appendChild(assignmentButton);

                            //add the due date
                            let td = document.createElement('td');
                            td.textContent = assignments[i].dueDate; // Use textContent instead of innerHTML for safety
                            holder.appendChild(td);
                            //add the grade
                            td = document.createElement('td');
                            td.textContent = assignments[i].grade; // Use textContent instead of innerHTML for safety
                            holder.appendChild(td);


                        } else if (role == 'teacher') {
                            button.innerHTML = assignments[i].name;
                            assignmentButton.appendChild(button);
                            holder.appendChild(assignmentButton);

                            const editButton = document.createElement('td');

                            //add the due date
                            let td = document.createElement('td');
                            td.textContent = assignments[i].dueDate; // Use textContent instead of innerHTML for safety
                            holder.appendChild(td);

                            //make the edit assignment button
                            let newbutton = document.createElement('button');
                            newbutton.classList.add("btn-assignment");
                            newbutton.innerHTML = "Edit";

                            editButton.appendChild(newbutton);
                            holder.appendChild(editButton);
                            newbutton.onclick = function () {
                                toggleEditAssignment(assignments[i].id, assignments[i].name, assignments[i].dueDate);
                            }

                            //see grades button
                            const gradeButton = document.createElement('td');
                            let newestbutton = document.createElement('button');
                            newestbutton.classList.add("btn-assignment");
                            newestbutton.innerHTML = "Grades";

                            gradeButton.appendChild(newestbutton);
                            holder.appendChild(gradeButton);
                            newestbutton.onclick = function () {
                                seeGrades(assignments[i].id, assignments[i].name);
                            }
                        }

                        button.onclick = function () {
                            if (role == 'student') {
                                fetch('/mainPage/goToAssignment', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ assignId: assignments[i].id, assignName: assignments[i].name })
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.error) {
                                            console.log(data.error);
                                        } else {
                                            window.location.href = '/assignmentView';
                                        }
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                            }

                            // Teacher-specific logic can be handled here
                            else if (role == 'teacher') {
                                // Handle teacher-specific logic if needed
                                fetch('/mainPage/goToAssignment', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ assignId: assignments[i].id, assignName: assignments[i].name })
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.error) {
                                            console.log(data.error);
                                        } else {
                                            window.location.href = '/assignmentEditor';
                                        }
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                            }
                        };

                        container.appendChild(holder);
                    }


                }
            }
        })
        .catch(error => {
            console.log(error);
        });
}
function toggleCreateAssignment() {
    //no assignment passed

    var popup = document.getElementById("CreateAssignmentOverlay");
    popup.classList.toggle("show");

    //reset the values
    document.getElementById("assignmentName").value = null;
    document.getElementById("assignmentDueDate").value = null;

    document.getElementById("createAssignmentButton").onclick = function () {
        assignName = document.getElementById("assignmentName").value;
        assignDate = document.getElementById("assignmentDueDate").value;
        createAssignment(assignName, assignDate); // Call createAssignment when the button is clicked
    };

}
function toggleEditAssignment(assignId, assignName, assignDate) {
    //toggle the edit assignment
    var popup = document.getElementById("EditAssignmentOverlay");
    popup.classList.toggle("show");
    //fill the information of the assignment
    document.getElementById("assignmentId2").value = assignId;
    document.getElementById("assignmentName2").value = assignName;
    document.getElementById("assignmentDueDate2").value = assignDate;

    document.getElementById("createAssignmentButton2").onclick = function () {
        assignId = document.getElementById("assignmentId2").value;
        assignName = document.getElementById("assignmentName2").value;
        assignDate = document.getElementById("assignmentDueDate2").value;
        editAssignment(assignId, assignName, assignDate); // Call editAssignment with the correct data
    };
}
function createAssignment(assignName, dueDate) {
    console.log("Create assignment");
    //create assignment
    fetch('/mainPage/makeAssignment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ className: globalClassName, assignName: assignName, dueDate: dueDate })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                window.location.href = '/assignmentEditor';
            }
        })
        .catch(error => {
            console.log(error);
        });
}
function editAssignment(assignId, assignName, dueDate) {
    //edit assignment
    fetch('/mainPage/editAssignment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ className: globalClassName, assignId: assignId, assignName: assignName, dueDate: dueDate })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                //update the class view
                selectClass(globalClassName);
                //close the panel
                toggleEditAssignment();
            }
        })
        .catch(error => {
            console.log(error);
        });

}
function removeAssignment() {
    //remove an assignment
    assignId = document.getElementById("assignmentId2").value;
    fetch('/mainPage/removeAssignment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignId: assignId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                //update the class view
                selectClass(globalClassName);
                //close the panel
                toggleEditAssignment();
            }
        })
        .catch(error => {
            console.log(error);
        });
}
function seeGrades(assignId, assignName) {
    fetch('/mainPage/seeGrades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignId: assignId, assignName: assignName })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                //go to the gradeView
                window.location.href = "/gradeView";
            }
        })
        .catch(error => {
            console.log(error);
        });
}
function removeClass() {
    if (globalClassName != "") {
        //delete the class
        fetch('/mainPage/deleteClass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ className: globalClassName })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.log(data.error);
                } else {
                    //remove class stats
                    globalClassName = "";
                    resetPage();
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
}