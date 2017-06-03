vsapp.factory('Player', ['$http', '$q', 'CPUService', function ($http, $q, CPUService) {

    var Player = function(info) {
        this.init(info);
        this.profile = null;

    };
    var allPlayers = [];
    

    Player.prototype = {
        init: function (info) {
            for (item in info) {
                this[item] = info[item];
            }
        },

        doNextAction: function () {
            console.log("nextAction", this.nextAction)
           // this.nextAction.fire();
        },

        getAllPlayers: function () {
            return allPlayers
        },

        setNextAction: function (gameState) {
            // console.log("Player.setNextAction called ", gameState)
            var me = this;
            switch (gameState) {

                case 'Deal':
                    return null;
                    break;
                case 'Bidding':
                    me.nextAction = CPUService.cpuBidDecision;
                    break;
                case 'PickTrump':
                    me.nextAction = CPUService.cpuPickTrump
                    break;
                case 'StayOrFold':
                    me.nextAction = CPUService.cpuStayDecision
                    break;
                case 'Play':
                    me.nextAction = CPUService.cpuPlayDecision
                    break;
            }
        }
    }

    // function Player(info) {
    //     this.init(info);
    // }

    // (function initPlayers() {
    //     var preMadePlayers = [
    //         { location: 'North', type: 'cpu', name: 'nate', handLocation: { faceUp: true, x: 350, y: 100 }, score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, isIn: true },
    //         { location: 'South', type: 'cpu', name: 'same', handLocation: { faceUp: true, x: 350, y: 400 }, score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, isIn: true },
    //         { location: 'West', type: 'cpu', name: 'weseley', handLocation: { faceUp: true, x: 100, y: 250 }, score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, isIn: true },
    //         { location: 'East', type: 'cpu', name: 'evan', handLocation: { faceUp: true, x: 600, y: 250 }, score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, isIn: true }
    //     ];
    //     _.each(preMadePlayers, function (p) {
    //         console.log("creating new player")
    //         var test = new Player(p);
    //         allPlayers.push[test];
    //     });
    //     return;
    // }());
    return Player;
}]);

