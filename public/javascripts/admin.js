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
	self.rankingList = ko.observableArray();	
	
	self.sessionuser = ko.observable();
	self.activePage = ko.observable("admin");
	
	self.playerName = ko.observable();
	self.ranking = ko.observable();
	self.player = ko.observable();

	self.showSuccess = ko.observable(false);
	
	self.hotness = ko.observable();
	
	self.visiblePage = ko.observable("users");
	self.visibleSubPage = ko.observable("newEvent");
	
	self.eventName = ko.observable();
	self.eventStartTime = ko.observable();
	self.eventEndTime = ko.observable();
	
	self.eventList = ko.observableArray();
	self.event = ko.observable();
	
	self.club = ko.observable();
	self.clubShort = ko.observable();
	self.clubList = ko.observableArray();
	
	self.userclub = ko.observable();
	
	self.eventAffectsRanking = ko.observable(true);
	
	
	self.ios = ko.observable(navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
	
	
	self.hideInactive = ko.computed(function() {
		if(self.visiblePage() == "events") {
			$("#users").css('display', 'none');
			$("#clubs").css('display', 'none');
			$("#events").css('display', 'block');
		}
		else if(self.visiblePage() == "clubs") {
			$("#users").css('display', 'none');
			$("#clubs").css('display', 'block');
			$("#events").css('display', 'none');			
		}
		else if(self.visiblePage() == "users") {
			$("#users").css('display', 'block');
			$("#clubs").css('display', 'none');
			$("#events").css('display', 'none');			
		}
	});
	
	
	self.navShowNewEvent = function() {
		if(self.visibleSubPage() == "editEvent") {
			//$("#newEvent").css('display', 'block');
			//$("#editEvent").css('display', 'none');
			self.visibleSubPage("newEvent");
		}
	}
	
	self.navShowEditEvent= function() {
		if(self.visibleSubPage() == "newEvent") {
			//$("#newEvent").css('display', 'none');
			//$("#editEvent").css('display', 'block');
			self.visibleSubPage("editEvent");
		}
	}
	
	
	
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
		
		var affectsRanking = ko.toJS(self.eventAffectsRanking());
		
		//console.log("startDate " + startDate);
		//console.log("endDate " + endDate);		
		
		var name = ko.toJS(self.eventName());
		
		sqEventProxy.createEvent(
			{ startDate : startDate, endDate : endDate, name : name, affectsRanking : affectsRanking },
			function(data) {
				//console.log(data);
				self.showSuccess(true);
			}
		);
	}
	
	self.updateEvent = function() {
		var event = ko.toJS(self.event());
		
		sqEventProxy.updateEvent(
			{ event : event },
			function(data) {
				//		
			}
		);
	}
	
	
	self.getRankings = function getRankings() {
		var data;
		sqEventProxy.getRankings(
			{ data:data },
			function(data) {
				//console.log(data);
				ko.mapping.fromJS(data.ranking, {}, self.rankingList);
			}
		);
	}
	
	function getClubs() {
		var data;
		sqEventProxy.getClubs(
			{ data:data},
			function(data) {
				ko.mapping.fromJS(data.clubs, {}, self.clubList);
			}
		);
	}
	
	getClubs();
	
	self.addClub = function() {
		var club = self.club();
		var clubShort = self.clubShort();
		
		sqEventProxy.addClub(
			{ club:club, clubShort:clubShort },
			function(data) {
				if(data.message === "OK") {
					//
				}
			}
		);
	}
	
	self.saveUser = function() {
		var player = ko.toJS(self.player());
		player.club = ko.toJS(self.userclub()._id());
		console.log(player.club);
		
		sqEventProxy.addToRanking(
			{ player:player },
			function(data) {
				//console.log(data);
				self.showSuccess(true);
				
				self.getRankings();
			}
		);
	}
	
	/*self.addClub = function() {
		var club = ko.toJS(self.club());
		var clubShort = ko.toJS(self.clubShort());
		
		sqEventProxy.addClub(
			{ club:club, clubShort:clubShort },
			function(data) {
				self.showSuccess(true);
				getClubs;
			}
		);
	} */
	
	function getPlayers() {
		var data;
		sqEventProxy.getUserlist(
			{ data:data },
			function(data) {
/*				for (var i=0, i < data.length, i++) {
					self.playerList[i]. */
//				var x = ko.mapping.fromJS(data);
				
//				console.log(x().length);
				
				ko.mapping.fromJS(data, {}, self.playerList);
				
//				self.playerList = ko.mapping.fromJS(data);

		//		console.log(self.playerList().length);

	//			for (var i = 0; i < self.playerList().length; i++) {
//					console.log(self.playerList()[i].username());
	//			}
//				console.log(playerList.userlist[0]().username());
			}
		);
	}
	
	getPlayers();
	//getRankings();
	
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
	
	getMatches();
	
	function getAllEvents () {
		var data;
		sqEventProxy.getAllEvents(
			{data : data},
			function(data) {
				ko.mapping.fromJS(data.events, {}, self.eventList);
			}
		);
	}
	
	getAllEvents();
	
	self.login = function() {
		//console.log("running login");
		//console.log(self.session.name());
		if (self.session.name() !== undefined) return;
		//console.log("attempting login");		
		var data;
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
			}
		);
	}
	
	self.login();	
	self.getRankings();
}
	

$(document).ready(function() {
	
	window.vm = new viewModel();

	ko.applyBindings(vm, document.getElementById("main"));
	

    $(document).foundation();
	$('.dp').fdatepicker({ 'format' : 'dd.mm.yyyy', 'weekStart' : 1 });
});
