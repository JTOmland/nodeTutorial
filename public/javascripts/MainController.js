vsapp.controller('MainController', MainController)

MainController.$inject = ['$scope', '$http', '$q', '$mdDialog', '$rootScope', 'DataFactory', 'CPUService'];


function MainController($scope, $http, $q, $mdDialog, $rootScope, DataFactory, CPUService) {
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
    $scope.allCardsPlayed = [];
    $scope.arrayToRender = [];
    $scope.clicked = { x: 0, y: 0 };
    $scope.test = {};
    $scope.newRender = { hands: [], draw: false };
    $scope.cardClick = function (mouseCoords) {
        console.log("mouseCoords", mouseCoords);
        $scope.clicked.x = mouseCoords.x;
        $scope.clicked.y = mouseCoords.y;
        var cardPlayed;
        _.each(player, function (p) {
            _.each(p.hand, function (card) {
                if (mouseCoords.x > card.hitX && mouseCoords.x < card.hitX + card.hitXadd && card.hitY > mouseCoords.y && card.hitY < mouseCoords.y + cardSize.height) {
                    console.log('card selected is ', card);
                    cardPlayed = card;


                }
            });
        });
        if(cardPlayed){
            $scope.deck.addCard(cardPlayed);
            $scope.render(true, true, true, true, true, true);
        }
       
    }

    $scope.render = function (north, east, south, west, deck, pile) {
        var itemsToRender = { player1: north, player2: east, player3: south, player4: west, deck: deck, pile: pile }
        console.log("maincontroller render", itemsToRender)
        $scope.test = itemsToRender;
        console.log("scope.test", $scope.test);
        return $scope.test;
    }


    // function cpuBidDecision() {
    //     //console.log("cpuBidDecision");
    //     var cpuBid;
    //     if (player[$scope.activePlayer].handScore <= 40) {
    //         cpuBid = 0;
    //     } else if (player[$scope.activePlayer].handScore > 40 && player[$scope.activePlayer].handScore <= 60) {
    //         cpuBid = 3;
    //     } else if (player[$scope.activePlayer].handScore > 60 && player[$scope.activePlayer].handScore <= 80) {
    //         cpuBid = 4;
    //     } else if (player[$scope.activePlayer].handScore > 80 && player[$scope.activePlayer].handScore <= 90) {
    //         cpuBid = 5;
    //     } else if (player[$scope.activePlayer].handScore > 90) {
    //         cpuBid = 6;
    //     }

    //     if (cpuBid > $scope.bidTaken) {
    //         $scope.makebid(cpuBid);
    //     } else {
    //         $scope.pass();
    //     }
    // }

    // function cpuPickTrump() {
    //     console.log("cpu pick trump ", player[$scope.activePlayer]);
    //     $scope.trump = player[$scope.activePlayer].topSuit;
    //     $scope.trumpChoosen();
    // }

    // function cpuStayDecision() {
    //     //console.log("cpuStaydecision handtrump info", player[$scope.activePlayer].sortedHand, $scope.trump)
    //     var handTrumpInfo = player[$scope.activePlayer].sortedHand[$scope.trump];

    //     if (handTrumpInfo.score > 35) {
    //         $scope.stay();
    //         return;
    //     }
    //     if (handTrumpInfo.score > 20 && handTrumpInfo.offAces > 0) {
    //         $scope.stay();
    //         return;
    //     }
    //     if (handTrumpInfo.offAces > 1) {
    //         $scope.stay();
    //         return;
    //     }

    //     $scope.fold()
    //     return;

    // }

    // function cpuPlayDecision() {
    //     var p = $scope.activePlayer;
    //     var cardToPlay;
    //     var possibleCards = legalPlays();
    //     console.log("possible plays", possibleCards);
    //     var ranNum = Math.floor(Math.random() * possibleCards.length);
    //     cardToPlay = possibleCards[ranNum]
    //     $scope.discardPile.addCard(cardToPlay);
    //     $scope.discardPile.render();
    //     player[p].hand.render();
    //     trickEval(cardToPlay);
    // }

    $scope.indexPlay = function () {
        if (player[$scope.activePlayer].type == 'cpu') {
            cpuPlayDecision();
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
                $scope.discardPile.render();
                $scope.deck.render({ immediate: true });
                console.log('deck after repopulate', $scope.deck);
                init();
                dealAgain();


            } else {

                $scope.activePlayer = $scope.trickOwner;
                $scope.handLeader = $scope.activePlayer;
                $scope.trickOwner;
                $scope.hand.push($scope.trick);
                $scope.trick = [];
                if (player[$scope.activePlayer].type == 'cpu') {
                    // cpuPlayDecision();
                }
            }
        } else {
            $scope.activePlayer = rotatePlayerIn($scope.activePlayer);
            console.log("rotated players in and active player is now", $scope.activePlayer);
            if (player[$scope.activePlayer].type == 'cpu') {
                // cpuPlayDecision();
            }
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
            _.each(player, function (player) {
                var longSuit = { 'd': { suit: 'd', count: 0, arr: [], jick: false, score: 0, ntScore: 0, offAces: 0 }, 'h': { suit: 'h', count: 0, arr: [], jick: false, score: 0, ntScore: 0, offAces: 0 }, 's': { suit: 's', count: 0, arr: [], jick: false, score: 0, ntScore: 0, offAces: 0 }, 'c': { suit: 'c', count: 0, arr: [], jick: false, score: 0, ntScore: 0, offAces: 0 } };
                var topSuit = 's';
                var topScore = 0;
                var suits = ['d', 'h', 'c', 's'];
                _.each(player.hand, function (card) {
                    if (card.rank == 14) {
                        _.each(suits, function (suit) {
                            if (card.suit != suit) {
                                longSuit[suit].offAces++;
                            }
                        });
                    }

                    if (card.rank == 11) {
                        longSuit[jickSuit(card.suit)].jick = true;
                        longSuit[jickSuit(card.suit)].score += 21;
                        longSuit[jickSuit(card.suit)].count++;
                        longSuit[card.suit].count++;
                        longSuit[card.suit].score += 22;
                        longSuit[card.suit].ntScore += 11;
                        longSuit[card.suit].arr.push(card);
                    } else {
                        longSuit[card.suit].count++;
                        longSuit[card.suit].score += card.rank + 6;
                        longSuit[card.suit].ntScore += card.rank;
                        longSuit[card.suit].arr.push(card);
                    }
                    if (longSuit[card.suit].score > topScore) {
                        topSuit = card.suit;
                        topScore = longSuit[card.suit].score;
                    }
                });
                var totalScore = 0;
                _.each(longSuit, function (item) {
                    if (item.suit === topSuit) {
                        totalScore += item.score;
                    } else {
                        totalScore += item.ntScore;
                    }
                    //console.log("item is ", item)
                    item.arr.sort(function (a, b) {
                        return b.rank - a.rank;
                    });
                    // for (var i = 0; i < item.arr.length; i++) {
                    //     console.log("after initial sort item", item.arr[i].rank);
                    // }
                    // console.log("*************")
                });
                player.sortedHand = angular.copy(longSuit);
                player.handScore = topScore;
                player.handTotalScore = totalScore;
                player.topSuit = topSuit;
                //makeCodedHand(player);

                console.log("player", player, player.handScore, player.topSuit, player.handTotalScore);
            });
            $scope.gameState = "Bidding";
            console.log('cpu? ', player[$scope.activePlayer].type)
            if (player[$scope.activePlayer].type == 'cpu') {
                //goto cpuBidDecision
                cpuBidDecision();
            }
        });
    }

    // function legalPlays() {
    //     var legalCards = [];
    //     var hasSuit = false;
    //     var canTrump = false;
    //     var hasHigherSuitCard = false;
    //     var higherSuitCards = [];
    //     var lowerSuitCards = [];
    //     var higherTrumpCards = [];
    //     var lowerTrumpCards = [];
    //     var losers = [];
    //     //four cases:
    //     //1.  Your the leader  all cards legalCards
    //     //2.  The trick has been trumped, you have the leadsuit
    //     //3.  The trick has been trumped, you don't have lead suit but you do have higher trump
    //     //4.  The trick has not been trumped you have a higher card in suit
    //     //5.  The trick has not been trumped you have a lower card in suit
    //     //6.  The trick has not been trumped you have no cards in suit led and you have trump
    //     //7.  The trick has not been trumped you have no cards in suit and no trump
    //     //8.  The trick has been trumped, you don't have lead suit or trump (all cards legal)
    //     console.log("handLeader ", $scope.handLeader);
    //     if ($scope.activePlayer == $scope.handLeader) {
    //         return player[$scope.activePlayer].hand;
    //     }
    //     _.each(player[$scope.activePlayer].hand, function (card) {
    //         if ((card.suit == $scope.suitLed && !(card.rank == 11 && jickSuit(card.suit) == $scope.trump)) || ($scope.suitLed == $scope.trump && (card.rank == 11 && jickSuit(card.suit) == $scope.trump))) {
    //             hasSuit = true;
    //             if (card.power > $scope.topCard.power) {
    //                 hasHigherSuitCard = true;
    //                 higherSuitCards.push(card);
    //             } else {
    //                 lowerSuitCards.push(card);
    //             }
    //         } else {
    //             if (card.suit == $scope.trump || (card.rank == 11 && jickSuit(card.suit) == $scope.trump)) {
    //                 canTrump = true;
    //                 if (card.power > $scope.topCard.power) {
    //                     higherTrumpCards.push(card);
    //                 } else {
    //                     lowerTrumpCards.push(card);
    //                 }
    //             } else {
    //                 if (card.suit != $scope.suitLed && card.suit != $scope.trump) {
    //                     losers.push(card);
    //                 }
    //             }
    //         }
    //     });
    //     if (!$scope.trumpPlayed) {
    //         if (hasHigherSuitCard) {
    //             return higherSuitCards;
    //         } else {
    //             if (hasSuit) {
    //                 return lowerSuitCards;
    //             } else {
    //                 if (canTrump) {
    //                     return higherTrumpCards; //should be all trump in hand if no trump played yet
    //                 }
    //             }
    //         }
    //     } else {
    //         if (hasSuit) {
    //             return (lowerSuitCards.length > 0 ? lowerSuitCards : higherSuitCards);
    //         } else {
    //             if (higherTrumpCards.length > 0) {
    //                 return higherTrumpCards;
    //             } else {
    //                 return (losers.length > 0 ? losers : lowerTrumpCards);
    //             }
    //         }
    //     }


    // }

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
        console.log("trump chossen trump is", $scope.trump);
        if ($scope.activePlayer.isStuck) {
            $scope.playersIn.push(player['North']);
            $scope.playersIn.push(player['East']);
            $scope.playersIn.push(player['South']);
            $scope.playersIn.push(player['West']);
            $scope.gameState = 'Play'
            rotateActivePlayer($scope.currentBidOwner);
            if (player[$scope.activePlayer].type == 'cpu') {
                cpuPlayDecision();
            }

        } else {
            $scope.playersIn.push($scope.activePlayer);
            $scope.gameState = 'StayOrFold';
            rotateActivePlayer($scope.currentBidOwner);
            if (player[$scope.activePlayer].type == 'cpu') {
                cpuStayDecision();
            }
        }

        adjustCardRank();

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
                cpuPlayDecision();
            }
        } else {
            if (player[$scope.activePlayer].type == 'cpu') {
                cpuStayDecision();
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
                    //goto cpuBidDecision
                    cpuPlayDecision();
                }
            }
        } else {
            if (player[$scope.activePlayer].type == 'cpu') {
                cpuStayDecision();
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
                //goto cpuBidDecision
                cpuPickTrump();
            }
        }
        rotateActivePlayer($scope.activePlayer);
        if (player[$scope.activePlayer].type == 'cpu') {
            //goto cpuBidDecision
            cpuBidDecision();
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
                    cpuPickTrump();
                }
            } else { //dealer was stuck and folded

                console.log("dealer stuck and folded end of hand need to write scoring here in $scope.pass")
            }
        } else {
            rotateActivePlayer($scope.activePlayer);
            if (player[$scope.activePlayer].type == 'cpu') {
                cpuBidDecision();
            }
        }
    }

    function rotatePlayerIn(currentPlayer) {
        var currentIndex = $scope.playersIn.indexOf(currentPlayer);
        console.log("rotate PlayerIn currentPlayer and index", currentPlayer, " ", currentIndex);
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
        North: { type: 'human', name: 'nate', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, hand: new cards.Hand({ faceUp: true, x: 300, y: 60 }) },
        South: { type: 'cpu', name: 'same', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, hand: new cards.Hand({ faceUp: true, x: 300, y: 340 }) },
        West: { type: 'cpu', name: 'weseley', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, hand: new cards.Hand({ faceUp: true, x: 100, y: 200 }) },
        East: { type: 'cpu', name: 'evan', score: 0, tricksTaken: 0, sortedHand: {}, topSuit: 's', handScore: 0, handPattern: { sixCards: [], fiveCards: [], fourCards: [], threeCards: [], twoCards: [] }, isbidder: false, isDealer: true, hand: new cards.Hand({ faceUp: true, x: 500, y: 200 }) }
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
        $scope.deck = new cards.Deck({ faceUp: false, x: 350, y: 250});
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
                console.log("printing deck after deal");
                _.each($scope.deck, function (card) {
                    console.log(card.shortName);
                });
                $scope.gameState = "Bidding";
                console.log('cpu? ', player[$scope.activePlayer].type)
                if (player[$scope.activePlayer].type == 'cpu') {
                    //goto cpuBidDecision
                    CPUService.cpuBidDecision(player[$scope.activePlayer], $scope.bidTaken);
                }
                $scope.render(true, true, true, true, true, true);
            });
        });
    }
};