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
		
	
	
//	self.playerList = ko.observable();
	
	self.playerList = ko.observableArray();
	self.matchList = ko.observableArray([]);
	self.showScores = ko.observable(false);
	
	self.eventMatches = ko.observableArray();
	
	self.ios = ko.observable(navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
	
	self.sessionuser = ko.observable();
	self.activePage = ko.observable("events");

	self.showSuccess = ko.observable(false);
	self.eventList = ko.observableArray();
	self.matchListHeader = ko.observable("Viimeisimmät pelit");

	self.createEvent = function() {
	
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
	}
	
	self.getActiveEvents = function() {
		var data;
		sqEventProxy.getActiveEvents(
			{ data:data },
			function(data) {
				ko.mapping.fromJS(data.events, {}, self.eventList);
			}
		);
	}
	
	self.getActiveEvents();
	
	self.getMatchesForEvent = function(id, name) {
		//var event_id = event._id;
		
		var event_id = id();

		//console.log(event_id);
		
		sqEventProxy.getMatchesForEvent(
		{ event_id : event_id },
		function(data) {
			ko.mapping.fromJS(data.scores, {}, self.matchList);
			self.matchListHeader(name());
		});
	}
	
	
	function getMatches() {
		var data;
		sqEventProxy.getMatchList(
			{ data: data },
			function(data) {
				ko.mapping.fromJS(data.scores, {}, self.matchList);
			}
		);
	}
	getMatches();

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
	