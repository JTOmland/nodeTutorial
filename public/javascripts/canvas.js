vsapp.directive("drawCanvas", function () {
    return {
        restrict: "E",
        scope: {
            startdraw: "<array",
            clicked: "=mClicked",
            render: "&draw"
        },
        template: '<div style = "position: relative;">' +
        '<canvas id="canvas" width="960" height="480" z-index 0;"></canvas>' +
        '<canvas id="canvas2" width="900" height="672" z-index 1;"></canvas>' +
        '</div>',

        link: function (scope, element) {
            var cv1 = document.getElementById('canvas');
            var cv2 = document.getElementById('canvas2');
            var tableWidth = 960;
            var tableHeight = 480;
            var cardWidth = 35;
            var cardHeight = 32;
            var cardImg = new Image();
            cardImg.src = '../images/cards.png'
            var suitLocations = { c: 0, d: 1, h: 2, s: 3 };
            //cardlocations based on card rank.  If 14 then = 1
            var cardSize = { width: 69, height: 94, padding: 18 };
            //How much of the card is seen when covered by another card.
            var cardMargin = { x: 20, y: 0 };
            var lastX;
            var lastY;

           
            element.bind('mousedown', function(event){
                
                lastX = event.offsetX;
                lastY = event.offsetY;
                scope.$apply(function() {
                     scope.clicked({x:lastX, y:lastY});
                });
            });
            scope.$watch(scope.render, function(value){
                console.log("canvas watch called value", value);
                //the value passed is whether this needs to be rendered true or false
                if(value){
                     draw(value.player1,value.player2,value.player3,value.player4,value.deck, value.pile, value.alt);
                }
               
            });
           
            function draw(north, east, south, west, deck, pile, lastTrick) {
                console.log("draw arguments north:", north);
                console.log("draw arguments north:", east);
                console.log("draw arguments north:", south);
                console.log("draw arguments north:", west);
                console.log("draw arguments north:", deck);
                console.log("draw arguments north:", pile);
                console.log("draw arguments north:", lastTrick);
                console.log("This is the lastTrick in arraytodraw", scope.startdraw[scope.startdraw.length-1]);
                console.log("This is the lastTrick in arraytodraw north", scope.startdraw[0]);
                var ctx = cv1.getContext('2d');
                ctx.clearRect(0,0,900, 900);
               // ctx.scale(.75, .75);
               var containerWidth = element.parent().width();
               console.log("canvas container width is ", containerWidth);
               cv1.width = .6 * containerWidth;
   
              
               
                for(var i = 0; i < arguments.length; i++){
                    if(arguments[i]){
                        var hand = scope.startdraw[i];
                        console.log("This is the north called same way in arraytodraw north", scope.startdraw[i], " and i", i);
                        console.log("Render hand after set equal to draw", hand);
                        var cardCounter = 0;
                        _.each(scope.startdraw[i], function(card){
                            console.log("render drawing card with i", card, i);
                            var imgLocation = {};
                            var xAxisNum = card.rank;
                            if (xAxisNum == 14) { xAxisNum = 1 };
                            if(hand.faceUp){
                                imgLocation.x = (cardSize.width) * xAxisNum;
                                imgLocation.y = suitLocations[card.suit] * cardSize.height;
                            } else {
                                imgLocation.x = 0;
                                imgLocation.y = 0;
                            }
                            var offset;
                            if(hand.padding){
                                offset = hand.padding* cardCounter;
                            } else {
                                offset = cardCounter * cardMargin.x;
                            }
                            card.hitX = hand.x + offset;
                            card.hitY = hand.y + cardSize.height;
                            if(cardCounter == scope.startdraw[i].length -1){
                               card.hitXadd = cardSize.width;
                            } else {
                                card.hitXadd = cardMargin.x;
                            }
                            //the hit box will be hand.x + offset is upper left to the same plus offset to y = hand.y to hand.y + cardSize.height
                            ctx.drawImage(cardImg, imgLocation.x, imgLocation.y, cardSize.width, cardSize.height, hand.x + offset, hand.y + cardMargin.y, cardSize.width, cardSize.height);
                            cardCounter++;
                        });
                    }
                }
            }
        }
    }
});