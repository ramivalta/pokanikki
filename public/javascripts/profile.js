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

	
	self.oldPass = ko.observable();
	self.newPass = ko.observable();
	self.newPassVerify = ko.observable();
	self.saveInProgress = ko.observable(false);
	self.saveSucceeded = ko.observable(false);
	
	self.visiblePage = ko.observable('profiili');

	self.hideInactive = ko.computed(function() {
		if(self.visiblePage() == "profiili") {
			$("#edit").css('display', 'none');
			$("#profiili").css('display', 'block');
		}
		else if(self.visiblePage() == "edit") {
			$("#profiili").css('display', 'none');
			$("#edit").css('display', 'block');
		}
	});
	
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
	$(document).foundation('abide', {
		patterns : {
			shortpass : /.{6,}/,
			shortuser : /.{3,}/,
			dummy : /./,
		},
	});
    
	
});
	