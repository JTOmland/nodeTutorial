vsapp.controller('HeaderController', HeaderController)

HeaderController.$inject = ['$scope','$http', '$location', '$mdDialog'];

function HeaderController($scope, $http, $location, $mdDialog) {
    $scope.openSideNavPanel = function(){

    }
    $scope.createVS = function() {

    }
    $scope.simulationPage = function(path) {
        console.log("HeaderController simulaiton page")
        $location.url(path);
    }
}
