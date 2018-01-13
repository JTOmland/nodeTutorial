vsapp.controller('StayController', ['$scope', '$mdDialog','dialogLocals','CommService', '$rootScope', function ($scope, $mdDialog, dialogLocals, CommService, $rootScope) {
    
        $scope.options = dialogLocals;
        $scope.data = 0;
        //console.log("StayController options", $scope.options)

        $scope.closeEdit = function(){
            //folding button
            $scope.data.group2 = 0;
            $mdDialog.hide($scope.data);
        }
    
        $scope.save = function(){
           // staying button
           $scope.data = 1;
    
            $mdDialog.hide($scope.data);
        }
    
       
    
    }]);
    
    
    
    