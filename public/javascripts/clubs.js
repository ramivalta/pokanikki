function viewModel() {
	var self = this;
	
	self.session = ko.observable();

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

	self.title = ko.observable("Seurat - Pokanikki");
		
	self.playerList = ko.observableArray();
	self.matchList = ko.observableArray([]);
	
	self.eventList = ko.observableArray([]);
	self.oldEventList = ko.observableArray([]);	
	
	self.showScores = ko.observable(false);
	
	self.activePage = ko.observable("profile");
	self.clubList = ko.observableArray();
	
	self.playerMatches = ko.observableArray();
	/*function getPlayers() {
		var data;
		sqEventProxy.getUserlist(
			{ data:data },
			function(data) {
				ko.mapping.fromJS(data, {}, self.playerList);
			}
		);
	}
	getPlayers();		
	*/

/*	function getMatches() {
		var data;
		sqEventProxy.getMatchList(
			{ data: data },
			function(data) {
				var x = data.scores;
				ko.mapping.fromJS(data.scores, {}, self.matchList);
			}
		);
	}

	getMatches(); */
	
	
	self.getPastEvents = function() {
		var data;
		var id, name, match_id;
		if(typeof jshare !== 'undefined') {
			id = jshare.event._id;
			name = jshare.event.name;
			match_id = jshare.match_id;
		}
		sqEventProxy.getPastEvents(
			{data:data},
			function(data) {
				ko.mapping.fromJS(data.current, {}, self.eventList);
				ko.mapping.fromJS(data.past, {}, self.oldEventList);
				/* if(typeof jshare !== 'undefined') {
					self.getMatchesForEvent(id, name, match_id, true);
					self.selectedEvent(id);
				}
				else {
					self.getMatchesForEvent(data.events[0]._id, data.events[0].name, null, true);
				} */
			}
		);
	}
	
	self.getPastEvents();	
	
	
	self.getClubData = function(id, clubShort) {
		self.getPlayersByClub(id);
		self.getMatchesByClub(clubShort);
	}
	
	self.getMatchesByClub = function(shortHand) {
		sqEventProxy.getMatchesByClub(
		{clubShort:shortHand},
		function(data) {
			ko.mapping.fromJS(data.scores, {}, self.matchList);
		});
	}
	
	function getClubs() {
		var data;
		sqEventProxy.getClubs(
		{ data:data},
		function(data) {
			if(data.clubs.length > 0) {
				ko.mapping.fromJS(data.clubs, {}, self.clubList);
				self.getClubData(data.clubs[0]._id, data.clubs[0].nameShort);
			}
			else {
				window.location.href="/home";
			}
		});
	}

	getClubs();
	
	self.getClubById = function(id) {
		for (var i = 0; i < self.clubList().length; i++) {
			if (self.clubList()[i]._id == id) return self.clubList()[i].name;
		}
	}
	
	self.getPlayersByClub = function(club_id) {
		//console.log("derped");
		sqEventProxy.getPlayersByClub(
			{ club_id : club_id },
			function(data) {
				ko.mapping.fromJS(data.players, {}, self.playerList);
			}
		);
	}


	/*self.getMatchesByPlayer = function() {
		if (!self.session.name) return
		var player_id = self.session._id();
		
		//console.log("sending player_id :" + player_id);

		sqEventProxy.getMatchesByPlayer(
			{ player_id : player_id },
			function(data) {
				//console.log(data.message);
				ko.mapping.fromJS(data.scores, {}, self.matchList);
			}
		);
	}
	
	
	self.getMatchesByPlayer(); */
	
	self.toggleVisible = function(item, event) {
		var el = event.currentTarget;
		var s = $(el).nextAll('.gameScores:first');

		if (s.is(":visible")) {

			s.transition( {
				perspective: '1000',
				height: '0px',
				opacity: '0',
				duration: '250',
				complete: function() {
					s.css('display', 'none');
				}
			});


			//$(".gameScores").slideUp("slow");
			//s.slideUp("fast");
		} else {

			//$(".gameScores").slideDown("slow");
			//$(this).next("div").slideToggle("slow");
			var s = $(el).nextAll('.gameScores:first');
			//s.slideUp("slow");
			//console.log(s);
			s.transition( {
				perspective: '1000',
				height: '0px',
				opacity: '0',
				duration: '0',
				complete: function() {
					s.css('display', 'block');
				}
			}).transition( {
				perspective: '1000',
				duration: '250',
				opacity: '1',
				height: 'auto',
			});
			
			//s.slideDown("fast");
		}
	}


}
	

$(document).ready(function() {
	
	window.vm = new viewModel();
	ko.applyBindings(vm, document.getElementById("main"));
    $(document).foundation();
	
});
	