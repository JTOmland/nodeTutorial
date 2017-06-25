var bodyParser = require('body-parser');
var fs = require('fs');
var logger = require('./logging');
logger.debugLevel = 'warn';
var AWS = require('aws-sdk');
var config = { "endpoint": "http://localhost:8000", "region": 'us-east-1' };
var logs = require('../controllers/logging');
var _ = require('lodash');
var dynamodb = new AWS.DynamoDB(config);
var docClient = new AWS.DynamoDB.DocumentClient(config);

module.exports = function (app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post('/api/saveHand', function (req, res) {
        logs.log('debug', "/api/saveHand post", JSON.stringify(req.body));
        
        //what I want to do is take the data which is 
        //data is an array of objects with the key the hand code
        var table = "CodedHands";
        var key = Object.keys(req.body[0])[0];
        var hand = req.body[0];
         
        var params = {
            TableName: table,
            Key: {
                "hand": key
            }
        };

        docClient.get(params, function (err, data) {
            if (err) {
                logs.log('debug', "Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));

            } else {
                logs.log('debug', "GetItem succeeded: ", JSON.stringify(data, null, 2));
                res.send('Success');
                
                //add manipulation of attributes and do update
                //if it returns undefined then key does not exit
                // if (data) {
                //     logs.log('debug', "/api/saveItem item exists and will be updated", JSON.stringify(data, null, 2));
                //     var returnKey = Object.keys(data);
                //     var existingHand = data[returnKey].hand, total = data[returnKey].total, totalTricks = data[returnKey].totalTricks,
                //     average = data[returnKey].average, totalBid = data[returnKey].totalBid, averageBid = data[returnKey].averageBid,
                //     max = data[returnKey].max, min = data[returnKey].min;

                //     total++; //increment total hands
                //     totalTricks += hand.tricksTaken;
                //     average = totalTricks/total;
                //     totalBid += hand.bid;
                //     averageBid = totalBid/total;
                //     if(hand.tricksTaken > max) {
                //         max = hand.tricksTaken;
                //     }
                //     if(hand.tricksTakn < min) {
                //         min = hand.tricksTaken;
                //     }

                //     var params = {
                //         TableName: table,
                //         Key: {"hand": existingHand},
                //         UpdateExpression: "set total = :t, totalTricks = :tt, average = :a, totalBid = :tb, averageBid = :ab, max = :mx, min = :mn",
                //         ExpressionAttributeValues: {
                //             ":t": total,
                //             ":tt": totalTricks,
                //             ":a": average,
                //             ":tb": totalBid,
                //             ":ab": averageBid,
                //             ":mx": max,
                //             ":mn": min
                //         }
                //     }
                //     docClient.update(params, function (err, data) {
                //         if (err) logs.log('debug', "/api/saveHand update error: ", JSON.stringify(err, null, 2)); // an error occurred
                //         else return JSON.stringify(data, null, 2); // successful response
                //     });



                // } else {
                //     var params = {
                //         TableName: table,
                //         Item: { // a map of attribute name to AttributeValue
                //             "hand": key,
                //             "total": hand[key].total,
                //             "totalTricks": hand[key].totalTricks,
                //             "average": hand[key].average,
                //             "totalBid": hand[key].totalBid,
                //             "averageBid": hand[key].averageBid,
                //             "max": hand[key].max,
                //             "min": hand[key].min
                //             // attribute_value (string | number | boolean | null | Binary | DynamoDBSet | Array | Object)
                //             // more attributes...
                //         },
                //         ConditionExpression: 'attribute_not_exists(attribute_name)', // optional String describing the constraint to be placed on an attribute
                //         ExpressionAttributeNames: { // a map of substitutions for attribute names with special characters
                //             //'#name': 'attribute name'
                //         },
                //         ExpressionAttributeValues: { // a map of substitutions for all attribute values
                //             //':value': 'VALUE'
                //         },
                //         ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
                //         ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
                //         ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
                //     };
                //     docClient.put(params, function (err, data) {
                //         if (err) logs.log('debug', "/api/saveHand PutItem error: ", JSON.stringify(err, null, 2)); // an error occurred
                //         else return JSON.stringify(data, null, 2); // successful response
                //     });
                // }
            }
        });

    });

    app.post('/api/save', function (req, res) {


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