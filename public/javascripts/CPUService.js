
vsapp.factory('CPUService', ['$http', '$q', '$rootScope', 'DataFactory', 'CommService', "Rules", "Utilities", function ($http, $q, $rootScope, DataFactory, CommService, Rules, Utilities) {
    var service = {
        cpuPickTrump: cpuPickTrump,
        cpuStayDecision: cpuStayDecision,
        cpuPlayDecision: cpuPlayDecision,
        cpuBidDecision: cpuBidDecision,
        makeCodedHand: makeCodedHand,
        scoreHand: scoreHand,
        //setProbabilities: setProbabilities,
       // adjustCardProb: newAdjustProb,
        //adjustFoldProb: adjustFoldProb
    };

    var debugging = false;
   

    return service;

    $scope.$on('bid', function (e, bid) {
        if(debugging == true){
            console.log('$on bid broadcast received in cpusService', bid)
        }
        // $scope.allUnits = angular.copy(units);
    });

    /** Returns cpu bid
     * @param {player} player
     * @param {gameInformation} gameInfo
     */

    function cpuBidDecision(player, gameInfo) {
        scoreHand(player);
        if(debugging == true){
            console.log("cpuBidDecision handscore");
        }

        var cpuBid;
        if (player.handScore <= 40) {
            cpuBid = 0;
        } else if (player.handScore > 55 && player.handScore <= 70) {
            cpuBid = 3;
        } else if (player.handScore > 70 && player.handScore <= 80) {
            cpuBid = 4;
        } else if (player.handScore > 80 && player.handScore <= 90) {
            cpuBid = 5;
        } else if (player.handScore > 90) {
            cpuBid = 6;
        }

        if (cpuBid > gameInfo.bidTaken) {
            return cpuBid;
        } else {
            return 0;
        }

    }


    /**
    * Returns the cpu trump for bid.
    * @param {Player} player - The computer player.
    * @param {gameInformation} gameInfo - The gameInformation.
    */
    function cpuPickTrump(player, gameInfo) {
        var handTrumpInfo = player.sortedHand[player.topSuit];

        if (handTrumpInfo.score > 35) {
            player.strategy = 'Make trump good'
        } else {
            if (handTrumpInfo.score > 20 && handTrumpInfo.offAces > 0) {
                player.strategy = 'Trump or Ace'
            } else {
                if (handTrumpInfo.offAces > 1) {
                    player.strategy = 'Float ace'
                }
            }
        }
        return player.topSuit;
    }

    /**
    * Returns a whether the cpu will stay for the hand.
    * @param {Player} player - The computer player.
    * @param {gameInformation} gameInfo - The gameInformation.
    */
    function cpuStayDecision(player, gameInfo) {
        if(debugging == true){
            console.log("cpuStayDecision", player, " gameInfo.trump", gameInfo.trump);
        }
        var handTrumpInfo = player.sortedHand[gameInfo.trump];

        if (handTrumpInfo.score > 35 || handTrumpInfo.score > 20 && handTrumpInfo.offAces > 0 || handTrumpInfo.offAces > 1) {
            if (handTrumpInfo.score > 35) {
                player.strategy = 'Make trump good'
            } else {
                if (handTrumpInfo.score > 20 && handTrumpInfo.offAces > 0) {
                    player.strategy = 'Trump or Ace'
                } else {
                    if (handTrumpInfo.offAces > 1) {
                        player.strategy = 'Float ace'
                    }
                }
            }
            if(debugging == true){
                console.log(player.location, " is staying");
            }
            return true;
        } else {
            if(debugging == true){
                console.log(player.location, " is folding");
            }
            return false;
        }
    }

    /**
    * Returns a card to play.
    * @param {Player} player - The computer player.
    * @param {gameInformation} gameInfo - The gameInformation.
    */
    function cpuPlayDecision(player, gameInfo) {
        if(debugging == true){
            console.log("cpuPlayDecision args", arguments)
        }
        var cardToPlay;
        var lowestCard;
        var highestCard;
        var possibleCards = Rules.legalPlays(player, gameInfo);
        if(debugging == true){
            console.log("possible plays", possibleCards);
        }
        //if your the last to play then play the lowest winner
        //if your the leader and bidder then higher prob of leading trump winner
        //if losers returned play losest loser not twin suited with king
        if (gameInfo.trick.length < 1) {
            //your leading
            if(debugging == true){
                console.log('************** IS LEADING ********');
                console.log("length of player.hand", player.hand.length);
            }
            _.each(possibleCards.cards, function (card) {
                if (!highestCard) {
                    highestCard = card;
                } else {
                    if (card.power > highestCard.power) {
                        highestCard = card;
                    }
                }

            });
            cardToPlay = highestCard;
            //Here I should check if high card is a likely winner.  If not likely winner then use alternate strategy.

        }
        if (!cardToPlay) {
            if (possibleCards.losers) {
                if(debugging == true){
                    console.log("losers")
                }
                var lowestCardPower = 30;
                _.each(possibleCards.cards, function (card) {
                    if (!lowestCard) {
                        lowestCard = card;
                    }
                    if (card.power < lowestCard.power) {
                        lowestCard = card;
                    }
                });
                cardToPlay = lowestCard;
            } else {
                if(debugging == true){
                    console.log("losers false")
                }
                //if your last or have high probability of winning play min highest card to win
                if (gameInfo.trick.length == gameInfo.playersIn.length - 1) {
                    _.each(possibleCards.cards, function (card) {
                        if (!lowestCard) {
                            lowestCard = card;
                        }
                        if (card.power < lowestCard.power) {
                            lowestCard = card;
                        }
                    });
                    if(debugging == true){
                        console.log("playing lowest possible winner")
                    }
                    cardToPlay = lowestCard;

                } else {
                    if(debugging == true){
                        console.log("playing random")
                    }
                    var ranNum = Math.floor(Math.random() * possibleCards.cards.length);
                    cardToPlay = possibleCards.cards[ranNum];
                }

            }
        }
        if(debugging == true) {
            console.log(player.name, " plays card ", cardToPlay);
        }
        //adjust hand info


        return cardToPlay;
    }


    function scoreHand(player) {
        if(debugging == true){
            console.log("cpuService scorehand player", player);
            console.log("hand length ", player.hand.length);
        }
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
                longSuit[Rules.jickSuit(card.suit)].jick = true;
                longSuit[Rules.jickSuit(card.suit)].score += 21;
                longSuit[Rules.jickSuit(card.suit)].count++;
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
        if(debugging == true){
            console.log("cpuService player.sortedHand", player.sortedHand)
        }
        player.handScore = topScore;
        player.handTotalScore = totalScore;
        player.topSuit = topSuit;
    }
    function makeCodedHand(player, bid, dealer) {
        if (player.type != 'cpu') {
            //don't save hands of humans
            return;
        }

        var codedHand = "";
        var offSuit = Rules.jickSuit(player.topSuit);
        var valuesOnly = [];
        var data = [];
        if(debugging == true){
            console.log("makeCodedHand params", player.sortedHand, bid, dealer)
        }
        if (player.sortedHand[player.topSuit].jick) {
            // console.log("inside jick if in makecoded hand")
            //remove jick from offsuite and add it to topsuite
            var jickString = offSuit.toUpperCase() + '11'
            // console.log("before splice for jickString", jickString)
           
            var index = player.sortedHand[offSuit].arr.indexOf(jickString);
            player.sortedHand[offSuit].arr.splice(index, 1)
            // console.log("after splic with index", index)
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

        console.log("suitOrder", suitOrder);

        //this for loop adds the remaining cards after trump seperated into suits by n
        for (var i = 0; i < suitOrder.length; i++) {
            var prevKing = false;
            if (player.sortedHand[suitOrder[i].suit].arr.length < 1) {
                //codedHand += 'n';
                continue;
            }
            for (var j = 0; j < player.sortedHand[suitOrder[i].suit].arr.length; j++) {


                var rank = player.sortedHand[suitOrder[i].suit].arr[j].rank;
                switch (rank) {
                    case 14:
                        codedHand += rank;
                        prevKing = false;
                        break;
                    case 13:
                        if (j == player.sortedHand[suitOrder[i].suit].arr.length - 1) {
                            //last card so add
                            codedHand += 'L';
                        }
                        prevKing = true;
                        break;
                    default:
                        if (prevKing) {
                            codedHand += '13' + 'L';
                        } else {
                            codedHand += 'L';
                        }
                        prevKing = false;
                }
            }
            codedHand += 'n';

        }
        if(debugging == true){
            console.log("coded hand ", codedHand);
        }
        var oneHand = {};
        // {code: {handCode: xyy, bid: 4, tricksTaken: 4, location: west, DealerLocation: 'North'}}
        oneHand[codedHand] = {};
        oneHand[codedHand].bid = bid;
        oneHand[codedHand].dealer = dealer.location;
        oneHand[codedHand].location = player.location;
        oneHand[codedHand].tricksTaken = player.tricksTaken;

        return oneHand;
    }

}]);