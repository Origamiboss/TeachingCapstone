var express = require('express');
var router = express.Router();
var dbUtils = require('../utils/dbUtils');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('gradeView', { title: 'Grades', assignName: req.session.assignName });
});
router.post('/getGrades', async (req, res) => {
    const assignId = req.session.assignId;

    try {
        const result = await dbUtils.getGrades(assignId);

        if (result) {
            return res.json({ status: 'success', message: 'Assignment Found', grades: result });
        } else {
            return res.status(400).json({ error: 'Invalid Assignment' });
        }
    } catch (error) {
        console.error("Error during grade gathering process:", error);
        return res.status(500).json({ error: 'Invalid Assignment' });
    }
});
module.exports = router;