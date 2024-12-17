var express = require('express');
var router = express.Router();
var dbUtils = require('../utils/dbUtils'); // Use relative path to your dbUtils

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('login', { title: 'Login' });
});

router.post('/login-click', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await dbUtils.login(username, password);

        if (result && result.username) {
            //set the username and role
            req.session.username = result.username;
            req.session.role = result.role;
            return res.json({ status: 'success', message: 'Login successful!', user: result });
        } else {
            return res.status(400).json({ error: 'Invalid Username or Password' });
        }
    } catch (error) {
        console.error("Error during login process:", error);
        return res.status(500).json({ error: 'Invalid Username or Password' });
    }
});


module.exports = router;
