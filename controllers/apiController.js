var bodyParser = require('body-parser');
// var items = require('../models/itemModel');
// var entities = require('../models/entityModel');
// var requests = require('../models/requestModel');
// var oldAllID = require('./entityData');
//var _ = require('../public/lib/underscore');
// var errorHandler = require('./errorHandler.js');
// var list = require('../models/listModel');
var fs = require('fs');
var logger = require('./logging');
logger.debugLevel = 'warn';

module.exports = function (app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post('/api/save', function (req, res) {
        logger.log('info', "calling save /api/save post");


        var codeSummary = {};
        var countSingles = 0;
        var countGreater = 0;
        var removalArray = [];
        var codeCounter = 0;

        fs.readFile('./public/data/summary.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                logger.log('error', err);
            } else {
                codeSummary = JSON.parse(data); //now it an object
                var tempC = 0;
                for(var item in codeSummary){
                    tempC++;
                };
                logger.log("warn", "********total code summary before ****");
                logger.log("warn", tempC);
                

                //now add to it new req.body data

                for (var i = 0; i < req.body.length; i++) {
                    var key = Object.keys(req.body[i]);

                    logger.log('info', "Inside for key", key)
                    logger.log('info', "req.body[i].tricks", req.body[i][key].tricksTaken)
                    logger.log('info', "req.body[i].bid", req.body[i][key].bid)
                    if (req.body[i][key].tricksTaken) {

                    } else {
                        logger.log('info', "continue no tricks");
                        continue;
                    }
                    if (key in codeSummary) {
                        logger.log('info', key, "Inside codeSummary ", codeSummary[key], " ", req.body[i][key].tricksTaken, " ", req.body[i][key].bid, codeSummary[key].max, codeSummary[key].min);
                        countGreater++;
                        codeSummary[key].total++;
                        //logger.log('info', "total after ", codeSummary[key])

                        if (req.body[i][key].tricksTaken) {
                            codeSummary[key].totalTricks += req.body[i][key].tricksTaken;
                        } else {
                            logger.log('info', "No tricks taken for ", req.body[i][key]);
                        };

                        if (req.body[i][key].bid) {
                            codeSummary[key].totalBid += req.body[i][key].bid;

                        } else {
                            logger.log('info', "No tricks taken for ", req.body[i][key]);
                        };

                        if (codeSummary[key].max && req.body[i][key].tricksTaken) {
                            if (req.body[i][key].tricksTaken > codeSummary[key].max) {
                                codeSummary[key].max = req.body[i][key].tricksTaken;
                            };
                        };

                        if (codeSummary[key].min && req.body[i][key].tricksTaken) {
                            if (req.body[i][key].tricksTaken < codeSummary[key].min) {
                                codeSummary[key].min = req.body[i][key].tricksTaken;
                            };
                        };

                        if (req.body[i][key].tricksTaken && req.body[i][key].bid) {
                            codeSummary[key].average = codeSummary[key].totalTricks / codeSummary[key].total;
                            codeSummary[key].averageBid = codeSummary[key].totalBid / codeSummary[key].total;
                        }


                    } else {
                        if (req.body[i][key].tricksTaken && req.body[i][key].bid) {
                            countSingles++;
                            codeSummary[key] = {};
                            codeSummary[key].total = 1;
                            codeSummary[key].totalTricks = req.body[i][key].tricksTaken;
                            codeSummary[key].average = req.body[i][key].tricksTaken;
                            codeSummary[key].totalBid = req.body[i][key].bid;
                            codeSummary[key].averageBid = codeSummary[key].totalBid / codeSummary[key].total;
                            codeSummary[key].average = codeSummary[key].totalTricks / codeSummary[key].total;
                            codeSummary[key].max = req.body[i][key].tricksTaken;
                            codeSummary[key].min = req.body[i][key].tricksTaken;
                        } else {
                        }
                    };
                };

                console.log('Number of singles', countSingles, ' Count multioples ', countGreater, " total ", countSingles + countGreater);
                var json = JSON.stringify(req.body);
                var json2 = JSON.stringify(codeSummary);
                logger.log('info', "before fs writefile");
                fs.writeFile('./public/data/summary.json', json2, 'utf8', function (err) {
                    logger.log('info', "return from fs")
                    if (err) {
                        logger.log('error', "Error writing file summary.json");
                        return console.error(err);
                    } else {
                        res.send('Success');
                    }
                });

            }
        });
        // logger.log('info', "just before for", req.body.length);
        // var l = req.body.length;
        // var indexToRemove = [];
        // for(var j = 0; j < l; j++){
        //      var key = Object.keys(req.body[j]);
        //      if (req.body[j][key].tricksTaken && req.body[j][key].bid){

        //     } else {
        //         logger.log('info', "remove item from req.body ", req.body[j])
        //         indexToRemove.push(j);
        //     }
        // }
        //  logger.log('info', "number removed ", indexToRemove.length);
        // for(var j = 0; j < indexToRemove.length; j++){
        //     req.body.splice(indexToRemove[j],1);
        // }

        // logger.log('info', "number removed ", indexToRemove.length);
        // logger.log('info', "number now ", req.body.length);
        // var counter = 0;
        //  for(var j = 0; j < req.body.length; j++){
        //      var key = Object.keys(req.body[j]);
        //      if (req.body[j][key].tricksTaken && req.body[j][key].bid){

        //     } else {
        //         logger.log('info', "remove item from req.body ", req.body[j])
        //         counter++;
        //     }
        // }
        // logger.log('info', "counter", counter);

    });

    app.get('/api/results', function (req, res) {
        fs.readFile('./public/data/summary.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                logger.log('error', err);
            } else {
                obj = JSON.parse(data); //now it an object
                res.send(obj)
            }
        });

    });


}