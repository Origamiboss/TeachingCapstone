var express = require('express');
var router = express.Router();
var dbUtils = require('../utils/dbUtils'); // Use relative path to your dbUtils

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('signUp', { title: 'Create Account' });
});

router.post('/createAccount-click', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const result = await dbUtils.createAccount(username, password, role);

        if (result && result.username) {
            //set the username and role
            req.session.username = result.username;
            req.session.role = result.role;
            return res.json({ status: 'success', message: 'Account Creation successful!', user: result });
        } else {
            return res.status(400).json({ error: 'Username already taken' });
        }
    } catch (error) {
        console.error("Error during login process:", error);
        return res.status(500).json({ error: 'Username already taken' });
    }
});


module.exports = router;
