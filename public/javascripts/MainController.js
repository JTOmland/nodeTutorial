'use strict'
vsapp.controller('MainController', MainController)

MainController.$inject = ['$scope', '$http', '$q', '$rootScope', '$timeout', '$interval', '$mdDialog', '$rootScope', 'DataFactory', 'CPUService', 'Player', 'CommService'];


function MainController($scope, $http, $q, $rootscope, $timeout, $interval, $mdDialog, $rootScope, DataFactory, CPUService, Player, CommService) {
    var data = [];
    var numHands = 0;
    var autoHands = 1;
    var cardSize = { width: 69, height: 94, padding: 18 }
    $scope.auto = true;
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

        var newPlayer = new Player({ location: 'East', type: 'cpu', name: 'evan', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, isbidder: false, isDealer: true, isIn: true, hand: new cards.Hand({ faceUp: true, x: 600, y: 300 }) });
        $scope.gameInformation.actors.push(newPlayer);
        $scope.gameInformation.playersIn.push(newPlayer);
        newPlayer = new Player({ location: 'South', type: 'cpu', name: 'same', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, isbidder: false, isDealer: true, isIn: true, hand: new cards.Hand({ faceUp: true, x: 325, y: 540 }) });
        $scope.gameInformation.actors.push(newPlayer);
        $scope.gameInformation.playersIn.push(newPlayer);
        newPlayer = new Player({ location: 'West', type: 'cpu', name: 'weseley', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, isbidder: false, isDealer: true, isIn: true, hand: new cards.Hand({ faceUp: true, x: 50, y: 300 }) });
        $scope.gameInformation.actors.push(newPlayer);
        $scope.gameInformation.playersIn.push(newPlayer);
        newPlayer = new Player({ location: 'North', type: 'cpu', name: 'nate', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, isbidder: false, isDealer: true, isIn: true, hand: new cards.Hand({ faceUp: true, x: 325, y: 60 }) });
        $scope.gameInformation.actors.push(newPlayer);
        $scope.gameInformation.playersIn.push(newPlayer);
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
        for (var i = 0; i < $scope.gameInformation.actors.length; i++) {
            $scope.arrayToRender.push($scope.gameInformation.actors[i].hand);
        }
        $scope.gameInformation.currentPlayer = $scope.gameInformation.playersIn[0];
        $scope.gameInformation.Dealer = $scope.gameInformation.playersIn[3];

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
        onStartTurn();
       // return $scope.test;
    }

    $scope.indexPlayer = function () {
        $scope.index = true;
        $scope.indexPlay();

    }

    $scope.indexPlay = function () {
        console.log("indexPlay");
        //$scope.indexTurn = true;
        stop = $interval(function(){
            $scope.render(true, true, true, true, true, true, true);}, 500);

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
        if ($scope.gameInformation.currentPlayer.dealerStuck && $scope.gameInformation.currentPlayer == 0) {
            $scope.gameInformation.currentPlayer.score -= 3;
        } else {
            _.each($scope.gameInformation.playersIn, function (player) {
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
                        player.score += player.tricksTaken
                    }
                }

            });
            if ($scope.gameInformation.currentBidOwner.codedHand) {
                $scope.gameInformation.currentBidOwner.codedHand[Object.keys(player.codedHand)].score = $scope.gameInformation.currentBidOwner.tricksTaken;
                data.push($scope.gameInformation.currentBidOwner.codedHand);
                // DataFactory.saveData(data);
                // console.log($scope.player[$scope.currentBidOwner], ' coded hand ', $scope.player[$scope.currentBidOwner].codedHand);
                // DataFactory.getData().then(function (response) {
                //     console.log(response)
                // });
            }

        }
        numHands++;
        console.log("End of hand ", numHands);
        if (numHands > 20) {
            $scope.auto = false;
        }

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
        _.each($scope.gameInformation.actors, function (p) {
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


    $scope.trumpChoosen = function (value) {
        $scope.trump = value || $scope.trump;
        adjustCardRank();
        console.log("trump chossen trump is", $scope.trump);
        if ($scope.isStuck) {
            $scope.playersIn.push($scope.player['North']);
            $scope.playersIn.push($scope.player['East']);
            $scope.playersIn.push($scope.player['South']);
            $scope.playersIn.push($scope.player['West']);
            $scope.gameState = 'Play'
            $scope.activePlayer = rotateActivePlayer($scope.currentBidOwner);
            $scope.handLeader = $scope.activePlayer;
            if ($scope.player[$scope.activePlayer].type == 'cpu') {
                $scope.indexPlay();
            }

        } else {
            $scope.playersIn.push($scope.activePlayer);
            $scope.gameState = 'StayOrFold';
            $scope.activePlayer = rotateActivePlayer($scope.currentBidOwner);
            if ($scope.player[$scope.activePlayer].type == 'cpu') {
                var cpuStay = CPUService.cpuStayDecision($scope.player[$scope.activePlayer], $scope.trump, $scope.handLeader, $scope.activePlayer, $scope.suitLed, $scope.trumpPlayed);
                if (cpuStay) {
                    $scope.stay();
                } else {
                    $scope.fold();
                }
            }
        }
    }

    $scope.stay = function () {
        console.log("staying is ", $scope.activePlayer);
        $scope.playersIn.push($scope.activePlayer);
        $scope.activePlayer = rotateActivePlayer($scope.activePlayer);
        var leaderFound = false;
        if ($scope.activePlayer == $scope.currentBidOwner) {
            $scope.gameState = 'Play';
            if ($scope.player[$scope.activePlayer].type == 'cpu') {
                $scope.player[$scope.activePlayer].codedHand = CPUService.makeCodedHand($scope.player[$scope.currentBidOwner], $scope.bidTaken, $scope.Dealer);
            }
            console.log('player with coded hand', $scope.player[$scope.activePlayer]);
            $scope.activePlayer = rotateActivePlayer($scope.Dealer);
            if (_.includes($scope.playersIn, $scope.activePlayer)) {
                $scope.handLeader = $scope.activePlayer;
                leaderFound = true;
            }
            while (!leaderFound) {
                $scope.activePlayer = rotateActivePlayer($scope.activePlayer);
                if (_.includes($scope.playersIn, $scope.activePlayer)) {
                    $scope.handLeader = $scope.activePlayer;
                    leaderFound = true;
                }
            }
            if ($scope.player[$scope.activePlayer].type == 'cpu') {
                $scope.indexPlay();
            }
        } else {
            if ($scope.player[$scope.activePlayer].type == 'cpu') {
                var cpuStay = CPUService.cpuStayDecision($scope.player[$scope.activePlayer], $scope.trump);
                if (cpuStay) {
                    $scope.stay()
                } else { $scope.fold() }
            }
        }
    }

    $scope.fold = function () {
        var leaderFound = false;
        $scope.activePlayer = rotateActivePlayer($scope.activePlayer);
        console.log("folding is ", $scope.activePlayer, $scope.currentBidOwner, $scope.playersIn.length);

        if ($scope.activePlayer == $scope.currentBidOwner) {
            //Check if any stayers
            if ($scope.playersIn.length < 2) {
                //nobody stayed game over
                console.log('Hand over everyone folded.  Score bidding bid and set everyone else')
                _.each($scope.player, function (p) {
                    if (p.location = $scope.currentBidOwner) {
                        p.tricksTaken = $scope.bidTaken;
                    } else {
                        p.tricksTaken -= $scope.bidTaken;
                    }

                });
                calculateScores();
            } else {
                $scope.gameState = 'Play';
                $scope.player[$scope.activePlayer].codedHand = CPUService.makeCodedHand($scope.player[$scope.currentBidOwner], $scope.bidTaken, $scope.Dealer);
                console.log('player with coded hand', $scope.player[$scope.activePlayer]);
                $scope.activePlayer = rotateActivePlayer($scope.Dealer);
                if (_.includes($scope.playersIn, $scope.activePlayer)) {
                    $scope.handLeader = $scope.activePlayer;
                    leaderFound = true;
                }
                while (!leaderFound) {
                    $scope.activePlayer = rotateActivePlayer($scope.activePlayer);
                    console.log("searching for hand lead for ", $scope.activePlayer);
                    if (_.includes($scope.playersIn, $scope.activePlayer)) {
                        $scope.handLeader = $scope.activePlayer;
                        leaderFound = true;
                    }

                }
                if ($scope.player[$scope.activePlayer].type == 'cpu') {
                    $scope.indexPlay();
                }
            }
        } else {
            if ($scope.player[$scope.activePlayer].type == 'cpu') {
                var cpuStay = CPUService.cpuStayDecision($scope.player[$scope.activePlayer], $scope.trump);
                if (cpuStay) {
                    $scope.stay()
                } else { $scope.fold() }
            }
        }
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
        console.log($scope.activePlayer, " passed");
        if ($scope.activePlayer === $scope.Dealer) {
            if ($scope.bidTaken && $scope.player[$scope.currentBidOwner]) {
                $scope.activePlayer = $scope.currentBidOwner;
                $scope.player[$scope.currentBidOwner].isbidder = true;
                $scope.gameState = 'PickTrump';
                if ($scope.player[$scope.activePlayer].type == 'cpu') {
                    //goto cpuBidDecision
                    $scope.trumpChoosen(CPUService.cpuPickTrump($scope.player[$scope.activePlayer]));
                }
            } else { //dealer was stuck and folded
                $scope.isStuck = true;
                console.log("dealer stuck and folded end of hand need to write scoring here in $scope.pass")
                calculateScores();
            }
        } else {
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

    $scope.$on('$destroy', function() {
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
        $scope.gameInformation.playersIn = [];
        $scope.gameInformation.playersPlaying = [];
        $scope.gameInformation.numBids = 0;
        $scope.gameInformation.suitLed = null;
        $scope.gameInformation.trump = null;
        $scope.gameInformation.trick = [];
        $scope.gameInformation.trickOwner = null;
        $scope.gameInformation.topCard = null;
        $scope.gameInformation.trumpPlayed = null;
        $scope.gameInformation.tricks = 0;
        _.each($scope.gameInformation.actors, function (p) {
            $scope.gameInformation.playersIn.push(p)
            if (p.isDealer == true) {
                lastDealer = p;
            }
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
        //to rotate dealer simply shift and push first player
        var temp = $scope.gameInformation.playersIn.shift(0);
        $scope.gameInformation.playersIn.push(temp);
        //Then copy array into actors to perserve original order
        $scope.gameInformation.actors = [];
        copyArray($scope.gameInformation.playersIn, $scope.gameInformation.actors)
        $scope.gameInformation.currentPlayer = $scope.gameInformation.playersIn[0];
        $scope.gameInformation.Dealer = $scope.gameInformation.playersIn[3];
        // printPlayersInArray($scope.gameInformation.playersIn, "Player ");
        // console.log("After reset deck playersIn");
        // printPlayersInArray($scope.gameInformation.actors, "Actor ");
        // printPlayersInArray($scope.deck, 'card in deck before shuffle');
        cards.shuffle($scope.deck);
        $scope.newDeal();
        //  printPlayersInArray($scope.deck, 'card in deck shuffle');
        $scope.gameState = "Deal";

    }
   
    function onLastTurn() {
        console.log("onLastTurn gamestate before switch ", $scope.gameInformation.gameState)
        switch ($scope.gameInformation.gameState) {
            case 'Deal':
                $scope.gameInformation.gameState = 'Bidding';
                break;
            case 'Bidding':
                $scope.gameInformation.gameState = 'PickTrump';
                //rearrange playersIn order based on which player has bid.
                console.log("bidowner", $scope.gameInformation.currentBidOwner, " index ", $scope.gameInformation.playersIn.indexOf($scope.gameInformation.currentBidOwner));
                rotateArray($scope.gameInformation.currentBidOwner, 0);
                break;
            case 'PickTrump':
                if($scope.gameInformation.numBids < 1){
                    $scope.gameInformation.dealerStuck = true;
                }
                adjustCardRank();
                $scope.gameInformation.gameState = 'StayOrFold';
                //remove bidder from array since his turn was picking trump will push back on in stay fold
                var index = $scope.gameInformation.playersIn.indexOf($scope.gameInformation.currentBidOwner);
                $scope.gameInformation.playersIn.splice(index, 1);
                break;
            case 'StayOrFold':
                //Adjust playersIn to reflect only the players staying
                $scope.gameInformation.playersPlaying.push($scope.gameInformation.currentBidOwner)
                console.log("stayorfold playersPlaying");
                $scope.gameInformation.playersIn = [];
                var index = $scope.gameInformation.actors.length;
                for (var i = 0; i < index; i++) {
                    //console.log("check includes for ", $scope.gameInformation.actors[i]);
                    if (_.includes($scope.gameInformation.playersPlaying, $scope.gameInformation.actors[i])) {
                        //console.log("adding ",$scope.gameInformation.actors[i].name)
                        $scope.gameInformation.playersIn.push($scope.gameInformation.actors[i]);
                        //printPlayersInArray($scope.gameInformation.playersIn, "PlayersIn ");
                    }
                }
                console.log("&&&&&& This is playersIn after removing players")
                printPlayersInArray($scope.gameInformation.playersIn, "PlayersIn  item ");
                $scope.gameInformation.gameState = 'Play'
                break;
            case 'Play':
                //here the trick has ended and maybe the hand
                console.log("Next log should be trick finished, winner ");
                if ($scope.gameInformation.trick.length == $scope.gameInformation.playersIn.length) {
                    console.log("Trick finished, winner ", $scope.gameInformation.trickOwner);
                    //trick is over score it and winner is active player
                    $scope.gameInformation.tricks++;
                    console.log("number of tricks ", $scope.gameInformation.tricks);
                    $scope.gameInformation.trickOwner.tricksTaken++;
                    console.log("empty discardPile", $scope.discardPile);
                    moveCardsToDeck($scope.discardPile);
                    $scope.trickEnded = true;
                    if ($scope.gameInformation.tricks == 6) {
                        //hand has ended score it and deal
                        $scope.hand.push($scope.trick);
                        calculateScores();
                        $scope.gameInformation.gameState = 'HandEnd'
                    } else {
                        //rearrange playersIn order based on trick winner
                        rotateArray($scope.gameInformation.trickOwner, 0)
                        $scope.hand.push($scope.gameInformation.trick);
                        $scope.gameInformation.trick = [];
                    }
                }
                break;

            case 'HandEnd':
                console.log("Game Over");
                $scope.activeGame = false;
                break;
        }
    }

    function onStartTurn() {
        if (turnOver) {
            turnOver = false;
            if ($scope.gameInformation.gameState != 'HandEnd') {
                if ($scope.activeGame) {
                    $scope.indexTurn = false;
                    if ($scope.activeGame && $scope.gameInformation.currentPlayer.type == 'cpu') {
                        $scope.gameInformation.currentPlayer.setNextAction($scope.gameInformation.gameState);
                        onCurrentPlayerEndTurn();
                    } else {
                        console.log("Human player turn or end of game")
                    }
                }
            }
        }

    }

    function onCurrentPlayerEndTurn() {
        if ($scope.gameInformation.gameState == 'Play') {
            var cardToPlay = $scope.gameInformation.currentPlayer.nextAction($scope.gameInformation.currentPlayer, $scope.gameInformation);
            $scope.discardPile.addCard(cardToPlay);
            trickEval(cardToPlay);
        } else {
            $scope.gameInformation.currentPlayer.nextAction($scope.gameInformation.currentPlayer, $scope.gameInformation);
            if($scope.gameInformation.dealerStuck && $scope.gameInformation.gameState == 'Bidding'){
                 if(scope.gameInformation.numBids == 0){
                    //dealer stuck and folded scorehand
                    calculateScores();
                } else {
                    //dealer stuck and bid everyone plays
                }
            }
           
        }
        //rotate return
        var index = $scope.gameInformation.playersIn.indexOf($scope.gameInformation.currentPlayer);
        if (index > -1) {
            if (index == $scope.gameInformation.playersIn.length - 1 || $scope.gameInformation.gameState == 'PickTrump') {
                //back to first player
                //do something based on gamestate
                onLastTurn();
                if ($scope.trickEnded) {
                    turnsCompleted++;
                    rotateArray($scope.gameInformation.trickOwner, 0);
                    printPlayersInArray($scope.gameInformation.playersIn, "player after trick taken")
                }
                index = 0;
            } else {
                index++;
            }
        } else {
            console.log("ERROR - when rotating players turn the current player could not be found in the array of players in", $scope.gameInformation.playersIn);
            console.log("Player", $scope.gameInformation.currentPlayer)
        }
        if ($scope.gameInformation.gameState != 'HandEnd') {
            $scope.gameInformation.currentPlayer = $scope.gameInformation.playersIn[index];
            console.log("Current player turn ", $scope.gameInformation.currentPlayer.name)
        } else {
            $scope.resetDeck();
        }
        console.log("Tricks completed ", turnsCompleted);
       // $scope.render(true, true, true, true, true, true, true);
        turnOver = true;
        // if ($scope.auto && turnsCompleted < autoHands) {
        //     onStartTurn();
        // }

    }

    $scope.stopGame = function(){
        if(angular.isDefined(stop)){
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

    function pause(time) {
        console.log("in pause")

        var start = Date.now();
        var counter = 0;
        while (time > 0) {
            var end = Date.now();
            console.log("time elapsed", end - start);
            time -= (end - start);
            counter++
            if (counter > 10000) {
                time = -1;
            }

        }
    }

    function copyArray(arrayFrom, arrayTo) {
        for (var i = 0; i < arrayFrom.length; i++) {
            console.log("copying array item ", i, " is ", arrayFrom[i])
            arrayTo.push(arrayFrom[i])
        }
    }

    /**
* Reorders array based on item and index past item to make zero location.
* @param {Player} player - The player to pick index of array.
* @param {number} positions - Number of elements past the index player
*/

    function rotateArray(indexPlayer, positions) {
        var index = $scope.gameInformation.playersIn.indexOf(indexPlayer)
        for (var i = 0; i < index + positions; i++) {
            var temp = $scope.gameInformation.playersIn.shift(0);
            $scope.gameInformation.playersIn.push(temp);
        }

    }
}
