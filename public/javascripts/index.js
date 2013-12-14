function viewModel() {
	var self = this;
	
	self.user = {};
	
	self.user.username = ko.observable();
	self.user.email = ko.observable();
	self.user.name = ko.observable();
	self.user.password = ko.observable();
	
	self.user.rememberMe = ko.observable(true);
	
	self.session = ko.observable();
	
	self.title = ko.observable("Sisäänkirjautuminen - Pokanikki");	

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
		
	
	self.passwordFail = ko.observable(false);
	self.userFail = ko.observable(false);
	
	$('#pass-tf').keydown(function() {
		self.passwordFail(false);
	});

	$('#user-tf').keyup(function() {
		self.userFail(false);
	});	
	
/*	console.log(typeof self.session);
	console.log(typeof self.session.name());	
	console.log(self.session.name); */
	

/*	$('#user-tf').keyup(function() {
		self.usernameTaken(false);
	});
	
	$('#email-tf').keyup(function() {
		self.emailTaken(false);
	}); */
	
	
	self.login = function() {
		//console.log("logging in");
		var username = ko.toJS(self.user.username());
		var password = ko.toJS(self.user.password());
		var rememberMe = ko.toJS(self.user.rememberMe());

		sqEventProxy.login(
			{ username : username, password : password, rememberMe : rememberMe },
			function(data) {
				//console.log(data);
				if (data.message === "OK") {
				
					//self.session(data.session);
					//console.log("logged in");
					window.location.href="/profile";
				}
				else if (data.message === "pass") {
					self.passwordFail(true);
				}
				else if (data.message === "user not found") {
					self.userFail(true);
				}
				else {
					//console.log("virhe");
					//console.log(data.message);
				}
			}
		);
	}
	
	
	
//	self.playerList = ko.
}
	

$(document).ready(function() {
	
	window.vm = new viewModel();
	ko.applyBindings(vm, document.getElementById("main"));
	
    $(document).foundation();
    
    //window.location.href="/autoLogin";
    
/*	$(document).foundation('abide', {
		patterns : {
			shortpass : /.{6,}/,
			shortuser : /.{3,}/,
		},
	}); */

});
	