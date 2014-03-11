function ControllerProxy() {
    var self = this;

    // *** Call a wrapped object
    self.post = function (url, type, data, callback, error, anyway) {

        var json;
        if (data != null) {
//            json = JSON.stringify(data);
			json = data;
        } else {
            json = null;
        }

        // *** The service endpoint URL

        $.ajax({
            url: url,
            data: json,
            type: type,
            timeout: 10000,
            dataType: "json"
        }).done(function (res) {
			if (!callback) return;
			callback(res);
			return;
        }).fail(function (xhr, res) {
			var responseTextErr = xhr.responseText;
			if (responseTextErr) {

				if (error) error(responseTextErr);
				else {
					console.log(error);
					//alert('FAIL', responseTextErr);
				}

			}
			return;
		}).always(function() {
			if (anyway) anyway();
		});
    };
}


var sqEventProxy = function() {
	var self = this;
	self.proxy = new ControllerProxy();

	self.getUserlist = function(data, done, fail, always) {
		self.proxy.post('/users', 'GET', data, done, fail, always);
	}

	self.saveGameScores = function(data, done, fail, always) {
		self.proxy.post('/startMatch', 'POST', data, done, fail, always);
	}

	self.updateGameScores = function(data, done, fail, always) {
		self.proxy.post('/updateMatch', 'POST', data, done, fail, always);
	}

	self.getMatchList = function(data, done, fail, always) {
		self.proxy.post('/getMatches', 'GET', data, done, fail, always);
	}

	self.login = function(data, done, fail, always) {
		self.proxy.post('/login', 'POST', data, done, fail, always);
	}

	self.addUser = function(data, done, fail, always) {
		self.proxy.post('/adduser', 'POST', data, done, fail, always);
	}

	self.startMatch = function(data, done, fail, always) {
		self.proxy.post('/startGame', 'POST', data, done, fail, always);
	}

	self.logout = function(data, done, fail, always) {
		self.proxy.post('/logout', 'POST', data, done, fail, always);
	}

	self.ranking = function(data, done, fail, always) {
		self.proxy.post('/ranking', 'GET', data, done, fail, always);
	}

	self.events = function(data, done, fail, always) {
		self.proxy.post('/events', 'GET', data, done, fail, always);
	}

	self.addToRanking = function(data, done, fail, always) {
		self.proxy.post('/addToRanking', 'POST', data, done, fail, always);
	}

	self.getRankings = function(data, done, fail, always) {
		self.proxy.post('/getRankings', 'GET', data, done, fail, always);
	}

	self.updateRankinglist = function(data, done, fail, always) {
		self.proxy.post('/updateRankings', 'POST', data, done, fail, always);
	}
	self.getMonthMatches = function(data, done, fail, always) {
		self.proxy.post('/monthMatches', 'GET', data, done, fail, always);
	}

	self.getActiveEvents = function(data, done, fail, always) {
		self.proxy.post('/getActiveEvents', 'GET', data, done, fail, always);
	}

	self.createEvent = function(data, done, fail, always) {
		self.proxy.post('/createEvent', 'POST', data, done, fail, always);
	}

	self.getMatchesForEvent = function(data, done, fail, always) {
		self.proxy.post('/getMatchesForEvent', 'POST', data, done, fail, always);
	}

	self.getMatchesByPlayer = function(data, done, fail, always) {
		self.proxy.post('/getMatchesByPlayer', 'POST', data, done, fail, always);
	}

	self.getSession = function(data, done, fail, always) {
		self.proxy.post('/getSession', 'GET', data, done, fail, always);
	}

	self.updateEvent = function(data, done, fail, always) {
		self.proxy.post('/updateEvent', 'POST', data, done, fail, always);
	}

	self.getAllEvents = function(data, done, fail, always) {
		self.proxy.post('/getAllEvents', 'GET', data, done, fail, always);
	}

	self.getClubs = function(data, done, fail, always) {
		self.proxy.post('/getClubs', 'GET', data, done, fail, always);
	}

	self.addClub = function(data, done, fail, always) {
		self.proxy.post('/addClub', 'POST', data, done, fail, always);
	}
	self.getPlayersByClub = function(data, done, fail, always) {
		self.proxy.post('/getPlayersByClub', 'POST', data, done, fail, always);
	}

	self.getMatchesByClub = function(data, done, fail, always) {
		self.proxy.post('/getMatchesByClub', 'POST', data, done, fail, always);
	}

	self.checkOldPass = function(data, done, fail, always) {
		self.proxy.post('/checkPass', 'POST', data, done, fail, always);
	}

	self.changePassword = function(data, done, fail, always) {
		self.proxy.post('/changePassword', 'POST', data, done, fail, always);
	}

	self.saveRankingList = function(data, done, fail, always) {
		self.proxy.post('/saveRankingList', 'POST', data, done, fail, always);
	}

	self.getPastEvents = function(data, done, fail, always) {
		self.proxy.post('/getPastEvents', 'GET', data, done, fail, always);
	}

	self.getPastRankings = function(data, done, fail, always) {
		self.proxy.post('/getPastRankings', 'GET', data, done, fail, always);
	}

	self.generateRankingList = function(data, done, fail, always) {
		self.proxy.post('/generateRankingList', 'GET', data, done, fail, always);
	}

	self.getAllUsers = function(data, done, fail, always) {
		self.proxy.post('/getAllUsers', 'GET', data, done, fail, always);
	}

	self.getAltRankings = function(data, done, fail, always) {
		self.proxy.post('/getAltRankings', 'GET', data, done, fail, always);
	}

	self.createComment = function(data, done, fail, always) {
		self.proxy.post('/createComment', 'POST', data, done, fail, always);
	}

	self.getComments = function(data, done, fail, always) {
		self.proxy.post('/getComments', 'GET', data, done, fail, always);
	}

	self.getDroppedMatches = function(data, done, fail, always) {
		self.proxy.post('/getDroppedMatches', 'GET', data, done, fail, always);
	}

	self.generateRankingArchive = function(data, done, fail, always) {
		self.proxy.post('/generateRankingArchive', 'GET', data, done, fail, always);
	}

};

moment.lang('fi');

var sqEventProxy = new sqEventProxy;
