
vsapp.factory('CPUService', ['$http', '$q','$rootScope','DataFactory','CommService', function ($http, $q, $rootScope, DataFactory, CommService) {
    var service = {
        cpuPickTrump: cpuPickTrump,
        cpuStayDecision: cpuStayDecision,
        cpuPlayDecision: cpuPlayDecision,
        cpuBidDecision: cpuBidDecision,
        makeCodedHand: makeCodedHand
    };

    var currentHighBid;
    var trump;
    var handLeader;
    var suitLed;
    var trumpPlayed; 
    var topCard;
    var activePlayer;
    return service;

     $scope.$on('bid', function(e, bid) {
        console.log('$on bid broadcast received in cpusService', bid)
      // $scope.allUnits = angular.copy(units);
  });

    function cpuBidDecision(player, gameInfo) {
        //console.log("cpuBidDecision");
        scoreHand(player);
        var cpuBid;
        if (player.handScore <= 40) {
            cpuBid = 0;
        } else if (player.handScore > 40 && player.handScore <= 60) {
            cpuBid = 3;
        } else if (player.handScore > 60 && player.handScore <= 80) {
            cpuBid = 4;
        } else if (player.handScore > 80 && player.handScore <= 90) {
            cpuBid = 5;
        } else if (player.handScore > 90) {
            cpuBid = 6;
        }

        if (cpuBid > gameInfo.bidTaken) {
            gameInfo.bidTaken = cpuBid;
            gameInfo.currentBidOwner = player;
            gameInfo.numBids++;
            console.log(player.name, 'bid ', gameInfo.bidTaken);
        } else {
            console.log(player.name, 'passed');
        }

    }

    function cpuPickTrump(player, gameInfo) {
         gameInfo.trump = player.topSuit;
        console.log("cpu pick trump ", player.name, " trump ", gameInfo.trump);
         
    }

    function cpuStayDecision(player, gameInfo) {
        var handTrumpInfo = player.sortedHand[gameInfo.trump];

        if (handTrumpInfo.score > 35 || handTrumpInfo.score > 20 && handTrumpInfo.offAces > 0 || handTrumpInfo.offAces > 1) {
            gameInfo.playersPlaying.push(player);
            console.log(player.location, " is staying");
        } else {
             console.log(player.location, " is folding");
        }
    }

    /**
 * Returns a card to play.
 * @param {Player} player - The computer player.
 * @param {gameInformation} gameInfo - The gameInformation.
 */

    function cpuPlayDecision(player, gameInfo) {
        console.log("cpuPlayDecision args", arguments)
        var cardToPlay;
        var possibleCards = legalPlays(player, gameInfo);
        console.log("possible plays", possibleCards);
        //if your the last to play then play the lowest winner
        //if your the leader and bidder then higher prob of leading trump winner
        //if losers returned play losest loser not twin suited with king
        if(possibleCards.losers){
            var lowestCardPower = 30;
            var lowestCard;
            _.each(possibleCards.cards, function(card){
                if(!lowestCard){
                    lowestCard = card;
                }
                if(card.power < lowestCard.power){
                    lowestCard = card;
                }
            });
            cardToPlay = lowestCard;
        } else {
            var ranNum = Math.floor(Math.random() * possibleCards.cards.length);
            cardToPlay = possibleCards.cards[ranNum];
        }
        console.log(player.name, " plays card ", cardToPlay);
        
        return cardToPlay;
    }

    function legalPlays(player, gameInfo) {
        var legalCards = [];
        var hasSuit = false;
        var canTrump = false;
        var hasHigherSuitCard = false;
        var higherSuitCards = [];
        var lowerSuitCards = [];
        var higherTrumpCards = [];
        var lowerTrumpCards = [];
        var losers = [];
        console.log("******* LEGAL PLAYS *********")

        //four cases:
        //1.  Your the leader  all cards legalCards
        //2.  The trick has been trumped, you have the leadsuit
        //3.  The trick has been trumped, you don't have lead suit but you do have higher trump
        //4.  The trick has not been trumped you have a higher card in suit
        //5.  The trick has not been trumped you have a lower card in suit
        //6.  The trick has not been trumped you have no cards in suit led and you have trump
        //7.  The trick has not been trumped you have no cards in suit and no trump
        //8.  The trick has been trumped, you don't have lead suit or trump (all cards legal)
        console.log("trick length", gameInfo.trick.length)
        if(gameInfo.trick.length < 1){
              _.each(player.hand, function(card){
                higherSuitCards.push(card);
            });
            return {cards: higherSuitCards, losers: false};
        }
       
        _.each(player.hand, function (card) {
            //console.log("card to evaluate ", card, " player is ", player);

            if ((card.suit == gameInfo.suitLed && !(card.rank == 11 && jickSuit(card.suit) == gameInfo.trump)) || (gameInfo.suitLed == gameInfo.trump && (card.rank == 11 && jickSuit(card.suit) == gameInfo.trump))) {
                hasSuit = true;
               // console.log("has suit");
                if (card.power > gameInfo.topCard.power) {
                   // console.log("higher card in suit");
                    hasHigherSuitCard = true;
                    higherSuitCards.push(card);
                } else {
                    lowerSuitCards.push(card);
                  //  console.log("lower card in suit");
                }
            } else {
                if (card.suit == gameInfo.trump || (card.rank == 11 && jickSuit(card.suit) == gameInfo.trump)) {
                    //console.log("can trump is true");
                    canTrump = true;
                    if (card.power > gameInfo.topCard.power) {
                       // console.log("higherTrump");
                        higherTrumpCards.push(card);
                    } else {
                       // console.log("lower trump card")
                        lowerTrumpCards.push(card);
                    }
                } else {
                    if (card.suit != gameInfo.suitLed && card.suit != gameInfo.trump) {
                       // console.log("card is a loser")
                        losers.push(card);
                    }
                }
            }
        });
        if (gameInfo.suitLed == gameInfo.trump) {
            if (hasSuit) {  //has suit need to play higher card unles trumped
                return (higherSuitCards.length > 0 ? {cards: higherSuitCards, losers: false} : {cards: lowerSuitCards, losers: true});
            } else {
                return {cards: losers, losers: true};
            }
        } else {
            if (!gameInfo.trumpPlayed) {
                if (hasHigherSuitCard) {
                    console.log("Returning higherSuiCards no trump played")
                    return {cards: higherSuitCards, losers: false};
                } else {
                    if (hasSuit) {
                    console.log("Returning suit no trump played")
                        
                        return {cards: lowerSuitCards, losers: true};
                    } else {
                        if (canTrump) {
                        console.log("Returning trump no trump played")
                            
                            return {cards: higherTrumpCards, losers: false}; //should be all trump in hand if no trump played yet
                        }
                    }
                }
            } else {  //trump played
                if (hasSuit) {  //has suit need to play higher card unles trumped
                        console.log("Returning trump played has suit play lower card if available")
                    
                    return (lowerSuitCards.length > 0 ? {cards: lowerSuitCards, losers: true} : {cards: higherSuitCards, losers: false});
                } else {
                    if (higherTrumpCards.length > 0) {
                        console.log("Returning trump played no suit higher trump card returns")
                        return {cards: higherTrumpCards, losers: false};
                    } else {
                         console.log("Returning trump played no suit no trump return losers")
                        return (losers.length > 0 ? {cards: losers, losers: true} : {cards: lowerTrumpCards, losers: true});
                    }
                }
            }
        }
    }
    function scoreHand(player) {
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
            for (var i = 0; i < item.arr.length; i++) {
                // console.log("after initial sort item", item.arr[i].rank);
            }
            //console.log("*************")
        });
        player.sortedHand = angular.copy(longSuit);
        player.handScore = topScore;
        player.handTotalScore = totalScore;
        player.topSuit = topSuit;
    }
    function makeCodedHand(player, bid, dealer) {

        var codedHand = "";
        var offSuit = jickSuit(player.topSuit);
        var valuesOnly = [];
        var data = [];
        console.log("makeCodedHand params", bid, dealer)
        if (player.sortedHand[player.topSuit].jick) {
            // console.log("inside jick if in makecoded hand")
            //remove jick from offsuite and add it to topsuite
            var jickString = offSuit.toUpperCase() + '11'
            // console.log("before splice for jickString", jickString)
            _.each(player.sortedHand[offSuit].arr, function (c) {
                // console.log(c)
            });
            var index = player.sortedHand[offSuit].arr.indexOf(jickString);
            player.sortedHand[offSuit].arr.splice(index, 1)
            // console.log("after splic with index", index)
            _.each(player.sortedHand[offSuit].arr, function (c) {
                //    console.log(c)
            });
            valuesOnly.push('15');
        }
        _.each(player.sortedHand[player.topSuit].arr, function (card) {
            //  console.log('top suit card ', card);
            if (card.rank == 11) {
                valuesOnly.push('16')
            } else {
                valuesOnly.push(card.rank);
            }
        });
        // console.log("before sorted", valuesOnly.length)
        _.each(valuesOnly, function (v) {
            //    console.log(v);
        });
        valuesOnly.sort(function (a, b) {
            return b - a;
        });
        _.each(valuesOnly, function (card) {
            codedHand += card;
        })
        codedHand += "NT";
        var suitOrder = [];
        _.each(player.sortedHand, function (item, key) {
            var ranker = {};

            // console.log("key ", key, " topsuit ", player.topSuit);
            if (key != player.topSuit) {
                ranker.suit = key;
                ranker.score = item.ntScore;
                suitOrder.push(ranker);
            }
        });

        suitOrder.sort(function (a, b) {
            return b.score - a.score;
        });
        for (var i = 0; i < suitOrder.length; i++) {
            for (var j = 0; j < player.sortedHand[suitOrder[i].suit].arr.length; j++) {
                codedHand += player.sortedHand[suitOrder[i].suit].arr[j].rank;
            }
            codedHand += 'n';

        }

        console.log("coded hand ", codedHand);
        var oneHand = {};
        // {code: {handCode: xyy, bid: 4, tricksTaken: 4, location: west, DealerLocation: 'North'}}
        oneHand[codedHand] = {};
        oneHand[codedHand].bid = bid;
        oneHand[codedHand].dealer = dealer;
        oneHand[codedHand].location = player.location;
        
        return oneHand;
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

   
}]);