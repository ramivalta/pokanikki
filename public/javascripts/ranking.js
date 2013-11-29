function viewModel() {
	var self = this;
	
	self.matchList = ko.observableArray([]);
	self.sessionuser = ko.observable();
	self.activePage = ko.observable("ranking");
	self.rankingList = ko.observableArray();
	
	self.wholesession = ko.observable();

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
			
	self.rankingDate = ko.observable();
	
	
	function getRankings() {
		var data;
		sqEventProxy.getRankings(
			{ data:data },
			function(data) {
				if(data.message !== "ranking empty") {
					//console.log(data);
					ko.mapping.fromJS(data[0].ranking, {}, self.rankingList);
					self.rankingList.sort(function(a, b) {
						var key1 = a.rank();
						var key2 = b.rank();
						if (key1 < key2) return -1;
						if (key1 > key2) return 1;
						return 0;
					});
					self.rankingDate(moment(data[0].date).format('dddd, DoMoYYYY'));
				}
			}
		);
	}
	
	getRankings();	
	
	function getMatches() {
		var data;
		sqEventProxy.getMonthMatches(
			{ data: data },
			function(data) {
				ko.mapping.fromJS(data.scores, {}, self.matchList);
			}
		);
	}
	
	getMatches();
	

	/* function getSessionData() {
		var data;
		sqEventProxy.getSession(
		{ data:data },
			function(data) {
				if (data.message == "not logged in") {
					self.session("not logged in");
				}
				else {
					self.session( {
						name		: ko.observable(data.session.name),
						_id 		: ko.observable(data.session._id),
						hotness 	: ko.observable(data.session.hotness),
						club 		: ko.observable(data.session.club),
						rank 		: ko.observable(data.session.rank),
						username 	: ko.observable(data.session.username),
					});
				}				
			}
		);
	}
	getSessionData(); */


	

  
/*    function getSession() {
    	var data;
    	sqEventProxy.getSession(
    	{ data:data },
    		function(data) {
    			ko.mapping.fromJS(data.session.user, {}, self.session);
    			console.log("name : " + data);
    			console.log(self.session().name());
    		}
    	);
    }
    
    getSession(); */
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
    
}
	

$(document).ready(function() {
	window.vm = new viewModel();
	ko.applyBindings(vm, document.getElementById("main"));
    $(document).foundation();
});
	