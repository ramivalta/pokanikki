/* Number.prototype.mod = function(n) {
return ((this%n)+n)%n;
}; */

function viewModel () {
	var self = this;

	self.session = ({
		name	: ko.observable($('#sessname').val()),
		_id		: ko.observable($('#sessid').val()),
		hotness	: ko.observable($('#sesshot').val()),
		club	: ko.observable($('#sessclub').val()),
		rank	: ko.observable($('#sessrank').val()),
		username: ko.observable($('#sessuser').val()),
		clubShort	: ko.observable($('#sessclub').val()),
		clubName	: ko.observable($('#sessclubshort').val()),		
	});	
		
	
	self.playerOne = ko.observable();
	self.playerTwo = ko.observable();
	
	self.playerOneScore = ko.observable(0);
	self.playerTwoScore = ko.observable(0);
	
	self.gameScores = ko.observableArray([]);
	
	self.playerList = ko.observableArray();
	self.playerListTwo = ko.observableArray();
	
	self.scoreBoard = ko.observableArray([]);
	
	self.matchId = ko.observable();
	self.startTime = ko.observable();
	self.endTime = ko.observable();
	
	self.eventList = ko.observableArray();
	
	self.event = ko.observable();
	
	self.event_id = ko.observable();
	
	self.user = {};
	self.user.username = ko.observable();
	self.user.password = ko.observable();
	self.user.rememberMe = ko.observable(true);
	
	
	self.login = function() {
		//console.log("logging in");
		var username = ko.toJS(self.user.username());
		var password = ko.toJS(self.user.password());
		var rememberMe = ko.toJS(self.user.rememberMe());

		//console.log(username + " " + password + " " + rememberMe);

		sqEventProxy.login(
			{ username : username, password : password, rememberMe : rememberMe },
			function(data) {
				//console.log(data.message);
				if (data.message === "OK") {
				
					
					//self.sessionuser(data.session.user.username);
					//self.session(data.session);
					
					self.session.name(data.session.user.name);
					self.session._id(data.session.user._id);
					self.session.hotness(data.session.user.hotness);
					self.session.club(data.session.user.club);
					self.session.rank(data.session.user.rank);
					self.session.username(data.session.user.username);
					
					
					//console.log("logged in");
					//window.location.href="/profile";
					
					$.mobile.changePage('#setup', { transition: "flip" });
					
				}
				else if (data.message === "pass") {
					self.passwordFail(true);
				}
				else if (data.message === "user not found") {
					self.userFail(true);
				}
				else if (data.message === "already logged in") {
					//console.log(self.session.name());
					$.mobile.changePage('#setup', { transition: "flip" });
				}
			},
			function (err) {
				//console.log(err);
			}
		);
	}	
	
	
	
	self.getActiveEvents = function() {
		var data;
		sqEventProxy.getActiveEvents(
			{ data:data },
			function(data) {

				//console.log(data);
				ko.mapping.fromJS(data.events, {}, self.eventList);

			}
		);
	}
	

	
	self.getPlayers = function() {
		var data;
		sqEventProxy.getUserlist(
			{ data:data },
			function(data) {
				data.sort(function(a, b) {
					var key1 = a.name;
					var key2 = b.name;
					if (key1 < key2) return -1;
					if (key1 > key2) return 1;
					return 0;
				});			
				ko.mapping.fromJS(data, {}, self.playerList);
			}
		);
	};

	
	
	self.setupPlayers = ko.computed(function() {
		if (self.playerOne() === undefined || self.playerTwo() === undefined) {
			return;
		}
		else {
			self.playerListTwo(self.playerList().slice(0)); 
			var sel_id = self.playerOne()._id();
			//console.log(sel_id);
			
			self.playerListTwo.remove(function(i) { return i._id() === sel_id });
		
		}
		
	}).extend({throttle: 350 });
	
	self.updateRankinglist = function(win, lose) {
	
		if (self.event().affectsRanking() == "true") {
			var winner = ko.toJS(win);
			var loser = ko.toJS(lose);
		
			sqEventProxy.updateRankinglist(
				{ winner:winner, loser:loser },
				function(data) {
					//if (data.message === "OK")
						//console.log(data.message);
				}
			);
		}
	}
	
	self.updateScores = function() {
		if (self.scoreBoard().length === 0) {
//			self.startMatch();
			return;
		}
		var id;
/*		if (self.matchId() === self.scoreBoard().id) {
			console.log("all good");
			id = ko.toJS(self.matchId());
		} */
		
		var gameScores = ko.toJS(self.gameScores());
		var p1GamesWon = ko.toJS(self.playerOneGamesWon());
		var p2GamesWon = ko.toJS(self.playerTwoGamesWon());
		
		id = ko.toJS(self.matchId());
		
		var playerOne = ko.toJS(self.playerOne());
		var playerTwo = ko.toJS(self.playerTwo());
		var scores = ko.toJS(self.scoreBoard());
	
		var startTime = ko.toJS(self.startTime());
		var event_id = ko.toJS(self.event_id());
		
		if (self.matchSet() === "p1") {
			self.updateRankinglist(self.playerOne(), self.playerTwo());
			self.endTime("now");
		}
		else if (self.matchSet() === "p2") {
			self.updateRankinglist(self.playerTwo(), self.playerOne());
			self.endTime("now");
		}
		
		var endTime = ko.toJS(self.endTime());
		
		sqEventProxy.updateGameScores(
			{
				scores 			: scores,
				id 				: id,
				gameScores		: gameScores,
				playerOneName 	: playerOne.name,
				playerTwoName 	: playerTwo.name,
				playerOneId 	: playerOne._id,
				playerTwoId 	: playerTwo._id,
				playerOneClub	: playerOne.club,
				playerTwoClub	: playerTwo.club,				
				p1GamesWon 		: p1GamesWon,
				p2GamesWon 		: p2GamesWon,
				startTime 		: startTime,
				endTime			: endTime,
				event_id		: event_id,
			},
			function(data) {
				//console.log(data.message);
			},
			function(e) {
				//console.log(e);
			}
		);
	}
	
	
	self.startMatch = function() {
		var id;
		if (self.matchId() !== 'undefined') {
			self.scoreBoard().id = self.matchId();
			id = ko.toJS(self.matchId());
		}
		else {
			self.scoreBoard().id = null;
			id = null;
		}
		
		var gameScores = ko.toJS(self.gameScores());

		var playerOne = ko.toJS(self.playerOne());
		var playerTwo = ko.toJS(self.playerTwo());
		
		var p1GamesWon = ko.toJS(self.playerOneGamesWon());
		var p2GamesWon = ko.toJS(self.playerTwoGamesWon());
		var scores = ko.toJS(self.scoreBoard());
		
		var event_id = ko.toJS(self.event()._id);

//		console.log(ko.toJSON(self.scoreBoard), null, 2);
//		console.log(self.scoreBoard());
//		console.log(scores);
		sqEventProxy.saveGameScores(
			{
				scores 			: scores,
				gameScores 		: gameScores,
				playerOneName 	: playerOne.name,
				playerTwoName 	: playerTwo.name,
				playerOneId 	: playerOne._id,
				playerTwoId 	: playerTwo._id,
				playerOneClub	: playerOne.club,
				playerTwoClub	: playerTwo.club,				
				p1GamesWon		: p1GamesWon,
				p2GamesWon 		: p2GamesWon,
				event_id 		: event_id,
			},
			function(data) {
				//console.log(data.message);
//				console.log("id " + data.id);
				self.matchId(data.id);
				self.event_id(data.event_id);
				//console.log("save sent");
				self.startTime(data.startTime);
				
				$.mobile.changePage('#app', { transition: "flip" });
				
			},
			function(e) {
				//console.log(e);
//				console.log("err");
			}
		);
	};
	
//	self.startMatch();
	
	
	self.playerOneSlider = ko.observable(0);
	self.playerTwoSlider = ko.observable(0);
	
//	self.playerOneGamesWon = ko.observable(0);
//	self.playerTwoGamesWon = ko.observable(0);
	
	self.currentGameNumber = ko.observable(1);
	
	self.launchedFromHome = ko.observable();
	
	self.launchedFromHomeF = function() {
		//var x = (window.navigator.standalone) ? true : false;
		if (window.navigator.standalone == true) {
			self.launchedFromHome(true);	
			$('#top').css('height', '66px');
			//$('#top').css('height', '44px');
			$('#scrollPad').css('height', '66px');
			$('#tuom').css('top', '65px')
		} 
		else self.launchedFromHome(false);
	};
	
	self.launchedFromHomeF();
	
	self.bestOf = ko.observable("5");
	
/*	var el = {
		playerOneScore :  ko.observable(0),
		playerTwoScore : ko.observable(0),
		gameNumber : ko.observable(0),
		stroke : ko.observable(0),
		yesLet : ko.observable(0),
		noLet : ko.observable(0),
		serveSide : ko.observable(0),
		handOut : ko.observable(0),
		server : ko.observable(0),
		playerOneGamesWon : ko.observable(0),
		playerTwoGamesWon : ko.observable(0),
		gameBall : ko.observable(false),
		gameOver : ko.observable(false)
	}; */

	

//	self.scoreBoard().push(el);
/*		playerOneScore =  ko.observable(0),
		playerTwoScore = ko.observable(0),
		gameNumber = ko.observable(0),
		stroke = ko.observable(0),
		yesLet = ko.observable(0),
		noLet = ko.observable(0),
		serveSide = ko.observable(0),
		handOut = ko.observable(0),
		server = ko.observable(0),
		playerOneGamesWon = ko.observable(0),
		playerTwoGamesWon = ko.observable(0),
		gameBall = ko.observable(false),
		gameOver = ko.observable(false)
	]); */
	
	self.myScroll = [];
	var sliderMoved = false;	


	self.sliderMove = function () {
		
	};

	
	self.playerOneUpScore = function(tuomio) {
	
/*		if (tuomio !== 'undefined') {
			self.closeCallsPopup();
		} */
	
//		console.log(tuomio);
	
		var yeslet = false;
		var nolet = false;		
		var stroke = false;		
	
		if (tuomio === "yeslet") {
			yeslet = true;
		}
		if (tuomio === "nolet") {
			nolet = true;
		}
		if (tuomio === "stroke") {
			stroke = true;
		}

		var l = self.scoreBoard().length;
		var score, p2score;
			
		if (l === 0) {
			if (yeslet === true) {
				score = 0;
				p2score = 0;
			}

			else if (nolet === true) {
				score = 0;
				p2score = 1;
			}
			
			else {
				score = 1;
				p2score = 0;
			}
		}
		else {
			if (self.scoreBoard()[l -1].gameOver() === true) {
				if (nolet === true) {
					score = 0;
					p2score = 1;
				}
				else if (yeslet === true) {
					score = 0;
					p2score = 0;
				}
				else {
					score = 1;
					p2score = 0;
				}
			}
			else {
				if (yeslet === true) {
					score = self.scoreBoard()[l -1].playerOneScore();
					p2score = self.scoreBoard()[l - 1].playerTwoScore();	
				}
				else if (nolet === true) {
					score = self.scoreBoard()[l - 1].playerOneScore();
					p2score = self.scoreBoard()[l - 1].playerTwoScore() + 1;
				}
				else { 
					score = self.scoreBoard()[l -1].playerOneScore() + 1;
					p2score = self.scoreBoard()[l - 1].playerTwoScore();	
				}
			}
				
			if (self.matchSet() === "p1" || self.matchSet() === "p2") return;
		}
			
		self.playerOneScore(score);
		self.playerTwoScore(p2score);
				
		var el = {};
		
		var currentGame = self.currentGameNumber();
		
		el.playerOneScore = ko.observable(score);
		el.playerTwoScore = ko.observable(p2score);
		el.gameNumber = ko.observable(currentGame);

		el.playerOneStroke = ko.observable(stroke);
		el.playerOneYesLet = ko.observable(yeslet);
		el.playerOneNoLet = ko.observable(nolet);
		el.playerTwoStroke = ko.observable();
		el.playerTwoYesLet = ko.observable();
		el.playerTwoNoLet = ko.observable();					

		el.serveSide = ko.observable();
		el.handOut = ko.observable();
		el.server = ko.observable();
		el.playerOneGamesWon = ko.observable(self.playerOneGamesWon());
		el.playerTwoGamesWon = ko.observable(self.playerTwoGamesWon());
		el.gameBall = ko.observable(false);
		el.matchBall = ko.observable(false);
		el.gameOver = ko.observable(false);
		
//		console.log(el.playerOneYesLet());
			
		if (self.gameBall() === true)  el.gameBall(true);
		if (self.matchBall() === true) el.matchBall(true);
				
		if (self.gameSet() === "p1") {
			var games = {};
			games.p1score = self.playerOneScore();
			games.p2score = self.playerTwoScore();
			self.gameScores.push(games);
//			self.playerOneGamesWon(self.playerOneGamesWon() + 1);
			el.playerOneGamesWon(self.playerOneGamesWon() + 1);
			el.playerTwoGamesWon(self.playerTwoGamesWon());
			self.playerOneScore(0);
			self.playerTwoScore(0);
			el.playerOneScore(score);
			el.playerTwoScore(p2score);
			self.currentGameNumber(self.currentGameNumber() + 1);						
			el.gameNumber(self.currentGameNumber());			
	
			el.gameOver(true);

			
		}
		
		if (self.gameSet() === "p2") {
			var games = {};
			games.p1score = ko.observable(self.playerOneScore());
			games.p2score = ko.observable(self.playerTwoScore());
			self.gameScores.push(games);			
//			self.playerTwoGamesWon(self.playerTwoGamesWon() + 1);
			el.playerTwoGamesWon(self.playerTwoGamesWon() + 1);			
			el.playerOneGamesWon(self.playerOneGamesWon());
			self.playerOneScore(0);
			self.playerTwoScore(0);
			el.playerOneScore(score);
			el.playerTwoScore(p2score);
			self.currentGameNumber(self.currentGameNumber() + 1);						
			el.gameNumber(self.currentGameNumber());			
			el.gameOver(true);
			
			
		}
		

				
		self.scoreBoard.push(el);
		
	};
	
	self.playerTwoUpScore = function (tuomio) {
	
/*		if (tuomio !== 'undefined') {
			self.closeCallsPopup();
		} */
	
		var yeslet = false;
		var nolet = false;		
		var stroke = false;		
	
		if (tuomio === "yeslet") {
			yeslet = true;
		}
		if (tuomio === "nolet") {
			nolet = true;
		}
		if (tuomio === "stroke") {
			stroke = true;
		}
	
		var l = self.scoreBoard().length;
	
		var score, p1score;
	
		if (l === 0) {
			if (yeslet === true) {
				score = 0;
				p1score = 0;
			}

			else if (nolet === true) {
				score = 0;
				p1score = 1;
			}
			
			else {
				score = 1;
				p1score = 0;
			}
		}
		else {
			if (self.scoreBoard()[l -1].gameOver() === true) {
				if (nolet === true) {
					score = 0;
					p1score = 1;
				}
				else if (yeslet === true) {
					score = 0;
					p1score = 0;
				}
				else {
					score = 1;
					p1score = 0;
				}
			}
			else {
				if (yeslet === true) {
					score = self.scoreBoard()[l -1].playerTwoScore();
					p1score = self.scoreBoard()[l - 1].playerOneScore();	
				}
				else if (nolet === true) {
					score = self.scoreBoard()[l - 1].playerTwoScore();
					p1score = self.scoreBoard()[l - 1].playerOneScore() + 1;
				}
				else { 
					score = self.scoreBoard()[l -1].playerTwoScore() + 1;
					p1score = self.scoreBoard()[l - 1].playerOneScore();	
				}
			}
				
			if (self.matchSet() === "p1" || self.matchSet() === "p2") return;
		}
			
		self.playerOneScore(p1score);
		self.playerTwoScore(score);
		
		var currentGame = self.currentGameNumber();
		
		var el = {};
		
			el.playerTwoScore = ko.observable(score);
			el.playerOneScore = ko.observable(p1score);
			el.gameNumber = ko.observable(currentGame);

			el.playerOneStroke = ko.observable();
			el.playerOneYesLet = ko.observable();
			el.playerOneNoLet = ko.observable();
			
			el.playerTwoStroke = ko.observable(stroke);
			el.playerTwoYesLet = ko.observable(yeslet);
			el.playerTwoNoLet = ko.observable(nolet);					
			
			el.serveSide = ko.observable();
			el.handOut = ko.observable();
			el.server = ko.observable();
			el.playerOneGamesWon = ko.observable(self.playerOneGamesWon());
			el.playerTwoGamesWon = ko.observable(self.playerTwoGamesWon());
			el.gameBall = ko.observable(false);
			el.matchBall = ko.observable(false);
			el.gameOver = ko.observable(false);
			
		
		if (self.gameBall() === true) 
			el.gameBall(true);
		if (self.matchBall() === true) el.matchBall(true);
		
		if (self.gameSet() === "p1") {
			var games = {};
			games.p1score = self.playerOneScore();
			games.p2score = self.playerTwoScore();
			self.gameScores.push(games);
//			self.playerOneGamesWon(self.playerOneGamesWon() + 1);
			el.playerOneGamesWon(self.playerOneGamesWon() + 1);
			el.playerTwoGamesWon(self.playerTwoGamesWon());
			self.playerOneScore(0);
			self.playerTwoScore(0);
			el.playerOneScore(p1score);
			el.playerTwoScore(score);
			self.currentGameNumber(self.currentGameNumber() + 1);						
			el.gameNumber(self.currentGameNumber());					
			el.gameOver(true);
		}
		
		if (self.gameSet() === "p2") {
			var games = {};
			games.p1score = self.playerOneScore();
			games.p2score = self.playerTwoScore();
			self.gameScores.push(games);
//			self.playerTwoGamesWon(self.playerTwoGamesWon() + 1);
			el.playerTwoGamesWon(self.playerTwoGamesWon() + 1);
			el.playerOneGamesWon(self.playerOneGamesWon());
			self.playerOneScore(0);
			self.playerTwoScore(0);
			el.playerOneScore(p1score);
			el.playerTwoScore(score);
			self.currentGameNumber(self.currentGameNumber() + 1);						
			el.gameNumber(self.currentGameNumber());					
			el.gameOver(true);
		}
		
		self.scoreBoard.push(el);		
	}
	
	self.refreshScroll = ko.computed(function() {
		var l = ko.observable(self.scoreBoard().length);
		
//
		
		setTimeout(function () {
			if ($.mobile.activePage[0].id in self.myScroll) {
				self.myScroll['app'].refresh();
//						self.myScroll['app'].scrollTo(0, 23, 50, true);
				var wrapH = $("#scroller").height();
				var y = self.myScroll['app'].maxScrollY;
				//console.log("computed refresh");
				self.updateScores();
						
				if (y < 0) {
					self.myScroll['app'].scrollTo(0, self.myScroll['app'].maxScrollY, 350);
				}
			}
		}, 0);
		
	}).extend( { throttle: 1 });
	
	self.playerOneSliderMove = function () {
		if (sliderMoved == false) {
			var sVal = parseInt(self.playerOneSlider(), 10);
			
			if (sVal <50 && sVal >= 20){
				self.playerOneUpScore();
				sliderMoved = true;
			}
		}
	}

	self.playerTwoSliderMove = function () {
		if (sliderMoved == false) {
			var sVal = parseInt(self.playerTwoSlider(), 10);
			
			if (sVal <50 && sVal >= 20){
				self.playerTwoUpScore();
				sliderMoved = true;
			}
		}
	}	
	
	self.resetSlider = function() {
		var p1sl = self.playerOneSlider();
		var p2sl = self.playerTwoSlider();
		self.playerOneSlider = ko.observable(0);
		self.playerTwoSlider = ko.observable(0);
		//$(".ui-slider-handle").animate( { left: 0, easing: 'swing' }, 150);
		$(".ui-slider-handle").transition( {
			perspective: '1000',
			left: '0px',
			duration: '250',
			easing: 'snap',
			complete : function() {}
		});
		
		sliderMoved = false;
	}
	
	self.gameBall = ko.computed(function () {
		var p1 = self.playerOneScore();
		var p2 = self.playerTwoScore();
		
/*		var l = self.scoreBoard().length;
		if (l > 0) {
			p1 = self.scoreBoard()[l - 1].playerOneScore();
			p2 = self.scoreBoard()[l - 1].playerTwoScore();			
		} */
		
		if ((p1 === 10 && p2 < 10) || (p2 === 10 && p1 < 10)) {
			var x = Math.abs(p1 - p2);
//			console.log("game ball: p1: " + p1 + " p2: " + p2 + " ero: " + x);
			if (x >= 1) {
				return true;
			}
			else return false;
		}
		
		else if (p1 >= 10 && p2 >= 10) {
			var y = Math.abs(p1 - p2);
//			console.log("asasd " + y);
			if (y >= 1) {
				return true;
			}
			else return false;
		}
		else return false;
	});
	
	self.matchBall = ko.computed(function() {
		var p1 = self.playerOneScore();
		var p2 = self.playerTwoScore();
		
		if ((self.gameBall() === true) && (p1 === 10 && p2 < 10) || (self.gameBall() === true) && (p2 === 10 && p1 < 10)) {
			var x = Math.abs(p1 - p2);
			if (x >= 1) {
				return true;
			}
			else return false;
		}
		else if (p1 >= 10 && p2 >= 10 && self.gameBall() === true) {
			var y = Math.abs(p1 - p2);
			if (y >= 1) {
				return true;
			}
			else return false;
		}
		else return false;
	});
	
	self.gameSet = ko.computed(function() {
		var p1 = self.playerOneScore();
		var p2 = self.playerTwoScore();

		var l = self.scoreBoard().length;
		
/*		if (l > 0) {
			console.log(p1 + " " + p2);
			p1 = self.scoreBoard()[l - 1].playerOneScore();
			p2 = self.scoreBoard()[l - 1].playerTwoScore();			
			console.log(p1 + " " + p2);
		} */
		
		if (p1 >= 11 || p2 >= 11) {
			if (p1 - p2 >= 2) {
				return("p1");
			}
			else if (p2 - p1 >= 2) {
				return("p2");
			}
		}
		else return;
	});
	
	
	self.undo = function() {
		if (self.scoreBoard().length > 1) {
			var x = self.scoreBoard().length;
			
/*			console.log("length: " + x);
			console.log("index: " + (x - 1)); */
			
//			self.scoreBoard.splice(x - 1, 1);
			self.scoreBoard.pop();
			
			if (parseInt(self.playerOneGamesWon()) + parseInt(self.playerTwoGamesWon()) < self.gameScores().length) {
				self.gameScores.pop();
			}
			
			x = self.scoreBoard().length;
			
			if (self.gameSet() === "p1" || self.gameSet() === "p2") {
//				self.playerOneGamesWon(self.scoreBoard()[x - 1].playerOneGamesWon());
//				self.playerTwoGamesWon(self.scoreBoard()[x - 1].playerTwoGamesWon());
				self.playerOneScore(0);
				self.playerTwoScore(0);
			}
			
			else {
//				self.playerOneGamesWon(self.scoreBoard()[x - 1].playerOneGamesWon());
//				self.playerTwoGamesWon(self.scoreBoard()[x - 1].playerTwoGamesWon());
				self.playerOneScore(self.scoreBoard()[x - 1].playerOneScore());
				self.playerTwoScore(self.scoreBoard()[x - 1].playerTwoScore());
			}

		}
		else if (self.scoreBoard().length === 1) {
//			self.playerOneGamesWon(0);
//			self.playerTwoGamesWon(0);
			self.playerOneScore(0);
			self.playerTwoScore(0);
			
			self.scoreBoard.pop();
			
		}
	};
	
	self.playerOneGamesWon = ko.computed(function() {
		var l = self.scoreBoard().length;
		if (l === 0) return 0;
		else return (self.scoreBoard()[l - 1].playerOneGamesWon());
	});
	
	self.playerTwoGamesWon = ko.computed(function()  {
		var l = self.scoreBoard().length;
		if (l === 0) return 0;
		else return (self.scoreBoard()[l - 1].playerTwoGamesWon());
	});
	
	self.matchSet = ko.computed(function() {
		var p1games = self.playerOneGamesWon();
		var p2games = self.playerTwoGamesWon();
		
		var bestof = parseInt(self.bestOf());
		var toWin;
		
		if (bestof === 3) toWin = 2;
		else toWin = 3;
				

		
		if (p1games === toWin) {
//			$(".slaidi").slider("disable");
			$('#endGamePopup').popup('open');
			return ("p1");
			
		}
		else if (p2games === toWin)	{
//			$(".slaidi").slider("disable");
			$('#endGamePopup').popup('open');
			return ("p2");
		}
		else {
//			$(".slaidi").slider();
			return false;
		}
	});	
	
	self.leaveGame = function() {
		self.scoreBoard.removeAll();
		self.gameScores.removeAll();
		$.mobile.changePage('#setup', { transition: "flip" , reverse: true });
	}
	
	self.resetScore = function() {
		self.scoreBoard.removeAll();
		
//		$("#options").popup( "close", { transition: "flow", reverse: true });
		
	}
	
	var callsVis = false;
	
		self.toggleCallsPopup = function() {
		//$("#calls").popup( "open", { transition: "slidedown", shadow: true, positionTo: "#doomings" });
		
		function updateScrollPad(h) {
			$('#scrollPad').css('height', h);
			
			if ($.mobile.activePage[0].id in self.myScroll) {
				self.myScroll['app'].refresh();
				var wrapH = $("#scroller").height();
				var y = self.myScroll['app'].maxScrollY;
						
				if (y < 0) {
					self.myScroll['app'].scrollTo(0, self.myScroll['app'].maxScrollY, 0);
					}
				}
			
		}
		
		
		var tuom = document.getElementById("tuom");
		
//					$('#scrollPad').css('height', '158px');
//			$('#tuom').css('top', '66px')
		
		var sc_height;
		if (self.launchedFromHome() === true)
			sc_height = 66;
		else sc_height = 44;
		
			
		if (callsVis == false) {
			
			var h = sc_height + 90 +'px';
			
			$("#tuom").css( { transformOrigin: '100% 0'})
			.transition( {
				perspective: '1000',
				y: '-260px',
				duration: '0',
				complete: function() {
					tuom.style.display = 'block';
				}
			}).transition( {
				perspective: '1000',
				y: '0px',
				duration: '350',
				easing: 'snap',
				complete : function() {}
			});
			
			
			$("#tuom_arrow").transition( {
				rotate: '90deg',
				easing: 'ease'
			});
			
//			updateScrollPad(h);
			callsVis = true;

			
			$("#scrollPad").transition( {
				height: h,
				duration: '0',
				complete: function() {
					callsVis = true;
					if ($.mobile.activePage[0].id in self.myScroll) {
						self.myScroll['app'].refresh();

						var wrapH = $("#scroller").height();
						var y = self.myScroll['app'].maxScrollY;
								
						if (y < 0) {
							self.myScroll['app'].scrollTo(0, self.myScroll['app'].maxScrollY, 0);
							}
						}
				}
			});
			
		}
		
		else {
		
			$("#tuom").css( { transformOrigin: '100% 0'})
			.transition( {
				perspective: '1000',
				y: '-260px',
				duration: '350',
				easing: 'ease',
				complete: function() {
					//$('#scrollPad').css('height', '44px');
					//callsVis = false;
					tuom.style.display = 'none';
				}
			});
			
			$("#tuom_arrow").transition( {
				rotate: '0deg',
				easing: 'ease'
			});

			updateScrollPad(sc_height);
			callsVis = false;			
			

			
/*			$("#scrollPad").transition({
				height: sc_height,
				duration: '100',
				complete: function() {
					callsVis = false;

					if ($.mobile.activePage[0].id in self.myScroll) {
						self.myScroll['app'].refresh();
						var wrapH = $("#scroller").height();
						var y = self.myScroll['app'].maxScrollY;
								
						if (y < 0) {
							self.myScroll['app'].scrollTo(0, self.myScroll['app'].maxScrollY, 250);
						}
					}
				}
			}); */
		}
		
	};
	
	self.openEndGamePopup = function() {
		$("#endGamePopup").popup( "open", { transition: "flow", shadow: true, positionTo: "window" });
	};
	
	self.closeCallsPopup = function() {
		$("#calls").popup( "close", { transition: "slidedown", shadow: true, reverse: true });
	}
	
    ko.bindingHandlers.mobileradio = {
		init: function (element, valueAccessor) {
		},
		update: function (element, valueAccessor) {
			var value = valueAccessor();
			var valueUnwrapped = ko.utils.unwrapObservable(value);
			if (valueUnwrapped === $(element).val()) {
				$(element).prop("checked", true).checkboxradio("refresh");
			} else {
				$(element).removeProp("checked").checkboxradio("refresh");
			}
		}
	};
	
	self.getActiveEvents();
	self.getPlayers();
	
	
	ko.bindingHandlers.uislider = {
		init: function (element, valueAccessor, allBindingsAccessor) {
			var options = allBindingsAccessor().sliderOptions || {};
			
			$(element).slider(options);
//			$(element).slider( { value: 0, min: 0, max: 50, step : 1, animate: 'true' });
			
	//		$(element).slider( { animate: 'slow' });

			ko.utils.registerEventHandler(element, "slidechange", function (event, ui) {
				var observable = valueAccessor();
				observable(ui.value);
				//console.log("slidechanged");
				
			});
			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				$(element).slider("destroy");
			});
			ko.utils.registerEventHandler(element, "slide", function (event, ui) {
				//console.log("slide event fired");
				var observable = valueAccessor();
				observable(ui.value);
				var value = ko.unwrap(observable);
				$(element).slider('value', value);
			});
			
			ko.utils.registerEventHandler(element, "slidestop", function (event, ui) {
				//console.log("slider stopped");
				var observable = valueAccessor();
				observable(ui.value);
			});

			/* var obs  = valueAccessor();
			var value = ko.unwrap(obs);
			
			console.log(obs);
			
			console.log(value);
			
			obs.subscribe(function(value) {
				if (isNaN(value)) value = 0;
				console.log("herpderp");
				$(element).slider('option', 'value', value);
				obs(value);
			}); */
		},
		/*update: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			console.log(value);			
			if (isNaN(value)) {
				console.log("slider was Nan");
				//value = 0;
			}
			
			valueUn.subscribe(function(valueUn) {
				$(element).slider('option', 'value', valueUn.value); 		
			});
			
			//$(element).slider("value", value);
		} */
	};
	
	
	ko.bindingHandlers.jqmOptions = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel) {

			if (typeof ko.bindingHandlers.options.init !== 'undefined')
				ko.bindingHandlers.options.init(element, valueAccessor, allBindingsAccessor, viewModel);
		},
		update: function (element, valueAccessor, allBindingsAccessor, context) {
			if (typeof ko.bindingHandlers.options.update !== 'undefined') {
				ko.bindingHandlers.options.update(element, valueAccessor, allBindingsAccessor, viewModel);
			}
			var instance = $.data(element, 'selectmenu');
			if (instance) {
				$(element).selectmenu('refresh', true);
			} 
		}
	};
	
	ko.bindingHandlers.jqmValue = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			if (typeof ko.bindingHandlers.value.init !== 'undefined') {
				ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor, viewModel);
			}
		},

		update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			if (typeof ko.bindingHandlers.value.update !== 'undefined') {
				ko.bindingHandlers.value.update(element, valueAccessor, allBindingsAccessor, viewModel);
			}

			var instance = $.data(element, 'selectmenu');
			if (instance) {
				$(element).selectmenu('refresh', true);
			}
		}
	};
	
}


$(document).on('pageinit', function() {
	window.vm = new viewModel();
	ko.virtualElements.allowedBindings.mobileTable = true; // 
	//ko.applyBindings(vm, document.getElementById("login"));
	
	$('#setup').on('pageshow', function() {
		//console.log(vm.session.name());
		if(vm.session.name() == undefined) {
			//console.log("derp");
			window.location.href="/autoLogin";
			//$.mobile.changePage('/application#login');
		}
		else {
			if (!ko.dataFor(document.getElementById('setup')))
				ko.applyBindings(vm, document.getElementById('setup'));
		}
	});
	
	
	$('#login').on('pageshow', function() {
		if(!ko.dataFor(document.getElementById('login')));
			ko.applyBindings(vm, document.getElementById('login'));
	});
	
	
	/*$('#setup').on('pageinit', function() {
		ko.applyBindings(vm, document.getElementById('setup'));
	}); */


	$('#app').on('pageinit', function() {
		ko.applyBindings(vm, document.getElementById('app'));
	});
	
	$('#app').on('pageshow', function() {
		if(!ko.dataFor(document.getElementById('app'))) {
			ko.applyBindings(vm, document.getElementById('app'));
		}
		if(vm.session.name() == undefined) {
			//console.log("derp");
			window.location.href="/autoLogin";			
			//$.mobile.changePage('/application#login');
		}

		//ko.applyBindings(vm, document.getElementById('app'));
	
		$('body').on('touchmove', function (e) {
			e.preventDefault();
		});
	
		$("input").blur(function() {
			$("#scoreBar").show();
			$("#slaidiDiv").show();
		});

		$("input").focus(function() {
			$("#scoreBar").hide();
			$("#slaidiDiv").hide();
		});
		
		if ($.mobile.activePage.find('#scroller').length > 0) {
			if (this.id in vm.myScroll) {
				vm.myScroll[this.id].refresh();
			} else {
				vm.myScroll[this.id] = new iScroll($.mobile.activePage.find('#scroller')[0].id, {
					hScroll        : false,
					vScroll        : true,
					hScrollbar     : false,
					vScrollbar     : true,
					bounce         : true,
					hideScrollbar	: true,
					momentum       : true,
					lockDirection  : true
				});
			}
		}
		
		$('#app').on('pagehide', function() {
			$('body').on('touchmove', function(e) {
				//console.log("unblock touchmove");
				$(this).unbind('touchmove');
			});
		});
		
//		vm.startMatch();

		$(window).bind('orientationchange', function () {
			if ($.mobile.activePage[0].id in vm.myScroll) {
				vm.myScroll[$.mobile.activePage[0].id].refresh();
				var wrapH = $("#scroller").height();
				var y = vm.myScroll['app'].maxScrollY;
				if (y < 0) {
					vm.myScroll['app'].scrollTo(0, vm.myScroll['app'].maxScrollY, 150);
				}
			}
		});
	
	});
	
	
	//$('#app').on('pageshow', function() { });
		

	$('#login').off('pageinit');
	$('#app').off('pageinit');
	$('#setup').off('pageinit');
	
	$(document).off('pageinit');
});

