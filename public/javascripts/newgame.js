function viewModel() {
	var self = this;
	
	self.session = ko.observable();
	
	self.title = ko.observable("Uusi peli - Pokanikki");	

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
		
	self.ios = ko.observable(navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);	
	
	self.playerListOne = ko.observableArray([]);
	self.playerListTwo = ko.observableArray([]);
	
	self.matchList = ko.observableArray([]);
	self.showScores = ko.observable(false);
	
	self.scoreEntryError = ko.observable(false);
	
	self.scoreEntry = ko.observableArray();
	
	self.toggleShowScores = function() {
		if (self.showScores() === true) self.showScores(false);
		else self.showScores(true);
	}
	
	self.saveSucceeded = ko.observable(false);
	
	self.sessionuser = ko.observable();
	self.activePage = ko.observable("newgame");
	
	self.playerOne = ko.observable();
	self.playerTwo = ko.observable();
	
	self.selectedSwitch = ko.observable("bestof5");
	
	self.rankinglist = ko.observableArray();
	self.eventList = ko.observableArray();
	
	self.event = ko.observable();
	
	self.gameScores = ko.observable([]);
	
	self.p1GamesWon = ko.observable(0);
	self.p2GamesWon = ko.observable(0);
	
	
	self.setupScoreEntry = function(mod) {

		if (!mod) {
			if(self.selectedSwitch() == "bestof5") {
				while(self.scoreEntry().length <  3) {
					self.scoreEntry.push({
						p1score : ko.observable(),
						p2score : ko.observable(),
					});
				}
			}
			else if (self.selectedSwitch() == "bestof3") {
				while(self.scoreEntry().length > 2) {
					self.scoreEntry.pop();
				}
			}
		}
		
		if (mod == "remove") {
			self.scoreEntry.pop();			
		}
		else if(mod == "add") {
			self.scoreEntry.push({
				p1score : ko.observable(),
				p2score : ko.observable(),
			});
		}
	}
	
	self.setupScoreEntry();
	
	self.updateScoreEntry = function() {
		var l = self.scoreEntry().length;
		var sel = self.selectedSwitch();
		self.setupScoreEntry();
	}

	self.gameScore = ko.observableArray();


	self.saveInProgress =  ko.observable(false);

	self.validateMatch = function() {
		self.p1GamesWon(0);
		self.p2GamesWon(0);
		var p1, p2, toWin;
		for (var i = 0; self.scoreEntry().length > i; i++) {
			p1 = self.scoreEntry()[i].p1score();
			p2 = self.scoreEntry()[i].p2score();
			
			if (p1 >= 11 || p2 >= 11) {
				if (p1 - p2 >= 2) {
					self.p1GamesWon(self.p1GamesWon() + 1);
				}
				else if (p2 - p1 >= 2) {
					self.p2GamesWon(self.p2GamesWon() + 1);
				}
				else {
					self.scoreEntryError(true);
				}
			}
			else
				self.scoreEntryError(true);
			
			
			
			if (self.selectedSwitch() === "bestof3") toWin = 2;
			else if (self.selectedSwitch() === "bestof5") toWin = 3;
				
			if (self.p1GamesWon() == toWin || self.p2GamesWon() == toWin) {
				self.scoreEntryError(false);
				//console.log("sending save from validate");
				
				if(self.saveInProgress() === true) return;
				self.saveInProgress(true);
				
				var winner, loser;
				
				if (self.p1GamesWon() == toWin) {
					winner = self.playerOne();
					loser = self.playerTwo();
				}
				else {
					winner = self.playerTwo();
					loser = self.playerOne();
				}
				
				//console.log(typeof ko.toJS(self.event().affectsRanking));
				
				if (typeof ko.toJS(self.event().affectsRanking) != undefined) {
					if (self.event().affectsRanking() === "true") {
						self.updateRankinglist(winner, loser);
					}
				}
					
				self.saveScores();
				
				return;
			}	
				
		}
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
	
	self.updateRankinglist = function(win, lose) {
		var winRank, loseRank, loseIndex, winIndex;
		
		var winner = ko.toJS(win);
		var loser = ko.toJS(lose);
		
		sqEventProxy.updateRankinglist(
			{ winner:winner, loser:loser },
			function(data) {
				if (data.message === "OK")
				{

					//console.log(data.message);
				}
			}
		);
	}
	
	function getRankings() {
		var data;
		sqEventProxy.getRankings(
			{ data:data },
			function(data) {
				//console.log(data);
				ko.mapping.fromJS(data.ranking, {}, self.rankinglist);
			}
		);
	}
	
	function getPlayers() {

		self.customPlayerOne = ko.observable({
			_id : ko.observable("custom1"),
			name : ko.observable("Uusi pelaaja..."),
		});
		
		self.customPlayerTwo = ko.observable({
			_id : ko.observable("custom2"),
			name : ko.observable("Uusi pelaaja..."),
		});		
	
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
				
				//console.log(self.customPlayer()._id());
			
				ko.mapping.fromJS(data, {}, self.playerListOne);
				ko.mapping.fromJS(data, {}, self.playerListTwo);
				
				self.playerListOne.push(self.customPlayerOne());
				self.playerListTwo.push(self.customPlayerTwo());				
			}
		);
	}
	

	
	self.setupPlayers = ko.computed(function() {
		if (self.playerOne() == undefined || self.playerTwo() == undefined || typeof self.customPlayerOne == "undefined" || typeof self.customPlayerTwo == "undefined") {
		}
		else {
			var sel_id = self.playerOne()._id();
			//console.log(sel_id);
			
			self.playerListTwo.remove(function(i) { return i._id() === sel_id });
			
			if(self.playerOne()._id() == "custom1") {
				$('#newPlayerModalOne').foundation('reveal', 'open');
			}
			
			if(self.playerTwo()._id() == "custom2") {
				$('#newPlayerModalTwo').foundation('reveal', 'open');
			}
		}
		
	}).extend({throttle: 1 });
	
	$('#newPlayerModalOne').on( "close", function() {
		if(self.customPlayerOne().name() == "Uusi pelaaja...") {
			self.playerOne(self.playerListOne()[0]);
			self.customPlayerOne()._id("custom1");
			self.customPlayerOne().name("Uusi pelaaja...");
		}
		else {
			self.customPlayerOne()._id("0");
		}
	});	
	
	
	$('#newPlayerModalTwo').on( "close", function() {
		if(self.customPlayerTwo().name() == "Uusi pelaaja...") {
			self.playerTwo(self.playerListTwo()[0]);
			self.customPlayerTwo()._id("custom2");
			self.customPlayerTwo().name("Uusi pelaaja...");
		}
		else {
			self.customPlayerTwo()._id("1");
		}
		
	});
	
/*	self.closeNewPlayerPopupTwo = function() {
		self.playerTwo(self.playerLisTwo()[0]);
		self.customPlayerTwo()._id("custom2");
		self.customPlayerTwo()._id("Uusi pelaaja...");		
	} */
	
	function getMatches() {
		var data;
		sqEventProxy.getMatchList(
			{ data: data },
			function(data) {
				var x = data.scores;
				ko.mapping.fromJS(data.scores, {}, self.matchList);

			}
		);
	}
	
	self.saveScores = function() {
		//console.log("saving scores");
	
	
	
		var playerOne = ko.toJS(self.playerOne());
		var playerTwo = ko.toJS(self.playerTwo());
		
		var p1GamesWon = ko.toJS(self.p1GamesWon());
		var p2GamesWon = ko.toJS(self.p2GamesWon());
		
		var form = true;
		
		var gameScores = ko.toJS(self.scoreEntry());
		
		var event_id = ko.toJS(self.event()._id);
		
	
		sqEventProxy.saveGameScores(
			{
				scores 			: null,
				gameScores 		: gameScores,
				playerOneName 	: playerOne.name,
				playerTwoName 	: playerTwo.name,
				playerOneId 	: playerOne._id,
				playerTwoId 	: playerTwo._id,
				playerOneClub	: playerOne.club,
				playerTwoClub	: playerTwo.club,
				p1GamesWon		: p1GamesWon,
				p2GamesWon 		: p2GamesWon,
				form			: form,
				event_id		: event_id,
			},
			function(data) {
				//console.log(data.message);
				
				for (var i = 0; self.scoreEntry().length > i; i++) {
					self.scoreEntry()[i].p1score("");
					self.scoreEntry()[i].p2score("");					
				}				
				
				self.saveSucceeded(true);
				getRankings();
				
				setTimeout(function() {
					self.saveSucceeded(false);
				},3000);
				
				self.saveInProgress(false);
//				console.log("id " + data.id);
				
			},
			function(e) {
				//console.log(e);
//				console.log("err");
			}
		);		
	}
	
   	getMatches();
	getPlayers();
	getRankings();
	self.getActiveEvents();

}
	

$(document).ready(function() {
	
	window.vm = new viewModel();
	ko.applyBindings(vm, document.getElementById("main"));
	
    $(document).foundation();
    
    
});
	