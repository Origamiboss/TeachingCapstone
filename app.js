try {
    var createError = require('http-errors');
    var express = require('express');
    var session = require('express-session');
    var path = require('path');
    var cookieParser = require('cookie-parser');
    var logger = require('morgan');
    var favicon = require('serve-favicon');
} catch (error) {
    console.error("Error during initialization:", error);
}

var frontPageRouter = require('./routes/frontPage');
var loginRouter = require('./routes/login');
var signUpRouter = require('./routes/signUp');
var mainPageRouter = require('./routes/mainPage');
var assignmentViewerRouter = require('./routes/assignmentView');
var assignmentEditorRouter = require('./routes/assignmentEditor');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body parsing middleware
app.use(express.json());  // For parsing application/json
app.use(express.urlencoded({ extended: true }));  // For parsing application/x-www-form-urlencoded
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));


//set up cookies
app.use(session({
    secret: 'your-secret-key', // Use a strong secret here
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to `true` if using HTTPS
}));


app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', frontPageRouter);  // Handles the root URL
app.use('/login', loginRouter);  // Handles login page and login POST
app.use('/signUp', signUpRouter);
app.use('/mainPage', mainPageRouter);
app.use('/assignmentView', assignmentViewerRouter);
app.use('/assignmentEditor', assignmentEditorRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    console.error("Server Error: ", err);  // Log the error for debugging
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error', { title: 'Error' });
});

// Set up server to listen on a port
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server listening on port ' + port);
});

module.exports = app;
