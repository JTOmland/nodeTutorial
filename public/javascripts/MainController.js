
vsapp.controller('MainController', MainController)

MainController.$inject = ['$scope', '$http', '$q', '$rootScope', '$timeout', '$interval', '$mdDialog', '$rootScope', 'DataFactory', 'CPUService', 'Player', 'CommService'];


function MainController($scope, $http, $q, $rootscope, $timeout, $interval, $mdDialog, $rootScope, DataFactory, CPUService, Player, CommService) {
    'use strict'
    $scope.data = [];
    var targetData = 10;
    var numHands = 0;
    var autoHands = 1;
    var cardSize = { width: 69, height: 94, padding: 18 } //used to calculate if a card was clicked.
    $scope.auto = true;  //Used for auto play mode;
    var turnOver = true;
    var stop;
    var handInfo = {};

    $scope.test = {};
    //$scope.newRender = { hands: [], draw: false };
    $scope.activeGame = false;
    $scope.hand = [];
    $scope.trickEnded = false;
    $scope.indexTurn = false;
    $scope.clicked = {};
    $scope.playToo = 10;  //Score to win game

    function init() {
        DataFactory.getData().then(function (response) {
            console.log("response for data get", response);

            angular.copy(response, handInfo);
            // console.log("HandInfo", handInfo)
            var counter = 0;
            var myHand = [];
            for (var key in handInfo) {
                counter++;
            };
            console.log("number of objects in response ", counter);
        });
        $scope.gameInformation = {
            auto: false,
            actors: [],
            allCardsPlayed: [],
            bid: 3,
            bidTaken: 2,
            currentBidOwner: null,
            currentPlayer: null,
            dealerStuck: false,
            gameState: 'Deal',
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
        _.each($scope.gameInformation.playersIn, function(p){
            console.log("checking player if dealer", p, $scope.gameInformation.Dealer)
            if(p === $scope.gameInformation.Dealer){
                console.log("Inside if is dealer true")
                p.isDealer = true;
            } else {
                p.isDealer = false;
            }
        })

    };

    init();

    $scope.cardClick = function (mouseCoords) {
        console.log("mouseCoords", mouseCoords);

        if ($scope.gameInformation.gameState != 'Play') {
            return;
        }
        $scope.clicked.x = mouseCoords.x;
        $scope.clicked.y = mouseCoords.y;
        var cardPlayed;
        var playersHandClicked;
        _.each($scope.gameInformation.playersIn, function (p) {
            _.each(p.hand, function (card) {
                if (mouseCoords.x > card.hitX && mouseCoords.x < card.hitX + card.hitXadd && card.hitY > mouseCoords.y && card.hitY < mouseCoords.y + cardSize.height) {
                    console.log('card selected is ', card);
                    cardPlayed = card;
                    playersHandClicked = p.location;
                }
            });
        });
        console.log("handClicked ", playersHandClicked, " activePlayer", )
        if (playersHandClicked != $scope.gameInformation.currentPlayer.location) {
            console.log("Not the players hand")
        } else {
            onCurrentPlayerEndTurn(cardPlayed);
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
                   // turnOver = false;
                   console.log("Timer triggered");
                    onStartTurn();
                }

            }, 100);

        } else {
            onStartTurn();
        }

    }



    $scope.trumpChoosen = function (value) {
        console.log("trump picked by human", value)

        onCurrentPlayerEndTurn($scope.gameInformation.trump);
    }

    $scope.stay = function () {
        onCurrentPlayerEndTurn(true);
    }

    $scope.fold = function () {
        $scope.gameInformation.currentPlayer.isIn = false;
        onCurrentPlayerEndTurn(false);
    }

    $scope.pass = function () {
        onCurrentPlayerEndTurn(false);
    }

    $scope.DealRandom = function () {
        player[$scope.activePlayer].hand.addCard($scope.deck.DealRandom());
        player[$scope.activePlayer].hand.render();
        $scope.activePlayer = rotateActivePlayer($scope.activePlayer);
    }

    $scope.DealSpecific = function (c) {
        console.log("DealSpecific called")
        $scope.gameInformation.currentPlayer.hand.addCard($scope.deck.dealSpecific(c))
        $scope.render(true, true, true, true, true, true, true);

    }

    $scope.increaseBid = function () {
        $scope.gameInformation.bid++;
    }

    $scope.decreaseBid = function () {
        $scope.gameInformation.bid--;
    }

    $scope.inputBid = function () {
        console.log("inputBid ", $scope.gameInformation.bid);
        if ($scope.gameInformation.bid > $scope.gameInformation.bidTaken) {
            $scope.gameInformation.bidTaken = $scope.gameInformation.bid;
            $scope.gameInformation.bid++;
            $scope.gameInformation.currentBidOwner = $scope.gameInformation.currentPlayer;
            onCurrentPlayerEndTurn($scope.gameInformation.bid);
        }
    }

    $scope.stopGame = function () {
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }
    }

    $scope.$on('$destroy', function () {
        console.log("Scope.on destroy called");
        $scope.stopGame();
    })



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
            onCurrentPlayerEndTurn(null);
        }
       // turnOver = true;

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
                    console.log("Bidding and currentBidOwner is", $scope.gameInformation.currentBidOwner);
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
                $scope.gameInformation.currentPlayer.isIn = true;
                 $scope.gameInformation.currentPlayer.isbidder = true;
                adjustCardRank();
                if ($scope.gameInformation.dealerStuck) {
                    $scope.gameInformation.gameState = 'Play';
                } else {
                    $scope.gameInformation.gameState = 'StayOrFold';
                }
                $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.currentBidOwner);
                console.log("PickTrump and bidowner  ", $scope.gameInformation.currentBidOwner, " bidTaken ", $scope.gameInformation.currentBidOwner.bidTaken)
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
                        $scope.gameInformation.currentBidOwner.tricksTaken = $scope.gameInformation.bidTaken;
                        $scope.gameInformation.gameState = 'HandEnd';
                        console.log("Everyone folded after bid bidowner", $scope.gameInformation.currentBidOwner, " and bidTaken ", $scope.gameInformation.bidTaken);
                    } else {
                        $scope.gameInformation.gameState = 'Play';
                        $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.Dealer);
                    }
                }

                break;
            case 'Play':
                if (!playerAction || ($scope.gameInformation.currentPlayer.type == 'Human' && $scope.gameInformation.currentPlayer.isIn == false)) {
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
                resetDeck();
                var potentialWinner;
                 _.each($scope.gameInformation.playersIn, function(p){
                    if(p.score > $scope.playToo){
                        $scope.gameInformation.gameState = 'GameOver'
                        if(potentialWinner  && p.score>potentialWinner.score){
                            p.isWinner = true;
                            potentialWinner = p;
                        }
                    }
                 });
                break;
            case 'GameOver':
                $scope.stopGame();
        }
    }

    function resetDeck() {
        //pull all cards from hands and discard and put back in deck
        //clear trick scores from players
        //set gameState to deal.
        $scope.hand = [];
        console.log("resetDeck")
        moveCardsToDeck($scope.discardPile);
        var lastDealer = null;
        $scope.gameInformation.bid = 3;
        $scope.gameInformation.bidTaken = 2;
        $scope.gameInformation.currentBidOwner = null;
        $scope.gameInformation.currentPlayer = null;
        $scope.gameInformation.dealerStuck = false;
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

            try {
                if (!$scope.gameInformation.currentBidOwner.tricksTaken) throw "no tricks for bidder";

            }
            catch (err) {
                console.log(err);
                $scope.stopGame();
            }
            var codedHand = CPUService.makeCodedHand($scope.gameInformation.currentBidOwner, $scope.gameInformation.bidTaken, $scope.gameInformation.Dealer);
            if (codedHand) {
                $scope.data.push(codedHand);
                if ($scope.data.length > 0) {
                    console.log("this is data that will be saved before clearing", $scope.data);
                    DataFactory.saveData($scope.data);
                    $scope.data = [];
                }

            }
        }
        numHands++;
        console.log("End of hand ", numHands);
    }

    function convertCode(code) {

        // console.log('code first two digits', code);
        var index = code.indexOf('NT');
        //if index is odd then has a nine
        var card;
        var goodCards = [];
        var currentSuit = ['S', 'H', 'D', 'C', 'End'];
        var sIndex = 0;
        for (var i = 0; i < code.length; i++) {
            if (code[i] == '1') {
                card = currentSuit[sIndex];
                card += code[i];
                card += code[i + 1];
                i++;
                goodCards.push(card);
                card = '';
            } else {
                if (code[i].toUpperCase() == "N") {
                    //skip
                    card = '';
                    sIndex++;
                } else {
                    if (code[i].toUpperCase() == "T") {
                        card = '';
                    }
                    if (code[i] == '9') {
                        card = currentSuit[sIndex];
                        card += code[i];
                        goodCards.push(card);
                        card = '';
                    } else {
                    }
                }
            }
        }

        //console.log(goodCards);
        return goodCards;
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

    function jickSuit(suit) {
        switch (suit) {
            case 'd':
                return 'h'
            case 'h':
                return 'd'
            case 's':
                return 'c'
            case 'c':
                return 's'
        }
    }
}
