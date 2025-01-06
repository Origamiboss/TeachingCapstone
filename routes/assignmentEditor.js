var express = require('express');
var router = express.Router();
var dbUtils = require('../utils/dbUtils'); // Use relative path to your dbUtils

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('assignmentEditor', { title: 'Assignment Editor', assignmentId: req.session.assignId, assignmentName: req.session.assignName });
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
router.post('/submitQuestions', async function (req, res, next) {
    try {
        const questions = req.body.questions;

        const assignId = req.session.assignId;
        //send the message to dbUtils
        await dbUtils.submitQuestions(questions, assignId);

        return res.json({ status: 'success', questions});
    } catch (err) {
        console.error(err);
        return res.json({ status: 'error', message: err });
    }
});

module.exports = router;