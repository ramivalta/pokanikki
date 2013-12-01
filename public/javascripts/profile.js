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
		
	self.playerList = ko.observableArray();
	self.matchList = ko.observableArray([]);
	
	self.showScores = ko.observable(false);
	
	self.activePage = ko.observable("profile");
	
	self.oldPassFail = ko.observable(false);
	
	self.playerMatches = ko.observableArray();

	self.match = ko.observable();
	
	self.oldPass = ko.observable();
	self.newPass = ko.observable();
	self.newPassVerify = ko.observable();
	self.saveInProgress = ko.observable(false);
	self.saveSucceeded = ko.observable(false);
	
	self.visiblePage = ko.observable('profiili');
	
	self.showMatch = function(id) {
		for(var i = 0; i < self.matchList().length; i++) {
			if (id() == self.matchList()[i]._id()) {
				self.match(self.matchList()[i]);
				self.getStats();
				
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

	//getMatches();


	self.getMatchesByPlayer = function() {
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
	
	
	self.getMatchesByPlayer();
	

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

				if(typeof self.match().scores()[i].matchBall !== 'undefined' && self.match().scores()[i].matchBall() == 'true' && parseInt(self.match().scores()[i].playerTwoScore()) > parseInt(self.match().scores()[i].playerOneScore()) ) {
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


}
	

$(document).ready(function() {
	
	window.vm = new viewModel();
	ko.applyBindings(vm, document.getElementById("main"));
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
	