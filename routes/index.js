
exports.index = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	
	req.session.lastPage = "/";
	res.render('index');
}

exports.clubs = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	
	req.session.lastPage = "/seurat";
	res.render('clubs');
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
					console.log(club_id);
					
					var clubs = db.get("clubs");
					clubs.findOne({ _id: club_id}, {}, function(e, doc) {
						if (doc) {
							console.log(doc),
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

exports.matches = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);

	
	req.session.lastPage = "/matches";
	res.render('matches');
}


exports.home = function(req, res){
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	
	req.session.lastPage = "/home";
	res.render('home');
}

exports.events = function(req, res){
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	
	if (req.session.user) {
		console.log(req.session.user.name);
		console.log("logged in as ^^^^^");
	}
	req.session.lastPage = "/events";
	res.render('events');
}


exports.sup = function(req, res) {
	res.render('sup', { title: 'Sup, World' });
}

//		collection.find( { endTime : { $exists : true }}, {limit: 180, sort: {


exports.users = function(db) {
	return function(req, res) {
		var collection = db.get('users');
		collection.find( { rank : { $exists: true }},{ fields: { password: 0 }}, function(e, docs) {
			res.send(docs);
//			res.json(docs);
		});
	};
}

exports.getPlayersByClub = function(db) {
	return function(req, res) {
		var users = db.get('users');
		var club_id = req.body.club_id;
		users.find( { club : club_id }, { fields: { password :0 }}, function(e, docs) {
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
		
		events.find( { endDate : { $gte : date  }, startDate : { $lte : date }}, {}, function(e, docs) {
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
		
		events.find( {}, {}, function(err, docs) {
			if(docs) {
				res.send( { "events" : docs });
			}
			else if (err) {
				console.log(err);
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

exports.profile = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	

	if (req.session.user == undefined) {
		console.log("herpderp");
		res.redirect('/home');
		return;
	}
	req.session.lastPage = "/profile";
	res.render('profile');
}

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
	res.render('admin');
}



exports.newgame = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	

	req.session.lastPage = "/newgame";
	res.render('newgame');
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
		var matches = db.get('matches');
		club = req.body.club_id;
		
		if (!club) return;
		
		matches.find({ endTime : { $exists : true}, $or: [{playerOneClub : club }, {playerTwoClub : club }]}, { sort: { startTime : -1 }}, function(err, docs) {
				if(docs) {
					res.send({"matches" : docs });
				}
			}
		);
	}
}

exports.monthMatches = function(db) {
	return function(req, res) {
	
		var mom = moment.utc();
		var start = mom.startOf('month').toJSON();
		var end = mom.endOf('month').toJSON();
		
		console.log("month start " + start);
		console.log("month end " + end);
	
		var col = db.get('matches');
		
		col.find({ endTime : { $exists : true }, startTime : { $gte: start, $lte: end }}, { sort: { startTime : -1 }, fields : { endTime : 0 }}, function(err, docs) {
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
		
		console.log(req.body);
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
	res.render('application');
}

exports.newuser = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	

	req.session.lastPage = "/newuser";
	res.render('newuser', { title: 'Add new user '});
}

exports.ranking = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	

	req.session.lastPage = "/ranking";
	res.render('ranking');
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
		
		console.log(password);
		console.log(id);
		
		var users = db.get('users');
		
		users.findOne({ _id: id }, function(e, o) {
			console.log(o.password);
			if (o) {
				console.log(o.password);
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
		var rankings = db.get('users');
		
		rankings.find( {}, {sort: { rank: 1 }, fields: { password: 0, email: 0 }}, function(e,docs) {
			res.send({ "ranking" : docs });
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

		//req.body.winner;
		//var loser = req.body.loser;
		
		
		// tarvii rewriten nopeeta
		
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
										}
									});
									
									users.update({ _id: swappee._id}, { $set :{ rank : swappee.rank, hotness : swappee.hotness }}, {}, function(e, doc) {
										if(e) console.log("error updating swappee rank");
										else {
											console.log("swappee ranking updated to:  "+ swappee.rank);
										}
									});
								}
							});
						}
						else {
							console.log("no need to update ranking");
							
							if (loser.hotness !== "lukewarm") {
								users.update( { _id: loser._id}, { $set : { hotness : 'lukewarm' }}, {}, function(err, doc) {
									
								});
							}
							if (winner.hotness !== "lukewarm") {
								users.update( { _id: winner._id}, { $set : { hotness : 'lukewarm' }}, {}, function(err, doc) {
									
								});
							}
						}
						
						// update ranking db
						
						var list = db.get("users");
						var rank = db.get("rankings");
						
						var date = new moment().toJSON();
						
						list.find( { rank: { $ne : null }}, { sort: { rank: 1}, fields: { password: 0, email: 0, lastLogin: 0, addedDate: 0, username: 0 }}, function(err, doc) {
							if(doc) {
								var list = {};
								list.ranking = doc;
								list.date = date;
								
								rank.insert(list, function(err, doc) {
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
					else {}
				});
			}
		});

		res.send({ "message": "OK" });

	}
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
					console.log("updated");
				}
			}
		);
	}
	
	col.findOne ( { username : username}, function(e, o) {
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
		console.log("derp");
		if(req.session.user) {
			console.log(req.session.user);
			res.send({ "message" : "already logged in" });
			return;
		}
	
		console.log("not logged in, req.session.user:" + req.session.user);
	
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
	console.log("route yes");
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





