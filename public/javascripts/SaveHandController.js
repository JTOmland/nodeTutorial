vsapp.controller('SaveHandController', ['$scope', '$mdDialog','dialogLocals','CommService', '$rootScope', function ($scope, $mdDialog, dialogLocals, CommService, $rootScope) {
    
     $scope.options = dialogLocals;
     console.log("SaveHandController options", $scope.options)
     $scope.selectedDeal = $scope.options.backupDeal;
     $scope.handDescription = 'Provide Description'

     //Reference $scope.data = { dealer: {}, note: '', deal: [] };
 
     $scope.closeEdit = function(){
        
         $mdDialog.hide();
     }
 
     $scope.save = function(){
        console.log("save edit from SaveHandController", $scope.selectedDeal);
        $scope.selectedDeal.note = $scope.handDescription;
        $mdDialog.hide($scope.selectedDeal);
     }
 
 }]);