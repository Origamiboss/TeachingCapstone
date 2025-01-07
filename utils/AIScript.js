const axios = require('axios');

const AIScript = {
    generateQuestions: async (numOfQuestions, prompt) => {
        const postData = {
            prompt: `Generate ${numOfQuestions} questions based on the following prompt: ${prompt}`,
            max_tokens: 100, // Adjust as needed to ensure the response is sufficiently long
            n: 1,  // Return 1 response
            stop: ["\n"] // Optional: stop generation at the end of each question
        };
        const key = 'Test';
        try {
            const response = await axios.post('https://api.openai.com/v1/completions', postData, {
                headers: {
                    Authorization: `Bearer ${key}`, // Proper format for OpenAI API
                    'Content-Type': 'application/json',
                },
            });
            const questions = response.data.choices[0].text.trim().split('\n');
            return questions;
        } catch (error) {
            console.error('Error:', error.message || error);
            return []; // Return an empty array or a default value
        }

    }
}

module.exports = AIScript;
