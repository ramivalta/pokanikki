var RANKING_PERIOD = 60; // päivää

var _ = require('lodash');

exports.index = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);

	req.session.lastPage = "/";
	res.render('index', { title: 'Sisäänkirjautuminen - Pokanikki '});
}

exports.clubs = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);

	req.session.lastPage = "/seurat";
	res.render('clubs', { title: 'Seurat - Pokanikki' });
	//res.render('index', { title: 'Hello' });
}

exports.autoLogin = function(db) {
	return function(req, res) {

		var ref = req.session.lastPage;
		console.log(ref);

		var collection = db.get('users');
		if (req.cookies.username !== undefined && req.cookies.password !== undefined) {
			var username = req.cookies.username;
			var password = req.cookies.password;
			var auto = true;

			login(username, password, collection, auto, function(e, o) {
				if (e) {
					//res.send( { "message" : e });
					// redirect to last page?
					if(ref === "application")
						res.redirect("/application");
					else if (ref !== undefined) {
						if(ref === "/application")
							res.redirect('/application#login');
						else
							res.render(ref); }
					else
						res.redirect('/');
				}
				else {

					var club_id = o.club;

					var clubs = db.get("clubs");
					clubs.findOne({ _id: club_id}, {}, function(e, doc) {
						if (doc) {
							o.clubName = doc.name;
							o.clubShort = doc.nameShort;

						}

						console.log("autologged in");
						req.session.user = o;

						res.send( { "message" : "OK", "session" : req.session });
						if (ref !== undefined) {
							console.log(req.session.lastPage);
							res.redirect(ref); // lastpage, req.path?
						}
						else {
							res.redirect('/profile');

						}
					});
				}
			});
		}
		else {
			console.log("refff");
			console.log(ref);
			if (ref === "/application")
				res.redirect("/application#login");
			else
				res.redirect('/');
		}
	}

	//res.render('index', { title: 'Hello' });
}

exports.home = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);

	req.session.lastPage = "/home";
	res.render('home', { title: 'Pokanikki' });
}

exports.events = function(db) {
	return function(req, res) {
		res.header("Cache-Control", "no-cache, no-store, must-revalidate");
		res.header("Pragma", "no-cache");
		res.header("Expires", 0);

		req.session.lastPage = "/events";

		if(req.params.id !== undefined) {
			var id;
			var match_id = null;
			var events = db.get('events');
			id = req.params.id;

			events.findOne( { _id: id }, {}, function(e, event) {
				if(event) {
					res.jshare.event = event;

					if(req.params.match_id !== undefined) {
						var match_id = req.params.match_id;
						console.log(match_id);
						res.jshare.match_id = match_id;
					}
				}

				res.render('events');
				//, { title: 'Tapahtumat - Pokanikki' });
					//res.send({ "message" : "not found"});
			});
		}
		else res.render('events', { title: 'Tapahtumat - Pokanikki' });
	}
}


exports.sup = function(req, res) {
	res.render('sup', { title: 'Sup, World' });
}

//		collection.find( { endTime : { $exists : true }}, {limit: 180, sort: {


exports.users = function(db) {
	return function(req, res) {
		var collection = db.get('users');
		collection.find( { rank : { $exists: true, $ne: null }},{ fields: { password: 0 }}, function(e, docs) {
			res.send(docs);
//			res.json(docs);
		});
	};
}

exports.getAllUsers = function(db) {
	return function(req, res) {
		var  col = db.get('users');
		col.find( {}, { fields: { password: 0 }}, function(e, docs) {
			if(docs) {
				res.send(docs);
			}
		});
	}
}

exports.getPlayersByClub = function(db) {
	return function(req, res) {
		var users = db.get('users');
		var club_id = req.body.club_id;
		users.find( { club : club_id, rank: { $exists: true, $ne: null}}, { fields: { password :0 }}, function(e, docs) {
			if (docs) {
				res.send({"players" : docs});
			}
		});
	}
}

exports.updateMatch = function(db) {
	return function(req, res) {
		var collection = db.get('matches');

		console.log(req.body.id);
		var id = req.body.id;

		req.body.addedBy = req.session.user._id;
		req.body.addedByName = req.session.user.username;


		if (req.body.endTime == "now") {
			console.log("updating endtime");
			req.body.endTime = moment().toJSON();
		}

		collection.update( { _id: id }, req.body, { upsert : true },
			function(err, doc) {
				if (err) {
					console.log("problem updating " + err);
				}
				else {
					res.send( {"message" : "OK" });
				}
			}
		);
	}
}

exports.startMatch = function(db) {
	return function(req, res) {
		var collection = db.get('matches');
		var id;

		var doc = req.body;

		var date = moment().toJSON();
		//var date = moment("August 26, 1980 23:30:00").toJSON();

		doc.startTime = date;
		//moment(date).format('MMMM Do YYYY, HH:mm:ss');

		if (req.body.form == 'true')
			doc.endTime = date;

		doc.addedBy = req.session.user._id;
		doc.addedByName = req.session.user.username;

		collection.insert(req.body,
			function(err, doc) {
				if (err) {
					console.log("error?");
					res.send({ "message" : "db" });
				}
				else {
//					var doc = collection.find(req.body);
					console.log(doc);
					var id = doc._id;
					var startTime = doc.startTime;
					var event_id = doc.event_id;
//					console.log(id);
//
					res.send({ "id": id, "startTime" : startTime, "event_id" : event_id, "message" : "OK" });
				}
			}
		);
	}
}

exports.getActiveEvents = function(db) {
	return function(req, res) {
		var events = db.get('events');

		var date = moment().toJSON();

		events.find( { endDate : { $gte : date  }, startDate : { $lte : date }}, { sort : { startDate: -1}}, function(e, docs) {
			if(e) {
				console.log(e);
			}

			if (docs) {
				res.send({ "events" : docs });
			}
		});
	}
}

exports.getAllEvents = function(db) {
	return function(req, res) {
		var events = db.get('events');

		events.find( {}, { sort: { startDate: -1}}, function(err, docs) {
			if(docs) {
				res.send( { "events" : docs });
			}
			else if (err) {
				console.log(err);
			}

		});
	}
}

exports.getPastEvents = function(db) {
	return function(req, res) {
		// hakee käynnissä olevat ja loppuneet eventit

		var events = db.get('events');

		var date = moment().toJSON();

		var list;

		events.find( { startDate : { $lte : date }, endDate : { $gte : date }}, {sort: { startDate: -1}}, function(e, current) {
			if(current) {
				//list.push(current);

				events.find( { endDate : { $lt : date }}, { sort : { startDate: -1 }}, function(e, past) {
					if(past) {
						//list.push(past);
						res.send({"current" : current, "past" : past });
					}
				});
				//res.send({"events" : docs });
			}
			if( e) {
				console.log(e);
			}
		});
	}
}

exports.createEvent = function(db) {
	return function(req, res) {
		var events = db.get('events');

		var event = req.body;
		var now = moment().toJSON();
		event.creationDate = now;
		//event.affectsRanking = req.body.affects;


		events.insert(event, { safe : true }, function(e, docs) {
			if (!e) {
				res.send( { "message" : "OK" });
			}
		});

	}
}

exports.updateEvent = function(db) {
	return function(req, res) {
		var events = db.get('events');

		var event = req.body.event;

		events.update( { _id: event._id }, event, { upsert : true }, function(err, doc) {
			if (doc) {
				res.send( { "event" : event });
			}
			else if (err) {
				console.log(err);
			}
		});
	}
}

exports.createComment = function(db, sanitizer) {
	return function(req, res) {
		var comments = db.get('comments');

		var com = req.body;

		var now = moment().toJSON();

		com = {comment : sanitizer.sanitize(com.comment), match_id : com.match_id, author: com.author, date : now };

		console.log(com);

		comments.insert(com, { safe : true }, function(e, docs) {
			if (!e) {
				res.send({'comment' : com, 'message' : 'OK' });
			}
		});
	}
}

exports.getComments = function(db) {
	return function(req, res) {
		var comments = db.get('comments');

		comments.find({}, {}, function(e, docs) {
			if(docs) {
				res.send({'comments' : docs });
			}
		});
	}
}

exports.profile = function(db) {
	return function(req, res) {
		res.header("Cache-Control", "no-cache, no-store, must-revalidate");
		res.header("Pragma", "no-cache");
		res.header("Expires", 0);


		if(req.params.id !== undefined || req.session.user !== undefined) {
			req.session.lastPage = "/profile";
			var id;
			var users = db.get('users');

			if(req.params.id == undefined) {
				id = req.session.user._id;
			}
			else {
				id = req.params.id;
			}
			console.log("params id: " + id);


			users.findOne( { _id: id }, { fields: { password: 0 }}, function(e, prof) {
				if(prof) {
					var club_id = prof.club;
					var name = prof.name;

					var clubs = db.get("clubs");
					clubs.findOne({_id: club_id}, {}, function(e, doc) {
						if (doc) {
							prof.clubName = doc.name;
							prof.clubShort = doc.nameShort;

							//req.session.profile = prof.name;
							req.session.pid = id;

							res.jshare.profile = prof;

							//console.log(req.session.profile);
							var title = "Profiili - " + name + " - Pokanikki";

							res.render('profile', { title: title });
						}

					});
				}
			});
		}
		else {
			req.session.pid = undefined;
			res.redirect('/seurat');
		}
	}
}

/* exports.getProfile = function(db) {
	return function(req, res) {
		var id = req.body.id;
		console.log(id);
		var users = db.get('users');

		users.findOne( { _id: id }, { fields: { password: 0 }}, function(e, prof) {
			if(prof) {
				var club_id = prof.club;

				var clubs = db.get("clubs");
				clubs.findOne({_id: club_id}, {}, function(e, doc) {
					if (doc) {
						prof.clubName = doc.name;
						prof.clubShort = doc.nameShort;
					}
					res.send(prof);
				});
			}
		});
	}
} */

exports.admin = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);


	if (req.session.user == undefined) {
		res.redirect('/home');
		return;
	}
	else if (req.session.user.username !== "rtv") {
		res.render('req.session.lastPage');
		return;
	}
	req.session.lastPage = "/admin";
	res.render('admin', { title: 'Ylläpitäjän alue - Pokanikki' });
}



exports.newgame = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);


	req.session.lastPage = "/newgame";
	res.render('newgame', { title: 'Uusi peli - Pokanikki' } );
}

exports.getMatches = function(db) {
	return function(req, res) {
		var collection = db.get('matches');

		collection.find( { endTime : { $exists : true }}, {limit: 180, sort: { startTime: -1 }}, function(e, docs) {
			if (docs)
				res.send({"scores" : docs });
			if(e)
				console.log(e);
		});
	}
}

exports.getMatchesByClub = function(db) {
	return function(req, res) {
		var club_id,  matches, clubShort, period, date;
		clubShort = req.body.clubShort;
		var date = moment();
		if (req.body.period == 'ranking') {
			period = RANKING_PERIOD;
			date = date.subtract('days', period).startOf('day').toJSON();
		}

		else {
			date = date.subtract('days', 180).startOf('day').toJSON();
		}

		var clubs = db.get('clubs');

		clubs.findOne({ nameShort : clubShort}, {}, function(e, doc) {
			if(doc) {
				console.log(doc),
				matches = db.get('matches');
				club_id = String(doc._id);

				matches.find({ endTime : { $gte : date}, $and: [{playerOneClub : club_id }, {playerTwoClub : club_id }]}, { sort: { startTime : -1 }}, function(err, docs) {
					if(docs) {
						//console.log(docs);
						res.send({"scores" : docs });
					}
				});
			}
		});
	}
}

exports.monthMatches = function(db) {
	return function(req, res) {

		var mom = moment.utc();
		var start = mom.startOf('month').toJSON();
		var end = mom.endOf('month').toJSON();

		var col = db.get('matches');

		col.find({ endTime : { $exists : true }, startTime : { $gte: start, $lte: end }}, { sort: { startTime : -1 }}, function(err, docs) {
			if (err) console.log("error ", + e);
			else if (docs) {
				res.send( {"scores" : docs });
			}
			else {
				res.send({ "message" : "no games" });
			}
		});
	}
}

exports.getMatchesForEvent = function(db) {
	return function(req, res) {
		var event_id = req.body.event_id;

		var matches = db.get('matches');

		matches.find({ event_id : event_id, endTime : { $exists : true }}, { sort: { startTime : -1 } }, function(err, docs) {
			if (docs) {
				res.send({ "scores" : docs });
			}
			if (err) console.log(err);

		});
	}
}

exports.getMatchesByPlayer = function(db) {
	return function(req, res) {
		var player_id = req.body.player_id

		var matches = db.get('matches');

		matches.find({ endTime : { $exists : true },
			$or: [{playerOneId : player_id }, {playerTwoId : player_id }]},
			{ sort: { startTime : -1 }},
			function(err, docs) {
				if (docs) {
					//console.log(docs),
					res.send( { "scores" : docs });
				}
				else {
					res.send({ "message" : "no games" });
				}
		});
	}
}

/* exports.getSession = function(req, res) {
	var ses = req.session.user;

	console.log("tryibg to get session");

	if (ses === undefined)
		res.send ({ "message" : "not logged in" });
	else {
		console.log(ses.username);
		console.log(ses);
		res.send({ "session" : ses });
	}
} */

exports.application = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);


	req.session.lastPage = "/application";
	res.render('application', { title: 'Tuomarointisovellus - Pokanikki' });
}

exports.newuser = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);


	req.session.lastPage = "/newuser";
	res.render('newuser', { title: 'Rekisteröityminen - Pokanikki '});
}

exports.ranking = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);


	req.session.lastPage = "/ranking";
	res.render('ranking', { title: 'Seuraranking - Pokanikki' });
}

exports.addToRanking = function(db) {
	return function(req, res) {
		//var collection = db.get('ranking');
		var player = req.body.player;
		//player.rank = parseInt(req.body.rank);
		//player.hotness = req.body.hotness;

		var ranking = db.get('users');

		ranking.findOne({ _id : player._id}, function(e, o) {
			if (o) {
				res.send({ "message" : "player already added" });
				ranking.update({ _id: player._id}, { $set: { rank: parseInt(player.rank), hotness: player.hotness, club: player.club } }, { upsert: true}, function(e, o) {

				});
			}
		});
	}
}

exports.changePassword = function(db) {
	return function(req, res) {
		var user_id = req.body.user_id;
		var password = req.body.password;

		var users = db.get('users');

		users.findOne({ _id : user_id}, function(e, o) {
			if (o) {

				saltAndHash(password, function(hash) {
					var pass = hash;
					users.update({ _id: user_id}, { $set: { password: pass }}, function(e) {
					if(!e) {
						res.send({ "message" : "OK"});
					}
					});
				});
			}
		});
	}
}

exports.checkPass = function(db) {
	return function(req, res) {
		var password = req.body.password;
		var id = req.body.user_id;

		var users = db.get('users');

		users.findOne({ _id: id }, function(e, o) {
			if (o) {
	//			console.log(o[0].password);
				validatePassword(password, o.password, function(err, ok) {
					if (ok) {
						res.send({ "message" : "OK"});
					}
					else {
						res.send({ "message" : "fail"});
					}
				});
			}
		})
	}
}

exports.getRankings = function(db) {
	return function(req, res) {
		var rankings = db.get('rankings');

		rankings.find( {}, {sort: { date: -1 }, fields: { password: 0, email: 0 }, limit : 1 }, function(e,docs) {
			if(docs.length == 0) {
				res.send({'message' : 'ranking empty'});
			}
			else if(docs.length > 0) {
				res.send( docs );
			}
		});
	}
}

exports.getPastRankings = function(db) {
	return function(req, res) {
		//var rankings = db.get('newRanking');
		var rankings = db.get('rankings');

		rankings.find( {}, {sort: { date: 1}, fields: { password: 0, email : 0 }}, function(e, docs) {
			if(docs.length > 0) {
				res.send({'rankings' : docs });
			}
		});
	}
}

exports.getAltRankings = function(db) {
	return function(req, res) {
		var rankings = db.get('newRanking');
		//var rankings = db.get('rankings');

		rankings.find( {}, {sort: { date: 1}, fields: { password: 0, email : 0 }}, function(e, docs) {
			if(docs.length > 0) {
				res.send({'rankings' : docs });
			}
		});
	}
}




exports.saveRankingList = function(db) {
	return function(req, res) {
		var rankings = db.get('rankings');
		var list = {};
		list.ranking = req.body.rankings;

		for(var i = 0; i < list.ranking.length; i++) {
			list.ranking[i].rank = parseInt(list.ranking[i].rank);
		}

		var date = new moment().toJSON();
		list.date = date;
		rankings.insert(list, function(e, d) {
			if (!e) {
				console.log("ranking list saved");
				res.send({'message' : 'OK', 'date' : date });

			}
		});
	}
}

exports.getClubs = function(db) {
	return function(req, res) {
		var clubs = db.get('clubs');

		clubs.find( {}, {}, function(e, docs) {
			if(docs) {
				res.send({ "clubs" : docs });
			}
		});
	}
}

exports.addClub = function(db) {
	return function(req, res) {
		var clubs = db.get('clubs');
		var club = req.body.club;
		var clubShort = req.body.clubShort;

		var ins = {};
		ins.name = club,
		ins.nameShort = clubShort;

		if(!club) return;

		clubs.insert(ins, function(e) {
			if (!e) {
				res.send({ "message" : "OK" });
			}
		});
	}
}

exports.updateRankinglist = function(db) {
	return function(req, res) {
		//var ranking = req.body.rankings;
		var users = db.get('users')

		var w = req.body.winner;
		var l = req.body.loser;

		//var rankingsystem = "old";
		var rankingsystem = "new";
		// update new ranking

		var rankingArchive = db.get('rankingArchive');

		var newranking = db.get('newRanking');

		newranking.find({}, { sort: { date : -1 }, limit : 1}, function(e, doc) {
			if (doc) {

				var list = doc[0].ranking;
				var prev = JSON.parse(JSON.stringify(doc[0].ranking));

				var winner, loser, res;
				for (var i = 0; i < list.length ; i++) {
					if (list[i]._id == w._id) {
						winner = list[i];
					}
					if (list[i]._id == l._id) {
						loser = list[i];
					}
				}

				res = calcPoints(winner, loser);

				var sorted = list.sort(function(a, b) {
					var k1 = a.points;
					var k2 = b.points;
					if (k1 < k2) return 1;
					if (k1 > k2) return -1;
					return 0;
				});

				function getHotness(prev, sorted) {
					var l;
					if(typeof prev != "undefined") {
						l = calcHotCold(prev, sorted);
					}
					else {
						for(var k = 0; k < sorted.length; k++) {
							sorted[k].rank = k+1;
						}
						l = sorted;
					}
					return l;
				}

				list = getHotness(prev, list);

				var rankinglist = [];
				var r = { ranking : [] };
				rankinglist.push(r);
				rankinglist[0].ranking = list;
				rankinglist[0].date = new moment().toJSON();

				users.find( { rank: { $ne : null }}, { sort: { rank: 1}, fields: { password: 0, email: 0, lastLogin: 0, addedDate: 0, username: 0 }}, function(err, docs) {
					if (users) {
						console.log("looking for user");
						console.log(docs.length);
						console.log(list.length);
						for(var i = 0; i < list.length; i++) {
							for(var o = 0; o < docs.length; o++) {
								//console.log(list[i]._id);
								//console.log(users[o]._id);
								if (String(list[i]._id) == String(docs[o]._id)) {
									console.log("found user to update");
									users.update ( { _id: list[i]._id }, { $set: { rank : list[i].rank  }}, {}, function(e, doc) {
										//
										}
									);
								}
							}
						}
					}
				});

				newranking.insert(rankinglist, function(e, doc) {
					if (doc) {
						console.log(doc);
						console.log("list inserted");
					}
					if (e) console.log(e);
				});

				rankingArchive.insert(rankinglist, function(e, doc) {
					if (doc) {
						console.log(doc);
						console.log("list inserted to archive");
					}
					if (e) console.log(e);
				});


			}
		});

			//res.send({ "message": "OK" });


		//updateNewRanking();



		// update old ranking
		/*
			users.findOne({ _id: w._id }, function(e, winner) {
				if(winner) {
					console.log("found winner");
					users.findOne({ _id: l._id }, function(e, loser) {
						if (loser) {
							console.log("found loser");
							if (loser.rank < winner.rank) {
								console.log("loser is better ranked than winner");
								var s = winner.rank - 1;
								//var s = sr.toString();
								console.log("looking for player ranked at: " + s);
								users.findOne({ rank: s }, function(e, swappee) {
									if (e) console.log(e);
									if (swappee) {
										console.log("found relevant players");
										console.log(swappee);
										var w_rank = winner.rank
										var s_rank = swappee.rank;
										winner.rank = parseInt(s_rank);
										winner.hotness = "hot";
										swappee.hotness = "cold";
										swappee.rank = parseInt(w_rank);

										users.update( { _id: winner._id}, { $set :{ rank : winner.rank, hotness : winner.hotness }}, {}, function(e, doc) {
											if (e) {
												console.log("error updating winner rank")
											}
											else {
												console.log("winner ranking updated to: " +  winner.rank);
												users.update({ _id: swappee._id}, { $set :{ rank : swappee.rank, hotness : swappee.hotness }}, {}, function(e, doc) {
													if(e) console.log("error updating swappee rank");
													else {
														console.log("swappee ranking updated to:  "+ swappee.rank);
														var userlist = db.get("users");
														var rankings = db.get("rankings");
														updateRanking(userlist, rankings);
													}
												});
											}
										});
									}
								});
							}
							else {
								console.log("no need to update ranking");

								users.update( { _id: loser._id}, { $set : { hotness : 'lukewarm' }}, {}, function(err, doc) {
										users.update( { _id: winner._id}, { $set : { hotness : 'lukewarm' }}, {}, function(err, doc) {
												var userlist = db.get("users");
												var rankings = db.get("rankings");
												updateRanking(userlist, rankings);
										});
									});
							}
						}
						else {}
					});
				}
			}); */
			//res.send({ "message": "OK" });


		//updateOldRanking();

		//res.send({"message" : "OK"});
	}

}

function updateRanking(users, rankings) {
	console.log("update raking called");

	date = new moment().toJSON();

	users.find( { rank: { $ne : null }}, { sort: { rank: 1}, fields: { password: 0, email: 0, lastLogin: 0, addedDate: 0, username: 0 }}, function(err, doc) {
		if(doc) {
			var list = {};
			list.ranking = doc;
			list.date = date;

			rankings.insert(list, function(err, doc) {
				if(doc) {
					console.log("ranking collection saved");
				}
				else {
					console.log(err);
				}
			});
		}
	});
}


exports.getDroppedMatches = function(db) {
	return function(req, res) {
		/*var matches = db.get('matches');

		var period = RANKING_PERIOD;

		var date = moment();
		var date2 = moment();

		var start = date.subtract('days', period + 1);
		start = start.startOf('day').toJSON();
		var end = date2.subtract('days', period + 1);

		end = end.endOf('day').toJSON();


		console.log(start);
		console.log(end);

		matches.find({ endTime: { $gte : start, $lte : end }}, { sort: { startTime : -1 }}, function(e, docs) {
			if(docs.length >0) {
				console.log("found matches to drop");
				res.send({'matches' : docs });

			}
			else {
				console.log("did not find matches to drop");
				res.send({'message' : 'not found' });
			}

		}); */


		var matches = getMatchesToDrop(db, function(i) { if (i.length > 0) res.send({'matches' : i }); } );

		//res.send({'matches' : matches });


	}
}

function getMatchesToDrop(db, cb) {
	var matches = db.get('matches');

	var period = RANKING_PERIOD;

	var date = moment();
	var date2 = moment();

	var start = date.subtract('days', period + 1);
	start = start.startOf('day').toJSON();
	var end = date2.subtract('days', period + 1);

	end = end.endOf('day').toJSON();


	console.log(start);
	console.log(end);

	matches.find({ endTime: { $gte : start, $lte : end }, clubShort: 'LSQ' }, { sort: { startTime : -1 }}, function(e, docs) {
		if(docs.length >0) {
			console.log("found matches to drop");
			if (cb) {
				cb(docs);
			}
			//else return docs;

		}
		else {
			console.log("did not find matches to drop");
			cb([]);
			//res.send({'message' : 'not found' });
		}

	});
}



exports.generateRankingList = function(db) {
	return function(req, res) {
		var users = db.get('users');
		var matches = db.get('matches');
		var rankingArchive = db.get('rankingArchive');

		var period = RANKING_PERIOD;
		//var dateNow = new moment().utc();
		//dateNow.subtract('days', period);

		var dateThen = new moment().utc();
		dateThen.subtract('days', period + 1);

		var dropmatch_begin = dateThen.startOf('day').toJSON();
		var dropmatch_end = dateThen.endOf('day').toJSON();

		console.log("drop match begin date : " +  dropmatch_begin);
		console.log("drop match end date : " +  dropmatch_end);



		var ranking_starting_point;

		var modranks = [];

		var m_id;

		getMatchesToDrop(db, function(docs) {
			var matches_to_drop;
			if (docs.length > 0) {
				matches_to_drop = docs;
				console.log("matches to drop: ");
				console.log(matches_to_drop);
				console.log("matches to drop length: " + matches_to_drop.length);

				var match_ids = matches_to_drop.map(function(i) { return String(i._id); });
				console.log("match_ides length: " + match_ids.length);

				rankingArchive.find({ match_id : { $in: match_ids }}, function(e, rank) {
					if(rank) {
						console.log("modranks length: " + rank.length);
						modranks = rank;
					}
					console.log("modranks: ");
					console.log(modranks);

					m_id = String(match_ids[0]);
					console.log(m_id);
					console.log(match_ids.length);

					rankingArchive.findOne( { match_id: m_id }, { sort : { date: -1 }}, function(e, list) {
						if(list) {
							console.log("found ranking starting point : ");
							console.log(list);
							ranking_starting_point = list;
						}
					});
				});
			}



			users.find( { rank: { $ne : null }}, { sort: { rank: 1}, fields: { password: 0, email: 0, lastLogin: 0, addedDate: 0, username: 0 }}, function(err, users) {
				if (users) {
					matches.find({ endTime : { $exists : true, $gt : dropmatch_end }, playerOneClub : { $exists : true }, playerTwoClub : { $exists : true}}, { sort: { startTime : 1 } }, function(err, matchlist) {
						if (matchlist) {
							/*setTimeout(function() {
								exports.generateRanking(users, matchlist, matches_to_drop, ranking_starting_point, modranks, db);
							}, 1000);*/

								exports.generateRanking(users, matchlist, matches_to_drop, ranking_starting_point, modranks, db);

						}
					});
				}
			});
		});

		res.end();
	}
}

function getModRanks(matches, db) {
	return (function() {
		var ranking = db.get('rankingArchive');
		var match_ids = matches.map(function(i) { return i._id; });

		ranking.find({ match_id : { $in: match_ids }}, function(e, rank) {
			if(rank) {
				return rank;
				//console.log(rank);
				/*console.log(rank.length);
				for(var i = 0; i < rank.length; i++) {
					rank[i].ranking.forEach(function(v) {
						if(v.pointsGained > 0) {
							var l = { _id: v._id, pointsGained : v.pointsGained };
							console.log("pushing");
							table.push(l);
							//console.log(table);
						}

					});
				};

				console.log(table);
				return table; */

			}
		});
	})(matches, db);
}

function getStartingPoint(ranking_starting_point, modtable, users) {
	return (function() {
		var point;
		console.log("modtable fed to startingpoint");
		console.log(modtable);
		if (ranking_starting_point != undefined) {
			console.log("ranking starting point well defined");
			//console.log(ranking_starting_point);

			ranking_starting_point.ranking.forEach(function(v) {
				var found = false;

				/*console.log(_.contains(modtable, String(v._id)));

				if(!_.contains(modtable, String(v._id))) {
					console.log("nulling points for: " + v.name);
					v.points = 0;
				}*/


				for(var i = 0; i < modtable.length; i++) {
					//console.log(v._id);
					//console.log(modtable[i]._id);
					if(String(v._id) == String(modtable[i]._id)) {
						console.log("not nulling: " + v.name + " " + v._id);
						found = true;
					}

					if(i == modtable.length -1 && found == false) {
						console.log("nulling points in starting point check for: ", v);
						v.points = 0;
					}
				}



				/*if(found == false) {
					console.log("nulling points in starting point check for: ", v);
					//console.log(v);
					v.points = 0;

				}*/

			});

			//userlist = ranking_starting_point.ranking;

			point = ranking_starting_point.ranking;
		}

		else {
			console.log("starting point undefined");
			var userlist = users;
			for (var z = 0; z < userlist.length; z++) {
					userlist[z].points = 0;
			}

			point = userlist;
		}
		//console.log("startpoint");
		console.log(point);
		return point;
	})(ranking_starting_point, modtable, users);

}

function getPlayerObs(player_ids, userlist, winner, loser) {
	return (function() {
		for(var o = 0; o < userlist.length; o++) {
			if(userlist[o]._id == player_ids[0]) {
				winner = userlist[o];
				//console.log(winner.points);

				if (winner.points == undefined)
					winner.points = 0;
			}
			else if (userlist[o]._id == player_ids[1]) {
				loser = userlist[o];
				if (loser.points == undefined)
					loser.points = 0;
			}

			else {
				userlist[o].pointsGained = 0;
			}
		}
		//calcPoints(winner, loser);
		return [winner, loser, userlist];
	})(player_ids, userlist, winner, loser);
}

function getPlayerIds(match) {
	return (function() {
		var winner_id, loser_id;
		if(match.p1GamesWon > match.p2GamesWon) {
			winner_id = match.playerOneId;
			loser_id = match.playerTwoId;
		}
		else {
			winner_id = match.playerTwoId;
			loser_id = match.playerOneId;
		}
		return [winner_id, loser_id];
	})(match);
}

function getHotness(prev, sorted) {
	return (function() {
		var l;
		if(typeof prev != "undefined") {
			l = calcHotCold(prev, sorted);
		}
		else {
			for(var k = 0; k < sorted.length; k++) {
				sorted[k].rank = k+1;
			}
			l = sorted;
		}
		return l;
	})(prev, sorted);
}

function deductPoints(modtable, userlist) {
	return (function() {
		modtable.forEach(function(i) {
			console.log(modtable.length);
			for(var o = 0; o < userlist.length; o++) {
				//console.log(i);
				if (String(i._id) == String(userlist[o]._id)) {
					console.log("removing points from " + userlist[o].name);
					console.log("userlist points before " + userlist[o].points);
					console.log("i pointsgained " + i.pointsGained);
					userlist[o].points = parseInt(userlist[o].points, 10) - parseInt(i.pointsGained, 10);
					console.log("userlist points after " + userlist[o].points);
				}
			}
		});
		return userlist;
	})(modtable, userlist);
}

function genRank(userlist, cur, entry) {
	return (function() {
		var end = cur.endTime;
		var match_id = cur._id;

		console.log("insert match with id: " + match_id);

		var e;
		e = { ranking :  userlist  , date : end, match_id : match_id };
		return e;
	})(userlist, cur);
}

exports.generateRankingArchive = function(db) {
	return function(req, res) {
		//var rankingArchive = db.get('rankingArchive');

		var users = db.get('users');
		var matches = db.get('matches');
		var archive = db.get('rankingArchive');
		archive.remove();

		users.find( { rank: { $ne : null }}, { sort: { rank: 1}, fields: { password: 0, email: 0, lastLogin: 0, addedDate: 0, username: 0 }}, function(err, users) {
			if (users) {
				matches.find({ endTime : { $exists : true }, playerOneClub : { $exists : true }, playerTwoClub : { $exists : true}}, { sort: { startTime : 1 } }, function(err, matches) {
					if(matches) {
						var rankinglist = [];
						for(var i = 0; i < matches.length; i++) {

							var ranking;
							var entry = {};

							match = matches[i];
							var prev, ids, players, res, win, lose, list, hotnesslist, sorted, winner, loser;

							if (i > 0) {
								ranking = rankinglist[rankinglist.length-1].ranking;
								prev = JSON.parse(JSON.stringify(rankinglist[rankinglist.length-1].ranking));
							}
							else {
								ranking = users;
								for (var z = 0; z < ranking.length; z++) {
									ranking[z].points = 0;
								}
							}

							var player_ids = getPlayerIds(match);

							var players = getPlayerObs(player_ids, ranking, winner, loser);
							var p = calcPoints(players[0], players[1]);
							winner = p[0];
							loser = p[1];

							var sorted = ranking.sort(function(a, b) {
								var k1 = a.points;
								var k2 = b.points;
								if (k1 < k2) return 1;
								if (k1 > k2) return -1;
								return 0;
							});

							ranking = getHotness(prev, ranking);
							var list = JSON.parse(JSON.stringify(genRank(ranking, match)));
							rankinglist.push(list);


							/*archive.insert(list, function(e, doc) {
								if(doc) console.log("inserted");
							});*/

							//insertToArchive(list, db);
						}
					}
				});
			}
		});

		res.end();
	}
}


exports.generateRanking = function (users, matches, matches_to_drop, ranking_starting_point, modranks, db) {

	var r = db.get('newRanking');
	r.remove();

	var modtable = [];

	for(var i = 0; i < modranks.length; i++) {
		console.log(modranks.length);
		modranks[i].ranking.forEach(function(v) {
			if(v.pointsGained > 0) {
				var l = { _id: v._id, pointsGained : v.pointsGained };
				console.log("pushing");
				modtable.push(l);
				//console.log(table);
			}
		});
	};

	console.log(modtable);


	var rankinglist = [];
	var derpinglist = [];

	for(var i = 0; i < matches.length; i++) {

		(function() {
			var match = matches[i];
			var win_id, lose_id;

			//var userlist = getStartingPoint(ranking_starting_point, modtable);

			var ranking;
			var entry = {};

			var prev, ids, players, res, win, lose, list, hotnesslist, sorted, winner, loser;

			if (i > 0) {
				ranking = rankinglist[rankinglist.length-1].ranking;
				prev = JSON.parse(JSON.stringify(rankinglist[rankinglist.length-1].ranking));
			}
			else {
				ranking = getStartingPoint(ranking_starting_point, modtable, users);
			}


			var player_ids = getPlayerIds(match);


			var players = getPlayerObs(player_ids, ranking, winner, loser);
			var p = calcPoints(players[0], players[1]);
			winner = p[0];
			loser = p[1];

			if(i == matches.length -1) {
				ranking = deductPoints(modtable, ranking);

				(function() {
					var users = db.get('users');
					users.find( { rank: { $ne : null }}, { sort: { rank: 1}, fields: { password: 0, email: 0, lastLogin: 0, addedDate: 0, username: 0 }}, function(err, docs) {
						if (users) {
							console.log("looking for user");
							console.log(docs.length);
							for(var i = 0; i < ranking.length; i++) {
								for(var o = 0; o < docs.length; o++) {
									//console.log(list[i]._id);
									//console.log(users[o]._id);
									if (String(ranking[i]._id) == String(docs[o]._id)) {
										console.log("found user to update");
										users.update ( { _id: ranking[i]._id }, { $set: { rank : ranking[i].rank  }}, {}, function(e, doc) {
											//
											}
										);
									}
								}
							}
						}
					});
				})(ranking);

			}

			var sorted = ranking.sort(function(a, b) {
				var k1 = a.points;
				var k2 = b.points;
				if (k1 < k2) return 1;
				if (k1 > k2) return -1;
				return 0;
			});


			ranking = getHotness(prev, ranking);

			/*(function() {
				win_id = JSON.parse(JSON.stringify(players_ids[0]));
				lose_id = JSON.parse(JSON.stringify(players_ids[1]));
			});*/


			/*for(var i = 0; i < ranking.length ; i++) {
				if(String(ranking[i]._id) !== String(winner._id) && String(ranking[i]._id) !== String(loser._id)) {
					console.log("osuma");
					console.log(ranking[i].pointsGained);
				}
			};*/

			var list;
			(function() {
				console.log(match._id);
				list = JSON.parse(JSON.stringify(genRank(ranking, match)));
			})(ranking, match);


			/*for(var i = 0; i < ranking.length ; i++) {
				if(String(ranking[i]._id) !== String(player_ids[0]) && String(ranking[i]._id) !== String(player_ids[1])) {
					console.log("osuma");
					console.log(ranking[i].pointsGained);
				}
			};*/


			rankinglist.push(list);


			(function() {
				insertRanking(list, db);
				//insertToArchive(list, db);
			})(list, db);



		})(i, matches, rankinglist);
	}
}

function insertRanking(list, db) {
	(function() {
		var derp = list;
		var ranking = db.get('newRanking');

		var mid = derp.match_id;

		ranking.insert(list, {}, function(e, doc) {
			if(doc) {
				/*ranking.findOne({}, { sort: { date: -1}}, function(e, doc) {
					if(doc)
						generateArchive(doc, db);
				}); */
				ranking.findOne({match_id : mid}, {}, function(e, doc) {
					if(doc)
						insertToArchive(doc, db);
				});

			}

		});

		//console.log("list id before gen archive: " + derp.match_id);
		//generateArchive(derp, db);
	})(list, db);


};

function insertToArchive(list, db) {
	(function() {
		var derp = list;
		console.log("generate archive id: " + derp.match_id);
		var archive = db.get('rankingArchive');
		archive.find( { match_id : derp.match_id }, {limit: 1}, function(e, doc) {
			if(doc.length == 0) {
				archive.insert(derp, function(e, doc) {
					if(doc) console.log("inserted");
				});
			}
			else {
				console.log("match already in archive");
			}
		});
	})(list, db);
}


function getPointsGainedAllMatches() {

	/*
	matchlist.findOne( { _id : thisMatch._id }, {}, function(e, match) {
		if (match) {
			console.log("match found");
			//console.log("found matches");
			//console.log(match);
			//console.log(res.winner._id);
			//console.log(match[0].playerOneId);

			console.log("this match: ");
			console.log(match._id);
			console.log(thisMatch._id);

			if (match.playerOneId == res.winner._id) {
				console.log("updating match: " + match._id);
				matchlist.update( { _id: match._id }, { $set : { playerOnePointsGained : res.winner.pointsGained, playerTwoPointsGained : res.loser.pointsGained }}, { multi: true }, function(e, result) {
					if(result)
						console.log("1won updated");
				});
			}
			else if (match.playerOneId == res.loser._id) {
				console.log("updating match: " + match._id);
				matchlist.update(
					{ _id: match._id },
					{
						$set : { playerOnePointsGained : res.loser.pointsGained, playerTwoPointsGained : res.winner.pointsGained }
					},
					{},
					function(e, result) {
						if(result)
							console.log("2w updated");
						//
				});

			}
		}
	}); */
}



function calcHotCold(previous, current) {
	//console.log(previous);
	//console.log(current);
	//console.log(previous[previous.length -1]);
	//console.log(previous[previous.length - 1]);

	for(var k = 0; k < current.length; k++) {
		current[k].rank = k+1;
		if(current[k].pointsGained == undefined) {
			current[k].pointsGained = 0;
		}
		//console.log(current[k].rank);
	}

	//console.log(current);

	if (previous.length > 0) {
		for(var h = 0; h < current.length; h++) {
			for(var g = 0; g < previous.length; g++) {
				if(current[h]._id == previous[g]._id) {
					if(current[h].rank < previous[g].rank) {
						current[h].hotness = "hot";
					}
					else if (current[h].rank > previous[g].rank) {
						current[h].hotness = "cold";
					}
					else if (current[h].rank == previous[g].rank) {
						//current[h].hotness = "lukewarm";
					}

				//console.log(current[h].rank + " " + current[h].name);
				//console.log(previous[pl-1].ranking[g].rank + " " + previous[pl-1].ranking[g].name);

				}
			}
		}
	}
	return current;
}


function calcPoints (winner, loser) {
	var win = {};
	var lose = {};
	var res = {};
	winner["pointsGained"] = 0;
	loser["pointsGained"] = 0;

	if (winner.rank <= 3) {
		win.bonus = 100;
		win.tier = 1;
	}
	else if (winner.rank >= 4 && winner.rank <= 7) {
		win.bonus = 50;
		win.tier = 2;
	}
	else if (winner.rank > 7) {
		win.bonus = 0;
		win.tier = 3;
	}

	if (loser.rank <= 3) {
		lose.bonus = 100;
		lose.tier = 1;
	}
	else if (loser.rank >= 4 && loser.rank <= 7) {
		lose.bonus = 50;
		lose.tier = 2;
	}
	else if (loser.rank > 7) {
		lose.bonus = 0;
		lose.tier = 3;
	}

	if (win.tier == lose.tier) {
		winner.points += lose.bonus + 100;
		loser.points += 25;
		winner.pointsGained = lose.bonus + 100;
		loser.pointsGained = 25;
	}
	else if (win.tier < lose.tier) {
		winner.points += lose.bonus + (50);
		loser.points += 25;
		winner.pointsGained = lose.bonus + 50;
		loser.pointsGained = 25;
	}

	else if (win.tier > lose.tier) {
		if (win.tier == 3 && lose.tier == 1) {
			winner.points += lose.bonus + (100 * 3);
			loser.points += 25;
			winner.pointsGained = lose.bonus + (100 * 3);
			loser.pointsGained = 25;
		}
		else {
			winner.points += lose.bonus + (100 * 2);
			loser.points += 25;
			winner.pointsGained = lose.bonus + (100 * 2);
			loser.pointsGained = 25;
		}
	}

	//res.winner = winner;
	//res.loser = loser;
	return [winner, loser];
}

exports.adduser = function(db, callback) {
	return function(req, res) {

		var user = req.body.user;
		user.lastLogin = null;
		user.rank = null;
		user.hotness = null;
//		console.log(user);
/*		user.username = req.body.username;
		user.email = req.body.useremail;
		user.name = req.body.realname;
		user.password = req.body.password; */

		console.log("new user: " + user.name)

		var users = db.get('users');

		users.findOne({username:user.username}, function(e, o) {
			if (o) {
				//console.log(o);
				//console.log("username taken");
				res.send({ "message" : "username" });
				// do code
			}
			else {
				users.findOne({email: user.email}, function(e ,o) {
					if (o) {
						res.send({ "message" : "email" });
						//console.log("email taken");
					}
					else {
						saltAndHash(user.password, function(hash) {
							user.password = hash;
							user.addedDate = moment().format('MMMM Do YYYY, HH:mm:ss');
							// unix?
							users.insert(user, { safe : true },
								function(err) {
									if (err)
										res.send( { "message" : "fail"});
									else
										res.send({ "message" : "OK" });
								}
							);

						});

					}
				});
			}
		});
	}
}



function login(username, password, col, auto, cb) {

	function updateLastLogin(o) {
		o.lastLogin = moment().format('MMMM Do YYYY, HH:mm:ss');
		col.update( { _id : o._id }, o,
			function(err, doc) {
				if (err) {}
				else {
					//console.log(doc);
					//console.log("updated");
				}
			}
		);
	}

	console.log("trying to log in as " + username);

	//col.findOne ( { username : username}, function(e, o) {

	col.findOne ( { $or: [ { username : username}, { email : username } ] }, function(e, o) {
		if (o) {
			var success;

			if (auto == true) {
				if (o.password == password) {
					updateLastLogin(o);
					console.log("autologging in");
					cb(null, o);
//					return;
				}
				else cb('pass');
			}

			else {
				validatePassword(password, o.password, function(err, res) {
					if (res) {
						updateLastLogin(o);
						cb(null, o);
					}
					else {
						console.log(err);
						cb('pass');
					}
				});
			}
		}
		else cb('user not found');
	});
}

exports.login = function(db) {
	return function(req, res) {
		if(req.session.user) {
			console.log(req.session.user);
			res.send({ "message" : "already logged in" });
			return;
		}

		var collection = db.get('users');
		var username, password, auto;

		if (req.cookies.username !== undefined && req.cookies.password !== undefined) {
			username = req.cookies.username;
			password = req.cookies.password;
			auto = true;
		}
		else if (req.body.username !== undefined && req.body.password !== undefined) {
			username = req.body.username;
			password = req.body.password;
			auto = false;
		}
		else {
			res.send( { "message" : "no credentials given" });
		}


		var remember = req.body.rememberMe;

		login(username, password, collection, auto, function(e, o) {
			if (e) {
				console.log("error on login : " + e);
				if (auto) {
					console.log("clearing cookies after failed autologin");
					res.clearCookie('username');
					res.clearCookie('password');
				}
				res.send( { "message" : e });
			}
			else {
				if (remember) {
					console.log("setting cookies");
					res.cookie('username', o.username, { maxAge: 9000000000000 });
					res.cookie('password', o.password, { maxAge: 9000000000000 });
				}

				var club_id = o.club;

				var clubs = db.get("clubs");
				clubs.findOne({_id: club_id}, {}, function(e, doc) {
					if (doc) {
						o.clubName = doc.name;
						o.clubShort = doc.nameShort;
					}

					req.session.user = o;
					console.log("logged in as : " + req.session.user.name);

					res.send( { "message" : "OK", "session" : req.session });
						//res.redirect('/profile');

				});
			}
		});
	}
}


exports.logout = function(req, res) {
	var prev = req.session.lastPage;
	res.clearCookie('username');
	res.clearCookie('password');
	req.session.destroy(function(e) {
		if (!e) {
			//res.send({'message' : 'ok'});
			/* if (prev == "/application")	prev = "/newgame";
			else if (prev == "/profile") prev = "/home";
			else prev = "/home"; */

			res.redirect('/');
		}
		else {
			console.log(e);
		}
	});
}


var crypto = require('crypto');
var moment = require('moment');
//moment.lang('fi');

/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}





