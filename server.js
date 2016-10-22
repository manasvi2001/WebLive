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
mongoose.connect(configDB.db); // connect to our database

// require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

//flock credentials
var flock = require('flockos');

flock.setAppId('d910233d-b87b-4648-b41d-bccdc4240b84');
flock.setAppSecret('0e2d9834-7336-451a-80f9-7962f6306ee0');

//To verify event tokens, you can either use the verifyEventToken function (this only works if have set the app secret):
//flock.verifyEventToken(token);

//middleware to verify tokens
//app.use(flock.eventTokenChecker);

app.post('/events', flock.router);

flock.events.on('app.install', function (event) {
    console.log("app.install called with->",JSON.stringify(event));
    return {
        success:true
    }
});

//


// routes ======================================================================
require('./app/routes/login.js')(app); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);

app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});