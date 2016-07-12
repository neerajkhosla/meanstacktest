// app/routes/index.js
'use strict';
var path = require('path');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
// User Schema
var User = mongoose.model('User', {login: String,password: String,fname: String,lname: String,email: String});
// Course Schema
var Course = mongoose.model('Course', {login: String,password: String,email: String,gender: String,address: String});

// Request custom attribute to check is user logged in 
var isLogin = function (req, res, next) {
    if (req.session.user)
        return next();
    res.redirect('/');
}

// Load the first login page
router.get('/', function (req, res) {
    if (req.session.user)
        res.redirect('/course');
    else
        res.sendFile(path.resolve('public/views/login.html'));
});

// login method
router.post('/api/users', function (req, res) {
    User.findOne({ login: req.body.login, password: req.body.password }, function (err, usr) {
        if (usr) {
            req.session.user = usr;
        }
        res.send(usr);
    });
});
// Redirect to login page
router.get('/course', isLogin, function (req, res, next) {
    res.sendFile(path.resolve('public/views/index.html'));
});
// logout method for user
router.get('/api/logoutUser', isLogin, function (req, res, next) {
    req.session.destroy();
    res.sendFile(path.resolve('public/views/login.html'));
});
// Get the list of courses against logged in user
router.get('/api/courses', isLogin, function (req, res) {
    Course.find({ users: req.session.user.login }, function (err, crs) {
        res.send({ "mycourses": crs, "name": req.session.user.fname + ' ' + req.session.user.lname });
    });
});

module.exports = router;