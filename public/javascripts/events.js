function viewModel() {
	var self = this;
	self.session = ko.observable();

	self.title = ko.observable("Tapahtumat - Laajavuori Squash - Pokanikki");

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
		
	self.playerList = ko.observableArray();
	self.matchList = ko.observableArray([]);
	self.showScores = ko.observable(false);
	
	self.ios = ko.observable(navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
	
	self.sessionuser = ko.observable();
	self.activePage = ko.observable("events");

	self.showSuccess = ko.observable(false);
	self.eventList = ko.observableArray();
	self.matchListHeader = ko.observable();
	
	self.selectedEvent = ko.observable();
	self.match = ko.observable();
	self.selectedMatch_id = ko.observable("0");
	
	self.showNoMatchesText = ko.observable(false);
	
	self.getMatchesForEvent = function(id, name, match_id, mod_url) {
		//var event_id = event._id;
		
		var url = "";
		
		if (mod_url) {

			if(match_id) {
				url = "/" + match_id;
				//console.log("had match_id, appending " + url);
			}
			
			else if(typeof jshare !== 'undefined') {
				if(jshare.match_id !== undefined) {
					url = "/" + jshare.match_id;
					match_id = jshare.match_id;
					self.selectedMatch_id(match_id);
				}
			}
			window.history.replaceState({}, {}, '/events' + '/' + id + url);
		}
		
		var event_id = id;
		self.selectedEvent(event_id);		

		sqEventProxy.getMatchesForEvent(
		{ event_id : event_id },
		function(data) {
			if(data.scores.length == 0) {
				self.matchList([]);
				self.match(undefined);
				self.showNoMatchesText(true);
			}
			else {
				ko.mapping.fromJS(data.scores, {}, self.matchList);
				self.showNoMatchesText(false);
				self.match(undefined);
				if(match_id) {
					//console.log("have match_id, showing " + match_id);
					self.showMatch(match_id);
				}
		}
			self.matchListHeader(name);
		});
	}	
	
	self.showMatch = function(id) {
		var split = window.location.href.split("/");
		var found = false;
		for(var i = 0; i < self.matchList().length; i++) {
			if (id == self.matchList()[i]._id()) {
				found = true;
				self.match(self.matchList()[i]);
				self.selectedMatch_id(self.matchList()[i]._id);
				if (split.length == 5) {
					window.history.replaceState({}, {}, window.location.href + "/" + id);
				}
				else if(split.length == 6) {
					split[split.length - 1] = id;
					var url = split.join("/");
					window.history.replaceState({}, {}, url);
				}
				
				
				self.getStats();
				$('html, body').scrollTo('#scores', 250);
				
				//self.playerListTwo(self.playerList().slice(0)); 				
				
			}
		}
		
		if(found == false) {
			delete window.jshare.match_id;
			//console.log("not found");
			if(split.length == 6) {
				split.pop();
				var url = split.join("/");
				window.history.replaceState({}, {}, url);
			}
		}
	}		
	

	self.getEvent = function() {
		if(typeof jshare !== 'undefined') {
			self.getMatchesForEvent(jshare._id, jshare.name, jshare.match_id, false);
			/*if(jshare.match_id) {
				console.log(jshare.match_id);
				self.showMatch(jshare.match_id); 
			}*/

		}
		else {
			// näytetään viimeisimmän eventin pelit jos ei id:tä
			/*console.log("eventlist len " + self.eventList().length);
			if(self.eventList().length > 0 ) {
				self.getMatchesForEvent(self.eventList()[0]._id(), self.eventList()[0]._name(), true);
			} */
		}
	}
	
	self.getEvent();


	/* self.createEvent = function() {
	
		var startTime, endTime;
	
		if(self.ios() === true) {
			startDate = moment(self.eventStartTime(), 'YYYY-MM-DD').toJSON();
			endDate = moment(self.eventEndTime(), 'YYYY-MM-DD').toJSON();
		}
		else {
			startDate = moment(self.eventStartTime(), 'DD.MM.YYYY').toJSON();
			endDate = moment(self.eventEndTime(), 'DD.MM.YYYY').endOf('day').toJSON();
		}
		
		//console.log("startDate " + startDate);
		//console.log("endDate " + endDate);		
		
		var name = ko.toJS(self.eventName());
		
		sqEventProxy.createEvent(
			{ startDate : startDate, endDate : endDate, name : name },
			function(data) {
				//console.log(data);
				self.showSuccess(true);
			}
		);
	} */
	
	self.getActiveEvents = function() {
		var data;
		sqEventProxy.getActiveEvents(
			{ data:data },
			function(data) {
				ko.mapping.fromJS(data.events, {}, self.eventList);
			}
		);
	}
	
	//self.getActiveEvents();
	
	
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
				ko.mapping.fromJS(data.events, {}, self.eventList);
				if(typeof jshare !== 'undefined') {
					self.getMatchesForEvent(id, name, match_id, true);
					self.selectedEvent(id);
				}
				else {
					self.getMatchesForEvent(data.events[0]._id, data.events[0].name, null, true);
				}
			}
		);
	}
	
	self.getPastEvents();
	

	
	
/*	function getMatches() {
		var data;
		sqEventProxy.getMatchList(
			{ data: data },
			function(data) {
				ko.mapping.fromJS(data.scores, {}, self.matchList);
			}
		);
	}
	getMatches(); */

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
				complete: function() {

				}
			});
			
			//s.slideDown("fast");
		}
	}
	
	
	self.stats = ko.observable({
		p1lets 		: ko.observable(0),
		p2lets 		: ko.observable(0),
		p1nolets 	: ko.observable(0),
		p2nolets 	: ko.observable(0),
		p1strokes	: ko.observable(0),
		p2strokes	: ko.observable(0),
		p1gameBalls : ko.observable(0),
		p2gameBalls : ko.observable(0),
		p1matchBalls: ko.observable(0),
		p2matchBalls: ko.observable(0)
	});
	
	self.getStats = function() {
		self.stats().p1lets(0);
		self.stats().p2lets(0);
		self.stats().p1nolets(0);
		self.stats().p2nolets(0);
		self.stats().p1strokes(0);
		self.stats().p2strokes(0);
		self.stats().p1gameBalls(0);
		self.stats().p2gameBalls(0);
		self.stats().p1matchBalls(0);
		self.stats().p2matchBalls(0);
		
		if (self.match() !== undefined) {
			for(var i = 0; i < self.match().scores().length; i++) {
				if(typeof self.match().scores()[i].playerOneYesLet !== 'undefined') {
					if(self.match().scores()[i].playerOneYesLet() == 'true') {
						self.stats().p1lets(self.stats().p1lets() + 1);
					}
					else if (self.match().scores()[i].playerOneNoLet() == 'true') {
						self.stats().p1nolets(self.stats().p1nolets() + 1);
					}
					else if (self.match().scores()[i].playerOneStroke() == 'true') {
						self.stats().p1strokes(self.stats().p1strokes() + 1);
					}
					
					if(self.match().scores()[i].gameBall() == 'true' && parseInt(self.match().scores()[i].playerOneScore()) > parseInt(self.match().scores()[i].playerTwoScore()) ) {
						self.stats().p1gameBalls(self.stats().p1gameBalls() + 1);
					}
				}
				
				if(typeof self.match().scores()[i].playerTwoYesLet !== 'undefined') {
					if(self.match().scores()[i].playerTwoYesLet() == 'true') {
						self.stats().p2lets(self.stats().p2lets() + 1);
					}
					else if (self.match().scores()[i].playerTwoNoLet() == 'true') {
						self.stats().p2nolets(self.stats().p2nolets() + 1);
					}
					else if (self.match().scores()[i].playerTwoStroke() == 'true') {
						self.stats().p2strokes(self.stats().p2strokes() + 1);
					}
					if(self.match().scores()[i].gameBall() == 'true' && parseInt(self.match().scores()[i].playerTwoScore()) > parseInt(self.match().scores()[i].playerOneScore()) ) {
						self.stats().p2gameBalls(self.stats().p2gameBalls() + 1);
					}
				}
				
				if(typeof self.match().scores()[i].matchBall !== 'undefined' && self.match().scores()[i].matchBall() == 'true' && parseInt(self.match().scores()[i].playerOneScore()) > parseInt(self.match().scores()[i].playerTwoScore()) ) {
						self.stats().p1matchBalls(self.stats().p1matchBalls() + 1);
				}					

				if(typeof self.match().scores()[i].matchBall !== 'undefined' && self.match().scores()[i].matchBall() == 'true' &&  parseInt(self.match().scores()[i].playerTwoScore()) > parseInt(self.match().scores()[i].playerOneScore()) ) {
					self.stats().p2matchBalls(self.stats().p2matchBalls() + 1);
				}
			}
		}
	}		
	
	
	
	self.login = function() {
		//console.log("running login");
		//console.log(self.session.name());
		if (self.session.name() !== undefined) return;
		
		window.location.href="/";
		
		//console.log("attempting login");		
		/*var data;
		sqEventProxy.login(
		{ data:data },
			function(data) {
				console.log(data);
				if(data.message === "OK") {
					self.session.name(ko.observable(data.session.user.name));
					self.session._id(ko.observable(data.session.user._id));
					self.session.hotness(ko.observable(data.session.user.hotness));
					self.session.club(ko.observable(data.session.user.club));
					self.session.rank(ko.observable(data.session.user.rank));
					self.session.username(ko.observable(data.session.user.username));
				}
			},
			
			function(fail) {
				console.log(fail);
			}
		); */
	}
	

}
	

$(document).ready(function() {
	
	window.vm = new viewModel();
	ko.applyBindings(vm, document.getElementById("main"));
    $(document).foundation();
});
	