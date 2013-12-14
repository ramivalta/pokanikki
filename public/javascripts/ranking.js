function viewModel() {
	var self = this;
	
	self.title = ko.observable("Seuraranking - Laajavuori Squash - Pokanikki");
	
	self.matchList = ko.observableArray([]);
	self.sessionuser = ko.observable();
	self.activePage = ko.observable("ranking");
	self.rankingList = ko.observableArray();
	
	self.visiblePage = ko.observable("current");
	self.oldRankings = ko.observableArray();
	self.session = ko.observable();
	self.historySlider = ko.observable(1);
	
	self.oldRankingList = ko.observableArray();
	self.oldRankingDate = ko.observable();
	self.oldRankingFirstDate = ko.observable();
	self.oldRankingLastDate = ko.observable();
	
	self.sliderVis = ko.observable(false);
	
	self.historySliderMove = function() {
		var v = self.historySlider() - 1;
		ko.mapping.fromJS(self.oldRankings()[v].ranking, {}, self.oldRankingList);
		self.oldRankingDate(self.oldRankings()[v].date());
	}
	

	
	self.filteredMatches = ko.observableArray();

	var tempdate;	
	self.filterMatches = ko.computed(function() {
		var f = moment(self.oldRankingDate()).format('MM');
		//var matches = new Array();

		if(f !== tempdate) {
			var filt = ko.utils.arrayFilter(self.matchList(), function(item) {
				/* console.log("item date: " + moment(item.endTime()).format('MM'));
				console.log(self.oldRankingDate());
				console.log("selected date: " + f); */
				tempdate = f;
				return moment(item.endTime()).format('MM') == f;
			});

			//ko.mapping.fromJS(matches, {}, self.filteredMatches);
			//self.filteredMatches.valueHasMutated();
			self.filteredMatches([]);
			self.filteredMatches.push.apply(self.filteredMatches, filt);

		}

	}).extend({ throttle: 250 });
	

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

	self.matchListLabel = ko.computed(function() {
		var label = moment(self.oldRankingDate()).format('MMMM') + "n" + " " + "pelit";
		return label;
	});
	
	self.tooltipVisible = function() {
		$('#tooltip').css('visibility', 'visible');
	}

	self.noOfGames = function(player_id) {
		var count = 0;
		for(var i = 0; i < self.filteredMatches().length; i++) {
			if(self.matchList()[i].playerOneId() == player_id() || self.matchList()[i].playerTwoId() == player_id()) {
				count++;
			}
		}
		
		return count;
	}
	
	self.gamesVsDifferentOpponents = function(player_id) {
		var old = [];
		for(var i = 0; i < self.filteredMatches().length; i++) {
			if(self.filteredMatches()[i].playerOneId() == player_id()) {
				if(_.contains(old, self.filteredMatches()[i].playerTwoId()) == false) 
				{
					old.push(self.filteredMatches()[i].playerTwoId());
				}
			}
			else if (self.filteredMatches()[i].playerTwoId() == player_id()) {
				if(_.contains(old, self.filteredMatches()[i].playerOneId()) == false) 
				{
					old.push(self.filteredMatches()[i].playerOneId());
				}
			}
		}
		return old.length;
	}	
	
	self.loadProfile = function(id) {
		window.location.href=('/profile/' + id());
	}
	
	self.toggleHistory = function() {
	//	var el = event.currentTarget;
		//var s = $(el).nextAll('.gameScores:first');
		
		var el = $('#sliderContainer');

		if (el.is(":hidden")) {

			el.transition( {
				perspective: '1000',
				opacity: '0',
				height: '0px',
				duration: '0',
				complete: function() {
					self.sliderVis(true);				
					el.css('display', 'block');
				}
			}).transition( {
				perspective: '1000',
				duration: '250',
				height: 'auto',
			}).transition( {
				opacity: '1',
				duration: '250',
			});
		}
		else {
			el.transition( {
				perspective: '1000',
				opacity: '0',
				duration: '250',
				height: '0',
				complete: function() {
					self.sliderVis(false);
					el.css('display', 'none');
				}
			});
		}
	}
	
	
	/*function getRankings() {
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
	
	getRankings(); */
	
	self.getPastRankings = function() {
		var data;
		sqEventProxy.getPastRankings(
			{data:data},
			function(data) {
				//console.log(data.rankings.length);
				var l = data.rankings.length;
				ko.mapping.fromJS(data.rankings, {}, self.oldRankings);
				self.oldRankingFirstDate(moment(data.rankings[0].date).format('DoMo'));
				self.oldRankingLastDate(moment(data.rankings[l-1].date).format('DoMo'));
				
				$('#historySlider').slider( { value: l, min: 1, max: l, step : 1, animate: 'true' });
				
				ko.mapping.fromJS(data.rankings[l-1].ranking, {}, self.oldRankingList);
				
				self.oldRankingDate(data.rankings[l-1].date);
				//.format('dddd, DoMoYYYY'));
			}
		);
	}
	
	self.getPastRankings();
	
	
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
			});
			
			//s.slideDown("fast");
		}
	}
	
	ko.bindingHandlers.uislider = {
	
		init: function (element, valueAccessor, allBindingsAccessor) {
			var options = allBindingsAccessor().sliderOptions || {};
			
			//$(element).slider(options);
			
			$(element).slider( { value: 0, min: 0, max: 50, step : 1, animate: 'true' });
			
	//		$(element).slider( { animate: 'slow' });

			ko.utils.registerEventHandler(element, "slidechange", function (event, ui) {
				var observable = valueAccessor();
				observable(ui.value);
				//console.log("slidechanged");
				
			});
			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				$(element).slider("destroy");
			});
			ko.utils.registerEventHandler(element, "slide", function (event, ui) {
				//console.log("slide event fired");
				var observable = valueAccessor();
				observable(ui.value);
				var value = ko.unwrap(observable);
				$(element).slider('value', value);
			});
			
			ko.utils.registerEventHandler(element, "slidestop", function (event, ui) {
				//console.log("slider stopped");
				var observable = valueAccessor();
				observable(ui.value);
			});

			/* var obs  = valueAccessor();
			var value = ko.unwrap(obs);
			
			console.log(obs);
			
			console.log(value);
			
			obs.subscribe(function(value) {
				if (isNaN(value)) value = 0;
				console.log("herpderp");
				$(element).slider('option', 'value', value);
				obs(value);
			}); */
		},
		/*update: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			console.log(value);			
			if (isNaN(value)) {
				console.log("slider was Nan");
				//value = 0;
			}
			
			valueUn.subscribe(function(valueUn) {
				$(element).slider('option', 'value', valueUn.value); 		
			});
			
			//$(element).slider("value", value);
		} */
	};	
	
	
	
    
}
	

$(document).ready(function() {
	window.vm = new viewModel();
	ko.applyBindings(vm, document.getElementById("main"));
    $(document).foundation();
});
	