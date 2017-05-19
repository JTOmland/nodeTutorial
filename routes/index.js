var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/table', function(req, res, next) {
  res.render('partials/table');
});

router.get('/demand', function(req, res, next) {
  console.log("calling demand route");
  res.render('partials/demand');
});

router.get('/partials/:name', function(req, res, next){
  var name = req.params.name;
  res.render('partials/' + name);
})


// exports.partials = function (req, res) {
//   var name = req.params.name;
//   res.render('partials/' + name);
// };

module.exports = router;
