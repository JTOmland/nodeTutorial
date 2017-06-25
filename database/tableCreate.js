var AWS = require('aws-sdk');
var config = { "endpoint": "http://localhost:8000", "region": 'us-east-1' };
var client = new AWS.S3(config);
var logs = require('../controllers/logging');
var fs = require('fs');
var _ = require('lodash');

module.exports = {
    test: function () {
        logs.log('debug', "tableCreate.test called");
    },
    createUsers: function (callback) {
        logs.log('debug', 'creating table for users');
        var dynamodb = new AWS.DynamoDB({
            region: 'us-east-1',
            endpoint: "http://localhost:8000"
        });

        var params = {
            TableName: "Users",
            KeySchema: [
                { AttributeName: "email", KeyType: "HASH" }
            ],
            AttributeDefinitions: [
                { AttributeName: "email", AttributeType: "S" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            }
        }
        dynamodb.createTable(params, function (err, data) {
            if (err) logs.log('debug', err)
            else logs.log('debug', 'createTable for users successful');
        });
    },

    createLogins: function (callback) {

        var dynamodb = new AWS.DynamoDB({
            region: 'us-east-1',
            endpoint: "http://localhost:8000"
        });

        var params = {
            TableName: "Logins",
            KeySchema: [
                { AttributeName: "email", KeyType: "HASH" },
                { AttributeName: "timestamp", KeyType: "RANGE" }
            ],
            AttributeDefinitions: [
                { AttributeName: "email", AttributeType: "S" },
                { AttributeName: "timestamp", AttributeType: "N" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            }
        };
        dynamodb.createTable(params, function (err, data) {
            if (err) logs.log('debug', err)
            else logs.log('debug', 'createTable for logins successful');
        });

    },

    createSupervisors: function (callback) {

        var dynamodb = new AWS.DynamoDB({
            region: 'us-east-1',
            endpoint: "http://localhost:8000"
        });

        var params = {
            TableName: "Supervisors",
            KeySchema: [
                { AttributeName: "name", KeyType: "HASH" }
            ],
            AttributeDefinitions: [
                { AttributeName: "name", AttributeType: "S" },
                { AttributeName: "company", AttributeType: "S" },
                { AttributeName: "factory", AttributeType: "S" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            },
            GlobalSecondaryIndexes: [{
                IndexName: "FactoryIndex",
                KeySchema: [
                    {
                        AttributeName: "company",
                        KeyType: "HASH"
                    },
                    {
                        AttributeName: "factory",
                        KeyType: "RANGE"
                    }
                ],
                Projection: {
                    ProjectionType: "ALL"
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1
                }
            }]
        };

        dynamodb.createTable(params, function (err, data) {
            if (err) logs.log('debug', err)
            else logs.log('debug', 'createTable for logins successful');
        });
    },

    createCompanies: function (callback) {

        var dynamodb = new AWS.DynamoDB({
            region: 'us-east-1',
            endpoint: "http://localhost:8000"
        });

        var params = {
            TableName: "Companies",
            KeySchema: [
                { AttributeName: "name", KeyType: "HASH" },
                { AttributeName: "subsidiary", KeyType: "RANGE" }
            ],
            AttributeDefinitions: [
                { AttributeName: "name", AttributeType: "S" },
                { AttributeName: "subsidiary", AttributeType: "S" },
                { AttributeName: "ceo", AttributeType: "S" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            },
            LocalSecondaryIndexes: [{
                IndexName: "CeoIndex",
                KeySchema: [
                    {
                        AttributeName: "name",
                        KeyType: "HASH"
                    },
                    {
                        AttributeName: "ceo",
                        KeyType: "RANGE"
                    }
                ],
                Projection: {
                    ProjectionType: "ALL"
                }
            }]
        };

        dynamodb.createTable(params, function (err, data) {
            if (err) logs.log('debug', err)
            else logs.log('debug', 'createTable for logins successful');
        });
    },

    createCodedHands: function (callback) {

        var dynamodb = new AWS.DynamoDB({
            region: 'us-east-1',
            endpoint: "http://localhost:8000"
        });

        var params = {
            TableName: "CodedHands",
            KeySchema: [
                { AttributeName: "hand", KeyType: "HASH" },
            ],
            AttributeDefinitions: [
                { AttributeName: "hand", AttributeType: "S" },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            },
        };

        dynamodb.createTable(params, function (err, data) {
            if (err) logs.log('debug', err)
            else logs.log('debug', 'createTable for logins successful');
        });
    },

    fillCodedHands: function (callback) {
        var dynamodb = new AWS.DynamoDB({
            region: 'us-east-1',
            endpoint: "http://localhost:8000"
        });

        var docClient = new AWS.DynamoDB.DocumentClient({
            region: 'us-east-1',
            endpoint: "http://localhost:8000"
        });

        var hand = {
            "151413129NT14n": {
                "total": 1,
                "totalTricks": 5,
                "average": 5,
                "totalBid": 6,
                "averageBid": 6,
                "max": 5,
                "min": 5
            }
        }

        var params = {
            TableName: "CodedHands",
            Item: {
                hand: "151413129NT14n",
                total: hand["151413129NT14n"].total,
                totalTricks: hand["151413129NT14n"].totalTricks,
                average: hand["151413129NT14n"].average,
                totalBid: hand["151413129NT14n"].totalBid,
                averageBid: hand["151413129NT14n"].averageBid,
                max: hand["151413129NT14n"].max,
                min: hand["151413129NT14n"].min

            }
        }
        logs.log('debug', "Putting item in CodedHand table")
        docClient.put(params, function (err, data) {
            if (err) {
                logs.log('debug', "Unable to add item.  Error JSON", JSON.stringify(err, null, 2));
            } else {
                logs.log('debug', "Added item:", JSON.stringify(data, null, 2));
            }
        });

    },

    putFullFile: function (callback) {

        var dynamodb = new AWS.DynamoDB({
            region: 'us-east-1',
            endpoint: "http://localhost:8000"
        });

        var docClient = new AWS.DynamoDB.DocumentClient({
            region: 'us-east-1',
            endpoint: "http://localhost:8000"
        });
        // The BatchWriteItem takes up to 25 requests, some of which may succeed,
        // and others needing to be retried. This example program takes in a list of requests
        // that is larger than the batch size, and calls BatchWriteItem multiple times until
        // all of the items have been written.
        var obj = {};
        logs.log('debug', "putFullFile reading file");


        fs.readFile('./public/data/summary.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                logs.log('debug', "error reading file", err);
            } else {
                logs.log('debug', 'putFullFile read file')
                obj = JSON.parse(data); //now it an object
                var params = {
                    // RequestItems is a map of TableName to Requests
                    RequestItems: {
                        CodedHands: []
                    }
                };

                // Iterate over all of the additional URLs and keep kicking off batches of up to 25 items
                var tempArray = [];
                _.forEach(obj, function (value, key) {
                    tempArray.push(
                        {
                            PutRequest: {
                                Item: {
                                    hand: key,
                                    total: obj[key].total,
                                    totalTricks: obj[key].totalTricks,
                                    average: obj[key].average,
                                    totalBid: obj[key].totalBid,
                                    averageBid: obj[key].averageBid,
                                    max: obj[key].max,
                                    min: obj[key].min

                                }
                            }
                        }
                    )
                });
                logs.log('debug', "Array filled with objects from file", tempArray.length);

                if (tempArray.length > 0) {


                    params.RequestItems.CodedHands.push(tempArray.pop());
                    params.RequestItems.CodedHands.push(tempArray.pop());


                    while (tempArray.length > 0) {

                        // Pull off up to 25 items from the list
                        for (var i = params.RequestItems.CodedHands.length; i < 25; i++) {

                            // Nothing else to add to the batch if the input list is empty
                            if (tempArray.length === 0) {
                                break;
                            }

                            // Take a URL from the list and add a new PutRequest to the list of requests
                            // targeted at the Image table
                            params.RequestItems.CodedHands.push(tempArray.pop())
                        }
                        // Kick off this batch of requests
                        logs.log('debugh', "Calling BatchWriteItem with a new batch of "
                            + params.RequestItems.CodedHands.length + " items");
                        docClient.batchWrite(params, doBatchWriteItem);

                        // Initialize a new blank params variable
                        params = {
                            RequestItems: {
                                CodedHands: []
                            }
                        };
                    }
                }
            }
        });
    },

    getItem: function(callback){
        var dynamodb = new AWS.DynamoDB({
            region: 'us-east-1',
            endpoint: "http://localhost:8000"
        });

        var docClient = new AWS.DynamoDB.DocumentClient({
            region: 'us-east-1',
            endpoint: "http://localhost:8000"
        });

        var table = "CodedHands";
        var hand =  "14131210NTLnLn";
        var params = {
            TableName: table,
            Key: {
                "hand": hand
            }
        };

        docClient.get(params, function(err, data){
            if(err){
                logs.log('degug', "Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
            } else {
                logs.log('debug', "GetItem succeeded: ", JSON.stringify(data, null, 2));
            }
        });

    }

}

// A callback that repeatedly calls BatchWriteItem until all of the writes have completed
function doBatchWriteItem(err, data) {
    if (err) {
        logs.log('debug', "Unable to add item in batch write.  Error JSON", JSON.stringify(err, null, 2));
    } else {
        if ('UnprocessedItems' in data && 'Image' in data.UnprocessedItems) {
            // More data. Call again with the unprocessed items.
            var params = {
                RequestItems: data.UnprocessedItems
            };
            logs.log('debug', "Calling BatchWriteItem again to retry "
                + params.RequestItems.Image.length + "UnprocessedItems");
            docClient.batchWrite(params, doBatchWriteItem);
        } else {
            logs.log('debug', "BatchWriteItem processed all items in the batch");
        }
    }

}
