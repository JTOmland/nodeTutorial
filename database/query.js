var AWS = require('aws-sdk');
var config = { "endpoint": "http://localhost:8000", "region": 'us-east-1' };
var client = new AWS.S3(config);
var logs = require('../controllers/logging');
var fs = require('fs');
var _ = require('lodash');
var dynamodb = new AWS.DynamoDB({
    region: 'us-east-1',
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1',
    endpoint: "http://localhost:8000"
});

module.exports = {
    getHand: function (hand) {
        var table = "CodedHands";
        var params = {
            TableName: table,
            Key: {
                "hand": hand
            }
        };

        docClient.get(params, function (err, data) {
            if (err) {
                logs.log('degug', "Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
            } else {
                logs.log('debug', "GetItem succeeded: ", JSON.stringify(data, null, 2));
                return JSON.stringify(data, null, 2);
            }
        });

    }
}