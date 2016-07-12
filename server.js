// server.js
'use strict';

/******************** dependencies ********************/
var express = require('express');
var router = express.Router();
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
/******************** configuration ********************/

var mongoose = require('mongoose');
var dbConfig = require('./config/db');

// Connect Mongo DB with mongoose
mongoose.connect(dbConfig.url);

// set env port
var port = process.env.PORT || 8080;

// set the session secret key
app.use(session({ secret: 'sgdayasd36adasd6astd763e237tgady' }));
// get POST parameters
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true  }));

// set static files location
// /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

/******************** routes ********************/
var routes = require('./app/routes/index');
app.use('/', routes);

/******************** start app ********************/
app.listen(port);
console.log('Launched app on port %s', port);
