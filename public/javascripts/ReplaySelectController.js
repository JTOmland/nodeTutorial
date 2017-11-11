vsapp.controller('ReplaySelectController', ['$scope', '$mdDialog','dialogLocals','CommService', '$rootScope', function ($scope, $mdDialog, dialogLocals, CommService, $rootScope) {
   
    $scope.options = dialogLocals;
    console.log("ReplaySelectController options", $scope.options)
    $scope.selectedDeal = $scope.options[0];

    $scope.closeEdit = function(){
        console.log("closed edit from replaySeelectController");
        $mdDialog.hide();
    }

    $scope.save = function(){
       // CommService.unitEdited($scope.units);

        $mdDialog.hide($scope.selectedDeal);
    }
    
    $scope.selectUnit = function(deal) {
        $scope.selectedDeal = deal;
        console.log("Selected deal in pop up is ", $scope.selectedDeal);
    }

    

}]);
