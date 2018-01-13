vsapp.factory('Rules', [function () {
    var service = {
        legalPlays: legalPlays,
        jickSuit: jickSuit,
        adjustCardRank: adjustCardRank
    };

    return service;

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


    function legalPlays(player, gameInfo) {
        var legalCards = {};
        var hasSuit = false;
        var canTrump = false;
        var hasHigherSuitCard = false;
        var higherSuitCards = [];
        var lowerSuitCards = [];
        var higherTrumpCards = [];
        var lowerTrumpCards = [];
        var losers = [];
        // console.log("******* LEGAL PLAYS *********")

        //four cases:
        //1.  Your the leader  all cards legalCards
        //2.  The trick has been trumped, you have the leadsuit
        //3.  The trick has been trumped, you don't have lead suit but you do have higher trump
        //4.  The trick has not been trumped you have a higher card in suit
        //5.  The trick has not been trumped you have a lower card in suit
        //6.  The trick has not been trumped you have no cards in suit led and you have trump
        //7.  The trick has not been trumped you have no cards in suit and no trump
        //8.  The trick has been trumped, you don't have lead suit or trump (all cards legal)
        // console.log("trick length", gameInfo.trick.length)
        // console.log("legal plays game info", gameInfo);
        if (gameInfo.trick.length < 1) {
            _.each(player.hand, function (card) {
                higherSuitCards.push(card);
            });
            return { cards: higherSuitCards, losers: false };
        }

        _.each(player.hand, function (card) {
           // console.log("card to evaluate ", card, " player is ", player);

            if ((card.suit == gameInfo.suitLed && !(card.rank == 11 && jickSuit(card.suit) == gameInfo.trump)) || (gameInfo.suitLed == gameInfo.trump && (card.rank == 11 && jickSuit(card.suit) == gameInfo.trump))) {
                hasSuit = true;
                //console.log("has suit");
                if (card.power > gameInfo.topCard.power) {
                    //console.log("higher card in suit");
                    hasHigherSuitCard = true;
                    higherSuitCards.push(card);
                } else {
                    lowerSuitCards.push(card);
                    //console.log("lower card in suit");
                }
            } else {
                if (card.suit == gameInfo.trump || (card.rank == 11 && jickSuit(card.suit) == gameInfo.trump)) {
                    //console.log("can trump is true");
                    canTrump = true;
                    if (card.power > gameInfo.topCard.power) {
                        //console.log("higherTrump");
                        higherTrumpCards.push(card);
                    } else {
                        //console.log("lower trump card")
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

        if (gameInfo.suitLed == gameInfo.trump) { //if trump is led then
            if (hasSuit) {  //if has trump then has to play higher card else can play lower cart
                return (higherSuitCards.length > 0 ? { cards: higherSuitCards, losers: false } : { cards: lowerSuitCards, losers: true });
            } else {  //if does not have suit (trump) then can play any card.
               // console.log("returning from trump led, player had no trump returning losers ", losers, " should match player.hand", player.hand)
                legalCards = losers;
                return { cards: losers, losers: true };
            }
        } else {  //if trump is not led
           // console.log("Legal plays checking which cards to return based on trump played gameInfo.trumpPlayed is  ", gameInfo.trumpPlayed)
            if (!gameInfo.trumpPlayed) {  // and if trump has not been played.
                if (hasHigherSuitCard) {  //must play higher suit led card if available (must kill)
                   // console.log("Returning higherSuiCards no trump played")
                    legalCards = higherSuitCards;
                    return { cards: higherSuitCards, losers: false };
                } else { //if cannot kill must follow suit
                    if (hasSuit) {
                       // console.log("Returning suit no trump played")
                        legalCards = higherSuitCards.concat(lowerSuitCards);  //should not have higherSuitCards
                        return { cards: lowerSuitCards, losers: true };
                    } else { //if cannot follow suit can trump
                        if (canTrump) {  //if can trump must trump
                            console.log("Returning trump no trump played")

                            return { cards: higherTrumpCards, losers: false }; //should be all trump in hand if no trump played yet
                        } else { //if cannot follow suit and has no trump can play any card.
                            return { cards: losers, losers: true }
                        }
                    }
                }
            } else {  //trump played
                if (hasSuit) {  //has suit need to play higher card unles trumped
                    //console.log("Returning trump played has suit play lower card if available")
                    //here legal plays are really any suit card
                    legalCards = higherSuitCards.concat(lowerSuitCards);
                    if (player.type == 'human') {
                        return { cards: legalCards }
                    } else {
                        return (lowerSuitCards.length > 0 ? { cards: lowerSuitCards, losers: true } : { cards: higherSuitCards, losers: false });
                    }
                } else {
                    if (higherTrumpCards.length > 0) {
                       // console.log("Returning trump played no suit but higher trump card returns")
                        return { cards: higherTrumpCards, losers: false };
                    } else {
                       //console.log("Returning trump played no suit no trump return losers")
                        return (losers.length > 0 ? { cards: losers, losers: true } : { cards: lowerTrumpCards, losers: true });
                    }
                }
            }
        }
    }
    function adjustCardRank(gameInfo) {
        //console.log("************Adjusting Ranks *****************")
        _.each(gameInfo.playersIn, function (p) {
            // console.log("player ", p.name);
            _.each(p.hand, function (card) {
                if (card.suit == gameInfo.trump) {
                    //  console.log("card.rank before for trump", card.rank);
                    card.power = card.rank + 6;
                    //  console.log("card.rank after for trump", card.rank);

                } else {
                    card.power = card.rank;
                }
                if (card.rank == 11 && jickSuit(card.suit) == gameInfo.trump) {
                    card.power = 21;
                }
                if (card.rank == 11 && card.suit == gameInfo.trump) {
                    card.power = 22;
                }
            });
        });
    }

}]);