var express = require('express');
var router = express.Router();
var winston = require('winston');
var logger = winston.loggers.get('Standard');

/* GET home page. */
router.get('/', function(req, res, next) {
  logger.log('degug', 'index.js get /');
  res.render('index', { title: 'Express' });
});

router.get('/table', function(req, res, next) {
  res.render('partials/table');
});

router.get('/login', function(req, res, next) {
  console.log("calling login route");
  res.render('partials/index');
});

router.get('/partials/:name', function(req, res, next){
  var name = req.params.name;
  console.log("using generic get with name", name)
  res.render('partials/' + name);
})


// exports.partials = function (req, res) {
//   var name = req.params.name;
//   res.render('partials/' + name);
// };

module.exports = router;
