
vsapp.factory('DataFactory', ['$http', '$q', function ($http, $q) {
    var theStore = [];
    var service = {
        getData: getData,
        saveData: saveData,
    };
    return service;

    function saveData(data) {
        //console.log("capacityController saveData and data is", angular.toJson(DataFactory.fullModel()));
        $http({
            method: 'POST',
            url: 'api/save',
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
}]);