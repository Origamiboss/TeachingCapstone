const { HfInference } = require('@huggingface/inference');
const hf = new HfInference('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');

const pdfParse = require('pdf-parse');
const fs = require('fs');



const AIScript = {
    generateQuestions: async (numOfQuestions, prompt, file) => {
        // Save the uploaded PDF file temporarily
        const filePath = `uploads/${file.filename}`;

        // Read the PDF file and extract text using pdf-parse
        const pdfData = fs.readFileSync(filePath);
        const data = await pdfParse(pdfData);
        const pdfText = data.text;

        console.log("Extracted PDF Text:", pdfText);

        try {
            //what question are we on
            let i = 1;
            // Combine the prompt and extracted text into a single string for the model
            const combinedInput = `Prompt: ${prompt}\n\nExtracted Text: ${pdfText}\n\nGenerate a question based on the above text.`;

            // Use a more suitable model like T5 or BART
            const promptResult = await hf.textGeneration({
                model: 'google/flan-t5-large',  // Or another model like 'facebook/bart-large'
                inputs: combinedInput,
                parameters: {
                    max_new_tokens: 150,
                    temperature: 0.7,
                    top_p: 0.8,
                    top_k: 50,
                    do_sample: true
                },
            });

            // Extract the generated questions
            const questions = promptResult.generated_text.trim().split('\n').map(q => q.trim());

            console.log("Generated questions:", questions);

            //generate the correct answer
            const answerSetup = `Extracted Text: ${pdfText}\n\nGenerate a correct answer for "${questions}" in one sentence.`;
            const answerResult = await hf.textGeneration({
                model: 'google/flan-t5-large',
                inputs: answerSetup,
                parameters: {
                    max_new_tokens: 250,
                    temperature: 0.3,
                    do_sample: true
                },
            });

            console.log("Correct Answer:", answerResult.generated_text);


            // Generate wrong answers
            const wrongAnswers = [];
            const uniqueAnswersSet = new Set(); // To track unique wrong answers

            const wrongPromptModifiers = [
                'Generate a wrong answer for this question that is brief and incorrect.',
                'Give a plausible but incorrect answer to this question in one sentence.',
                'Generate an incorrect, plausible one-sentence answer to the following question.',
                'Give me a wrong answer for the question that is short and wrong.',
                'I need a wrong answer for this question that fits in one sentence.',
                'I want a wrong answer for this question that is short and difficult to spot.',
                'Generate an incorrect answer to the question that is brief and wrong.',
                'Generate a wrong, plausible one-sentence answer to the following question.',
                'I need a random statement that is short.'
            ];

            for (let j = 0; j < 3; j++) {
                let wrongAnswerResult;
                let newAnswer;

                // Retry mechanism to ensure unique wrong answers
                let attempts = 0;
                let promptModifier;

                do {
                    // Dynamically choose a different prompt modifier each time
                    promptModifier = wrongPromptModifiers[(j + attempts) % wrongPromptModifiers.length]; // Use modulo to cycle through the modifiers

                    // Set up the query with the dynamic prompt
                    const wrongAnswerSetup = `Extracted Text: ${pdfText}\n\n${promptModifier} The question is: "${questions}"`;

                    // Send the query with increased creativity (temperature 0.9)
                    wrongAnswerResult = await hf.textGeneration({
                        model: 'google/flan-t5-large',
                        inputs: wrongAnswerSetup,
                        parameters: {
                            max_new_tokens: 250,
                            temperature: .5,
                            do_sample: true
                        },
                    });

                    newAnswer = wrongAnswerResult.generated_text.trim();

                    // If answer is not unique, increase attempts
                    attempts++;

                } while (uniqueAnswersSet.has(newAnswer) && attempts < wrongPromptModifiers.length); // Retry until the answer is unique or all modifiers are used

                // Add the new unique wrong answer to the list and the Set for uniqueness
                wrongAnswers.push(newAnswer);
                uniqueAnswersSet.add(newAnswer);
            }

            console.log("Generated Wrong Answers:", wrongAnswers.join(', '));

            //compile all the information
            const answers = [];
            const rightPosition = Math.floor(Math.random() * 4);

            for (let j = 0; j < 4; j++) {
                if (j === rightPosition) {
                    answers[j] = answerResult.generated_text.trim();
                } else {
                    answers[j] = wrongAnswers.pop()?.trim() || "Placeholder wrong answer";
                }
            }

            questions.push({
                num: i + 1,
                prompt: question,
                correctAnswer: answerResult.generated_text.trim(),
                answers: answers,
            });


            return questions; // Return the generated questions
        } catch (err) {
            console.error("Error generating questions:", err.message);
            throw new Error("An error occurred while generating questions.");
        }
    },

    /*generateQuestions: async (numOfQuestions, prompt, file) => {
        const questions = [];
        for (let i = 0; i < numOfQuestions; i++) {
            //generate the questions based on these templates
            const questionModifiers = [
                'Generate a simple introductory question about',
                'Create a complex and thought-provoking question on',
                'Make a question about',
                'Generate a multiple-choice style question about',
            ];

            const endingMarker = [
                'Make the question difficult.',
                'Make the question simple.',
                'Make the question easy',
                'Make the question hard',
            ];
            //randomly select a question Modifier
            const questionModifier = questionModifiers[Math.floor(Math.random() * questionModifiers.length)];
            const questionSetup = questionModifier + ` "${prompt}". ` + endingMarker[Math.floor(Math.random() * endingMarker.length)];
            console.log("Initial Prompt: " + questionSetup);

            try {
                // Generate the question and increase the temperature to .7 for creativity
                const promptResult = await hf.textGeneration({
                    model: 'google/flan-t5-large',
                    inputs: questionSetup,
                    parameters: {
                        max_new_tokens: 250,
                        temperature: 0.7,
                        top_p: 0.8,
                        top_k: 50,
                        do_sample: true
                    },
                });
                // generated text
                var question = promptResult.generated_text.trim();

                console.log("Generated question:", question);

                // Generate the correct answer
                const answerSetup = `Generate a correct answer for "${question}" in one sentence.`;
                const answerResult = await hf.textGeneration({
                    model: 'google/flan-t5-large',
                    inputs: answerSetup,
                    parameters: {
                        max_new_tokens: 250,
                        temperature: 0.3,
                        do_sample: true
                    },
                });
                console.log("Generated answer:", answerResult.generated_text);

                // Generate wrong answers
                const wrongAnswers = [];
                const uniqueAnswersSet = new Set(); // To track unique wrong answers

                const wrongPromptModifiers = [
                    'Generate a wrong answer for this question that is brief and incorrect.',
                    'Give a plausible but incorrect answer to this question in one sentence.',
                    'Generate an incorrect, plausible one-sentence answer to the following question.',
                    'Give me a wrong answer for the question that is short and wrong.',
                    'I need a wrong answer for this question that fits in one sentence.',
                    'I want a wrong answer for this question that is short and difficult to spot.',
                    'Generate an incorrect answer to the question that is brief and wrong.',
                    'Generate a wrong, plausible one-sentence answer to the following question.',
                    'I need a random statement that is short.'
                ];

                for (let j = 0; j < 3; j++) {
                    let wrongAnswerResult;
                    let newAnswer;

                    // Retry mechanism to ensure unique wrong answers
                    let attempts = 0;
                    let promptModifier;

                    do {
                        // Dynamically choose a different prompt modifier each time
                        promptModifier = wrongPromptModifiers[(j + attempts) % wrongPromptModifiers.length]; // Use modulo to cycle through the modifiers

                        // Set up the query with the dynamic prompt
                        const wrongAnswerSetup = `${promptModifier} The question is: "${question}"`;

                        // Send the query with increased creativity (temperature 0.9)
                        wrongAnswerResult = await hf.textGeneration({
                            model: 'google/flan-t5-large',
                            inputs: wrongAnswerSetup,
                            parameters: {
                                max_new_tokens: 250,
                                temperature: .5,
                                do_sample: true
                            },
                        });

                        newAnswer = wrongAnswerResult.generated_text.trim();

                        // If answer is not unique, increase attempts
                        attempts++;

                    } while (uniqueAnswersSet.has(newAnswer) && attempts < wrongPromptModifiers.length); // Retry until the answer is unique or all modifiers are used

                    // Add the new unique wrong answer to the list and the Set for uniqueness
                    wrongAnswers.push(newAnswer);
                    uniqueAnswersSet.add(newAnswer);
                }

                console.log("Generated Wrong Answers:", wrongAnswers.join(', '));




                //compile all the information
                const answers = [];
                const rightPosition = Math.floor(Math.random() * 4);

                for (let j = 0; j < 4; j++) {
                    if (j === rightPosition) {
                        answers[j] = answerResult.generated_text.trim();
                    } else {
                        answers[j] = wrongAnswers.pop()?.trim() || "Placeholder wrong answer";
                    }
                }

                questions.push({
                    num: i + 1,
                    prompt: question,
                    correctAnswer: answerResult.generated_text.trim(),
                    answers: answers,
                });
            } catch (err) {
                console.warn(`Error generating question ${i + 1}:`, err.message);
            }
        }
        return questions;
    },*/
};

module.exports = AIScript;

