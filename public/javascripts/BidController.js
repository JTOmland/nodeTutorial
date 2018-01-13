vsapp.controller('BidController', ['$scope', '$mdDialog','dialogLocals','CommService', '$rootScope', function ($scope, $mdDialog, dialogLocals, CommService, $rootScope) {

    $scope.options = dialogLocals;

    var disableThree = false;
    var disableFive = false;
    var disableFour = false;

    if($scope.options.highBid == 3){
       // console.log("BicController setting disabledThree")
        disableThree = true
    } else if($scope.options.highBid == 4){
        disableThree = true;
        disableFour = true;
    } else if($scope.options.highBid == 5){
        disableThree = true;
        disableFour = true;
        disableFive = true;
    }
    $scope.closeEdit = function(){
        $scope.data.group2 = 0;
        $mdDialog.hide($scope.data);
    }

    $scope.save = function(){
       // CommService.unitEdited($scope.units);

        $mdDialog.hide($scope.data);
    }

    $scope.data = {
        group2 : $scope.options.highBid + 1,
      };

    $scope.radioData = [
        { label: '3', value: 3, isDisabled: disableThree },
        { label: '4', value: 4, isDisabled: disableFour },
        { label: '5', value: 5, isDsabled: disableFive},
        { label: '6', value: 6 }
      ];
    
    //console.log("BidController options", $scope.options)

}]);



