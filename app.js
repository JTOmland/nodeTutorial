var express = require('express');
var passport = require('passport');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index')(passport);
var users = require('./routes/users');
var apiController = require('./controllers/apiController');
var logs = require('./controllers/logging');
var table = require('./database/tableCreate');
var query = require('./database/query.js');
var hand = {};
var app = express();
var session = require('express-session');
var flash = require('connect-flash');
var mongoose = require('mongoose');
var configDB = require('./config/database.js');


var promise = mongoose.connect('mongodb://jeffomland:einstein@ds023560.mlab.com:23560/iceman', {
  useMongoClient: true,
});

promise.then(function(db){
  db.model();
});

//mongoose.connect('configDB');

require('./config/passport')(passport); //pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

//passport
app.use(session({
  secret: 'iamtheapostatelegond',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());



app.all('/*', function (req, res, next) {
  logs.log('debug', req.url + ' in app.js app.all');
  logs.log('debug', 'this is the body of the req', req.body)
  //table.createUsers();
  //table.createCodedHands();
  next();
});
logs.log('debug', 'Just prior to call')

app.use('/', index);
app.use('/users', users);
apiController(app);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  logs.log('debug', req + 'catch 404');
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  logs.log('debug', req + ' in error handler' + err.message);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
