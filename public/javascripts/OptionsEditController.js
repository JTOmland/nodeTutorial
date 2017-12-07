vsapp.controller('OptionsEditController', ['$scope', '$mdDialog','dialogLocals','CommService', '$rootScope', function ($scope, $mdDialog, dialogLocals, CommService, $rootScope) {
    $scope.close = function(){
        $mdDialog.hide($scope.options);
    }

    $scope.save = function(){
       // CommService.unitEdited($scope.units);

        $mdDialog.hide($scope.options);
    }

    $scope.options = dialogLocals;
    console.log("OptionsEditController options", $scope.options)

}]);



