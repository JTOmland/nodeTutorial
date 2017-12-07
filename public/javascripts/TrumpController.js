vsapp.controller('TrumpController', ['$scope', '$mdDialog','CommService', '$rootScope', function ($scope, $mdDialog, CommService, $rootScope) {

        $scope.data = 'd';

        $scope.save = function(){
            $mdDialog.hide($scope.data);
        };
        
        $scope.radioData = [
            { label: 'Diamonds', value: 'd'},
            { label: 'Clubs', value: 'c'},
            { label: 'Hearts', value: 'h'},
            { label: 'Spades', value: 's' }
          ];
    }]);
    
    
    
    