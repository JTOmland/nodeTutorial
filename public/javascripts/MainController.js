'use strict'
vsapp.controller('MainController', MainController)

MainController.$inject = ['$scope', '$http', '$q', '$rootScope', '$timeout', '$interval', '$mdDialog', '$rootScope', 'DataFactory', 'CPUService', 'Player', 'CommService'];


function MainController($scope, $http, $q, $rootscope, $timeout, $interval, $mdDialog, $rootScope, DataFactory, CPUService, Player, CommService) {
    var data = [];
    var numHands = 0;
    var autoHands = 1;
    var cardSize = { width: 69, height: 94, padding: 18 }
    $scope.auto = false;
    $scope.allCardsPlayed = [];
    var turnsCompleted = 0;
    var turnOver = true;
    var stop;

    $scope.test = {};
    $scope.newRender = { hands: [], draw: false };
    $scope.timeoutRunning = false;
    $scope.activeGame = false;
    $scope.activePlayer = 'East';
    $scope.isStuck = false;
    $scope.hand = [];
    $scope.trickEnded = false;
    $scope.indexTurn = false;

    function init() {
        DataFactory.getData().then(function (response) {
                console.log("response for data get", response);
                angular.copy(response, data);
                var codeSummary = {};
                _.each(data, function(codeObject){
                    var key = Object.keys(codeObject);
                    if(key in codeSummary){
                        codeSummary[key].total++;
                        if(codeObject[key].tricksTaken){
                            codeSummary[key].totalTricks += codeObject[key].tricksTaken;
                        } else {
                            console.log("No tricks taken for ", codeObject[key]);
                        }
                        if(codeObject[key].bid){
                            console.log('total bid before', codeSummary[key].totalBid, ' plus ', codeObject[key].bid )
                            codeSummary[key].totalBid += codeObject[key].bid;
                            console.log('total bid after', codeSummary[key].totalBid, ' plus ')
                            
                        } else {
                            console.log("No tricks taken for ", codeObject[key]);
                        }
                        //codeSummary[key].average = Math.floor( codeSummary[key].totalTricks/codeSummary[key].total++);
                        //codeSummary[key].averageBid = Math.floor( codeSummary[key].totalBid/codeSummary[key].total++);
                        
                    } else {
                        codeSummary[key] = {};
                        codeSummary[key].total = 1;
                        codeSummary[key].totalTricks = codeObject[key].tricksTaken;
                        codeSummary[key].average = codeObject[key].tricksTaken;
                        codeSummary[key].totalBid = codeObject[key].bid;
                       // codeSummary[key].averageBid = Math.floor( codeSummary[key].totalBid/codeSummary[key].total++);
                       // codeSummary[key].average = Math.floor( codeSummary[key].totalTricks/codeSummary[key].total++);
                        
                    }
                });
                console.log("summary", codeSummary);
            });
        $scope.gameInformation = {
            auto: false,
            actors: [],
            allCardsPlayed: [],
            bid: 3,
            bidTaken: 2,
            currentBidOwner: null,
            currentPlayer: null,
            data: [],
            dealerStuck: false,
            gameState: 'Deal',
            gameStates: ['Deal', 'Bidding', 'StayOrFold', 'Play', 'HandEnded'],
            hand: [],
            isStuck: false,
            numBids: 0,
            playersIn: [],
            playersPlaying: [],
            suitLed: null,
            trump: null,
            trick: [],
            trickOwner: null,
            topCard: null,
            trumpPlayed: null,
            tricks: 0,
        }
        $scope.arrayToRender = [];

        var newPlayer = new Player({ location: 'North', type: 'cpu', name: 'nate', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, isbidder: false, isDealer: true, isIn: true, hand: new cards.Hand({ faceUp: true, x: 325, y: 60 }) });
        $scope.gameInformation.playersIn.push(newPlayer);
        $scope.arrayToRender.push(newPlayer.hand);
        newPlayer = new Player({ location: 'East', type: 'cpu', name: 'evan', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, isbidder: false, isDealer: true, isIn: true, hand: new cards.Hand({ faceUp: true, x: 600, y: 300 }) });
        $scope.gameInformation.playersIn.push(newPlayer);
        $scope.arrayToRender.push(newPlayer.hand);
        newPlayer = new Player({ location: 'South', type: 'cpu', name: 'same', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, isbidder: false, isDealer: true, isIn: true, hand: new cards.Hand({ faceUp: true, x: 325, y: 540 }) });
        $scope.gameInformation.playersIn.push(newPlayer);
        $scope.arrayToRender.push(newPlayer.hand);
        newPlayer = new Player({ location: 'West', type: 'cpu', name: 'weseley', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, isbidder: false, isDealer: true, isIn: true, hand: new cards.Hand({ faceUp: true, x: 50, y: 300 }) });
        $scope.gameInformation.playersIn.push(newPlayer);
        $scope.arrayToRender.push(newPlayer.hand);


        $scope.activeGame = true;
        cards.init({ table: '#card-table' });
        //Create a new deck of cards
        $scope.deck = new cards.Deck({ faceUp: false, x: 350, y: 250 });
        //By default it's in the middle of the container, put it slightly to the side
        $scope.deck.x -= 50;
        $scope.deck.padding = 0.5;
        //cards.all contains all cards, put them all in the deck
        $scope.deck.addCards(cards.all);
        $scope.arrayToRender.push($scope.deck);
        //Lets add a discard pile
        $scope.discardPile = new cards.Hand({ faceUp: true, x: 350, y: 250 });
        $scope.arrayToRender.push($scope.discardPile);
        $scope.discardPile.x += 50;
        $scope.gameInformation.numberOfPlayersIn = 4;
        $scope.gameInformation.currentPlayer = $scope.gameInformation.playersIn[0];
        $scope.gameInformation.Dealer = $scope.gameInformation.playersIn[0];

    };

    init();

    $scope.cardClick = function (mouseCoords) {
        console.log("mouseCoords", mouseCoords);

        if ($scope.gameState != 'Play' || $scope.timeoutRunning) {
            return;
        }
        $scope.clicked.x = mouseCoords.x;
        $scope.clicked.y = mouseCoords.y;
        var cardPlayed;
        var playersHandClicked;
        _.each($scope.player, function (p) {
            _.each(p.hand, function (card) {
                if (mouseCoords.x > card.hitX && mouseCoords.x < card.hitX + card.hitXadd && card.hitY > mouseCoords.y && card.hitY < mouseCoords.y + cardSize.height) {
                    console.log('card selected is ', card);
                    cardPlayed = card;
                    playersHandClicked = p.location;
                }
            });
        });
        console.log("handClicked ", playersHandClicked, " activePlayer", $scope.activePlayer)
        if (playersHandClicked != $scope.activePlayer) {
            return;
        }
        if (cardPlayed) {
            $scope.discardPile.addCard(cardPlayed);
            $scope.render(true, true, true, true, true, true, true);
            $scope.timeoutRunning = true;
            if ($scope.auto) {
                trickEval(cardPlayed);
            } else {
                $timeout(function () {
                    trickEval(cardPlayed);
                    $scope.timeoutRunning = false;
                }, 500);
            }

        }
    }

    $scope.render = function (north, east, south, west, deck, pile, alt) {
        console.log("render called")
        alt = !alt;
        var itemsToRender = { player1: north, player2: east, player3: south, player4: west, deck: deck, pile: pile, alt: alt }
        $scope.test = itemsToRender;

    }

    $scope.indexPlay = function () {
        console.log("indexPlay");
        // onStartTurn();
        $scope.indexTurn = true;
        if ($scope.auto) {
            stop = $interval(function () {
                if (turnOver) {
                    turnOver = false;
                    onStartTurn();
                }

            }, 100);

        } else {
            onStartTurn();
        }

    }



    $scope.trumpChoosen = function (value) {
        onCurrentPlayerEndTurn(value);
    }

    $scope.stay = function () {
        onCurrentPlayerEndTurn(true);
    }

    $scope.fold = function () {
        onCurrentPlayerEndTurn(false);
    }

    $scope.DealRandom = function () {
        player[$scope.activePlayer].hand.addCard($scope.deck.DealRandom());
        player[$scope.activePlayer].hand.render();
        $scope.activePlayer = rotateActivePlayer($scope.activePlayer);
    }

    $scope.DealSpecific = function () {
        $scope.testkey = false;

    }

    $scope.increaseBid = function () {
        $scope.bid++;
    }

    $scope.decreaseBid = function () {
        $scope.bid--;
    }

    $scope.inputBid = function () {
        console.log("inputBid ", $scope.bid);
        $scope.makebid($scope.bid);
    }

    $scope.makebid = function (actualBid) {
        console.log($scope.activePlayer, " bid ", actualBid);
        if (actualBid <= $scope.bidTaken) {
            return
        }
        $scope.bid = actualBid;
        $scope.bidTaken = $scope.bid;
        $scope.bid++;
        $scope.currentBidOwner = $scope.activePlayer;
        // $scope.bid = bid;
        if ($scope.activePlayer === $scope.Dealer) {
            $scope.currentBidOwner = $scope.activePlayer;
            $scope.player[$scope.activePlayer].isbidder = true;
            $scope.gameState = 'PickTrump';
            if ($scope.player[$scope.activePlayer].type == 'cpu') {
                console.log("calling trumpchoosen by cpu")
                $scope.trumpChoosen(CPUService.cpuPickTrump($scope.player[$scope.activePlayer]));
            }
        }
        $scope.activePlayer = rotateActivePlayer($scope.activePlayer);
        if ($scope.player[$scope.activePlayer].type == 'cpu') {
            var cpuBid = CPUService.cpuBidDecision($scope.player[$scope.activePlayer], $scope.bidTaken);
            if (cpuBid) {
                $scope.makebid(cpuBid);
            } else {
                $scope.pass();
            }
        }
    }

    $scope.pass = function () {

    }

    function jickSuit(suit) {
        switch (suit) {
            case 'd':
                return 'h'
                break;
            case 'h':
                return 'd'
                break;
            case 's':
                return 'c'
                break;
            case 'c':
                return 's'
                break;
        }
    }

    $scope.$on('$destroy', function () {
        console.log("Scope.on destroy called");
        $scope.stopGame();
    })

    $scope.resetDeck = function () {
        //pull all cards from hands and discard and put back in deck
        //clear trick scores from players
        //set gameState to deal.
        console.log("resetDeck")
        moveCardsToDeck($scope.discardPile);
        var lastDealer = null;
        $scope.gameInformation.bid = 3;
        $scope.gameInformation.bidTaken = 2;
        $scope.gameInformation.currentBidOwner = null;
        $scope.gameInformation.currentPlayer = null;
        $scope.gameInformation.dealerStuck = false;
        $scope.gameInformation.data = [];
        $scope.gameInformation.gameState = 'Deal';
        $scope.gameInformation.hand = [];
        $scope.gameInformation.isStuck = false;
        $scope.gameInformation.numberOfPlayersIn = 4;
        $scope.gameInformation.numBids = 0;
        $scope.gameInformation.suitLed = null;
        $scope.gameInformation.trump = null;
        $scope.gameInformation.trick = [];
        $scope.gameInformation.trickOwner = null;
        $scope.gameInformation.topCard = null;
        $scope.gameInformation.trumpPlayed = null;
        $scope.gameInformation.tricks = 0;
        _.each($scope.gameInformation.playersIn, function (p) {

            p.tricksTaken = 0;
            p.sortedHand = {};
            p.topSuit = 's';
            p.handScore = 0;
            p.isbidder = false;
            p.isDealer = false;
            p.isIn = true;
            console.log("moving player hand to deck", p.hand)
            moveCardsToDeck(p.hand);
        });
        $scope.gameInformation.Dealer = rotateActivePlayer($scope.gameInformation.Dealer);
        $scope.gameInformation.currentPlayer = $scope.gameInformation.Dealer;
        $scope.gameState = "Deal";
        $scope.render(true, true, true, true, true, true, true);
    }

    function onStartTurn() {
        if ($scope.gameInformation.currentPlayer.isIn) {
            if ($scope.gameInformation.gameState == 'Deal') {
                onCurrentPlayerEndTurn(null);
            } else {
                if ($scope.gameInformation.gameState != 'HandEnd') {
                    if ($scope.activeGame && $scope.gameInformation.currentPlayer.type == 'cpu') {
                        $scope.gameInformation.currentPlayer.setNextAction($scope.gameInformation.gameState);
                        var playerAction = $scope.gameInformation.currentPlayer.nextAction($scope.gameInformation.currentPlayer, $scope.gameInformation);
                        onCurrentPlayerEndTurn(playerAction);
                    } else {
                        console.log("Human player turn or end of game")
                    }
                } else {
                    onCurrentPlayerEndTurn(null);
                }

            }
            $scope.render(true, true, true, true, true, true, true);
        } else {
            console.log($scope.gameInformation.currentPlayer.location, " not in")
            if ($scope.gameInformation.currentPlayer.type == 'cpu') {
                onCurrentPlayerEndTurn(null);
            }
        }
        turnOver = true;

    }

    function onCurrentPlayerEndTurn(playerAction) {
        console.log("onLastTurn gamestate before switch ", $scope.gameInformation.gameState);
        console.log($scope.gameInformation.currentPlayer.name, " action is ", playerAction);
        switch ($scope.gameInformation.gameState) {
            case 'Deal':
                cards.shuffle($scope.deck);
                $scope.deck.deal(6, [$scope.gameInformation.playersIn[0].hand, $scope.gameInformation.playersIn[1].hand, $scope.gameInformation.playersIn[2].hand, $scope.gameInformation.playersIn[3].hand], 50, function () {

                });
                $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.currentPlayer);
                $scope.gameInformation.gameState = 'Bidding';
                break;
            case 'Bidding':
                //track bidding.  Bidding over when dealer bid

                if (playerAction == 0) {
                    //0 bid is pass
                    $scope.gameInformation.currentPlayer.bid = false;
                } else {
                    $scope.gameInformation.bidTaken = playerAction;
                    $scope.gameInformation.numBids++;
                    $scope.gameInformation.currentBidOwner = $scope.gameInformation.currentPlayer;
                }
                if ($scope.gameInformation.currentPlayer === $scope.gameInformation.Dealer) {
                    if ($scope.gameInformation.numBids < 1) {
                        //deal stuck and folded
                        console.log("Dealer stuck and folded");
                        $scope.gameInformation.numberOfPlayersIn = 0;
                        $scope.gameInformation.dealerStuck = true;
                        $scope.gameInformation.gameState = 'HandEnd'
                    } else if ($scope.gameInformation.numBids == 1 && $scope.gameInformation.currentBidOwner === $scope.gameInformation.Dealer) {
                        //dealer stuck and bid
                        $scope.gameInformation.dealerStuck = true;
                        $scope.gameInformation.gameState = 'PickTrump'
                        $scope.gameInformation.currentPlayer = $scope.gameInformation.currentBidOwner;
                    } else {
                        $scope.gameInformation.gameState = 'PickTrump'
                        $scope.gameInformation.currentPlayer = $scope.gameInformation.currentBidOwner;
                    }
                } else {
                    $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.currentPlayer);
                }
                break;
            case 'PickTrump':
                $scope.gameInformation.trump = playerAction;

                adjustCardRank();
                if ($scope.gameInformation.dealerStuck) {
                    $scope.gameInformation.gameState = 'Play';
                } else {
                    $scope.gameInformation.gameState = 'StayOrFold';
                }
                $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.currentBidOwner);
                break;
            case 'StayOrFold':
                $scope.gameInformation.currentPlayer.isIn = playerAction;
                if (!playerAction) {
                    $scope.gameInformation.currentPlayer.isIn = false;
                    $scope.gameInformation.numberOfPlayersIn--;
                }
                $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.currentPlayer);
                if ($scope.gameInformation.currentPlayer === $scope.gameInformation.currentBidOwner) {
                    if ($scope.gameInformation.numberOfPlayersIn < 2) {
                        //everyone folded on bid
                        $scope.gameInformation.currentBidOwner.tricksTaken = $scope.gameInformation.currentBidOwner.bidTaken;
                        $scope.gameInformation.gameState = 'HandEnd';
                    } else {
                        $scope.gameInformation.gameState = 'Play';
                        $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.Dealer);
                    }
                }

                break;
            case 'Play':
                if (!playerAction) {
                    $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.currentPlayer);

                } else {
                    if ($scope.gameInformation.trick.length == 0) {
                        moveCardsToDeck($scope.discardPile);
                    }
                    $scope.discardPile.addCard(playerAction);
                    trickEval(playerAction);
                    $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.currentPlayer);
                    //here the trick has ended and maybe the hand
                    console.log("Next log should be trick finished, winner ");
                    if ($scope.gameInformation.trick.length == $scope.gameInformation.numberOfPlayersIn) {
                        console.log("Trick finished, winner ", $scope.gameInformation.trickOwner);
                        //trick is over score it and winner is active player
                        $scope.gameInformation.tricks++;
                        $scope.hand.push($scope.gameInformation.trick);
                        $scope.gameInformation.trick = [];
                        console.log("number of tricks ", $scope.gameInformation.tricks);
                        $scope.gameInformation.trickOwner.tricksTaken++;
                        $scope.trickEnded = true;
                        if ($scope.gameInformation.tricks == 6) {
                            //hand has ended score it and deal
                            $scope.gameInformation.gameState = 'HandEnd'
                        } else {
                            //rearrange playersIn order based on trick winner
                            $scope.gameInformation.currentPlayer = $scope.gameInformation.trickOwner;
                        }
                    }
                }
                break;

            case 'HandEnd':
                console.log("HandEnded");
                calculateScores();
                $scope.gameInformation.gameState = 'Deal'
                $scope.resetDeck();
                break;
        }



    }

    $scope.stopGame = function () {
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }
    }

    $scope.newDeal = function () {

        $scope.deck.deal(6, [$scope.gameInformation.actors[0].hand, $scope.gameInformation.actors[1].hand, $scope.gameInformation.actors[2].hand, $scope.gameInformation.actors[3].hand], 50, function () {
            onLastTurn();
            $scope.render(true, true, true, true, true, true, true);
        });
        // onStartTurn();
    }

    function printPlayersInArray(array, msg) {

        for (var i = 0; i < array.length; i++) {
            console.log(msg, array[i])
        }

    }

    function copyArray(arrayFrom, arrayTo) {
        for (var i = 0; i < arrayFrom.length; i++) {
            console.log("copying array item ", i, " is ", arrayFrom[i])
            arrayTo.push(arrayFrom[i])
        }
    }

    function moveCardsToDeck(hand) {

        var isCard = true;
        var sIndex = 0;
        while (isCard) {
            console.log('moving card from container to deck', hand[0]);
            if (hand[0]) {
                if (hand[0].power) {
                    hand[0].power = hand[0].rank;
                }
                $scope.deck.addCard(hand[0]);
            }
            sIndex++;
            if (sIndex > 10) {
                isCard = false;
            }
        }
    }

    function calculateScores() {

        if ($scope.gameInformation.dealerStuck && $scope.gameInformation.numberOfPlayersIn < 2) {
            $scope.gameInformation.currentPlayer.score -= 3;
        } else {
            _.each($scope.gameInformation.playersIn, function (player) {
                if (player.isIn) {
                    if (player === $scope.gameInformation.currentBidOwner) {
                        console.log("Bid was ", $scope.gameInformation.bidTaken)
                        if (player.tricksTaken < $scope.gameInformation.bidTaken) {
                            player.score -= $scope.gameInformation.bidTaken;
                        } else {
                            player.score += player.tricksTaken;

                        }
                    } else {
                        if (player.tricksTaken == 0) {
                            player.score -= $scope.gameInformation.bidTaken;

                        } else {
                            player.score += player.tricksTaken;
                        }
                    }

                }

            });
            console.log('calculateScores check for coded hand', $scope.gameInformation.currentBidOwner);
            var codedHand = CPUService.makeCodedHand($scope.gameInformation.currentBidOwner, $scope.gameInformation.bidTaken, $scope.gameInformation.Dealer);
            console.log("codedHand redturned", codedHand);

            // codedHand['bid'] = $scope.gameInformation.bidTaken;
            // codedHand['dealer'] = $scope.gameInformation.Dealer.location;
            // codedHand['location'] = $scope.gameInformation.currentBidOwner.location;
            // codedHand['score'] = $scope.gameInformation.currentBidOwner.tricksTaken;
            data.push(codedHand);
            if(data.length > 5000){
                console.log("this is data that will be saved", data);
                DataFactory.saveData(data);
            }
            
            
        }
        numHands++;
        console.log("End of hand ", numHands);
    }

    function trickEval(cardToPlay) {
        console.log("trick eval called")
        //trick information, scoring and rotation of player
        var thisCardTrump = false
        $scope.gameInformation.allCardsPlayed.push(cardToPlay);
        if (cardToPlay.suit == $scope.gameInformation.trump || (cardToPlay.rank == 11 && jickSuit(cardToPlay.suit) == $scope.gameInformation.trump)) {
            $scope.gameInformation.trumpPlayed = true;
            thisCardTrump = true;
        }
        if ($scope.gameInformation.trick.length < 1) {
            if (cardToPlay.rank == 11 && jickSuit(cardToPlay.suit) == $scope.gameInformation.trump) {
                $scope.gameInformation.suitLed = jickSuit(cardToPlay.suit)
            } else {
                $scope.gameInformation.suitLed = cardToPlay.suit;
            }
            $scope.gameInformation.topCard = cardToPlay;
            $scope.gameInformation.trickOwner = $scope.gameInformation.currentPlayer;
            console.log("trickOwner = ", $scope.gameInformation.trickOwner);
            $scope.gameInformation.trick.push(cardToPlay);
        } else {
            console.log("calculating top card played in trick.  Card to play ", cardToPlay, " $scope.topCard.rank", $scope.gameInformation.topCard, " trump ", $scope.gameInformation.trump)
            if (cardToPlay.power > $scope.gameInformation.topCard.power && (cardToPlay.suit == $scope.gameInformation.suitLed || thisCardTrump)) {
                $scope.gameInformation.topCard = cardToPlay;
                $scope.gameInformation.trickOwner = $scope.gameInformation.currentPlayer;
                console.log("trickOwner = ", $scope.gameInformation.trickOwner);
            }
            $scope.gameInformation.trick.push(cardToPlay)
            console.log("Trick ", $scope.gameInformation.trick);
        }


    }

    function adjustCardRank() {
        console.log("************Adjusting Ranks *****************")
        _.each($scope.gameInformation.playersIn, function (p) {
            // console.log("player ", p.name);
            _.each(p.hand, function (card) {
                if (card.suit == $scope.gameInformation.trump) {
                    //  console.log("card.rank before for trump", card.rank);
                    card.power = card.rank + 6;
                    //  console.log("card.rank after for trump", card.rank);

                } else {
                    card.power = card.rank;
                }
                if (card.rank == 11 && jickSuit(card.suit) == $scope.gameInformation.trump) {
                    card.power = 21;
                }
                if (card.rank == 11 && card.suit == $scope.gameInformation.trump) {
                    card.power = 22;
                }
            });
        });
    }

    function rotateActivePlayer(currentPlayer) {
        var index = $scope.gameInformation.playersIn.indexOf(currentPlayer);
        console.log("rotate players index of current player before changing", index);
        if (index == $scope.gameInformation.playersIn.length - 1) {
            index = 0;
        } else {
            index++;
        }
        return $scope.gameInformation.playersIn[index];
    }
}
