
vsapp.controller('MainController', MainController)

MainController.$inject = ['$scope', '$location', '$http', '$q', '$rootScope', '$timeout', '$interval', '$mdDialog', '$rootScope', 'DataFactory', 'CPUService', 'Player', 'CommService', 'Rules', 'Utilities'];


function MainController($scope, $location, $http, $q, $rootscope, $timeout, $interval, $mdDialog, $rootScope, DataFactory, CPUService, Player, CommService, Rules, Utilities) {
    'use strict'

    var pause = false;
    $scope.data = [];
    $scope.backupDeals = [];
    var targetData = 10;
    var numHands = 0;
    var autoHands = 1;
    var cardSize = { width: 69, height: 94, padding: 18 } //used to calculate if a card was clicked.
    $scope.auto = true;  //Used for auto play mode;
    var turnOver = true;
    var stop;
    var handInfo = {};
    $scope.itemsToRender = {};
    $scope.playSpeed = 1000;
    $scope.testing = true;
    var playerTurnComplete = false;
    var dealTestHand = false;
    var testHand = { "dealer": "South", "deal": ["S9", "S10", "S11", "D9", "D12", "D14", "C9", "H14", "H13", "H9", "H11", "D13", "D10", "C13", "C11", "C12", "C14", "C10", "H12", "S12", "D11", "H10", "S13", "S14"] };
    var newMessage = '';
    // $scope.test = [
    //     { question: "q1" },
    //     { question: "q2" },
    //     { question: "q3" },
    //     { question: "q4" }
    // ]

    //$scope.newRender = { hands: [], draw: false };
    $scope.activeGame = false;
    $scope.hand = [];
    $scope.trickEnded = false;
    $scope.indexTurn = false;
    $scope.clicked = {};
    $scope.playToo = 5;  //Score to win game
    $scope.customMsg = [];

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

        DataFactory.getDeal().then(function (response) {
            console.log("response for getDeal", response);

            angular.copy(response, $scope.backupDeals);
            console.log("this is the backupDeals", $scope.backupDeals);

        });
        $scope.gameInformation = {
            auto: false,
            allCardsPlayed: [],
            bid: 3,
            bidTaken: 2,
            currentBidOwner: null,
            currentPlayer: null,
            dealer: null,
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

        var newPlayer = new Player({ location: 'North', type: 'human', name: 'nate', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, isbidder: false, isDealer: true, isIn: true, hand: new cards.Hand({ faceUp: true, x: 325, y: 60 }) });
        $scope.gameInformation.playersIn.push(newPlayer);
        $scope.arrayToRender.push(newPlayer.hand);
        newPlayer = new Player({ location: 'East', type: 'cpu', name: 'evan', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, isbidder: false, isDealer: false, isIn: true, hand: new cards.Hand({ faceUp: true, x: 600, y: 300 }) });
        $scope.gameInformation.playersIn.push(newPlayer);
        $scope.arrayToRender.push(newPlayer.hand);
        newPlayer = new Player({ location: 'South', type: 'cpu', name: 'same', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, isbidder: false, isDealer: false, isIn: true, hand: new cards.Hand({ faceUp: true, x: 325, y: 540 }) });
        $scope.gameInformation.playersIn.push(newPlayer);
        $scope.arrayToRender.push(newPlayer.hand);
        newPlayer = new Player({ location: 'West', type: 'cpu', name: 'weseley', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, isbidder: false, isDealer: false, isIn: true, hand: new cards.Hand({ faceUp: true, x: 50, y: 300 }) });
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
        console.log("this is all", cards.all);
        console.log("This is the deck", $scope.deck);
        //$scope.trackingDeck = new cards.Hand();
        // _.each($scope.deck, function(item){
        //     console.log("maincontroller deck item", item)
        //     if(item){
        //         $scope.trackingDeck.addCard(item, true);
        //     }
        // });
        // console.log("tracking deck", $scope.trackingDeck)
        console.log("deck after adding cards to tracking deck", $scope.deck);
        $scope.arrayToRender.push($scope.deck);
        //Lets add a discard pile
        $scope.discardPile = new cards.Hand({ faceUp: true, x: 350, y: 250 });
        //hand to show last trick
        $scope.lastTrickPile = new cards.Hand({ faceUp: true, x: 600, y: 60 });
        $scope.arrayToRender.push($scope.discardPile);
        $scope.arrayToRender.push($scope.lastTrickPile);
        $scope.discardPile.x += 50;
        $scope.gameInformation.numberOfPlayersIn = 4;
        $scope.gameInformation.currentPlayer = $scope.gameInformation.playersIn[0];
        $scope.gameInformation.dealer = $scope.gameInformation.playersIn[0];
        _.each($scope.gameInformation.playersIn, function (p) {
            console.log("checking player if dealer", p, $scope.gameInformation.dealer)
            if (p === $scope.gameInformation.dealer) {
                console.log("Inside if is dealer true")
                p.isDealer = true;
            } else {
                p.isDealer = false;
            }
        })

    };

    init();

    $scope.showTrick = function(){
        console.log("showtrick pause", pause);
        pause = !pause;
        if(pause){
            console.log('This is whats saved in maincontroller $scope.hand', $scope.hand);
            console.log("this is discardPile", $scope.discardPile);
            console.log("and this is the deck", $scope.deck, " and deck .length", $scope.deck.length);
            console.log("other", ($scope.gameInformation.numberOfPlayersIn));
            var examplePile = [];
            var deckLength = $scope.deck.length;
            for(var i = deckLength; i > deckLength - $scope.gameInformation.numberOfPlayersIn; i--){
                console.log("addint card to lastTrickPile ",$scope.deck[0].shortName, " i: ", i);
                $scope.lastTrickPile.addCard($scope.deck[$scope.deck.length-1]);
            }
            $scope.render(true, true, true, true, true, true, true);   
        } else {
            console.log("length ")
            var length = $scope.lastTrickPile.length;
            for(var i = 0; i < length; i++){
                console.log("lastTrick card", $scope.lastTrickPile[0]);
                $scope.deck.addCard($scope.lastTrickPile[0]);
            }
            console.log("The deck ", $scope.deck)
            // var i = 0;
            // while($scope.lastTrickPile[i]){
            //     console.log("Going off pause and putting lastTrick into deck", $scope.lastTrickPile[i], " i ", i);
            //    $scope.deck.addCard($scope.lastTrickPile[i]);
            //    i++
            // }
            onStartTurn();
        }
           

    }

    $scope.logout = function (path) {
        console.log("logout path", path);
        $location.path(path);
        location.reload();
    }

    $scope.cardClick = function (mouseCoords) {
        console.log("human mouseCoords", mouseCoords);

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
            console.log("Not the players hand");
            return;
        } else {
            //check card is legal play
            var legalPlays = Rules.legalPlays($scope.gameInformation.playersIn[0], $scope.gameInformation)
            console.log("legal plays on clicked card is ", legalPlays);
            if (_.findIndex(legalPlays.cards, cardPlayed) < 0) {
                console.log("not legal play findIndex returns", _.findIndex(legalPlays.cards, cardPlayed));
                return;
            }
            onCurrentPlayerEndTurn(cardPlayed);
        }
    }


    $scope.render = function (north, east, south, west, deck, pile, alt) {
        console.log("render called")
        for(var i = 0; i < arguments.length; i++){
            console.log("render arguments", arguments[i]);
        }
        //alt = alt;
        $scope.itemsToRender = { player1: north, player2: east, player3: south, player4: west, deck: deck, pile: pile, alt: alt }
        // $scope.test = itemsToRender;

    }

    $scope.indexPlay = function () {
        // $scope.customMsg = [];
        console.log("indexPlay");
        playerTurnComplete = false;
        onStartTurn();
        // onStartTurn();
        // $scope.indexTurn = true;
        // if ($scope.auto) {
        //     stop = $interval(function () {
        //         if (turnOver) {
        //             // turnOver = false;
        //             console.log("Timer triggered");
        //             onStartTurn();
        //         }

        //     }, 100);
        //     console.log('This is stop in interval start', stop)

        // } else {
        //     onStartTurn();
        // }

    }



    $scope.trumpChoosen = function (value) {
        console.log("trump picked by human", value)

        onCurrentPlayerEndTurn($scope.gameInformation.trump);
    }

    $scope.stay = function () {
        console.log("human stayed")
        onCurrentPlayerEndTurn(true);
    }

    $scope.fold = function () {
        console.log("human folded")
        $scope.gameInformation.currentPlayer.isIn = false;
        onCurrentPlayerEndTurn(false);
    }

    $scope.pass = function () {
        console.log("human passed")
        onCurrentPlayerEndTurn(0);
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

    $scope.test = function () {

        $scope.replaySelector();
        //test factorial
        // console.log('Factorial of 2', Utilities.factorial(2.2));
        // console.log("Combin 24 6", Utilities.combin(24,6));
        // console.log("look at 18 factorial again", Utilities.factorial(18));
        // $scope.DealSpecific(test);
        // console.log("trackingDeck", cards.all);
        // CPUService.setProbabilities($scope.gameInformation);
    }

    $scope.replaySelector = function () {

        var items = {
            backupDeal: $scope.backupDeals,
        }

        $mdDialog.show({
            controller: 'ReplaySelectController',
            templateUrl: '/dealSelector',
            clickOutsideToClose: true,
            fullscreen: false,
            // targetEvent: ev,
            dialogLocals: items,
            //  onComplete: addSubAttribute
        }).then(function (newOptions) {
            console.log('after dialog', newOptions);
            dealTestHand = true;
            testHand = newOptions;
        });
        //  @Jeff todo:  Maybe run replay deal right from here?
        // function addSubAttribute(scope, element, items) {
        //     scope.addSubAttribute();
        // }

    }

    $scope.changeSettings = function () {
        var items = {
            playSpeed: $scope.playSpeed,
            incrementCardPlay: $scope.testing
        }

        $mdDialog.show({
            controller: 'OptionsEditController',
            templateUrl: '/options',
            clickOutsideToClose: true,
            fullscreen: false,
            // targetEvent: ev,
            dialogLocals: items,
            //  onComplete: addSubAttribute
        }).then(function (newOptions) {
            console.log('after dialog', newOptions);
            $scope.playSpeed = newOptions.playSpeed;
            $scope.testing = newOptions.incrementCardPlay;
        });

        function addSubAttribute(scope, element, items) {
            scope.addSubAttribute();
        }
    }

    $scope.checkProbabilities = function () {
        var items = {
            cards: cards.all
        }

        $mdDialog.show({
            controller: 'ProbabilityTableController',
            templateUrl: '/probabilityTable',
            clickOutsideToClose: true,
            fullscreen: true,
            // targetEvent: ev,
            dialogLocals: items,
            //  onComplete: addSubAttribute
        }).then(function (newOptions) {
            console.log('after dialog', newOptions);
        });
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
            //$scope.gameInformation.bid++;
            $scope.gameInformation.currentBidOwner = $scope.gameInformation.currentPlayer;
            onCurrentPlayerEndTurn($scope.gameInformation.bid);
        }
    }

    $scope.stopGame = function () {
        $interval.cancel(stop);
        stop = undefined;
        console.log("StopGame called")
        $scope.testing = !$scope.testing;
        // if (angular.isDefined(stop)) {
        //     $interval.cancel(stop);
        //     stop = undefined;
        // }
    }

    $scope.$on('$destroy', function () {
        console.log("Scope.on destroy called");
        $scope.stopGame();
    })



    function onStartTurn() {

        if(pause){
            
        } else {
            console.log("beggining of onStartTurn testing, gamestate, playerTurnComplete", $scope.testing, $scope.gameInformation.gameState, playerTurnComplete);
            if ($scope.testing == true && $scope.gameInformation.gameState == 'Play' && playerTurnComplete) {
                $scope.render(true, true, true, true, true, true, true);
            } else {
                $timeout(function () {
                    console.log("inside timeout function", $scope.gameInformation.currentPlayer.name, ($scope.gameInformation.currentPlayer.isIn));
                    if ($scope.gameInformation.currentPlayer.isIn) {
                        if ($scope.gameInformation.gameState == 'Deal') {
                            onCurrentPlayerEndTurn(null);
                        } else {
                            console.log("not deal state check not handend", $scope.gameInformation.gameState)
                            if ($scope.gameInformation.gameState != 'HandEnd') {
                                console.log("onStartTurn check human vs cpu activegame and currentPlayerType", $scope.currentPlayer, $scope.activeGame, $scope.gameInformation.currentPlayer.type)
                                if ($scope.activeGame && $scope.gameInformation.currentPlayer.type == 'cpu') {
                                    $scope.gameInformation.currentPlayer.setNextAction($scope.gameInformation.gameState);
                                    var playerAction = $scope.gameInformation.currentPlayer.nextAction($scope.gameInformation.currentPlayer, $scope.gameInformation);
                                    onCurrentPlayerEndTurn(playerAction);
                                } else {
                                    console.log("Human player turn or end of game", angular.isDefined(stop))
                                    console.log("this is stop", stop)
                                    // $scope.stopGame();
                                }
                            } else {
                                onCurrentPlayerEndTurn(null);
                            }
    
                        }
                        //  $scope.render(true, true, true, true, true, true, true);
                    } else {
                        console.log($scope.gameInformation.currentPlayer.location, " not in")
                        onCurrentPlayerEndTurn(null);
                    }
                    // turnOver = true;
    
                }, $scope.playSpeed);
    
                console.log("end of timeout")
            }
    

        }
        
    }

    function onCurrentPlayerEndTurn(playerAction) {
        playerTurnComplete = true;
        console.log("onLastTurn gamestate before switch ", $scope.gameInformation.gameState);
        console.log($scope.gameInformation.currentPlayer.name, " action is ", playerAction);

        switch ($scope.gameInformation.gameState) {
            case 'Deal':
                if (dealTestHand) {
                    dealTestHand = false;
                    $scope.gameInformation.dealer.isDealer = false;
                    _.each($scope.gameInformation.playersIn, function (player) {
                        for (var j = 0; j < 6; j++) {
                            player.hand.addCard($scope.deck.dealSpecific(testHand.deal.shift()));
                        }
                    });
                    _.each($scope.gameInformation.playersIn, function (player) {
                        console.log("player location and testhand.dealer", $scope.gameInformation.dealer, player);
                        if (player.location == testHand.dealer) {
                            $scope.gameInformation.dealer = player;
                            player.isDealer = true;
                            console.log("player in deal test hand that is current ", $scope.gameInformation.currentPlayer);

                        }
                    });

                } else {
                    cards.shuffle($scope.deck);
                    $scope.deck.deal(6, [$scope.gameInformation.playersIn[0].hand, $scope.gameInformation.playersIn[1].hand, $scope.gameInformation.playersIn[2].hand, $scope.gameInformation.playersIn[3].hand], 50, function () {
                    });
                    var data = { dealer: {}, deal: [] };
                    console.log("Dealer", $scope.gameInformation);
                    console.log("gameInformation.dealer.location", $scope.gameInformation.dealer.location);
                    data.dealer = $scope.gameInformation.dealer.location;
                    _.each($scope.gameInformation.playersIn, function (player) {
                        _.each(player.hand, function (card) {
                            data.deal.push(card.name);
                        })
                    });
                    DataFactory.saveHand(data);

                }

                CPUService.setProbabilities($scope.gameInformation);
                $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.currentPlayer);
                $scope.gameInformation.gameState = 'Bidding';
                if ($scope.gameInformation.currentPlayer.type == 'cpu') {
                    onStartTurn();
                };
                break;
            case 'Bidding':
                //track bidding.  Bidding over when dealer bid

                if (playerAction == 0) {
                    //0 bid is pass
                    $scope.gameInformation.currentPlayer.bid = false;
                    newMessage = $scope.gameInformation.gameState + " " + $scope.gameInformation.currentPlayer.name + " passed " + playerAction;
                    $scope.customMsg.push(newMessage);
                } else {
                    $scope.gameInformation.bidTaken = playerAction;
                    $scope.gameInformation.numBids++;
                    $scope.gameInformation.currentBidOwner = $scope.gameInformation.currentPlayer;
                    newMessage = $scope.gameInformation.gameState + " " + $scope.gameInformation.currentPlayer.name + " bid " + playerAction;
                    $scope.customMsg.push(newMessage);
                    console.log("Bidding and currentBidOwner is", $scope.gameInformation.currentBidOwner);
                }
                if ($scope.gameInformation.currentPlayer === $scope.gameInformation.dealer) {
                    if ($scope.gameInformation.numBids < 1) {
                        //deal stuck and folded
                        console.log("Dealer stuck and folded");
                        $scope.gameInformation.numberOfPlayersIn = 0;
                        $scope.gameInformation.dealerStuck = true;
                        $scope.gameInformation.gameState = 'HandEnd'

                    } else if ($scope.gameInformation.numBids == 1 && $scope.gameInformation.currentBidOwner === $scope.gameInformation.dealer) {
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
                if ($scope.gameInformation.currentPlayer.type == 'cpu') {
                    onStartTurn();
                };
                break;
            case 'PickTrump':
                $scope.gameInformation.trump = playerAction;
                $scope.gameInformation.currentPlayer.isIn = true;
                $scope.gameInformation.currentPlayer.isbidder = true;
                Rules.adjustCardRank($scope.gameInformation);
                newMessage = $scope.gameInformation.gameState + " " + $scope.gameInformation.currentPlayer.name + " declared " + playerAction;
                $scope.customMsg.push(newMessage);

                if ($scope.gameInformation.dealerStuck) {
                    CPUService.adjustFoldProb($scope.gameInformation, $scope.gameInformation.currentBidOwner);
                    $scope.gameInformation.gameState = 'Play';
                } else {
                    $scope.gameInformation.gameState = 'StayOrFold';
                }
                $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.currentBidOwner);
                console.log("PickTrump and bidowner  ", $scope.gameInformation.currentBidOwner, " bidTaken ", $scope.gameInformation.currentBidOwner.bidTaken)
                //CPUService.setProbabilities($scope.gameInformation);
                if ($scope.gameInformation.currentPlayer.type == 'cpu') {
                    onStartTurn();
                };
                break;
            case 'StayOrFold':
                $scope.gameInformation.currentPlayer.isIn = playerAction;
                if (!playerAction) {
                    $scope.gameInformation.currentPlayer.isIn = false;
                    newMessage = $scope.gameInformation.gameState + " " + $scope.gameInformation.currentPlayer.name + " folded " + playerAction;
                    $scope.customMsg.push(newMessage);
                    $scope.gameInformation.numberOfPlayersIn--;
                } else {
                    newMessage = $scope.gameInformation.gameState + " " + $scope.gameInformation.currentPlayer.name + " is staying " + playerAction;
                    $scope.customMsg.push(newMessage);
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
                        console.log("**************** MainController calling adjust fold probabilities *************** ");
                        CPUService.adjustFoldProb($scope.gameInformation, $scope.gameInformation.currentBidOwner);
                        $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.dealer);
                    }
                }
                if ($scope.gameInformation.currentPlayer.type == 'cpu') {
                    onStartTurn();
                };
                break;
            case 'Play':

                if (!playerAction || ($scope.gameInformation.currentPlayer.type == 'Human' && $scope.gameInformation.currentPlayer.isIn == false)) {
                    console.log("in play and no player action or human and not in so rotating player", playerAction)
                    $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.currentPlayer);

                } else {
                    //console.log('in play and about to check trick length is 0 to move cards to deck', $scope.gameInformation.trick.length);
                    // if ($scope.gameInformation.trick.length == 0) {

                    // }
                    newMessage = $scope.gameInformation.gameState + " " + $scope.gameInformation.currentPlayer.name + " played card " + playerAction.shortName;
                    $scope.customMsg.push(newMessage);
                    $scope.discardPile.addCard(playerAction);
                    CPUService.adjustCardProb($scope.gameInformation, $scope.gameInformation.currentPlayer, playerAction);
                    trickEval(playerAction);
                    $scope.gameInformation.currentPlayer = rotateActivePlayer($scope.gameInformation.currentPlayer);
                    console.log("just returned from play call to rotate player and active player is now", $scope.gameInformation.currentPlayer.name)
                    //here the trick has ended and maybe the hand
                    if ($scope.gameInformation.trick.length == $scope.gameInformation.numberOfPlayersIn) {
                        console.log("Trick finished, winner ", $scope.gameInformation.trickOwner);
                        newMessage = $scope.gameInformation.gameState + " " + $scope.gameInformation.trickOwner.name + " won the trick number " + $scope.gameInformation.tricks;
                        $scope.customMsg.push(newMessage);
                        //trick is over score it and winner is active player
                        $scope.gameInformation.tricks++;
                        $scope.hand.push($scope.gameInformation.trick);
                        $scope.gameInformation.trick = [];
                        $scope.gameInformation.trumpPlayed = null;
                        console.log("number of tricks ", $scope.gameInformation.tricks);
                        $scope.gameInformation.trickOwner.tricksTaken++;
                        $scope.trickEnded = true;
                        $timeout(function () {
                            moveCardsToDeck($scope.discardPile);

                        }, 2000);
                        if ($scope.gameInformation.tricks == 6) {
                            //hand has ended score it and deal
                            $scope.gameInformation.gameState = 'HandEnd'
                        } else {
                            //rearrange playersIn order based on trick winner
                            $scope.gameInformation.currentPlayer = $scope.gameInformation.trickOwner;
                        }
                    }
                }
                console.log("after play check if current player is computer.  Current player is ", $scope.gameInformation.currentPlayer);
                if ($scope.gameInformation.currentPlayer.type == 'cpu') {
                    onStartTurn();
                };
                break;

            case 'HandEnd':
                console.log("HandEnded");
                calculateScores();
                var potentialWinner;
                resetDeck();
                console.log("HandEnd check if game is over")
                _.each($scope.gameInformation.playersIn, function (p) {
                    console.log("HandEnd check player and score ", p.score, p.location, $scope.playToo)

                    if (p.score > $scope.playToo) {
                        $scope.gameInformation.gameState = 'GameOver'

                        if (potentialWinner && p.score > potentialWinner.score) {
                            p.isWinner = true;
                            potentialWinner = p;
                        } else {
                            p.isWinner = true;
                            potentialWinner = p;
                        }
                    }
                });
                if ($scope.gameInformation.gameState == 'Deal') {
                    onStartTurn();
                }
                break;
            case 'GameOver':
                $scope.stopGame();
        }
        $scope.render(true, true, true, true, true, true, true);

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
        $scope.gameInformation.dealer = rotateActivePlayer($scope.gameInformation.dealer);
        $scope.gameInformation.currentPlayer = $scope.gameInformation.dealer;
        $scope.gameInformation.currentPlayer.isDealer = true;
        $scope.gameState = "Deal";
        $scope.render(true, true, true, true, true, true, true);
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
        if (hand[0]) {
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
        $scope.render(true, true, true, true, true, true, true);
    }

    function calculateScores() {

        if ($scope.gameInformation.dealerStuck && $scope.gameInformation.numberOfPlayersIn < 2) {
            newMessage = $scope.gameInformation.dealer.location + " stuck and folded dealer score reduced 3";
            $scope.customMsg.push(newMessage);
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
                $scope.customMsg.push(player.name + " score  for hand is " + player.score);

            });

            try {
                if (!$scope.gameInformation.currentBidOwner.tricksTaken) throw "no tricks for bidder";

            }
            catch (err) {
                console.log(err);
                $scope.stopGame();
            }
            var codedHand = CPUService.makeCodedHand($scope.gameInformation.currentBidOwner, $scope.gameInformation.bidTaken, $scope.gameInformation.dealer);
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
        if (cardToPlay.suit == $scope.gameInformation.trump || (cardToPlay.rank == 11 && Rules.jickSuit(cardToPlay.suit) == $scope.gameInformation.trump)) {
            console.log("**** Setting trumpPlayed to true currently it is ", $scope.gameInformation.trumpPlayed)
            $scope.gameInformation.trumpPlayed = true;
            thisCardTrump = true;
        }
        if ($scope.gameInformation.trick.length < 1) {
            if (cardToPlay.rank == 11 && Rules.jickSuit(cardToPlay.suit) == $scope.gameInformation.trump) {
                $scope.gameInformation.suitLed = Rules.jickSuit(cardToPlay.suit)
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



    function rotateActivePlayer(currentPlayer) {
        var returnPlayer = {};
        var index = $scope.gameInformation.playersIn.indexOf(currentPlayer);
        var notFound = true;
        while (notFound) {
            if (index == $scope.gameInformation.playersIn.length - 1) {
                index = 0;
            } else {
                index++;
            }
            if ($scope.gameInformation.playersIn[index].isIn == true) {
                notFound = false;
            }
        }

        console.log("before returning this is index", index);
        return $scope.gameInformation.playersIn[index];
    }
}
