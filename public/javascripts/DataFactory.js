
vsapp.factory('DataFactory', ['$http', '$q', function ($http, $q) {
    var theStore = [];
    var service = {
        getData: getData,
        saveData: saveData,
        saveHand: saveDeal,
        getDeal: getDeal,
    };
    return service;

    function saveDeal(data) {
        console.log('DataFactory saveDeal and data is ', data); //angular.toJson(data));
        $http({
            method: 'POST',
            url: 'api/saveDeal',
            data: angular.toJson(data),
            headers: {
                'Content-Type': 'application/json',
                'calledFrom': 'admin'
            }
        }).success(function (data, status) {
        }).error(function (data, status) {
        })
    }

    function saveData(data) {
        //@Jeff todo:  This uses dynamodb in the api.  Needs to switch to mongo.
        console.log("DataFactory saveData and data is", angular.toJson(data));
        var hand = {};
        hand.handCode = data;
        console.log("DataFactory.saveData the hands to post are", hand);
        $http({
            method: 'POST',
            url: 'api/saveHand',
            data: angular.toJson(data),
            headers: {
                'Content-Type': 'application/json',
                'calledFrom': 'admin'
            }
        }).success(function (data, status) {
        }).error(function (data, status) {
        });
    }

    function getData() {
        var deferred = $q.defer();
        var urls = '/api/results'
        console.log("before http call");
        $http({
            method: 'GET',
            url: urls,
        }).then(function successCallback(response) {
            console.log("success retrieving data ", response.data);
            deferred.resolve(response.data);
        }, function errorCallback(response) {
            console.log("error on http call for getting data", response);
            deferred.reject(response);
        });
        return deferred.promise;
    }

    function getDeal() {
        var deferred = $q.defer();
        var urls = '/api/getDeal';
        console.log("before http call for getDeal");
        $http({
            method: 'GET',
            url: urls,
        }).then(function successCallback(response) {
            console.log("success retrieving getDeal ", response.data);
            deferred.resolve(response.data);
        }, function errorCallback(response) {
            console.log("error on http call for getDeal", response);
            deferred.reject(response);
        });
        return deferred.promise;
    }
}]);