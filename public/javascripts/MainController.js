'use strict'
vsapp.controller('MainController', MainController)

MainController.$inject = ['$scope', '$http', '$q', '$timeout', '$mdDialog', '$rootScope', 'DataFactory', 'CPUService', 'Player'];


function MainController($scope, $http, $q, $timeout, $mdDialog, $rootScope, DataFactory, CPUService, Player) {
    //ToDo: 
    //need to make other locations of humans similar to North for activating cpu players
    //may need to pull cards/objects from sorted hand if going to use for cup play
    //if going to use cards from hand then need to set ranks on trump
    //Add a button to index play so I can more easily see what is happening.
    //remove cards from discard when trick finishes.
    //Still had issue with following kill rule.  w led QD, s played 10D when had jick added fix but need to check
    //when hand is over from everyone folded need to add that code

    var data = [];
    var numHands = 0;
    var cardSize = { width: 69, height: 94, padding: 18 }
    $scope.auto = false;
    $scope.allCardsPlayed = [];
    $scope.arrayToRender = [];
    $scope.clicked = { x: 0, y: 0 };
    $scope.test = {};
    $scope.newRender = { hands: [], draw: false };
    $scope.timeoutRunning = false;
    $scope.activeGame = false;
    $scope.activePlayer = 'East';
    $scope.Dealer = 'North';
    $scope.isStuck = false;
    $scope.player = {
        North: { location: 'North', type: 'cpu', name: 'nate', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, hand: new cards.Hand({ faceUp: true, x: 300, y: 60 }) },
        South: { location: 'South', type: 'cpu', name: 'same', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, hand: new cards.Hand({ faceUp: true, x: 300, y: 340 }) },
        West: { location: 'West', type: 'cpu', name: 'weseley', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, hand: new cards.Hand({ faceUp: true, x: 100, y: 200 }) },
        East: { location: 'East', type: 'cpu', name: 'evan', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, hand: new cards.Hand({ faceUp: true, x: 500, y: 200 }) }
    };


    $scope.cardClick = function (mouseCoords) {
        if ($scope.gameState != 'Play' || $scope.timeoutRunning) {
            return;
        }
        console.log("mouseCoords", mouseCoords);
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
            $scope.render(true, true, true, true, true, true);
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

    $scope.render = function (north, east, south, west, deck, pile) {
        var itemsToRender = { player1: north, player2: east, player3: south, player4: west, deck: deck, pile: pile }
        $scope.test = itemsToRender;
        return $scope.test;
    }

    $scope.indexPlayer = function () {
        $scope.index = true;
        $scope.indexPlay();

    }

    $scope.indexPlay = function () {
        console.log("indexPlay auto is ", $scope.player[$scope.activePlayer]);
        if ($scope.index || $scope.auto) {

            if ($scope.player[$scope.activePlayer].type == 'cpu') {
                var cardPlayed = CPUService.cpuPlayDecision($scope.player[$scope.activePlayer], $scope.trump, $scope.handLeader, $scope.suitLed, $scope.trumpPlayed, $scope.topCard, $scope.activePlayer);
                $scope.discardPile.addCard(cardPlayed);
                $scope.render(true, true, true, true, true, true);
            }

            if ($scope.auto) {
                trickEval(cardPlayed);
            } else {
                $scope.index = false;
                $timeout(function () {
                    trickEval(cardPlayed);
                    $scope.timeoutRunning = false;
                }, 500);
            }
        }

    }

    function moveCardsToDeck(hand) {
        var isCard = true;
        var sIndex = 0;
        while (isCard) {
            if (hand[0]) {
                console.log('moving card from container to deck', hand[0]);
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
        if ($scope.isStuck) {
            $scope.player[$scope.activePlayer].score -= 3;
        } else {
            _.each($scope.playersIn, function (player) {
                if (player === $scope.currentBidOwner) {
                    console.log("Bid was ", $scope.bidTaken)
                    if ($scope.player[player].tricksTaken < $scope.bidTaken) {
                        $scope.player[player].score -= $scope.bidTaken;
                    } else {
                        $scope.player[player].score += $scope.player[player].tricksTaken;

                    }
                } else {
                    if ($scope.player[player].tricksTaken == 0) {
                        $scope.player[player].score -= $scope.bidTaken;

                    } else {
                        $scope.player[player].score += $scope.player[player].tricksTaken
                    }
                }

            });
            if ($scope.player[$scope.currentBidOwner].codedHand) {
                $scope.player[$scope.currentBidOwner].codedHand[Object.keys($scope.player[$scope.currentBidOwner].codedHand)].score = $scope.player[$scope.currentBidOwner].tricksTaken;
                data.push($scope.player[$scope.currentBidOwner].codedHand);
                // DataFactory.saveData(data);
                // console.log($scope.player[$scope.currentBidOwner], ' coded hand ', $scope.player[$scope.currentBidOwner].codedHand);
                // DataFactory.getData().then(function (response) {
                //     console.log(response)
                // });
            }

        }
        numHands++;
        console.log("End of hand ", numHands);
        if(numHands > 20){
            $scope.auto = false;
        }
        $scope.resetDeck();
    }

    function trickEval(cardToPlay) {
        //trick information, scoring and rotation of player
        var thisCardTrump = false
        $scope.allCardsPlayed.push(cardToPlay);
        if (cardToPlay.suit == $scope.trump || (cardToPlay.rank == 11 && jickSuit(cardToPlay.suit) == $scope.trump)) {
            $scope.trumpPlayed = true;
            thisCardTrump = true;
        }
        if ($scope.trick.length < 1) {
            if (cardToPlay.rank == 11 && jickSuit(cardToPlay.suit) == $scope.trump) {
                $scope.suitLed = jickSuit(cardToPlay.suit)
            } else {
                $scope.suitLed = cardToPlay.suit;
            }
            $scope.topCard = cardToPlay;
            $scope.trickOwner = $scope.activePlayer;
            $scope.trick.push(cardToPlay);
        } else {
            console.log("calculating top card played in trick.  Card to play ", cardToPlay, " $scope.topCard.rank", $scope.topCard, " trump ", $scope.trump)
            if (cardToPlay.power > $scope.topCard.power && (cardToPlay.suit == $scope.suitLed || thisCardTrump)) {
                $scope.topCard = cardToPlay;
                $scope.trickOwner = $scope.activePlayer;
                console.log("trickOwner = ", $scope.trickOwner);
            }
            $scope.trick.push(cardToPlay)
            console.log("Trick ", $scope.trick);
        }
        if ($scope.trick.length == $scope.playersIn.length) {
            console.log("Trick finished, winner ", $scope.trickOwner);
            //trick is over score it and winner is active player
            $scope.tricks++;
            console.log("number of tricks ", $scope.tricks);
            $scope.player[$scope.trickOwner].tricksTaken++;
            console.log("empty discardPile", $scope.discardPile);
            moveCardsToDeck($scope.discardPile);

            $scope.render(true, true, true, true, true, true);

            if ($scope.tricks == 6) {
                //hand has ended score it and deal
                $scope.hand.push($scope.trick);
                calculateScores();
            } else {
                $scope.activePlayer = $scope.trickOwner;
                $scope.handLeader = $scope.activePlayer;
                $scope.trickOwner;
                $scope.hand.push($scope.trick);
                $scope.trick = [];
                $scope.indexPlay();
            }
        } else {
            $scope.activePlayer = rotatePlayerIn($scope.activePlayer);
            console.log("rotated players in and active player is now", $scope.activePlayer);
            $scope.indexPlay();
        }

    }

    function adjustCardRank() {
        console.log("************Adjusting Ranks *****************")
        _.each($scope.player, function (p) {
            // console.log("player ", p.name);
            _.each(p.hand, function (card) {
                if (card.suit == $scope.trump) {
                    //  console.log("card.rank before for trump", card.rank);
                    card.power = card.rank + 6;
                    //  console.log("card.rank after for trump", card.rank);

                } else {
                    card.power = card.rank;
                }
                if (card.rank == 11 && jickSuit(card.suit) == $scope.trump) {
                    card.power = 21;
                }
                if (card.rank == 11 && card.suit == $scope.trump) {
                    card.power = 22;
                }
            });
        });
    }

    //stages:  Deal, bid, (Dealerstuck) PickTrump, stay, play
    function init() {
        $scope.bid = 3;
        $scope.bidTaken = 2;
        $scope.currentBidOwner = "No Bidder";
        $scope.gameState = 'Deal';
        $scope.currentBid = 0;
        $scope.trump;
        $scope.trick = [];
        $scope.suitLed;
        $scope.topCard;
        $scope.trumpPlayed;
        $scope.hand = [];
        $scope.tricks = 0;
        $scope.playersIn = [];
        $scope.allCardsPlayed = [];
        $scope.isStuck = false;
        _.each($scope.player, function (p) {
            p.tricksTaken = 0;
            p.sortedHand = {};
            p.isbidder = false;

        });
        $scope.player1 = new Player({location: 'North', type: 'cpu', name: 'nate', handLocation: {faceUp: true, x: 350, y: 100 }, score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, isIn: true });
        console.log($scope.player1);
    }

    init();

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
        $scope.auto = false;

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

    function rotatePlayerIn(currentPlayer) {
        var currentIndex = $scope.playersIn.indexOf(currentPlayer);
        console.log("rotate PlayerIn currentPlayer and index", currentPlayer, " ", currentIndex, "#playersIN", $scope.playersIn);
        if (currentIndex == $scope.playersIn.length - 1) {
            return $scope.playersIn[0];
        }
        return $scope.playersIn[currentIndex + 1];
    }

    function rotateActivePlayer(currentPlayer) {
        console.log("rotating player from current ", currentPlayer);
        switch (currentPlayer) {
            case 'North':
                return 'East'
                break;
            case 'East':
                return 'South'
                break;
            case 'South':
                return 'West'
                break;
            case 'West':
                return 'North'
                break;
            default:
                return;
        }
        //console.log('rotate  Activeplayer currentplayer', $scope.activePlayer);
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

    $scope.resetDeck = function () {
        //pull all cards from hands and discard and put back in deck
        //clear trick scores from players
        //set gameState to deal.
        moveCardsToDeck($scope.discardPile);
        _.each($scope.player, function (p) {
            p.tricksTaken = 0;
            moveCardsToDeck(p.hand);
        });
        $scope.Dealer = rotateActivePlayer($scope.Dealer);
        $scope.activePlayer = rotateActivePlayer($scope.Dealer);
        $scope.gameState = "Deal";
        if ($scope.auto) {
            $scope.nextDeal();
        }


    }

    $scope.nextDeal = function () {
        if($scope.deck.length != 24){
            console.log("nextDeal reset deck");
            $scope.resetDeck();
        }
        init();
        
        // $scope.discardPile = new cards.Hand({ faceUp: true, x: 350, y: 250 });
        // $scope.discardPile.x += 50;
        console.log("next deal before deal deck length", $scope.deck.length);
        $scope.deck.deal(6, [$scope.player.North.hand, $scope.player.East.hand, $scope.player.South.hand, $scope.player.West.hand], 50, function () {
           // $scope.$apply(function () {
                $scope.render(true, true, true, true, true, true);
                _.each($scope.player, function (p) {
                    if (p.hand.length != 6) {
                        console.log("nextDeal and hands not right ", p.name, p.hand.length);
                        console.log("deck ", $scope.deck.length)
                    }
                });
                $scope.gameState = "Bidding";
                console.log("in next deal North is ", $scope.player.North.hand, $scope.activePlayer);
                console.log('cpu? ', $scope.player[$scope.activePlayer].type)
                if ($scope.player[$scope.activePlayer].type == 'cpu') {
                    var cpuBid = CPUService.cpuBidDecision($scope.player[$scope.activePlayer], $scope.bidTaken);
                    if (cpuBid) {
                        $scope.makebid(cpuBid);
                    } else {
                        $scope.pass();
                    }
                }
            });

       // });

    }

    $scope.newDeal = function () {
        if ($scope.activeGame) {
            $scope.nextDeal();
        } else {
            $scope.activeGame = true;
            cards.init({ table: '#card-table' });
            //Create a new deck of cards
            $scope.deck = new cards.Deck({ faceUp: false, x: 350, y: 250 });
            console.log("deck when created ", $scope.deck.length);
            //By default it's in the middle of the container, put it slightly to the side
            $scope.deck.x -= 50;
            $scope.deck.padding = 0.5;
            //cards.all contains all cards, put them all in the deck
            $scope.deck.addCards(cards.all);
            console.log("newDeal button deck", $scope.deck);
            console.log("deck length ", $scope.deck.length);
            $scope.arrayToRender.push($scope.deck);

            //Lets add a discard pile
            $scope.discardPile = new cards.Hand({ faceUp: true, x: 350, y: 250 });
            $scope.discardPile.x += 50;
            console.log("discard pile", $scope.discardPile);
            $scope.player.North.hand = new cards.Hand({ faceUp: true, x: 350, y: 100 });
            $scope.arrayToRender.push($scope.player.North.hand);
            $scope.player1.hand =  $scope.player.North.hand;
            console.log("player1", $scope.player1)
            $scope.player.South.hand = new cards.Hand({ faceUp: true, x: 350, y: 400 });
            $scope.arrayToRender.push($scope.player.South.hand);
            $scope.player.West.hand = new cards.Hand({ faceUp: true, x: 100, y: 250 });
            $scope.arrayToRender.push($scope.player.West.hand);
            $scope.player.East.hand = new cards.Hand({ faceUp: true, x: 600, y: 250 });
            $scope.arrayToRender.push($scope.player.East.hand);
            $scope.arrayToRender.push($scope.discardPile);

            $scope.deck.deal(6, [$scope.player.North.hand, $scope.player.East.hand, $scope.player.South.hand, $scope.player.West.hand], 50, function () {
                //$scope.$apply(function () {
                    $scope.render(true, true, true, true, true, true);
                    $scope.gameState = "Bidding";
                    console.log('cpu? ', $scope.player[$scope.activePlayer].type)
                    if ($scope.player[$scope.activePlayer].type == 'cpu') {
                        //goto cpuBidDecision
                        var cpuBid = CPUService.cpuBidDecision($scope.player[$scope.activePlayer], $scope.bidTaken);
                        if (cpuBid) {
                            $scope.makebid(cpuBid);
                        } else {
                            $scope.pass();
                        }
                    }
                });
            //});
        }
    }
}