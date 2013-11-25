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
	
	self.toggleShowScores = function() {
		if (self.showScores() === true) self.showScores(false);
		else self.showScores(true);
	}
	
	self.sessionuser = ko.observable();
	
	self.activePage = ko.observable("home");
	
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
	
	function getMatches() {
		var data;
		sqEventProxy.getMatchList(
			{ data: data },
			function(data) {
				//console.log(data);
				//console.log(data.scores);
				
				var x = data.scores;
				ko.mapping.fromJS(data.scores, {}, self.matchList);
				
				
				//console.log(self.matchList()[0]._id());
				
				//if (!self.matchList()[0].gameScores) console.log("doh");
				
				//console.log(typeof self.matchList()[0].gameScores);
				
//				console.log(self.matchList()[0].gameScores()[0].p1score());
				
/*				for(var i = 0; i < self.matchList().length; i++) {
				
					var p1won, p2won;
					self.matchList()[i].gameScores()
					
				
				
				
					self.matchList(); */
				

				

/*				console.log(data.scores.length);

				for (var i=0; i < data.scores.length; i++) {
					var e;
					e.playerOneScore = data.scores[i].playerOneScore;
					e.playerTwoScore = data.scores[i].playerTwoScore;
					self.matchList().push(e);
				}; */
				
				
//				console.log(self.matchList().data);
//				self.matchList(ko.mapping.fromJS(data));
			}
		);
	}
	
	getMatches();
	
	self.login = function() {
		//console.log("running login");
		//console.log(self.session.name());
		if (self.session.name() !== undefined) return;
		//console.log("attempting login");		
		var data;
		sqEventProxy.login(
		{ data:data },
			function(data) {
				/*console.log(data);
				if(data.message === "OK") {
					self.session.name(ko.observable(data.session.user.name));
					self.session._id(ko.observable(data.session.user._id));
					self.session.hotness(ko.observable(data.session.user.hotness));
					self.session.club(ko.observable(data.session.user.club));
					self.session.rank(ko.observable(data.session.user.rank));
					self.session.username(ko.observable(data.session.user.username));
				} */
			}
		);
	}
	
	self.login();	
	

}
	

$(document).ready(function() {
	
	window.vm = new viewModel();
	ko.applyBindings(vm, document.getElementById("main"));
	
    $(document).foundation();
	
});
	