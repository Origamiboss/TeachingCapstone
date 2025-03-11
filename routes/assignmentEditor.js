const express = require('express');
const multer = require('multer');
var router = express.Router();
var dbUtils = require('../utils/dbUtils'); // Use relative path to your dbUtils
var AIScript = require('../utils/AIScript');
const path = require('path');
const fs = require('fs');

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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify where to store the uploaded files
        cb(null, 'uploads/');  // You may want to create this directory
    },
    filename: function (req, file, cb) {
        // Ensure unique filenames
        cb(null, Date.now() + path.extname(file.originalname));  // Use a timestamp as filename
    }
});
//stuff for pdfs
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // Limit file size to 5MB
    fileFilter: function (req, file, cb) {
        // Only accept PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});
//generate pdf questions
router.post('/generateQuestions', upload.single('pdf'), async function (req, res, next) {
    try {
        // Extract form data
        const { numOfQuestions, prompt } = req.body;

        // Access the uploaded file via req.file
        const file = req.file;  // This will hold the uploaded file data

        if (!file) {
            return res.json({ status: 'error', message: 'No file uploaded' });
        }

        // If file and form data are valid, process the questions
        var questions = await AIScript.generateQuestions(numOfQuestions, prompt, file);  // Pass file if needed

        //remove pdf file
        const filePath = file.path; // Path to the uploaded file
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } else {
                console.log('File deleted successfully');
            }
        });
        
        return res.json({ status: 'success', questions: questions });
    } catch (err) {
        console.error(err);
        return res.json({ status: 'error', message: err.message });
    }
});
//error handling
// Multer error handling middleware
router.use(function (err, req, res, next) {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors (e.g., file size too large)
        res.status(400).json({ status: 'error', message: err.message });
    } else {
        // Other errors
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});





module.exports = router;