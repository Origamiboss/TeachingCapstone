var express = require('express');
var router = express.Router();
var dbUtils = require('../utils/dbUtils'); // Use relative path to your dbUtils

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('assignmentEditor', { title: 'Assignment Editor', assignmentId: req.session.assignId, assignmentName: req.session.assignName });
});