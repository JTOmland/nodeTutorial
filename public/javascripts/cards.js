var cards = (function() {
	//The global options
	var opt = {
		cardSize : {width:69,height:94, padding:18},
		animationSpeed : 10,
		table : 'body',
		cardback : 'red',
		acesHigh : true,
		cardsUrl : 'images/cards.png',
		blackJoker : false,
		redJoker : false,
		euchre: true,
		doShuffle: true
	};
	var zIndexCounter = 1;
	var all = []; //All the cards created.
	
	function mouseEvent(ev) {
		var card = $(this).data('card');
		if (card.container) {
			var handler = card.container._click;
			if (handler) {
				handler.func.call(handler.context||window, card, ev);
			}
		}
	}
	
	function init(options) {
		zIndexCounter = 1;
		console.log("function init ")
		if(all.length > 0){
			all = [];
		}
		if(opt.table){
			$('#card-table').empty();
		}
		if (options) {
			for (var i in options) {
				if (opt.hasOwnProperty(i)) {
					opt[i] = options[i];
				}
			}
		}
		var start;
		if(opt.euchre){
			start = 9;
		} else {
			start = opt.acesHigh ? 2 : 1;
		}
		var end = start + 5;
		opt.table = $(opt.table)[0];
		console.log("opt.table", opt.table);
		if ($(opt.table).css('position') == 'static') {
			$(opt.table).css('position', 'relative');
		}
		for (var i = start; i <= end; i++) {
			all.push(new Card('h', i, opt.table));
			all.push(new Card('s', i, opt.table));
			all.push(new Card('d', i, opt.table));
			all.push(new Card('c', i, opt.table));
		}
		if (opt.blackJoker) {
			all.push(new Card('bj', 0, opt.table));
		}
		if (opt.redJoker) {
			all.push(new Card('rj', 0, opt.table));
		}
		// if (opt.euchre) {
		// 	all.push(new Card('h', 1, opt.table));
		// 	all.push(new Card('s', 1, opt.table));
		// 	all.push(new Card('d', 1, opt.table));
		// 	all.push(new Card('c', 1, opt.table));
		// }
		
		$('.card').click(mouseEvent);
		if(opt.doShuffle){
			shuffle(all);
		}
	}

    function shuffle(deck) {
        //Fisher yates shuffle
        var i = deck.length;
        if (i == 0) return;
        while (--i) {
            var j = Math.floor(Math.random() * (i + 1));
            var tempi = deck[i];
            var tempj = deck[j];
            deck[i] = tempj;
            deck[j] = tempi;
        }
    }
	
	function Card(suit, rank, table) {
		console.log("Card calling init")
		this.init(suit, rank, table);
	}
	
	Card.prototype = {
		init: function (suit, rank, table) {
			console.log("Card.prototype init");
			this.shortName = suit + rank;
			this.suit = suit;
			this.rank = rank;
			this.name = suit.toUpperCase()+rank;
			this.faceUp = false;
			this.el = $('<div/>').css({
				width:opt.cardSize.width,
				height:opt.cardSize.height,
				"background-image":'url('+ opt.cardsUrl + ')',
				position:'absolute',
				cursor:'pointer'	
			}).addClass('card').data('card', this).appendTo($(table));
			this.showCard();
			this.moveToFront();
		},

		toString: function () {
			return this.name;
		},

		moveTo : function(x, y, speed, callback) {
			var props = {top:y-(opt.cardSize.height/2),left:x-(opt.cardSize.width/2)};
			$(this.el).animate(props, speed || opt.animationSpeed, callback);
		},
		
		rotate : function(angle) {
			$(this.el)
				.css('-webkit-transform', 'rotate(' + angle + 'deg)')
				.css('-moz-transform', 'rotate(' + angle + 'deg)')
				.css('-ms-transform', 'rotate(' + angle + 'deg)')
				.css('transform', 'rotate(' + angle + 'deg)')
				.css('-o-transform', 'rotate(' + angle + 'deg)');
		},
		
		showCard : function() {
			var offsets = { "c": 0, "d": 1, "h": 2, "s": 3 };
			var xpos, ypos;
			var rank = this.rank;
			if (rank == 14) {
				rank = 1; //Aces high must work as well.
			}
			xpos = -rank * opt.cardSize.width;
			ypos = -offsets[this.suit] * opt.cardSize.height;
			this.rotate(0);
			$(this.el).css('background-position', xpos + 'px ' + ypos + 'px');
		},

		hideCard : function(position) {
			//console.log("card hide card called");
			var y = opt.cardback == 'red' ? 0*opt.cardSize.height : -1*opt.cardSize.height;
			$(this.el).css('background-position', '0px ' + y + 'px');
			this.rotate(0);
		},
		
		moveToFront : function() {
			$(this.el).css('z-index', zIndexCounter++);
		}		
	};
	
	function Container() {
	
	}
	
	Container.prototype = new Array();
	Container.prototype.extend = function(obj) {
		for (var prop in obj) {
			this[prop] = obj[prop];
		}
	}
	Container.prototype.extend({
		
		addCard : function(card) {
			//console.log("cards.addCard ", card);
			this.addCards([card]);
		},
		
		addCards : function(cards) {
			for (var i = 0; i < cards.length;i++) {
				var card = cards[i];
				if (card.container) {
					card.container.removeCard(card);
				}
				this.push(card);
				card.container = this;
			}
		},
		
		removeCard : function(card) {
			for (var i=0; i< this.length;i++) {
				if (this[i] == card) {
					this.splice(i, 1);
					return true;
				}
			}
			return false;
		},

		init : function(options) {
			console.log("Containter.prototype init");
			
			options = options || {};
			this.x = options.x || $(opt.table).width()/2;
			this.y = options.y || $(opt.table).height()/2;
			this.faceUp = options.faceUp;
		},

		click : function(func, context) {
			this._click = {func:func,context:context};
		},

		mousedown : function(func, context) {
			this._mousedown = {func:func,context:context};
		},
		
		mouseup : function(func, context) {
			this._mouseup = {func:func,context:context};
		},
		
		render : function(options) {
			console.log("rendering options and this", options, " this ", this);
			options = options || {};
			var speed = options.speed || opt.animationSpeed;
			this.calcPosition(options);
			for (var i=0;i<this.length;i++) {
				var card = this[i];
				zIndexCounter++;
				card.moveToFront();
				var top = parseInt($(card.el).css('top'));
				var left = parseInt($(card.el).css('left'));
				console.log("rendering card", card, " top", top, " left", left, "zindex ", zIndexCounter);
				console.log("card.el", $(card.el));
				if (top != card.targetTop || left != card.targetLeft) {
					var props = {top:card.targetTop, left:card.targetLeft, queue:false};
					if (options.immediate) {
						$(card.el).css(props);
					} else {
						$(card.el).animate(props, speed);
					}
				}
			}
			var me = this;
			//console.log("this is me before file", me);
			var flip = function(){
				for (var i=0;i<me.length;i++) {
					if (me.faceUp) {
						me[i].showCard();
					} else {
						me[i].hideCard();
					}
				}
			}
			if (options.immediate) {
				flip();
			} else {
				setTimeout(flip, speed /2);
			}
			
			if (options.callback) {
				setTimeout(options.callback, speed);
			}
		},
		
		topCard : function() {
			return this[this.length-1];
		},
		
		toString: function() {
			return 'Container';
		}
	});
	
	function Deck(options) {
		console.log("Deck calling init");
		this.init(options);
	}
	
	Deck.prototype = new Container();
	Deck.prototype.extend({
		calcPosition : function(options) {
			options = options || {};
			var left = Math.round(this.x-opt.cardSize.width/2, 0);
			var top = Math.round(this.y-opt.cardSize.height/2, 0);
			var condenseCount = 6;
			for (var i=0;i<this.length;i++) {
				if (i > 0 && i % condenseCount == 0) {
					top-=1;
					left-=1;
				}
				this[i].targetTop = top;
				this[i].targetLeft = left;
			}
		},
		
		toString : function() {
			return 'Deck';
		},

		dealRandom: function() {
				return this[Math.floor(Math.random()*this.length)];
		},

		dealSpecific: function(cardName){
			console.log("dealSpecific this", this);
			for(var i = 0; this.length; i++){
				if(this[i].name == cardName){
					return this[i];
				}
			}
		},
		
		deal : function(count, hands, speed, callback) {
			//console.log("inside deal hands", hands);
			var me = this;
			var i = 0;
			var totalCount = count*hands.length;
			function dealOne() {
				//console.log("inside deal one", me.length);
				if (me.length == 0 || i == totalCount) {
					if (callback) {
						callback();
					}
					return;
				}
				hands[i%hands.length].addCard(me.topCard());
				hands[i%hands.length].render({callback:dealOne, speed:speed});
				i++;
			}
			dealOne();
		}
	});

	function Hand(options) {
		console.log("hand calling init")
		this.init(options);
	}
	Hand.prototype = new Container();
	Hand.prototype.extend({
		calcPosition : function(options) {
			options = options || {};
			var width = opt.cardSize.width + (this.length-1)*opt.cardSize.padding;
			var left = Math.round(this.x - width/2);
			var top = Math.round(this.y-opt.cardSize.height/2, 0);
			console.log("calc hand position", left,  this.length);
			
			for (var i=0;i<this.length;i++) {
				console.log("inside setting top and left of cards")
				this[i].targetTop = top;
				this[i].targetLeft = left+i*opt.cardSize.padding;
			}
		},
		
		toString : function() {
			return 'Hand';
		}
	});
	
	function Pile(options) {
		console.log("pile calling init")
		
		this.init(options);
	}
	
	Pile.prototype = new Container();
	Pile.prototype.extend({
		calcPosition : function(options) {
			options = options || {};
		},
		
		toString : function() {
			return 'Pile';
		},
		
		deal : function(count, hands) {
			if (!this.dealCounter) {
				this.dealCounter = count * hands.length;
			}
		}
	});
	

	return {
		init : init,
		all : all,
		options : opt,
		SIZE : opt.cardSize,
		Card : Card,
		Container : Container,
		Deck : Deck,
		Hand : Hand,
		Pile : Pile,
		shuffle: shuffle
	};
})();

