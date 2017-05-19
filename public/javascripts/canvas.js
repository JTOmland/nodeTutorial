vsapp.directive("drawCanvas", function () {
    return {
        restrict: "E",
        scope: {
            startdraw: "&drawTable",
        },
        template: '<div style = "position: relative;">' +
        '<canvas id="canvas" width="1500" height="750" z-index 0;"></canvas>' +
        '<canvas id="canvas2" width="900" height="672" z-index 1;"></canvas>' +
        '</div>',
        // '<canvas id="canvas2" width="900" height ="672"></canvas>',

        link: function (scope, element) {
            console.log("Canvas link called")
            // var cv2 = document.getElementById('canvas2');
            var cv1 = document.getElementById('canvas');
            var cv2 = document.getElementById('canvas2');
            var tableWidth = 900;
            var tableHeight = 600;
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
                
                console.log("mousedown on canvas", lastX, lastY);
               
            });

            // tableBackground.onload = function(){
            //     console.log("calling draw from image onload");
            //     draw(true);  //map
            // }

            //value of scope.startDraw could be Deck, North, South, East, West, pile, etc.
            //should be an array of object information to draw.
            //[North, South] with North = {Cards:[], handLeft (x), handTop = Y}
            //And Card = {faceUp:true or false}
            scope.$watch(scope.startdraw, function (value) {
                //value is object with true or false to draw different parts map, units, visibility
                console.log("Rendering", value);
                draw(value);
                // }
            });
            function draw(arrayOfHands) {
                var ctx = cv1.getContext('2d');
                //////console.log("Inside draw");
                _.each(arrayOfHands, function (hand) {
                    var cardCounter = 0;
                    console.log("Hand to be rendered", hand);
                    _.each(hand, function (card) {
                        var imgLocation = {};
                        var xAxisNum = card.rank;
                        cardCounter++;
                        if (xAxisNum == 14) { xAxisNum = 1 };
                        console.log("cardRank to render", card, " cardrand and xAxisnum", card.rank, xAxisNum);
                        imgLocation.x = (cardSize.width) * xAxisNum;
                        imgLocation.y = suitLocations[card.suit] * cardSize.height;
                        var offset = cardCounter * cardMargin.x;
                        ctx.drawImage(cardImg, imgLocation.x, imgLocation.y, cardSize.width, cardSize.height, hand.x + offset, hand.y + cardMargin.y, cardSize.width, cardSize.height)
                    });
                });
            }
        }
    }
});