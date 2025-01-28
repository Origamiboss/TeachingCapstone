window.onload = function () {
    var container = document.getElementById('questionHolder');


    fetch('/assignmentEditor/getQuestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Handle error
                console.log(data.error);
            } else {
                var questions = data.questions;
                var answers = data.answers;
                console.log(questions);
                console.log(answers);

                // Generate questions and answers dynamically
                for (let i = 0; i < questions.length; i++) {
                    generateQuestion(questions[i].num, questions[i], answers.filter(a => a.num === questions[i].num));
                }
            }
        })
        .catch(error => {
            // Handle fetch error
            console.log(error);
        });

    console.log("Everything is loaded!");
};
// Generate questions and answers dynamically
function generateQuestion(questionNum, question, answers) {
    var container = document.getElementById('questionHolder');

    // Create question element
    var questionElement = document.createElement('div');
    questionElement.classList.add('question');

    var questionNumPrompt = document.createElement('input');
    questionNumPrompt.type = 'number';
    questionNumPrompt.classList.add('questionNumPrompt');
    questionNumPrompt.value = questionNum;

    var questionPrompt = document.createElement('input');
    questionPrompt.type = 'text';
    questionPrompt.value = question.prompt;
    questionPrompt.classList.add('questionPrompt');

    //create a remove button for the question
    var removeQuestion = document.createElement('button');
    removeQuestion.innerHTML = 'Remove';
    removeQuestion.addEventListener('click', function () {
        container.removeChild(questionElement);
    });

    questionElement.appendChild(questionNumPrompt);
    questionElement.appendChild(questionPrompt);
    questionElement.appendChild(removeQuestion);

    // Create answers for the question
    var answersList = document.createElement('div');
    answers.forEach(answer => {
        var correct = false;

        if (question.correctAnswer === answer.prompt) {
            correct = true;
        } else {
            correct = false;
        }
        generateAnswer(answersList, answer.prompt, correct);
    });
    var addAnswer = document.createElement('button');
    addAnswer.innerHTML = "Add Answer";
    addAnswer.addEventListener('click', function () {
        generateAnswer(answersList, "Type Answer");
    });

    questionElement.appendChild(answersList);
    questionElement.appendChild(addAnswer);
    container.appendChild(questionElement);
}
function generateAnswer(answersList, text, correct) {
    var answerHolder = document.createElement('div');
    var answerItem = document.createElement('input');
    answerItem.type = "text";
    answerItem.value = text;  // Assuming answer has a prompt field
    answerItem.classList.add('answerPrompt');

    var removeAnswer = document.createElement('button');
    removeAnswer.innerHTML = "-";
    //remove answer
    removeAnswer.addEventListener('click', function () {
        answersList.removeChild(answerHolder);
    });
    //add the answer
    var correctAnswerBox = document.createElement('input');
    correctAnswerBox.type = "checkbox";
    correctAnswerBox.checked = correct;
    correctAnswerBox.classList.add('correctBox');

    answerHolder.appendChild(removeAnswer);
    answerHolder.appendChild(answerItem);
    answerHolder.appendChild(correctAnswerBox);

    answersList.appendChild(answerHolder);
}
function submitQuestions() {
    // Select all question containers
    var questionContainers = document.querySelectorAll('.question');
    let questions = [];

    // Loop through each question container
    questionContainers.forEach(function (questionContainer) {
        // Get the value of the number input (e.g., question number)
        var questionNum = questionContainer.querySelector('.questionNumPrompt').value;

        // Get the value of the text input (e.g., question prompt)
        var questionPrompt = questionContainer.querySelector('.questionPrompt').value;

        // Ensure the question number and prompt are not empty before proceeding
        if (!questionNum || !questionPrompt) {
            alert('Please fill out both the question number and prompt.');
            return; // Stop the function if invalid data is found
        }

        // Get all the answer sections (the divs containing the answer inputs)
        var answerDivs = questionContainer.querySelectorAll('.question > div > div');  // Select each answer section

        // Loop through the answer sections and get the values of the inputs
        var answers = Array.from(answerDivs).map(function (div) {
            var answerText = div.querySelector('.answerPrompt').value;  // Answer text
            var isCorrect = div.querySelector('.correctBox').checked;  // Whether this answer is correct

            // Skip answers that don't have text
            if (!answerText) {
                return null; // We can filter out null answers later
            }

            return { answerText, isCorrect };  // Return an object containing the answer text and correctness
        }).filter(answer => answer !== null); // Filter out null answers

        // Only add the question to the array if it has valid answers
        if (answers.length > 0) {
            questions.push({ questionNum, questionPrompt, answers });
        } else {
            alert('Please provide at least one answer for each question.');
            return; // Stop the function if no valid answers are found
        }
    });

    // Ensure there are questions to send
    if (questions.length === 0) {
        alert('No valid questions to submit.');
        return;
    }

    // Send questions to the server
    fetch('/assignmentEditor/submitQuestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questions })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Handle error
                alert(data.error);
            } else {
                // Success
                window.location.href = '/mainPage'; // Redirect on success
            }
        })
        .catch(error => {
            // Handle fetch error
            alert('An error occurred: ' + error);
        });
}
function aiPanelToggle() {
    var popup = document.getElementById("aiPanelOverlay");
    popup.classList.toggle("show");
}
function generateQuestions() {
    try {
        // Get the file input element
        const fileInput = document.querySelector('input[name="pdf"]');

        if (!fileInput.files.length) {
            throw Error('Please select a PDF file.');
        }

        const file = fileInput.files[0];

        // Validate the file
        if (file.type !== 'application/pdf') {
            throw Error('Only PDF files are allowed.');
        }

        if (file.size > 5 * 1024 * 1024) {
            throw Error('File must be less than 5MB.');
        }

        // Create FormData and append the file
        const formData = new FormData();
        formData.append('pdf', file);

        // Get other form data
        const numOfQuestions = document.getElementById("numOfQuestions").value;
        const prompt = document.getElementById("aiInput").value;

        // Append other form data to FormData
        formData.append('numOfQuestions', numOfQuestions);
        formData.append('prompt', prompt);

        // Send data to the server
        fetch('/assignmentEditor/generateQuestions', {
            method: 'POST',
            body: formData  // Send as FormData (no need to set Content-Type)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'error') {
                    alert(data.message);
                } else {
                    console.log(data.questions); // Handle success
                    var questions = data.questions;
                    // Generate questions and answers dynamically
                    for (let i = 0; i < questions.length; i++) {
                        generateQuestion(questions[i].num, questions[i], questions[i].answers);
                    }
                }
            })
            .catch(error => {
                alert('An error occurred: ' + error);
            });
    } catch (error) {
        console.error(error);
        const errorText = document.getElementById("errorText").innerHTML = error;
    }
}