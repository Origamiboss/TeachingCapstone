var express = require('express');
var router = express.Router();
var dbUtils = require('../utils/dbUtils'); // Use relative path to your dbUtils

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('mainPage', { title: 'Home', role: req.session.role });
});

// Find classes
router.post('/findClasses', async (req, res) => {
    // Get the username and role from session
    const username = req.session.username;
    const role = req.session.role;

    try {
        const result = await dbUtils.findClasses(username, role);

        if (result && result.classes) {
            return res.json({ status: 'success', classes: result.classes });
        } else {
            return res.status(400).json({ error: 'No classes found' });
        }
    } catch (error) {
        console.error('Error finding classes:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Add class connection (for students to join a class)
router.post('/addClassConnection', async (req, res) => {
    const { classId } = req.body;
    const username = req.session.username;

    try {
        const result = await dbUtils.addClassConnection(username, classId);

        if (result && result.message) {
            return res.json({ status: 'success', message: result.message });
        } else {
            return res.status(400).json({ error: 'Failed to add class connection' });
        }
    } catch (error) {
        console.error('Error adding class connection:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Add a new class (for teachers)
router.post('/addClass', async (req, res) => {
    if (req.session.role === 'teacher') {
        const { classId, className } = req.body;

        try {
            const result = await dbUtils.addClass(classId, className);

            if (result && result.status === 'success') {
                return res.json({ status: 'success', message: result.message });
            } else {
                return res.status(400).json({ error: 'Failed to add class' });
            }
        } catch (error) {
            console.error('Error adding class:', error);
            return res.status(500).json({ error: error.message });
        }
    } else {
        return res.status(403).json({ error: 'Unauthorized to add class' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.json({ status: 'success', message: 'Logged out successfully!' });
    });
});

router.post('/findAssignments', async (req, res) => {
    // Get the className
    const { className } = req.body;

    try {
        const result = await dbUtils.findAssignments(className);  // `await` is used here

        if (result && result.assignments) {  // Fix variable name
            return res.json({ status: 'success', assignments: result.assignments });  // Use `result.assignments`
        } else {
            return res.status(400).json({ error: 'No assignments found' });
        }
    } catch (error) {
        console.error('Error finding assignments:', error);
        return res.status(500).json({ error: error.message });
    }
});


module.exports = router;
