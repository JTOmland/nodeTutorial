
module.exports = function (passport) {
  var express = require('express');
  var winston = require('winston');
  var logger = winston.loggers.get('Standard');
  var router = express.Router();


  router.get('/OpeningDialog', function(req, res) {
    res.render('OpeningDialog');
  });
  router.get('/saveHand', function(req, res) {
    res.render('saveHand');
  });

  router.get('/bid', function(req,res){
    res.render('bid');
  });

  router.get('/trump', function(req,res){
    res.render('trump');
  });

  router.get('/stayOrFold', function(req,res){
    res.render('stayOrFold');
  });

  router.get('/probabilityTable', function(req, res) {
    res.render('probabilityTable');
  });

  router.get('/dealSelector', function(req, res) {
    res.render('dealSelector');
  });

  /* GET home page. */
  router.get('/', function (req, res, next) {
    logger.log('degug', 'index.js get /');
    res.render('login', { title: 'Express' });
  });

  router.get('/table', isLoggedIn, function (req, res) {
    console.log('route /table called')
    var userVariables = {};
    userVariables.id = req.user.id;
    userVariables.nickname = req.user.local.nickname;
    //var sendBack = JSON.stringify(userVariables)
    //var myUser = {user: userVariables}
    res.render('table', {
      user: userVariables
    });
  });

  router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/table',
    failureRedirect: '/login',
    failureFlash: true
  }));

  router.get('/login', function (req, res, next) {
    res.render('login', { message: req.flash('loginMessage') });
  });

  router.get('/signup', function (req, res) {
    res.render('signup', { message: req.flash('signupMessage') });
  });

  router.post('/signup', passport.authenticate('local-signup', {

    successRedirect: '/table',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
  });

  router.get('/partials/:name', function (req, res, next) {
    var name = req.params.name;
    console.log("using generic get with name", name)
    res.render('partials/' + name);
  });

  router.get('/users', function(req, res) {
    res.json({ username : req.user.email });
  });

  function isLoggedIn(req, res, next) {
    //if user is authenticated in the session carry on
    if (req.isAuthenticated()) {
      return next();
    }
    //if they aren't redirect to login
    res.redirect('/login');
  };

  return router;
}
