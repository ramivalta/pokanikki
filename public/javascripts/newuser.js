function viewModel() {
	var self = this;
	
	self.user = {};
	
	self.title = ko.observable("Rekisteröityminen - Pokanikki");	
	
	self.user.username = ko.observable();
	self.user.email = ko.observable();
	self.user.name = ko.observable();
	self.user.password = ko.observable();
	self.user.club = ko.observable();
	
	self.passwordVerify = ko.observable("");
	
	self.usernameTaken = ko.observable(false);
	self.emailTaken = ko.observable(false);
	
	self.sessionuser = ko.observable();
	
	self.club = ko.observable();
	
	self.clubList = ko.observableArray();
	
	function getClubs() {
		var data;
		sqEventProxy.getClubs(
		{ data:data},
		function(data) {
			ko.mapping.fromJS(data.clubs, {}, self.clubList);
		});
	}

	getClubs();
	
	
	$('#user-tf').keyup(function() {
		self.usernameTaken(false);
	});
	
	$('#email-tf').keyup(function() {
		self.emailTaken(false);
	});
	
	$('#passVerify').keyup(function() {
		$('#passErr').css('display', 'hidden');
	});
	
	
	self.doPasswordsDiffer = ko.computed(function() {
		if (self.user.password() === undefined || self.passwordVerify() === undefined) {
			return false;
		}
		
		if (self.user.password().length == 0 || self.passwordVerify().length == 0 ) {
			return false;
		}
		
		var pass1 = self.user.password();
		var pass2 = self.passwordVerify();
		
		if (pass1 === pass2) return false;
		else {
			$('passErr').css('display', 'block');
			return true;
		}
	}).extend( { throttle: 100 });
		
	
	self.addUser = function() {
		if(self.user.password() !== self.passwordVerify()) {
			//$('#passVerify').attr('[data-invalid]');
			//$('#passErr').css('display', 'block');
			//console.log("differs");
			//return;
		}
		
		var invalid = $(document).find('[data-invalid]');
		
		//console.log(self.user.password());
		//console.log(self.passwordVerify());
		
		//console.log(invalid.length);
		
		if(invalid.length === 0 && self.user.username() !== undefined && self.user.email() !== undefined && self.user.name() !== undefined && self.user.password() !== undefined) {
		
			self.user.club = self.club()._id;
		
			var user = ko.toJS(self.user);
			
		
			//console.log(user);
	
			sqEventProxy.addUser(
				{ user : user },
				function(data) {
					//console.log(data);
					if(data.message === "username") {
						//console.log("username taken");
						self.usernameTaken(true);
						//console.log(self.usernameTaken());
					}
					else if (data.message === "email") {
						//console.log("email taken");
						self.emailTaken(true);						

					}
					else if (data.message === "OK") {
						$('#formi').css('display', 'none');
						$('#success').css('display', 'block');
						
					}
				},
				function(e) {
					//console.log("fail :" + e);
				}
				
			);
		}
		else {
			//console.log("invalid invalid");
		}
	}
	
	
//	self.playerList = ko.
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
	