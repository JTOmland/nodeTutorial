
vsapp.factory('CPUService', ['$http', '$q', '$rootScope', 'DataFactory', 'CommService', "Rules", "Utilities", function ($http, $q, $rootScope, DataFactory, CommService, Rules, Utilities) {
    var service = {
        cpuPickTrump: cpuPickTrump,
        cpuStayDecision: cpuStayDecision,
        cpuPlayDecision: cpuPlayDecision,
        cpuBidDecision: cpuBidDecision,
        makeCodedHand: makeCodedHand,
        scoreHand: scoreHand,
        setProbabilities: setProbabilities,
        adjustCardProb: newAdjustProb,
        adjustFoldProb: adjustFoldProb
    };

    var debugging = false;
    var currentHighBid;
    var trump;
    var handLeader;
    var suitLed;
    var trumpPlayed;
    var topCard;
    var activePlayer;
    var assumedBidderTrump;
    var trumpOut = 7;
    var unplayedCards = 24;
    var numChoices;
    var locations = ['North', 'East', 'South', 'West'];

    var bidderTrumpPlayed = 0;
    var countOfTrumpPlayed = 0; //total num of actual trump played
    var expectedTrumpForBidder = 0;
    var allCardsPlayed;
    var expectedTrump;
    var cardsOut;
    var choicesRemaining;


    return service;

    $scope.$on('bid', function (e, bid) {
        if(debugging == true){
            console.log('$on bid broadcast received in cpusService', bid)
        }
        // $scope.allUnits = angular.copy(units);
    });

    /** Adjust probability of cards based on card played
     * @param {Player} currentPlayer
     * @param {Card} cardPlayed
     * @param {gameInformation} gameInfo
     */
    function newAdjustProb(gameInfo, currentPlayer, cardPlayed) {
        currentPlayer.sortedHand[cardPlayed.suit].count--;
        if(debugging == true){
            console.log('&&&&&&&&&&&&&&&&&&  New ADJUST PROBABILITIES CALLLED &&&&&&&&&&&&&&&&&&&&&&&&');
            console.log("newAdjustProb countOfTrumpPlayed ", countOfTrumpPlayed);
            console.log("do I have access to locations", locations)
        }
        
        if (cardPlayed.suit == gameInfo.trump || cardPlayed.power == 21) {
            countOfTrumpPlayed++;
            if (currentPlayer == gameInfo.currentBidOwner) {
                bidderTrumpPlayed++;
            }
        }
        trumpOut = 7 - countOfTrumpPlayed;
        allCardsPlayed = gameInfo.allCardsPlayed.length;

        _.each(locations, function (location) {
            if (location != currentPlayer.location) {
                _.each(locations, function (otherLocation) {
                    if (otherLocation != location) {
                        cardPlayed.probabilities[location][otherLocation] = 0;
                    }
                });
            }
        });

        _.each(cards.all, function (card) {
            //for trump cards we need to do bidder before other players because other players dependent on bidder
            if (card.suit == gameInfo.trump || cardPlayed.power == 21) {
                _.each(gameInfo.playersIn, function (player) {
                    if (player != currentPlayer && player.isIn) {
                        _.each(gameInfo.playersIn, function (player2) {
                            if (card.probabilities[player.location][player2.location] != 0) {
                                if (player != player2 && player2 == gameInfo.currentBidOwner) {
                                    card.probabilities[player.location][player2.location] = getProbPerspective(player, player2, card, gameInfo);
                                    if(debugging == true){
                                        console.log("Doing bidder trump Card ", card.shortName, " from ", player.location, " for ", player2.location, ":", card.probabilities[player.location][player2.location])
                                    }
                                }
                            }
                        });
                    }
                });
            }
            _.each(gameInfo.playersIn, function (player) {
                if (player != currentPlayer && player.isIn) {
                    _.each(gameInfo.playersIn, function (player2) {
                        if (card.probabilities[player.location][player2.location] != 0) {
                            if (player != player2) {
                                if ((card.suit == gameInfo.trump || cardPlayed.power == 21) && player2 == gameInfo.currentBidOwner) {
                                    //dont do anything here because we already did bidder trump first
                                } else {
                                    card.probabilities[player.location][player2.location] = getProbPerspective(player, player2, card, gameInfo);
                                    if(debugging == true) {
                                        console.log("Card ", card.shortName, " from ", player.location, " for ", player2.location, ":", card.probabilities[player.location][player2.location])
                                    }
                                }
                            }
                        }
                    });
                }
            });
        });
        if(debugging == true){
            console.log('allcards', cards.all);
        }


        function getProbPerspective(playerPerspective, playerViewed, card, gameInfo) {

            if(debugging == true){
                console.log('playerperspective is ', playerPerspective.location);
            }
            trumpOut = 7 - countOfTrumpPlayed - playerPerspective.sortedHand[gameInfo.trump].count;
            expectedTrumpForBidder = gameInfo.bidTaken - bidderTrumpPlayed;
            var cardsInOtherHands = 0;
            _.each(gameInfo.playersIn, function (player) {
                if (player != playerPerspective) {
                    cardsInOtherHands += player.hand.length;
                }
            })

            //There are different scenarios.  If the perspective is bidder and card is non trump then probability is total cards not in bidders hands
            //and choices are number of cards in player viewed hand.
            //If it is the bidder perspective and the card is trump then the cards out are the remaining trump not played minus what is held in bidders hand
            //and the number of choices are the number of cards in the players hand.
            if(playerPerspective == gameInfo.currentBidOwner){
                //bidder
                if(!(card.suit == gameInfo.trump || cardPlayed.power == 21)){
                    //not trump
                    if(debugging == true){
                        console.log("From bidder perspective ", playerPerspective, " estimating for ", playerViewed, "for card ", card, "cardsInOtherHands ", cardsInOtherHands, " playerViewed Hnad length ", playerViewed.hand.length);
                        console.log("Proability is ", Utilities.combin(cardsInOtherHands - 1, playerViewed.hand.length - 1) / Utilities.combin(cardsInOtherHands, playerViewed.hand.length));
                    }
                    return Utilities.combin(cardsInOtherHands - 1, playerViewed.hand.length - 1) / Utilities.combin(cardsInOtherHands, playerViewed.hand.length);
                } else {
                    if(debugging == true) {
                        console.log("From bidder perspective ", playerPerspective, " estimating for ", playerViewed, "for trump card ", card, "trump out", trumpOut, " playerViewed Hnad length ", playerViewed.hand.length);
                        console.log("Probability is ", Utilities.combin(trumpOut - 1, playerViewed.hand.length - 1) / Utilities.combin(trumpOut, playerViewed.hand.length));
                    }
                    return Utilities.combin(trumpOut - 1, playerViewed.hand.length - 1) / Utilities.combin(trumpOut, playerViewed.hand.length);

                }
            }

            //If it is not the bidder perspective and the player viewed is not the bidder and the card is non trump then the
            //choices to choose from are cards out minus the assumed trump held by the bidder and the choices are the number of cards in the player viewed hand
            //If it is not the bidder perspective and the player viewed is not the bidder and the card is trump then
            //the number to choose from is the trurmp played less trump in player perspective less assumed bidder held trump and the choices are the number of cards in the player viewed hand
            //If it is not the bidder perspective na dht eplayer viewed is the bidder and the card is not trump
            //then the number to choose from is the total cards out less the assumed bidder trump and choices are number of cards in hand less assumed held trump
            //if it is not the bidder perspective and the player viewed is the bidder and the card is trump
            //then the number to choose from is the total trump out less the assumed bidder trump less the number of trump in the player perspective hand and the number of choices is the assumed bidder trump
            cardsOut = cardsInOtherHands - expectedTrumpForBidder;
            if (playerViewed == gameInfo.currentBidOwner) {
                if(debugging == true) {
                    console.log('calculating choices and cards out for playerViewd is bidder ')
                    console.log('hand length', playerViewed.hand.length, ' expectedTrumpForBidder', expectedTrumpForBidder)
                }
                choicesRemaining = playerViewed.hand.length - expectedTrumpForBidder;
            } else {
                choicesRemaining = playerViewed.hand.length;
            }
            if(debugging == true){
                console.log('calculate prob key variables from perspective of ', playerPerspective.location, ' for player ', playerViewed.location);
                console.log("cardsout:", cardsOut, " choicesRemaining ", choicesRemaining, " trumpOUt", trumpOut, "card", card, "trump", gameInfo.trump);
            }
            if ((card.suit != gameInfo.trump || cardPlayed.power != 21) || playerPerspective == gameInfo.currentBidOwner) {
                //bidder non-trump and non bidder non trump
                if(debugging == true){
                    console.log("bidder non trump or from bidders perspective");
                }
                return Utilities.combin(cardsOut - 1, choicesRemaining - 1) / Utilities.combin(cardsOut, choicesRemaining)

            } else {
                if (playerViewed == gameInfo.currentBidOwner) {
                    //bidder trump
                    if(debugging == true){
                        console.log("bidder trump");
                    }
                    if (choicesRemaining < 1) {
                        choicesRemaining = 1;
                    }
                    return Utilities.combin(trumpOut - 1, choicesRemaining - 1) / Utilities.combin(trumpOut, choicesRemaining)
                } else {
                    //non bidder trump
                    if(debugging == true){
                        console.log("nonbidder trump");
                        console.log("playerPerspective ", playerPerspective, " gameInfo.bidder ", gameInfo.currentBidOwner)
                    }

                    return (1 - card.probabilities[playerPerspective.location][gameInfo.currentBidOwner.location]) / 2;
                }

            }
        }
    }

  

    function adjustFoldProb(gameInfo, bidder) {
        assumedBidderTrump = gameInfo.bidTaken;
        //after stay fold round adjust probabilities based on knowledge bidder is likely to have more trump
        //and folded player likely to have less trump and less aces
        if(debugging == true){
            console.log('******************* ADJUST FOLD PROBABILITIES CALLLED *********************');
            console.log("adjustFoldProb playersIn", gameInfo.playersIn);
        }
        //first calculate bidders trump
        _.each(cards.all, function (card) {
            if(debugging == true){
                console.log("CPUService.adjustFoldProb new card", card.shortName);
            }
            var index;
            _.each(gameInfo.playersIn, function (player) {
                if(debugging == true){
                    console.log("new player perspective", player.location)
                }
                if (player.type != "cpu") {
                    if(debugging == true){
                        console.log("CPUService.adjustFoldProb for human player calling scorehand");
                    }
                    scoreHand(player);
                }
                //player is the player from whom we calculate their perspective
                _.each(gameInfo.playersIn, function (player2) {
                    if(debugging == true){
                        console.log(player.location, "looking at location ", player2.location);
                    }
                    if (player != player2) {

                        //console.log("CPUService.adjustFoldProb card probs", card.probabilities);
                        //only need to check cards that the player doesn't already know is zero
                        if(debugging == true){
                            console.log('check card held by player ', card.probabilities[player.location][player2.location] != 0);
                        }
                        if (card.probabilities[player.location][player2.location] != 0) {
                            if(debugging == true){
                                console.log('check card is trump ', (card.suit == gameInfo.trump || card.power == 21));
                            }
                            
                            if (card.suit == gameInfo.trump || card.power == 21) {
                                if (player != bidder) {
                                    var trumpOut = 7 - player.sortedHand[gameInfo.trump].count;
                                    var choose = gameInfo.bidTaken;
                                    while (trumpOut < choose) {
                                        choose--;
                                    }
                                    var pAssume = Utilities.combin(trumpOut - 1, choose - 1); //assume has card
                                    var p = Utilities.combin(trumpOut, choose);
                                    if (player2 == bidder) {
                                        //set probability from non bidder view of bidder
                                        card.probabilities[player.location][player2.location] = pAssume / p;
                                    } else {
                                        //player2 is not the bidder card is trump 
                                        card.probabilities[player.location][player2.location] = (1 - pAssume / p) / (gameInfo.playersIn.length - 2); // minus one because bidder not included
                                    }
                                } else {
                                    //player is bidder card is trump and card is not in bidders hand
                                    //from the bidders perspective probabilities only change based on 
                                    //how many players stayed (staying indicates higher prob of trump and aces)
                                    card.probabilities[player.location][player2.location] = 1 / (gameInfo.playersIn.length - 1);
                                }
                            } else {
                                //card is not trump
                                if(debugging == true){
                                    console.log("check if play perspective is not bidder ", player != bidder);
                                }
                                if (player != bidder) {
                                    if(debugging == true){
                                        console.log("check if play viewed is bidder ", player2 == bidder);
                                    }
                                    if (player2 == bidder) {
                                        //card not trump player not bidder what he thinks bidder probability is
                                        card.probabilities[player.location][player2.location] = Utilities.combin(18 - gameInfo.bidTaken - 1, 6 - gameInfo.bidTaken - 1) / Utilities.combin(18 - gameInfo.bidTaken, 6 - gameInfo.bidTaken);
                                        if(debugging == true){
                                            console.log("calculated the bidder prob of non trump from ", player.location, "'s perspective and prob is ", Utilities.combin(18 - gameInfo.bidTaken - 1, 6 - gameInfo.bidTaken - 1) / Utilities.combin(18 - gameInfo.bidTaken, 6 - gameInfo.bidTaken));
                                            console.log("for card ", card.shortName);
                                        }
                                    } else {
                                        //card not trump player not bidder non-bidder player probability is
                                        card.probabilities[player.location][player2.location] = Utilities.combin(18 - gameInfo.bidTaken - 1, 6 - 1) / Utilities.combin(18 - gameInfo.bidTaken, 6);
                                        if(debugging == true){
                                            console.log("calculated non bidder prob of non trump from ", player.location, "perspective and prob is ", Utilities.combin(18 - gameInfo.bidTaken - 1, 6 - 1) / Utilities.combin(18 - gameInfo.bidTaken, 6));
                                            console.log("for card ", card.shortName);
                                        }
                                        // console.log("for bid", gameInfo.bidTaken);
                                    }

                                } else {
                                    //player is bidder and card is not trump
                                    card.probabilities[player.location][player2.location] = Utilities.combin(18 - 1, 6 - 1) / Utilities.combin(18, 6);
                                    //then adjust this probbility based on how many stayed and card rank
                                    if(debugging == true){
                                        console.log("calculated the bidder perspective of non trump and prob is ", Utilities.combin(18 - 1, 6 - 1) / Utilities.combin(18, 6));
                                        console.log("for card ", card.shortName);
                                    }

                                }
                            }

                        }
                    }
                });
            });
        });
    }

    function setProbabilities(gameInfo) {
        _.each(cards.all, function (card) {
            card.probabilities = {};
            _.each(gameInfo.playersIn, function (player) {
                card.probabilities[player.location] = {}
                _.each(gameInfo.playersIn, function (player2) {
                    if (player2 != player) {
                        //card.probabilities[player.location][player2.location] = 2;
                        //zero out probabilities of cards held by player
                        _.each(player.hand, function (pCard) {
                            if (pCard == card) {
                                card.probabilities[player.location][player2.location] = 0;
                            }
                        });
                        //if card does not have probabilities set
                        if (card.probabilities[player.location][player2.location] != 0) {
                            var cardsOut2 = 24 - 6; //total minus in players hand
                            var pAssume = Utilities.combin(cardsOut2 - 1, 6 - 1); //assume has card
                            var p = Utilities.combin(cardsOut2, 6);
                            card.probabilities[player.location][player2.location] = pAssume / p;
                        }
                    }
                });
            });
        });
    }



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
        var test = Math
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
        if(debugging = true){
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
    // function jickSuit(suit) {
    //     switch (suit) {
    //         case 'd':
    //             return 'h'
    //             break;
    //         case 'h':
    //             return 'd'
    //             break;
    //         case 's':
    //             return 'c'
    //             break;
    //         case 'c':
    //             return 's'
    //             break;
    //     }
    // }


}]);