const { HfInference } = require('@huggingface/inference');
const hf = new HfInference('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');

const AIScript = {
    generateQuestions: async (numOfQuestions, prompt) => {
        // Construct the input for the AI model
        const questionSetup = `
Generate ${numOfQuestions} multiple-choice questions about "${prompt}" in the following JSON format:
{ "prompt": "What is the quadratic formula?", "correct_answer": "x = (-b ± √(b² - 4ac)) / 2a", "possible_answers": ["x = (b ± √(b² - 4ac)) / 2a", "x = (-b ± √(b² - 4ac)) / 2a", "x = (-b ± √(b² - 4ac)) / a", "x = (-b ± √(b² - 4ac)) / (2a)"] }
Generate questions that are simple and easy to understand.
`;
        const requirements = "Please make them suitable for children with dyslexia.";

        // Call the Hugging Face API
        const result = await hf.textGeneration({
            model: 'google/flan-t5-large', // Upgrade for better outputs
            inputs: questionSetup + requirements,
            parameters: { max_new_tokens: 200 },
        });

        const questions = [];
        try {
            console.log("Generated text:", result.generated_text);
            const lines = result.generated_text.split('\n'); // Assuming questions are separated by new lines

            lines.forEach((line, index) => {
                try {
                    const jsonLine = JSON.parse(line.trim()); // Attempt JSON parsing
                    questions.push({
                        num: index + 1,
                        prompt: jsonLine.prompt,
                        correctAnswer: jsonLine.correct_answer,
                        answers: jsonLine.possible_answers,
                    });
                } catch (err) {
                    console.warn("Skipping invalid line:", line);
                }
            });
        } catch (error) {
            console.error("Error parsing AI response:", error.message);
        }
        console.log("Parsed questions:", questions);
        return questions;
    },
};



module.exports = AIScript;
