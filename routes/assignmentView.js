var express = require('express');
var router = express.Router();
var dbUtils = require('../utils/dbUtils'); // Use relative path to your dbUtils

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('assignmentView', { title: 'Assignment View', assignmentId: req.session.assignId, assignmentName: req.session.assignName});
});

router.post('/getQuestions', async function (req, res, next) {
    try {
        const assignId = req.session.assignId;

        // Wait for the result of findQuestions using await
        const { questions, answers } = await dbUtils.findQuestions(assignId);

        // Send the result back to the client
        return res.json({ status: 'success', questions, answers });
    } catch (err) {
        // If an error occurs, send an error response
        console.error(err);
        return res.json({ status: 'error', message: err });
    }
});
router.post('/submitAnswers', async function (req, res, next) {
    try {
        // Get the answers array from the request body
        const answersArray = req.body.answersArray;
        console.log("Received answersArray:", answersArray);

        // Convert it back into a Map (optional)
        const answers = new Map(answersArray);
        console.log("Converted Map:", answers);

        // Get session information
        const username = req.session.username;
        const assignId = req.session.assignId;

        // Await the result of submitAnswers function
        const grade = await dbUtils.submitAnswers(answers, username, assignId);
        console.log("Calculated grade:", grade);

        // Return the result
        return res.json({ status: 'success', grade: grade });
    } catch (err) {
        // If an error occurs, send an error response
        console.error("Error submitting answers:", err);
        return res.json({ status: 'error', message: err.message });
    }
});

module.exports = router;