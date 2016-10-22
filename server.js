// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 9000;
var mongoose = require('mongoose');

var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// configuration ===============================================================
// mongoose.connect(configDB.db); // connect to our database

// require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

//


// routes ======================================================================
require('./app/routes/login.js')(app); // load our routes and pass in our app and fully configured passport
require('./app/routes/flockEvents.js')(app);

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);

app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.get('/liveWidget', function(req,res) {
	res.sendfile('./app/views/index.html');
})