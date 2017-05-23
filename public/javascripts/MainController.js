vsapp.controller('MainController', MainController)

MainController.$inject = ['$scope', '$http', '$q', '$timeout', '$mdDialog', '$rootScope', 'DataFactory', 'CPUService'];


function MainController($scope, $http, $q, $timeout, $mdDialog, $rootScope, DataFactory, CPUService) {
    //ToDo: 
    //need to make other locations of humans similar to North for activating cpu players
    //may need to pull cards/objects from sorted hand if going to use for cup play
    //if going to use cards from hand then need to set ranks on trump
    //Add a button to index play so I can more easily see what is happening.
    //remove cards from discard when trick finishes.
    //Still had issue with following kill rule.  w led QD, s played 10D when had jick added fix but need to check
    //when hand is over from everyone folded need to add that code

    var data = [];
    var cardSize = { width: 69, height: 94, padding: 18 }
    $scope.auto = false;
    $scope.allCardsPlayed = [];
    $scope.arrayToRender = [];
    $scope.clicked = { x: 0, y: 0 };
    $scope.test = {};
    $scope.newRender = { hands: [], draw: false };
    $scope.timeoutRunning = false;


    $scope.cardClick = function (mouseCoords) {
        if ($scope.gameState != 'Play' || $scope.timeoutRunning) {
            return;
        }
        console.log("mouseCoords", mouseCoords);
        $scope.clicked.x = mouseCoords.x;
        $scope.clicked.y = mouseCoords.y;
        var cardPlayed;
        var playersHandClicked;
        _.each(player, function (p) {
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
            $timeout(function () {
                trickEval(cardPlayed);
                $scope.timeoutRunning = false;
            }, 1000);
        }
    }

    $scope.render = function (north, east, south, west, deck, pile) {
        var itemsToRender = { player1: north, player2: east, player3: south, player4: west, deck: deck, pile: pile }
        console.log("maincontroller render", itemsToRender)
        $scope.test = itemsToRender;
        console.log("scope.test", $scope.test);
        return $scope.test;
    }

    $scope.indexPlayer = function () {
        $scope.index = true;
        $scope.indexPlay();

    }

    $scope.indexPlay = function () {
        if ($scope.auto) {
            if (player[$scope.activePlayer].type == 'cpu') {
                var cardPlayed = CPUService.cpuPlayDecision(player[$scope.activePlayer], $scope.trump, $scope.handLeader, $scope.suitLed, $scope.trumpPlayed, $scope.topCard, $scope.activePlayer);
                $scope.discardPile.addCard(cardPlayed);
                console.log("indexPlay card is ", cardPlayed);
                $scope.render(true, true, true, true, true, true);
                $timeout(function () {
                    trickEval(cardPlayed);
                }, 1000);
            }
        } else {
            if ($scope.index) {
                if (player[$scope.activePlayer].type == 'cpu') {
                    var cardPlayed = CPUService.cpuPlayDecision(player[$scope.activePlayer], $scope.trump, $scope.handLeader, $scope.suitLed, $scope.trumpPlayed, $scope.topCard, $scope.activePlayer);
                    $scope.discardPile.addCard(cardPlayed);
                    console.log("indexPlay card is ", cardPlayed);
                    $scope.render(true, true, true, true, true, true);
                    $timeout(function () {
                        $scope.index = false;
                        trickEval(cardPlayed);
                    }, 1000);
                }
            }
        }

    }

    function moveCardsToDeck(hand) {
        var isCard = true;
        var sIndex = 0;
        while (isCard) {
            if (hand[0]) {
                console.log('moving card from container to deck', hand[0]);
                $scope.deck.addCard(hand[0]);
            }

            sIndex++;
            if (sIndex > 10) {
                isCard = false;
            }
        }

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
            $scope.trickOwner.tricksTaken++;
            console.log("empty discardPile", $scope.discardPile);
            moveCardsToDeck($scope.discardPile);

            $scope.render(true, true, true, true, true, true);

            if ($scope.tricks == 6) {
                //hand has ended score it and deal
                $scope.hand.push($scope.trick);
                _.each($scope.playersIn, function (player) {
                    if (player === $scope.currentBidOwner) {
                        console.log("Bid was ", $scope.bidTaken)
                        if (player.tricksTaken < $scope.bidTaken) {
                            player.score -= $scope.bidTaken;
                        } else {
                            player.score += player.tricksTaken;

                        }
                    } else {
                        if (player.tricksTaken == 0) {
                            player.score -= $scope.bidTaken;

                        } else {
                            player.score += player.tricksTaken
                        }
                    }
                });

                console.log("End of hand ", $scope.discardPile);
                var isCard = true;
                var sIndex = 0;
                while (isCard) {
                    if ($scope.discardPile[0]) {
                        console.log($scope.discardPile[0])
                        $scope.deck.addCard($scope.discardPile[0]);
                    } else {
                        isCard = false;
                    }

                    sIndex++;
                    if (sIndex > 24) {
                        isCard = false;
                    }
                }
                _.each(player, function (p) {
                    sIndex = 0;
                    isCard = true;
                    while (isCard) {
                        if (p.hand[0]) {
                            $scope.deck.addCard(p.hand[0])
                        } else {
                            isCard = false;
                        }
                        sIndex++;
                        if (sIndex > 24) {
                            isCard = false;
                        }
                    }
                });
                console.log('deck after repopulate', $scope.deck);
                $scope.render(true, true, true, true, true, true);
                // init();
                // dealAgain();
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

    function dealAgain() {
        $scope.deck.deal(6, [player.North.hand, player.East.hand, player.South.hand, player.West.hand], 50, function () {
            console.log("printing deck after deal");
            _.each($scope.deck, function (card) {
                console.log(card.shortName);
            });
            //This is a callback function, called when the Dealing
            //is done.

            $scope.gameState = "Bidding";
            console.log('cpu? ', player[$scope.activePlayer].type)
            if (player[$scope.activePlayer].type == 'cpu') {
                $scope.$apply(function () {
                    $scope.render(true, true, true, true, true, true);
                    $scope.gameState = "Bidding";
                    console.log('cpu? ', player[$scope.activePlayer].type)
                    if (player[$scope.activePlayer].type == 'cpu') {
                        //goto cpuBidDecision
                        var cpuBid = CPUService.cpuBidDecision(player[$scope.activePlayer], $scope.bidTaken);
                        if (cpuBid) {
                            $scope.makebid(cpuBid);
                        } else {
                            $scope.pass();
                        }
                    }
                });
            }
        });
    }
    function adjustCardRank() {
        console.log("************Adjusting Ranks *****************")
        _.each(player, function (p) {
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
        $scope.Dealer = 'North';
        $scope.DealerStuck = false;
        $scope.activePlayer = 'East';
        $scope.gameState = 'Deal';
        $scope.currentBid = 0;
        $scope.playersIn = [];
        $scope.trump;
        $scope.trick = [];
        $scope.suitLed;
        $scope.topCard;
        $scope.trumpPlayed;
        $scope.hand = [];
        $scope.tricks = 0;
    }

    init();

    $scope.trumpChoosen = function (value) {
        $scope.trump = value || $scope.trump;
        adjustCardRank();
        console.log("trump chossen trump is", $scope.trump);
        if ($scope.activePlayer.isStuck) {
            $scope.playersIn.push(player['North']);
            $scope.playersIn.push(player['East']);
            $scope.playersIn.push(player['South']);
            $scope.playersIn.push(player['West']);
            $scope.gameState = 'Play'
            rotateActivePlayer($scope.currentBidOwner);
            $scope.handLeader = $scope.activePlayer;
            if (player[$scope.activePlayer].type == 'cpu') {
                $scope.indexPlay();
            }

        } else {
            $scope.playersIn.push($scope.activePlayer);
            $scope.gameState = 'StayOrFold';
            rotateActivePlayer($scope.currentBidOwner);
            if (player[$scope.activePlayer].type == 'cpu') {
                var cpuStay = CPUService.cpuStayDecision(player[$scope.activePlayer], $scope.trump, $scope.handLeader, $scope.activePlayer, $scope.suitLed, $scope.trumpPlayed);
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
        rotateActivePlayer($scope.activePlayer);
        var leaderFound = false;
        if ($scope.activePlayer == $scope.currentBidOwner) {
            $scope.gameState = 'Play';
            rotateActivePlayer($scope.Dealer);
            if (_.includes($scope.playersIn, $scope.activePlayer)) {
                $scope.handLeader = $scope.activePlayer;
                leaderFound = true;
            }
            while (!leaderFound) {
                rotateActivePlayer($scope.activePlayer);
                if (_.includes($scope.playersIn, $scope.activePlayer)) {
                    $scope.handLeader = $scope.activePlayer;
                    leaderFound = true;
                }
            }
            if (player[$scope.activePlayer].type == 'cpu') {
                $scope.indexPlay();
            }
        } else {
            if (player[$scope.activePlayer].type == 'cpu') {
                var cpuStay = CPUService.cpuStayDecision(player[$scope.activePlayer], $scope.trump);
                if (cpuStay) {
                    $scope.stay()
                } else { $scope.fold() }
            }
        }
    }

    $scope.fold = function () {
        console.log("folding is ", $scope.activePlayer);
        rotateActivePlayer($scope.activePlayer);
        if ($scope.activePlayer == $scope.currentBidOwner) {
            //Check if any stayers
            if ($scope.playersIn.length < 2) {
                //nobody stayed game over
                console.log('Hand over everyone folded.  Score bidding bid and set everyone else')
                init();
            } else {
                $scope.gameState = 'Play';
                rotateActivePlayer(player[$scope.Dealer])
                if (_.includes($scope.playersIn, $scope.activePlayer)) {
                    $scope.handLeader = $scope.activePlayer;
                    leaderFound = true;
                }
                while (!leaderFound) {
                    rotateActivePlayer($scope.activePlayer);
                    console.log("searching for hand lead for ", $scope.activePlayer.name);
                    if (_.contains($scope.playersIn, $scope.activePlayer)) {
                        $scope.handLeader = $scope.activePlayer;
                        leaderFound = true;
                    }

                }
                if (player[$scope.activePlayer].type == 'cpu') {
                    $scope.indexPlay();
                }
            }
        } else {
            if (player[$scope.activePlayer].type == 'cpu') {
                var cpuStay = CPUService.cpuStayDecision(player[$scope.activePlayer], $scope.trump);
                if (cpuStay) {
                    $scope.stay()
                } else { $scope.fold() }
            }
        }
    }

    $scope.DealRandom = function () {
        player[$scope.activePlayer].hand.addCard($scope.deck.DealRandom());
        player[$scope.activePlayer].hand.render();
        rotateActivePlayer($scope.activePlayer);
    }

    $scope.DealSpecific = function () {

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
            player[$scope.activePlayer].isbidder = true;
            $scope.gameState = 'PickTrump';
            if (player[$scope.activePlayer].type == 'cpu') {
                console.log("calling trumpchoosen by cpu")
                $scope.trumpChoosen(CPUService.cpuPickTrump(player[$scope.activePlayer]));
            }
        }
        rotateActivePlayer($scope.activePlayer);
        if (player[$scope.activePlayer].type == 'cpu') {
            var cpuBid = CPUService.cpuBidDecision(player[$scope.activePlayer], $scope.bidTaken);
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
            if ($scope.bidTaken) {
                $scope.activePlayer = $scope.currentBidOwner;
                player[$scope.currentBidOwner].isbidder = true;
                $scope.gameState = 'PickTrump';
                if (player[$scope.activePlayer].type == 'cpu') {
                    //goto cpuBidDecision
                    $scope.trumpChoosen(CPUService.cpuPickTrump(player[$scope.activePlayer]));
                }
            } else { //dealer was stuck and folded

                console.log("dealer stuck and folded end of hand need to write scoring here in $scope.pass")
            }
        } else {
            rotateActivePlayer($scope.activePlayer);
            if (player[$scope.activePlayer].type == 'cpu') {
                var cpuBid = CPUService.cpuBidDecision(player[$scope.activePlayer], $scope.bidTaken);
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
        switch (currentPlayer) {
            case 'North':
                $scope.activePlayer = 'East'
                break;
            case 'East':
                $scope.activePlayer = 'South'
                break;
            case 'South':
                $scope.activePlayer = 'West'
                break;
            case 'West':
                $scope.activePlayer = 'North'
                break;
            default:
                return;
        }
        //console.log('rotate  Activeplayer currentplayer', $scope.activePlayer);
    }

    var player = {
        North: { location: 'North', type: 'human', name: 'nate', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, hand: new cards.Hand({ faceUp: true, x: 300, y: 60 }) },
        South: { location: 'South', type: 'cpu', name: 'same', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, hand: new cards.Hand({ faceUp: true, x: 300, y: 340 }) },
        West: { location: 'West', type: 'cpu', name: 'weseley', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, hand: new cards.Hand({ faceUp: true, x: 100, y: 200 }) },
        East: { location: 'East', type: 'cpu', name: 'evan', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, hand: new cards.Hand({ faceUp: true, x: 500, y: 200 }) }
    };

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

    }

    $scope.newDeal = function () {
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
        player.North.hand = new cards.Hand({ faceUp: true, x: 350, y: 100 });
        $scope.arrayToRender.push(player.North.hand);
        player.South.hand = new cards.Hand({ faceUp: true, x: 350, y: 400 });
        $scope.arrayToRender.push(player.South.hand);
        player.West.hand = new cards.Hand({ faceUp: true, x: 100, y: 250 });
        $scope.arrayToRender.push(player.West.hand);
        player.East.hand = new cards.Hand({ faceUp: true, x: 600, y: 250 });
        $scope.arrayToRender.push(player.East.hand);
        $scope.arrayToRender.push($scope.discardPile);

        $scope.deck.deal(6, [player.North.hand, player.East.hand, player.South.hand, player.West.hand], 50, function () {
            $scope.$apply(function () {
                $scope.render(true, true, true, true, true, true);
                $scope.gameState = "Bidding";
                console.log('cpu? ', player[$scope.activePlayer].type)
                if (player[$scope.activePlayer].type == 'cpu') {
                    //goto cpuBidDecision
                    var cpuBid = CPUService.cpuBidDecision(player[$scope.activePlayer], $scope.bidTaken);
                    if (cpuBid) {
                        $scope.makebid(cpuBid);
                    } else {
                        $scope.pass();
                    }
                }
            });
        });
    }
};