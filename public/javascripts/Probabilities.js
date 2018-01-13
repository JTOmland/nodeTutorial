 //var trump;
    //var handLeader;
    //var suitLed;
    // var trumpPlayed;
    // var topCard;
    //var activePlayer;
    //var assumedBidderTrump;
    //var trumpOut = 7;
   // var unplayedCards = 24;
    //var numChoices;
    //var locations = ['North', 'East', 'South', 'West'];

   // var bidderTrumpPlayed = 0;
   // var countOfTrumpPlayed = 0; //total num of actual trump played
    // var expectedTrumpForBidder = 0;
    // var allCardsPlayed;
    // var expectedTrump;
    // var cardsOut;
    // var choicesRemaining;

    // /** Adjust probability of cards based on card played
    //  * @param {Player} currentPlayer
    //  * @param {Card} cardPlayed
    //  * @param {gameInformation} gameInfo
    //  */
    // function newAdjustProb(gameInfo, currentPlayer, cardPlayed) {
    //     currentPlayer.sortedHand[cardPlayed.suit].count--;
    //     if(debugging == true){
    //         console.log('&&&&&&&&&&&&&&&&&&  New ADJUST PROBABILITIES CALLLED &&&&&&&&&&&&&&&&&&&&&&&&');
    //         console.log("newAdjustProb countOfTrumpPlayed ", countOfTrumpPlayed);
    //         console.log("do I have access to locations", locations)
    //     }
        
    //     if (cardPlayed.suit == gameInfo.trump || cardPlayed.power == 21) {
    //         countOfTrumpPlayed++;
    //         if (currentPlayer == gameInfo.currentBidOwner) {
    //             bidderTrumpPlayed++;
    //         }
    //     }
    //     trumpOut = 7 - countOfTrumpPlayed;
    //     allCardsPlayed = gameInfo.allCardsPlayed.length;

    //     _.each(locations, function (location) {
    //         if (location != currentPlayer.location) {
    //             _.each(locations, function (otherLocation) {
    //                 if (otherLocation != location) {
    //                     cardPlayed.probabilities[location][otherLocation] = 0;
    //                 }
    //             });
    //         }
    //     });

    //     _.each(cards.all, function (card) {
    //         //for trump cards we need to do bidder before other players because other players dependent on bidder
    //         if (card.suit == gameInfo.trump || cardPlayed.power == 21) {
    //             _.each(gameInfo.playersIn, function (player) {
    //                 if (player != currentPlayer && player.isIn) {
    //                     _.each(gameInfo.playersIn, function (player2) {
    //                         if (card.probabilities[player.location][player2.location] != 0) {
    //                             if (player != player2 && player2 == gameInfo.currentBidOwner) {
    //                                 card.probabilities[player.location][player2.location] = getProbPerspective(player, player2, card, gameInfo);
    //                                 if(debugging == true){
    //                                     console.log("Doing bidder trump Card ", card.shortName, " from ", player.location, " for ", player2.location, ":", card.probabilities[player.location][player2.location])
    //                                 }
    //                             }
    //                         }
    //                     });
    //                 }
    //             });
    //         }
    //         _.each(gameInfo.playersIn, function (player) {
    //             if (player != currentPlayer && player.isIn) {
    //                 _.each(gameInfo.playersIn, function (player2) {
    //                     if (card.probabilities[player.location][player2.location] != 0) {
    //                         if (player != player2) {
    //                             if ((card.suit == gameInfo.trump || cardPlayed.power == 21) && player2 == gameInfo.currentBidOwner) {
    //                                 //dont do anything here because we already did bidder trump first
    //                             } else {
    //                                 card.probabilities[player.location][player2.location] = getProbPerspective(player, player2, card, gameInfo);
    //                                 if(debugging == true) {
    //                                     console.log("Card ", card.shortName, " from ", player.location, " for ", player2.location, ":", card.probabilities[player.location][player2.location])
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 });
    //             }
    //         });
    //     });
    //     if(debugging == true){
    //         console.log('allcards', cards.all);
    //     }


    //     function getProbPerspective(playerPerspective, playerViewed, card, gameInfo) {

    //         if(debugging == true){
    //             console.log('playerperspective is ', playerPerspective.location);
    //         }
    //         trumpOut = 7 - countOfTrumpPlayed - playerPerspective.sortedHand[gameInfo.trump].count;
    //         expectedTrumpForBidder = gameInfo.bidTaken - bidderTrumpPlayed;
    //         var cardsInOtherHands = 0;
    //         _.each(gameInfo.playersIn, function (player) {
    //             if (player != playerPerspective) {
    //                 cardsInOtherHands += player.hand.length;
    //             }
    //         })

    //         //There are different scenarios.  If the perspective is bidder and card is non trump then probability is total cards not in bidders hands
    //         //and choices are number of cards in player viewed hand.
    //         //If it is the bidder perspective and the card is trump then the cards out are the remaining trump not played minus what is held in bidders hand
    //         //and the number of choices are the number of cards in the players hand.
    //         if(playerPerspective == gameInfo.currentBidOwner){
    //             //bidder
    //             if(!(card.suit == gameInfo.trump || cardPlayed.power == 21)){
    //                 //not trump
    //                 if(debugging == true){
    //                     console.log("From bidder perspective ", playerPerspective, " estimating for ", playerViewed, "for card ", card, "cardsInOtherHands ", cardsInOtherHands, " playerViewed Hnad length ", playerViewed.hand.length);
    //                     console.log("Proability is ", Utilities.combin(cardsInOtherHands - 1, playerViewed.hand.length - 1) / Utilities.combin(cardsInOtherHands, playerViewed.hand.length));
    //                 }
    //                 return Utilities.combin(cardsInOtherHands - 1, playerViewed.hand.length - 1) / Utilities.combin(cardsInOtherHands, playerViewed.hand.length);
    //             } else {
    //                 if(debugging == true) {
    //                     console.log("From bidder perspective ", playerPerspective, " estimating for ", playerViewed, "for trump card ", card, "trump out", trumpOut, " playerViewed Hnad length ", playerViewed.hand.length);
    //                     console.log("Probability is ", Utilities.combin(trumpOut - 1, playerViewed.hand.length - 1) / Utilities.combin(trumpOut, playerViewed.hand.length));
    //                 }
    //                 return Utilities.combin(trumpOut - 1, playerViewed.hand.length - 1) / Utilities.combin(trumpOut, playerViewed.hand.length);

    //             }
    //         }

    //         //If it is not the bidder perspective and the player viewed is not the bidder and the card is non trump then the
    //         //choices to choose from are cards out minus the assumed trump held by the bidder and the choices are the number of cards in the player viewed hand
    //         //If it is not the bidder perspective and the player viewed is not the bidder and the card is trump then
    //         //the number to choose from is the trurmp played less trump in player perspective less assumed bidder held trump and the choices are the number of cards in the player viewed hand
    //         //If it is not the bidder perspective na dht eplayer viewed is the bidder and the card is not trump
    //         //then the number to choose from is the total cards out less the assumed bidder trump and choices are number of cards in hand less assumed held trump
    //         //if it is not the bidder perspective and the player viewed is the bidder and the card is trump
    //         //then the number to choose from is the total trump out less the assumed bidder trump less the number of trump in the player perspective hand and the number of choices is the assumed bidder trump
    //         cardsOut = cardsInOtherHands - expectedTrumpForBidder;
    //         if (playerViewed == gameInfo.currentBidOwner) {
    //             if(debugging == true) {
    //                 console.log('calculating choices and cards out for playerViewd is bidder ')
    //                 console.log('hand length', playerViewed.hand.length, ' expectedTrumpForBidder', expectedTrumpForBidder)
    //             }
    //             choicesRemaining = playerViewed.hand.length - expectedTrumpForBidder;
    //         } else {
    //             choicesRemaining = playerViewed.hand.length;
    //         }
    //         if(debugging == true){
    //             console.log('calculate prob key variables from perspective of ', playerPerspective.location, ' for player ', playerViewed.location);
    //             console.log("cardsout:", cardsOut, " choicesRemaining ", choicesRemaining, " trumpOUt", trumpOut, "card", card, "trump", gameInfo.trump);
    //         }
    //         if ((card.suit != gameInfo.trump || cardPlayed.power != 21) || playerPerspective == gameInfo.currentBidOwner) {
    //             //bidder non-trump and non bidder non trump
    //             if(debugging == true){
    //                 console.log("bidder non trump or from bidders perspective");
    //             }
    //             return Utilities.combin(cardsOut - 1, choicesRemaining - 1) / Utilities.combin(cardsOut, choicesRemaining)

    //         } else {
    //             if (playerViewed == gameInfo.currentBidOwner) {
    //                 //bidder trump
    //                 if(debugging == true){
    //                     console.log("bidder trump");
    //                 }
    //                 if (choicesRemaining < 1) {
    //                     choicesRemaining = 1;
    //                 }
    //                 return Utilities.combin(trumpOut - 1, choicesRemaining - 1) / Utilities.combin(trumpOut, choicesRemaining)
    //             } else {
    //                 //non bidder trump
    //                 if(debugging == true){
    //                     console.log("nonbidder trump");
    //                     console.log("playerPerspective ", playerPerspective, " gameInfo.bidder ", gameInfo.currentBidOwner)
    //                 }

    //                 return (1 - card.probabilities[playerPerspective.location][gameInfo.currentBidOwner.location]) / 2;
    //             }

    //         }
    //     }
    // }

  

    // function adjustFoldProb(gameInfo, bidder) {
    //     assumedBidderTrump = gameInfo.bidTaken;
    //     //after stay fold round adjust probabilities based on knowledge bidder is likely to have more trump
    //     //and folded player likely to have less trump and less aces
    //     if(debugging == true){
    //         console.log('******************* ADJUST FOLD PROBABILITIES CALLLED *********************');
    //         console.log("adjustFoldProb playersIn", gameInfo.playersIn);
    //     }
    //     //first calculate bidders trump
    //     _.each(cards.all, function (card) {
    //         if(debugging == true){
    //             console.log("CPUService.adjustFoldProb new card", card.shortName);
    //         }
    //         var index;
    //         _.each(gameInfo.playersIn, function (player) {
    //             if(debugging == true){
    //                 console.log("new player perspective", player.location)
    //             }
    //             if (player.type != "cpu") {
    //                 if(debugging == true){
    //                     console.log("CPUService.adjustFoldProb for human player calling scorehand");
    //                 }
    //                 scoreHand(player);
    //             }
    //             //player is the player from whom we calculate their perspective
    //             _.each(gameInfo.playersIn, function (player2) {
    //                 if(debugging == true){
    //                     console.log(player.location, "looking at location ", player2.location);
    //                 }
    //                 if (player != player2) {

    //                     //console.log("CPUService.adjustFoldProb card probs", card.probabilities);
    //                     //only need to check cards that the player doesn't already know is zero
    //                     if(debugging == true){
    //                         console.log('check card held by player ', card.probabilities[player.location][player2.location] != 0);
    //                     }
    //                     if (card.probabilities[player.location][player2.location] != 0) {
    //                         if(debugging == true){
    //                             console.log('check card is trump ', (card.suit == gameInfo.trump || card.power == 21));
    //                         }
                            
    //                         if (card.suit == gameInfo.trump || card.power == 21) {
    //                             if (player != bidder) {
    //                                 var trumpOut = 7 - player.sortedHand[gameInfo.trump].count;
    //                                 var choose = gameInfo.bidTaken;
    //                                 while (trumpOut < choose) {
    //                                     choose--;
    //                                 }
    //                                 var pAssume = Utilities.combin(trumpOut - 1, choose - 1); //assume has card
    //                                 var p = Utilities.combin(trumpOut, choose);
    //                                 if (player2 == bidder) {
    //                                     //set probability from non bidder view of bidder
    //                                     card.probabilities[player.location][player2.location] = pAssume / p;
    //                                 } else {
    //                                     //player2 is not the bidder card is trump 
    //                                     card.probabilities[player.location][player2.location] = (1 - pAssume / p) / (gameInfo.playersIn.length - 2); // minus one because bidder not included
    //                                 }
    //                             } else {
    //                                 //player is bidder card is trump and card is not in bidders hand
    //                                 //from the bidders perspective probabilities only change based on 
    //                                 //how many players stayed (staying indicates higher prob of trump and aces)
    //                                 card.probabilities[player.location][player2.location] = 1 / (gameInfo.playersIn.length - 1);
    //                             }
    //                         } else {
    //                             //card is not trump
    //                             if(debugging == true){
    //                                 console.log("check if play perspective is not bidder ", player != bidder);
    //                             }
    //                             if (player != bidder) {
    //                                 if(debugging == true){
    //                                     console.log("check if play viewed is bidder ", player2 == bidder);
    //                                 }
    //                                 if (player2 == bidder) {
    //                                     //card not trump player not bidder what he thinks bidder probability is
    //                                     card.probabilities[player.location][player2.location] = Utilities.combin(18 - gameInfo.bidTaken - 1, 6 - gameInfo.bidTaken - 1) / Utilities.combin(18 - gameInfo.bidTaken, 6 - gameInfo.bidTaken);
    //                                     if(debugging == true){
    //                                         console.log("calculated the bidder prob of non trump from ", player.location, "'s perspective and prob is ", Utilities.combin(18 - gameInfo.bidTaken - 1, 6 - gameInfo.bidTaken - 1) / Utilities.combin(18 - gameInfo.bidTaken, 6 - gameInfo.bidTaken));
    //                                         console.log("for card ", card.shortName);
    //                                     }
    //                                 } else {
    //                                     //card not trump player not bidder non-bidder player probability is
    //                                     card.probabilities[player.location][player2.location] = Utilities.combin(18 - gameInfo.bidTaken - 1, 6 - 1) / Utilities.combin(18 - gameInfo.bidTaken, 6);
    //                                     if(debugging == true){
    //                                         console.log("calculated non bidder prob of non trump from ", player.location, "perspective and prob is ", Utilities.combin(18 - gameInfo.bidTaken - 1, 6 - 1) / Utilities.combin(18 - gameInfo.bidTaken, 6));
    //                                         console.log("for card ", card.shortName);
    //                                     }
    //                                     // console.log("for bid", gameInfo.bidTaken);
    //                                 }

    //                             } else {
    //                                 //player is bidder and card is not trump
    //                                 card.probabilities[player.location][player2.location] = Utilities.combin(18 - 1, 6 - 1) / Utilities.combin(18, 6);
    //                                 //then adjust this probbility based on how many stayed and card rank
    //                                 if(debugging == true){
    //                                     console.log("calculated the bidder perspective of non trump and prob is ", Utilities.combin(18 - 1, 6 - 1) / Utilities.combin(18, 6));
    //                                     console.log("for card ", card.shortName);
    //                                 }

    //                             }
    //                         }

    //                     }
    //                 }
    //             });
    //         });
    //     });
    // }

    // function setProbabilities(gameInfo) {
    //     _.each(cards.all, function (card) {
    //         card.probabilities = {};
    //         _.each(gameInfo.playersIn, function (player) {
    //             card.probabilities[player.location] = {}
    //             _.each(gameInfo.playersIn, function (player2) {
    //                 if (player2 != player) {
    //                     //card.probabilities[player.location][player2.location] = 2;
    //                     //zero out probabilities of cards held by player
    //                     _.each(player.hand, function (pCard) {
    //                         if (pCard == card) {
    //                             card.probabilities[player.location][player2.location] = 0;
    //                         }
    //                     });
    //                     //if card does not have probabilities set
    //                     if (card.probabilities[player.location][player2.location] != 0) {
    //                         var cardsOut2 = 24 - 6; //total minus in players hand
    //                         var pAssume = Utilities.combin(cardsOut2 - 1, 6 - 1); //assume has card
    //                         var p = Utilities.combin(cardsOut2, 6);
    //                         card.probabilities[player.location][player2.location] = pAssume / p;
    //                     }
    //                 }
    //             });
    //         });
    //     });
    // }
