vsapp.factory('HandOrgService', ['DataFactory', function (DataFactory) {
    var vector = [];
    var locations = ['North', 'East', 'South', 'West']
    var service = {
        createHandVector: createHandVector,
    };
    return service;

    function createHandVector(player, dealer, bid) {
        vector = [];
        for (var x = 0; x < 24; x++) {
            vector.push(0)
        }
        _.each(player.hand, function (card) {
            //console.log("card", card);
            if (card.index) {
                vector[card.index] = 1;
            }
        });

        //push the number from dealer
        //n,e,s,w
        var position = locations.indexOf(player.location) - locations.indexOf(dealer.location);
       // console.log("position", position, locations.indexOf(player.location), locations.indexOf(dealer.location), dealer);
        switch (position) {
            case 0:
                vector.push(0);
                vector.push(0);

                break;
            case 1:
                vector.push(0);
                vector.push(1);

                break;
            case 2:
                vector.push(1);
                vector.push(0);

                break;
            case 3:
                vector.push(1);
                vector.push(1);

                break;

            default:
                break;
        }
        console.log("vector", vector);
        return vector;
    }



}]);   
