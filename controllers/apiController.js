var bodyParser = require('body-parser');
// var items = require('../models/itemModel');
// var entities = require('../models/entityModel');
// var requests = require('../models/requestModel');
// var oldAllID = require('./entityData');
//var _ = require('../public/lib/underscore');
// var errorHandler = require('./errorHandler.js');
// var list = require('../models/listModel');
var fs = require('fs');

module.exports = function(app){
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.post('/api/save', function(req, res){
        console.log("calling save /api/save post",req.body);
        var json = JSON.stringify(req.body);
        fs.writeFile('./public/data/model.json', json, 'utf8', function(err){
            if(err){
                console.log("Error writing file units.json");
                return console.error(err);
            }
        });
        res.send('Success');
    });

    app.get('/api/results', function(req, res){
        fs.readFile('./public/data/model.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
            obj = JSON.parse(data); //now it an object
            res.send(obj)
        }});

    });


}