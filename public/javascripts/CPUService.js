
vsapp.factory('CPUService', ['$http', '$q', function ($http, $q) {
    var theStore = [];
    var service = {
        cpuPickTrump: cpuPickTrump,
        cpuStayDecision: cpuStayDecision,
        cpuPlayDecision: cpuPlayDecision,
        cpuBidDecision: cpuBidDecision
    };
    return service;

    function cpuBidDecision(player, currentHighBid) {
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

        if (cpuBid > currentHighBid) {
            return cpuBid;
        } else {
            return false;
        }
    }

    function cpuPickTrump(player) {
        console.log("cpu pick trump ", player);
        return player.topSuit;
    }

    function cpuStayDecision(player, trump) {
        var handTrumpInfo = player.sortedHand[trump];

        if (handTrumpInfo.score > 35) {
            return true;
        }
        if (handTrumpInfo.score > 20 && handTrumpInfo.offAces > 0) {
            return true;
        }
        if (handTrumpInfo.offAces > 1) {
            return true;
        }
        return false;
    }

    function cpuPlayDecision(player, trump, handLeader, suitLed, trumpPlayed, topCard, activePlayer) {
        console.log("cpuPlayDecision args", arguments)
        var p = player;
        var cardToPlay;
        var possibleCards = legalPlays(trump, handLeader, player, suitLed, trumpPlayed, topCard,activePlayer);
        console.log("possible plays", possibleCards);
        var ranNum = Math.floor(Math.random() * possibleCards.length);
        cardToPlay = possibleCards[ranNum]
        return cardToPlay;
    }

    function legalPlays(trump, handLeader, player, suitLed, trumpPlayed, topCard, activePlayer) {
        var legalCards = [];
        var hasSuit = false;
        var canTrump = false;
        var hasHigherSuitCard = false;
        var higherSuitCards = [];
        var lowerSuitCards = [];
        var higherTrumpCards = [];
        var lowerTrumpCards = [];
        var losers = [];
        //four cases:
        //1.  Your the leader  all cards legalCards
        //2.  The trick has been trumped, you have the leadsuit
        //3.  The trick has been trumped, you don't have lead suit but you do have higher trump
        //4.  The trick has not been trumped you have a higher card in suit
        //5.  The trick has not been trumped you have a lower card in suit
        //6.  The trick has not been trumped you have no cards in suit led and you have trump
        //7.  The trick has not been trumped you have no cards in suit and no trump
        //8.  The trick has been trumped, you don't have lead suit or trump (all cards legal)
        console.log("handLeader ", handLeader, " player is ", player);
        if (activePlayer == handLeader) {
            return player.hand;
        }
        _.each(player.hand, function (card) {
            if ((card.suit == suitLed && !(card.rank == 11 && jickSuit(card.suit) == trump)) || (suitLed == trump && (card.rank == 11 && jickSuit(card.suit) == trump))) {
                hasSuit = true;
                if (card.power > topCard.power) {
                    hasHigherSuitCard = true;
                    higherSuitCards.push(card);
                } else {
                    lowerSuitCards.push(card);
                }
            } else {
                if (card.suit == trump || (card.rank == 11 && jickSuit(card.suit) == trump)) {
                    canTrump = true;
                    if (card.power > topCard.power) {
                        higherTrumpCards.push(card);
                    } else {
                        lowerTrumpCards.push(card);
                    }
                } else {
                    if (card.suit != suitLed && card.suit != trump) {
                        losers.push(card);
                    }
                }
            }
        });
        if (!trumpPlayed) {
            if (hasHigherSuitCard) {
                return higherSuitCards;
            } else {
                if (hasSuit) {
                    return lowerSuitCards;
                } else {
                    if (canTrump) {
                        return higherTrumpCards; //should be all trump in hand if no trump played yet
                    }
                }
            }
        } else {
            if (hasSuit) {
                return (lowerSuitCards.length > 0 ? lowerSuitCards : higherSuitCards);
            } else {
                if (higherTrumpCards.length > 0) {
                    return higherTrumpCards;
                } else {
                    return (losers.length > 0 ? losers : lowerTrumpCards);
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
        //makeCodedHand(player);
    }
       function makeCodedHand(player) {
        var codedHand = "";
        var offSuit = jickSuit(player.topSuit);
        var valuesOnly = [];
        // console.log("makeCodedHand jick check", player.sortedHand[player.topSuit].jick);
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
        oneHand[codedHand] = 2;
        data.push(oneHand);
        DataFactory.saveData(data);
        console.log(player.name, ' coded hand ', codedHand);
        DataFactory.getData().then(function (response) {
            console.log(response)
        });
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