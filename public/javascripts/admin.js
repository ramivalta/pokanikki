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

	self.title = ko.observable("Pokanikki Admin Tools");


//	self.playerList = ko.observable();

	self.playerList = ko.observableArray();
	self.matchList = ko.observableArray([]);
	self.userList = ko.observableArray();

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
	self.rankingList = ko.observableArray();

	self.userclub = ko.observable();

	self.eventAffectsRanking = ko.observable(true);

	self.hotnessList = ko.observableArray([
		 "hot",
		 "cold",
		 "lukewarm"
	]);

	self.rankingDate = ko.observable();

	self.hotness = ko.observable();


	self.ios = ko.observable(navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);


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

	self.generateRankingList = function() {
		var data;
		sqEventProxy.generateRankingList(
			{data:data},
			function(data) {
				//console.log("derp");
			}
		);
	}

	self.generateRankingArchive = function() {
		var data;
		sqEventProxy.generateRankingArchive(
			{data:data},
			function(data) {
				//console.log("derp");
			}
		);
	}

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

				getPlayers();
			}
		);
	}


	self.saveRankingList = function() {
		var data;

		var rankings = ko.toJS(self.rankingList());

		sqEventProxy.saveRankingList(
			{rankings:rankings},
			function(data) {
				if(data.message === "OK") {
					self.showSuccess(true);
					//self.rankingDate(moment(data.date).format('dddd, DoMoYYYY'));
					getRankings();
				}
			}
		);
	}

	ko.bindingHandlers.numericValue = {
		init : function(element, valueAccessor, allBindingsAccessor) {
			var underlyingObservable = valueAccessor();
			var interceptor = ko.computed({
				read: underlyingObservable,
				write: function(value) {
					if (!isNaN(value)) {
						underlyingObservable(parseInt(value));
					}
				}
			});
		ko.bindingHandlers.value.init(element, function() {
			return 	interceptor }, allBindingsAccessor);
		},
		update : ko.bindingHandlers.value.update
	};


	function getPlayers() {
		var data;
		sqEventProxy.getAllUsers(
			{ data:data },
			function(data) {

				data.sort(function(a, b) {
					var key1 = a.rank;
					var key2 = b.rank;
					if (key1 < key2) return -1;
					if (key1 > key2) return 1;
					return 0;
				});
				ko.mapping.fromJS(data, {}, self.playerList);
			}
		);
	}

	getPlayers();

	function getRankings() {
		var data;
		sqEventProxy.getAltRankings(
			{ data:data },
			function(data) {
				if(data.message !== "ranking empty") {
					//console.log(data);
					var l = data.rankings.length
					ko.mapping.fromJS(data.rankings[l-1].ranking, {}, self.rankingList);

					self.rankingList.sort(function(a, b) {
						var key1 = a.rank();
						var key2 = b.rank();
						if (key1 < key2) return -1;
						if (key1 > key2) return 1;
						return 0;
					});

					self.rankingDate(moment(data.rankings[l-1].date).format('dddd, DoMoYYYY'));
				}
			}
		);
	}

	getRankings();

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
}


$(document).ready(function() {

	window.vm = new viewModel();

	ko.applyBindings(vm, document.getElementById("main"));


    $(document).foundation();
	$('.dp').fdatepicker({ 'format' : 'dd.mm.yyyy', 'weekStart' : 1 });
});
