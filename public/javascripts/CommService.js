vsapp.factory('CommService',
    ['$rootScope', function($rootScope){

     var service = {
        bid: function(bidMade) {
            console.log("commservice bid called", bidMade)
            $rootScope.$broadcast('bid', bidMade);
        },
     }

     return service;

  }]);



