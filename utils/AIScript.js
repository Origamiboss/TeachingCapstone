const { HfInference } = require('@huggingface/inference');
const hf = new HfInference('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');
const { OpenAI } = require("openai");


const pdfParse = require('pdf-parse');
const fs = require('fs');

const openai = new OpenAI({
    apiKey: "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",
});

const AIScript = {
    generateQuestions: async (numOfQuestions, prompt, file) => {
        // Save the uploaded PDF file temporarily
        const filePath = `uploads/${file.filename}`;

        // Read the PDF file and extract text using pdf-parse
        const pdfData = fs.readFileSync(filePath);
        const data = await pdfParse(pdfData);
        const pdfText = data.text;

        console.log("Extracted PDF Text:", pdfText);
        //our questions
        var generatedQuestions = [];

        try {
            // Combine the prompt and extracted text into a single string for the model
            const combinedInput = `Generate ${numOfQuestions} questions on this information (${pdfText}) in JSON format with {question: , correctAnswer: , wrongAnswers: }, One correct answer and Three wrong answers. ${prompt}`;

            
            // Ping OpenAI
            const promptResult = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                store: true,
                messages: [
                    { "role": "user", "content": combinedInput },
                ],
            });

            // Log the API response for debugging
            console.log("API Response:", promptResult);

            // Extract the response text (this may not be JSON but plain text)
            const responseText = promptResult.choices[0].message.content.trim();

            // Look for the JSON content after the "```json" part (if it exists)
            const jsonStart = responseText.indexOf("```json");
            const jsonEnd = responseText.indexOf("```", jsonStart + 7);

            if (jsonStart !== -1 && jsonEnd !== -1) {
                // Extract the JSON part from the response text
                const jsonString = responseText.slice(jsonStart + 7, jsonEnd).trim();

                // Check if the extracted string is valid JSON
                let questions = [];
                try {
                    // Parse the extracted JSON string
                    questions = JSON.parse(jsonString);
                    console.log("Raw JSON String:", jsonString);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    console.log("Raw JSON String:", jsonString);
                }

                // Initialize the generatedQuestions array
                let generatedQuestions = [];

                // Process the parsed questions
                for (let i = 0; i < questions.length; i++) {
                    // Combine the correct answer with the wrong answers
                    let allAnswers = [
                        { prompt: questions[i].correctAnswer },
                        ...questions[i].wrongAnswers.map(answer => ({ prompt: answer }))
                    ];


                    // Shuffle the answers randomly
                    allAnswers = shuffle(allAnswers);

                    // Push the question with shuffled answers into the generatedQuestions array
                    generatedQuestions.push({
                        num: i + 1,
                        prompt: questions[i].question, // Use the first generated question
                        correctAnswer: questions[i].correctAnswer, // Correct answer
                        answers: allAnswers, // Array of answers (correct + wrong, shuffled)
                    });
                }

                // Return or log the generated questions
                console.log("Generated Questions:", generatedQuestions);
                return generatedQuestions;
            } else {
                console.error("No JSON found in the response text.");
                return [];
            }

        } catch (error) {
            console.error("Error generating questions:", error);
            throw new Error("An error occurred while generating questions.");
        }
        return generatedQuestions; // Return the generated questions
    },

    
};

// Fisher-Yates shuffle function to randomize array elements
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

module.exports = AIScript;

