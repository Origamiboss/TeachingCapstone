var selectedAnswers = new Map();  // Object to store selected answers
window.onload = function () {
    var container = document.getElementById('questionHolder');


    fetch('/assignmentView/getQuestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
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
                var questions = data.questions;
                var answers = data.answers;
                console.log(questions);
                console.log(answers);

                // Generate questions and answers dynamically
                for (let i = 0; i < questions.length; i++) {
                    generateQuestion(questions[i].num, questions[i].prompt, answers.filter(a => a.num === questions[i].num));
                }
            }
        })
        .catch(error => {
            // Handle fetch error
            let errorText = document.createElement('p');
            errorText.innerHTML = error;
            container.appendChild(errorText);
        });

    console.log("Everything is loaded!");
};

// Generate questions and answers dynamically
function generateQuestion(questionNum, prompt, answers) {
    var container = document.getElementById('questionHolder');

    // Create question element
    var questionElement = document.createElement('div');
    questionElement.classList.add('question');

    var questionPrompt = document.createElement('p');
    questionPrompt.innerHTML = questionNum + ". " + prompt;

    questionElement.appendChild(questionPrompt);

    // Create answers for the question
    var answersList = document.createElement('div');
    answers.forEach(answer => {
        var answerItem = document.createElement('button');
        answerItem.innerHTML = answer.prompt;  // Assuming answer has a prompt field

        // Add click event listener to toggle selection
        answerItem.addEventListener('click', function () {
            // Remove 'selected' class from all buttons in this question
            var buttons = questionElement.querySelectorAll('button');
            buttons.forEach(btn => btn.classList.remove('selected'));

            // Add 'selected' class to the clicked button
            answerItem.classList.add('selected');

            // Save the selected answer to the selectedAnswers object
            selectedAnswers.set(questionNum, answer.prompt);  // Store the selected answer for this question
        });

        answersList.appendChild(answerItem);
    });

    questionElement.appendChild(answersList);
    container.appendChild(questionElement);
}

function submitForm() {
    // Log the selected answers to the console
    console.log("Selected Answers:");
    for (let questionNum in selectedAnswers) {
        console.log(`Question ${questionNum}: ${selectedAnswers[questionNum]}`);
    }
    //send the information back to server
    //ask if they are sure they want to submit
    if (window.confirm("Are you sure you want to submit?")) {
        //submit the answers
        const answersArray = Array.from(selectedAnswers.entries());  // Convert Map to array
        fetch('/assignmentView/submitAnswers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answersArray })
        })
            .then(response => response.json())
            .then(data => {
                //if success take them to main page
                window.location.href = '/mainPage';
            })
            .catch(error => {
                // Handle fetch error
                let errorText = document.createElement('p');
                errorText.innerHTML = error;
                container.appendChild(errorText);
            });
    }
}