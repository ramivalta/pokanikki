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
	
	self.profiili = ko.observableArray();
	if(typeof jshare !== "undefined") {
		self.title = ko.observable("Profiili - " + jshare.profile.name + " - Pokanikki");		
	}
	else {
		self.title = ko.observable("Profiili - Pokanikki");
	}

	self.playerList = ko.observableArray();
	self.matchList = ko.observableArray([]);
	
	self.showScores = ko.observable(false);
	
	self.activePage = ko.observable("profile");
	
	self.oldPassFail = ko.observable(false);

	self.match = ko.observable();
	self.selectedMatch_id = ko.observable("0");	
	
	self.rankings = ko.observableArray([]);
	
	self.oldPass = ko.observable();
	self.newPass = ko.observable();
	self.newPassVerify = ko.observable();
	self.saveInProgress = ko.observable(false);
	self.saveSucceeded = ko.observable(false);
	
	self.graphData = ko.observable();
	
	self.ios = ko.observable(navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);


	
	self.getRankings = function() {
		var data;

		var graphData = new google.visualization.DataTable();

		
		sqEventProxy.getAltRankings(
			{data:data},
			function(data) {
				//ko.mapping.fromJS(data.rankings, {}, self.rankings);
				var id = self.profiili()._id();
				var row = [];
				
				graphData.addColumn('string', 'Päiväys');
				graphData.addColumn('number', self.profiili().name());
				/*graphData.addColumn('number', "Lauri Selänne");
				graphData.addColumn('number', "Tero Kadenius");
				graphData.addColumn('number', "Timo Annala");
				graphData.addColumn('number', "Mikko Sillanpää"); */
				
				//graphData.push(row);
				var date = moment(data.rankings[0].date).format("DoMoYYYY");
				var rank;

				var numP = parseInt(data.rankings[data.rankings.length -1].ranking.length);
				
				//graphData.addRows(1);
				var c = 0;
				
				for(var i = 0; i < data.rankings.length; i++) {
					if(i < data.rankings.length -1) {
						date = moment(data.rankings[i].date).format("DoMoYYYY");					
						if(date !== moment(data.rankings[i+1].date).format("DoMoYYYY")) {
							for(var o = 0; o < data.rankings[i].ranking.length; o++) {
								if(data.rankings[i].ranking[o]._id == id) {
									//if(rank !== parseInt(data.rankings[i].ranking[o].rank)) {
										graphData.addRows(1);
										rank = parseInt(data.rankings[i].ranking[o].rank);
										graphData.setCell(c, 0, date);
										graphData.setCell(c, 1, rank);
										c++;
						//			}
								}
							}
						}
					}
					else if (i == data.rankings.length - 1) {
						//console.log("should happen once");
						date = moment(data.rankings[i].date).format("DoMoYYYY");
						for(var o = 0; o < data.rankings[i].ranking.length; o++) {
							if(data.rankings[i].ranking[o]._id == id) {
								//if(rank !== parseInt(data.rankings[i].ranking[o].rank)) {
									graphData.addRows(1);
									rank = parseInt(data.rankings[i].ranking[o].rank);
									graphData.setCell(c, 0, date);
									graphData.setCell(c, 1, rank);
									//c++;
					//			}
							}
						}
						
					}
						/*
						else if(data.rankings[i].ranking[o].name == "Lauri Selänne") {
							rank = parseInt(data.rankings[i].ranking[o].rank);
							graphData.setCell(i, 0, date);
							graphData.setCell(i, 2, rank);
						}
						else if(data.rankings[i].ranking[o].name == "Tero Kadenius") {
							rank = parseInt(data.rankings[i].ranking[o].rank);
							graphData.setCell(i, 0, date);
							graphData.setCell(i, 3, rank);
						}

						else if(data.rankings[i].ranking[o].name == "Timo Annala") {
							rank = parseInt(data.rankings[i].ranking[o].rank);
							graphData.setCell(i, 0, date);
							graphData.setCell(i, 4, rank);
						}
						else if(data.rankings[i].ranking[o].name == "Mikko Sillanpää") {
							rank = parseInt(data.rankings[i].ranking[o].rank);
							graphData.setCell(i, 0, date);
							graphData.setCell(i, 5, rank);
						}
						*/
						
					
				}
				
				//console.log(labels);
				
				//dataPoints = _.filter(_.flatten(data.rankings), function(_id) { return _id == self.profiili()._id() });
				// console.log(dataPoints);
				
				//labels = _.map(labels, function(i) { return moment(i).format("DoMoYYYY") });
				
				//dataPoints = _.map(dataPoints, function(i) { return parseInt(i) });
				
				//graphData.labels = [_.map(labels, function(i) { return moment(i).format("DoMoYYYY") })];
				
				//console.log(labels);
				//console.log(dataPoints);

				self.graphData(graphData);
				
				self.drawChart(numP);
				
				//console.log(graphData);
				
				/*function drawChart() {
					//var data = google.visualization.arrayToDataTable(graphData);
					//graphData.sort([{ column: 1, asc: true }]);
					
					var n = -1;
					var b = 12;
		
					var options = {
						title: 'Pelaajan ranking',
						curveType: 'none',
						legend: { position: 'top' },
						vAxis: { minValue: 1, direction: -1, maxValue: numP, viewWindow: { max : numP, min : 1}, gridlines: { count : numP }},
						fontSize: 13,
						fontArea: 'helvetica',
						valueLabelsInterval: 1,
						min: 1,
						max: numP,
					};
						//max: numP,				
		
					var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
					//console.log(chart);
					chart.draw(graphData, options);		
				}

				setTimeout(function() {
					drawChart();					
				}, 1);*/


				
				
		});
	}
	
	self.drawChart = function(num) {
		var numP = num;
		var graphData = self.graphData();
		
		var options = {
			title: 'Pelaajan ranking',
			curveType: 'none',
			legend: { position: 'top' },
			vAxis: { minValue: 1, direction: -1, maxValue: numP, viewWindow: { max : numP, min : 1}, gridlines: { count : numP }},
			fontSize: 13,
			fontArea: 'helvetica',
			backgroundColor: 'transparent'
		};

		var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
		chart.draw(graphData, options);
		
		function resizeHandler() {
			chart.draw(graphData, options);
		}
		if (window.addEventListener) {
			window.addEventListener('resize', resizeHandler, false);
		}
		else if (window.attachEvent) {
			window.attachEvent('onresize', resizeHandler);
		}
		
	}		

	
/*	self.drawChart = function() {
		var d = self.graphData();
		var data = google.visualization.arrayToDataTable(graphData);

		var options = { title: 'Pelaajan ranking' };

		var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
		console.log(chart);
		chart.draw(data, options);				
	} */

	
	self.getRankings();
	
	self.getMatchesByPlayer = function(id) {
		var player_id = id;
		sqEventProxy.getMatchesByPlayer(
			{ player_id : player_id },
			function(data) {
				ko.mapping.fromJS(data.scores, {}, self.matchList);
			}
		);
	}	
	
	self.getProfile = function () {
		if (typeof jshare !== 'undefined') {
			ko.mapping.fromJS(jshare.profile, {}, self.profiili);
			self.getMatchesByPlayer(jshare.profile._id);
			var title = "Profiili: " + jshare.profile.name + " - Pokanikki";
			self.title(title);
		
		}
		else if (typeof jshare == 'undefined' && self.session._id() == undefined) {
			window.location.href = "/seurat";
		}
	}
	
	self.getProfile();
	
/*	var p_name = self.profiili().name;
	
	var title = "Profiili: " + p_name + " - Pokanikki"; */


	self.visiblePage = ko.observable('profiili');
	
	self.profilePic = ko.observable();
	
	//self.matchStart = ko.observable();
	//self.matchEnd = ko.observable();
	self.matchDuration = ko.observable();
	
	self.matchLoaded = ko.observable(false);	
	
	self.showMatch = function(id) {
		self.matchLoaded(false);	
		for(var i = 0; i < self.matchList().length; i++) {
			if (id() == self.matchList()[i]._id()) {
				self.match(self.matchList()[i]);
				self.selectedMatch_id(self.matchList()[i]._id);
				self.getStats();
				self.matchLoaded(true);
				
				$('html, body').scrollTo('#scores', 250, { axis: 'y' });
				
				self.getCommentsForMatch(id());
				
				//self.playerListTwo(self.playerList().slice(0)); 				
				
			}
		}
	}	
	
	
	
	self.checkOldPass = function(user_id, password, cb) {
		sqEventProxy.checkOldPass(
			{user_id:user_id, password:password},
			function(data) {
				if(data.message === "OK") {
					self.oldPassFail(false);					
					cb(true);
				}
				else if (data.message === "fail") {
					self.oldPassFail(true);
					cb(false);
				}
			}
		);
	}
	
	
	self.newPassFail = ko.observable();
	
	self.saveUser = function() {
		
		var oldpass = ko.toJS(self.oldPass());
		var user_id = ko.toJS(self.session._id());
		
		var invalid = $(document).find('[data-invalid]');
		
	
		self.checkOldPass(user_id, oldpass, function(res) {
			if(res == true) {
				if(invalid.length === 0 && self.newPass() !== undefined && self.newPassVerify() !== undefined ) {

					var user_id = ko.toJS(self.session._id);
					var password = ko.toJS(self.newPass);
					
					self.saveInProgress(true);
					
					sqEventProxy.changePassword(
						{user_id: user_id, password:password},
						function(data) {
							if(data.message === "OK") {
								self.saveSucceeded(true);
				
								/*setTimeout(function() {
									self.saveSucceeded(false);
								},3000); */
				
								self.saveInProgress(false);
								// logout-nappi näkyviin
							}
						}
					);
				}
				else {
					//console.log("Hedperp");
					self.newPassFail(true);
				}
			}
		});
		
		
		/*if(check) {
			var user_id = ko.toJS(self.session._id);
			var newpass = ko.toJS(self.newpass());
			sqEventProxy.changePassword(
				{newpass:newpass},
				function(data) {
					if(data.message === "OK") {
						console.log("vaihdettu");
						// logout-nappi näkyviin
					}
				}
			);
		}
		else {
			console.log("väärä pass");
		} */
	}
	

	self.id = ko.observable();
	
	/* self.getProfile = function() {
		var id;
		if (self.id() !== 'undefined') {
			id = ko.toJS(self.id);
		}
		else if (self.session._id() !== undefined) {
			id = self.session._id();
			//console.log(self.session._id());
		}
		else {
			window.location.href="/seurat";
			return;
		}
		
		sqEventProxy.getProfile(
			{id:id},
			function(data) {
				self.profiili(data);
				self.getMatchesByPlayer(data._id);
				var title = "Profiili: " + data.name + " - Pokanikki";
				self.title(title);
			}
		);

	} */
	
	//self.getProfile(self.id);


	function getMatches() {
		var data;
		sqEventProxy.getMatchList(
			{ data: data },
			function(data) {
				//console.log(data);
				ko.mapping.fromJS(data.scores, {}, self.matchList);
			}
		);
	}

	//getMatches();


	self.getMatchesByPlayer = function(id) {
		//console.log(id);
		//if (!self.session.name) return
		//var player_id = self.session._id();
		var player_id = id;
		
		//console.log("sending player_id :" + player_id);

		sqEventProxy.getMatchesByPlayer(
			{ player_id : player_id },
			function(data) {
				//console.log(data);
				//console.log(data.message);
				ko.mapping.fromJS(data.scores, {}, self.matchList);
			}
		);
	}
	
	
	//self.getMatchesByPlayer();
	
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
			
			//self.matchStart(moment(self.match().startTime()));
			//self.matchEnd(moment(self.match().endTime()));
			
			self.matchDuration(moment(self.match().endTime()).diff(self.match().startTime(), 'minutes'));
		
		
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
				
				if(typeof self.match().scores()[i].matchBall !== 'undefined' && self.match().scores()[i].matchBall() == 'true'  && self.match().scores()[i].gameOver() == 'false' && parseInt(self.match().scores()[i].playerOneGamesWon()) >= parseInt(self.match().scores()[i].playerTwoGamesWon()) && parseInt(self.match().scores()[i].playerOneScore()) > parseInt(self.match().scores()[i].playerTwoScore()) ) {
						//console.log(self.match().scores()[i].playerOneGamesWon() + " " + 
						//self.match().scores()[i].playerTwoGamesWon());
						//console.log("p1 matchball");
						self.stats().p1matchBalls(self.stats().p1matchBalls() + 1);
				}					

				if(typeof self.match().scores()[i].matchBall !== 'undefined' && self.match().scores()[i].matchBall() == 'true' && self.match().scores()[i].gameOver() == 'false' &&  parseInt(self.match().scores()[i].playerTwoGamesWon()) >= parseInt(self.match().scores()[i].playerOneGamesWon()) && parseInt(self.match().scores()[i].playerTwoScore()) > parseInt(self.match().scores()[i].playerOneScore()) ) {
						self.stats().p2matchBalls(self.stats().p2matchBalls() + 1);
				}
			}
		}
	}	
	
	
	
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
	
	self.doPasswordsDiffer = ko.computed(function() {
		if (self.newPass() === undefined || self.newPassVerify() === undefined) {
			return false;
		}
		
		if (self.newPass().length == 0 || self.newPassVerify().length == 0 ) {
			return false;
		}
		
		var pass1 = self.newPass();
		var pass2 = self.newPassVerify();
		
		if (pass1 === pass2) return false;
		else {
			$('passErr').css('display', 'block');
			return true;
		}
	}).extend( { throttle: 100 });
			
	
	$('#newpassverify').keyup(function() {
		$('#newpassverify').css('display', 'hidden');
	});
	
	$('#oldpass').keyup(function() {
		$('#oldPassErr').css('display', 'hidden');
		self.oldPassFail(false);
	});	
	$('#newpass').keyup(function() {
		$('#newPassErr').css('display', 'hidden');
		self.newPassFail(false);
	});	
	
	
	ko.bindingHandlers.fadeVisible = {
		init: function(element, valueAccessor) {
			var shouldDisplay = valueAccessor();
			$(element).toggle(shouldDisplay);
		},
		update: function(element, valueAccessor) {
			// On update, fade in/out
			var shouldDisplay = valueAccessor();
        
			if (shouldDisplay == true) {
				$(element).css({ display: 'block'});
				$(element).transition({ opacity: 1, queue: false, duration: '500ms' });
			}
			else {
				$(element).transition({ opacity: 0, queue: false, duration: '500ms' });
				$(element).css({ display: 'none'});
			}
		} 
	};
	
	
	self.comment = ko.observable();
	self.saveInProgress = ko.observable(false);
	
	self.createComment = function() {
		if(self.comment() == undefined)
			return;
		if(self.comment() == "") return;
	
		self.saveInProgress(true);
		
		var author = ko.toJS(self.session.name);
		var comm = ko.toJS(self.comment);
		var match_id = ko.toJS(self.match()._id());
		
		sqEventProxy.createComment(
		{comment:comm, author:author, match_id:match_id},
		function(data) {

			if (data.message == "OK") {
				console.log("ok");
				
				if(self.commentList().length == 0) {
					ko.mapping.fromJS(data.comment, {}, self.commentList()[0]);
					console.log(ko.mapping.fromJS(data.comment, {}, self.commentList()[0]));
				}
				
				else {
				
					ko.mapping.fromJS(data.comment, {}, self.commentList()[self.commentList().length - 1]);
				}
				//self.allComments().push(data.comment);
				self.comment("");

			}
			self.saveInProgress(false);
			//console.log(self.commentList()[self.commentList().length - 1]);
			
			self.getComments(match_id);
			//self.getCommentsForMatch(match_id);			
			
		});
		

		
	}
	
	self.allComments = ko.observableArray([]);
	
	self.getComments = function(match_id) {
		var data;
		sqEventProxy.getComments(
		{data:data},
		function(data) {
			if(data) {
				//console.log("got comments");
				ko.mapping.fromJS(data.comments, {}, self.allComments);
				if (match_id)
					self.getCommentsForMatch(match_id);
			}
		});
	}
	
	self.getComments();
	
	self.commentList = ko.observableArray([]);
	
	self.getCommentsForMatch = function(match_id) {
		//console.log("getting comments for match");
		var comments = [];
		for(var i = 0; i < self.allComments().length; i++) {
			if(self.allComments()[i].match_id() == match_id) {
				comments.push(self.allComments()[i]);
			}
		}
		ko.mapping.fromJS(comments, {}, self.commentList);
	}
	
	self.getNumberOfComments = function(match_id) {
		//console.log("getting numbers");
		var comments = [];
		for(var i = 0; i < self.allComments().length; i++) {
			if(self.allComments()[i].match_id() == match_id) {
				comments.push(self.allComments()[i]);
			}
		}
		if (comments.length > 0) {
			return comments.length;
		}
	}	
	
	
	
	
}
	

$(document).ready(function() {
	
	window.vm = new viewModel();
	ko.applyBindings(vm, document.getElementById("main"));
	//vm.getProfile();
    $(document).foundation();
    
//$(document).foundation({dropdown: {is_hover: false}});    
    
	$(document).foundation({abide: {
		patterns: {
			shortpass : /.{6,}/,
			password : /.{6,}/,
			shortuser : /.{3,}/,
			dummy : /./,
		},
	}});
    
	
});
	