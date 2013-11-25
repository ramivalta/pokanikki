
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var crypto = require('crypto');


var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/pokanikki');

var app = express();




// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.compress());


app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('seecur3t'));
app.use(express.session());


// var quickdraw = require('quickdraw')(app);

app.use(function(req, res, next) {
	res.locals.session = req.session;
	next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


app.configure('development', function() {
	app.use(express.errorHandler( { dumpExceptions: true, showStack: true }));
});
app.configure('production', function() {
	app.use(express.errorHandler());
});

var RSS = require('rss');

var cronJob = require('cron').CronJob;

var monthly_ranking = new cronJob('0, 0, 1, *, *', function() {
	console.log("running cron task");
	// todo: loopataan kaikki seurat läpi
	var list = db.get('users');
	var rank = db.get('monthly_rankings');
	var date = new moment().toJSON();
	
	list.find( { rank : { $ne: null }}, { sort: { rank : 1}, fields: { password: 0, email: 0, lastLogin: 0, addedDate: 0, username: 0 }}, function(err, doc) {
			if(doc) {
				var list = {};
				list.ranking = doc;
				list.date = date;
				
				rank.insert(list, function(err, doc) {
					if (doc) {
						console.log("ranking saved");
					}
					else {
						console.log("error saving ranking : " + err);
					}
				});
			}
			if (err) console.log(err);
		});
		
	}, function() {
		console.log("ranking save task finished");
	}
);

// development only
/*if ('development' == app.get('env')) {
  app.use(express.errorHandler());
} */

/* app.get('*', function(req, res, next) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	//next();
	
    res.header( {
		'cache-control': 'private',     // only cache on the browser, not intermediate proxies
		maxAge: 3600,                     // 60sec (*60)
		varyByHeaders: 'User-Agent',    // vary by browser useragent
		varyByParams: 'Test',           // also vary by querystring param Test
		cacheOutput: true               // cache rendered output so not re-rendered for the next <maxAge> seconds
	});
	next();
});
*/

app.get('/autoLogin', routes.autoLogin(db));
app.get('/', routes.index);
app.get('/home', routes.home);
app.get('/events', routes.events);
app.get('/newgame', routes.newgame);
app.get('/newuser', routes.newuser);
app.get('/application', routes.application);
app.get('/profile', routes.profile);
app.get('/ranking', routes.ranking);
app.get('/admin', routes.admin);
app.get('/matches', routes.matches);
app.get('/seurat', routes.clubs);


app.get('/sup', routes.sup);
app.get('/users', routes.users(db));
app.get('/getMatches', routes.getMatches(db));
app.get('/getClubs', routes.getClubs(db));
app.get('/monthMatches', routes.monthMatches(db));


app.get('/logout', routes.logout);
app.get('/getRankings', routes.getRankings(db));
app.get('/getActiveEvents', routes.getActiveEvents(db));
app.get('/getAllEvents', routes.getAllEvents(db));

app.post('/adduser', routes.adduser(db));
app.post('/login', routes.login(db));
app.post('/startMatch', routes.startMatch(db));
app.post('/updateMatch', routes.updateMatch(db));
app.post('/addToRanking', routes.addToRanking(db));
app.post('/updateRankings', routes.updateRankinglist(db));
app.post('/createEvent', routes.createEvent(db));
app.post('/getMatchesForEvent', routes.getMatchesForEvent(db));
app.post('/getMatchesByPlayer', routes.getMatchesByPlayer(db));
app.post('/updateEvent', routes.updateEvent(db));
app.post('/addClub', routes.addClub(db));
app.post('/getPlayersByClub', routes.getPlayersByClub(db));
app.post('/getMatchesByClub', routes.getMatchesByClub(db));
app.post('/checkPass', routes.checkPass(db));
app.post('/changePassword', routes.changePassword(db));


app.get('/lsq.xml', function(req, res) {
	function derp() {
		var list = db.get('rankings');
		list.find( {}, { sort: { date: -1 }, limit : 1}, function(err, doc) {
			if(doc.length == 0) {			
				console.log(err);
				res.send("ranking empty");
			}
			      else if(doc.length > 0) {
				console.log(doc.length);
				console.log(err);
				var items = [];


				var l;
				if (doc[0].ranking.length > 10) {
								l = 10;
				}
				else l = doc[o].ranking.length;


				for(var i = 0; l > i; i++) {
								var trend;
								if (doc[0].ranking[i].hotness == "hot")
												trend = "<i class='fi-arrow-up'></i>";
								else if (doc[0].ranking[i].hotness == "cold")
												trend = "<i class='fi-arrow-down'></i>";
								//else trend = "<span class='circle'>&nbsp;</span>";
								else trend = "<i class='fi-arrow-left lukewarm'></i>";
								items[i] = doc[0].ranking[i].rank + " " + trend + " " + doc[0].ranking[i].name;
				}

				var date = doc[0].date;
				var unix = moment(date).unix();
				unix = unix + 'asd';

				var formatted_date = moment(date).format('DD.MM.YYYY');

				var html = "";
				html += "<div id='rssRanking'>";
				//html += "<h3 id='rss_header'> Seuraranking ";
				//html += formatted_date + '</h3>';
				html += '<style>';
				html += "@import url('http://pokanikki.valta.me/stylesheets/vendor/foundation-icons.css');"
				html += '#rssRanking { font-family: verdana; font-size: 13px !important }';
				html += '#rssTable { border: 1px solid #333; border-collapse: collapse; width: 100%; font-family: verdana; sans-serif }';
				html += '.rssTableCell { border: 1px solid #ccc; font-family: verdana, sans-serif; font-size: 13px }';
				html += '.lukewarm { visibility: hidden }';
				html += '.rss2html-note { display: none }';
				//html += 'h4 > .feed-item-title: { display: none }';

				html += '#pokis { font-size: 90% }';
				html += '</style>';

				html += "<table id='rssTable'>";
				for (var i = 0; i < items.length; i++) {
						html += '<tr>'
						html += "<td class='rssTableCell'>";
						html += '<span>'
						html += items[i];
						html += '</span>';
						html += '</td>';
				}
				html += '</tr> </table>';
				html += '<p></p>';
				//html += '<h3>' + formatted_date + '</h3>';
				html += "<a id='pokis' href='http://pokanikki.valta.me/ranking'>Tarkemmat tiedot Pokanikistä</a></div>";

				console.log(unix);

				var feed = new RSS( {
						title: 'Ranking',
						feed_url: 'http://pokanikki.valta.me/lsq.xml',
						site_url: 'http://pokanikki.valta.me/ranking',
						link: 'http://pokanikki.valta.me/ranking',
						ttl: 1,
						pubDate : date,
						description: 'LSQ:n rankinglista'

				});

				feed.item( {

					title: formatted_date,
					description: html,
					date : date,
					guid: 'asd'+unix,
				});
				
				var xml = feed.xml('\t');
				
				res.header("Cache-Control", "no-cache, no-store, must-revalidate");
				res.header("Pragma", "no-cache");
				res.header("Expires", 0);				
	
				res.set('Content-Type', 'text/xml');
				res.send(xml);
			}
		});
	}
	derp();
});

app.get('/lsq_monthly.xml', function(req, res) {

	function derp() {
		var list = db.get('monthly_rankings');
		list.find( {}, { sort: { date: -1 }, limit : 1}, function(err, doc) {
			if(!doc) {
				console.log(err);
			}
			else {
				//console.log(doc);
				var items = [];
				for(var i = 0; doc[0].ranking.length > i; i++) {
					items[i] = doc[0].ranking[i].rank + " " + doc[0].ranking[i].name;
				}

				var date = doc[0].date;
				var unix = moment(date).unix();
				unix = unix + 'asd';
				
				var formatted_date = moment(date).format('DD.MM.YYYY');
				
				var html = "";
				html += "<div id='rssRanking'>";
				html += "<h3 id='rss_header'> Seuraranking ";
				html += formatted_date + '</h3>';
				html += '<style>';
				html += '#rssTable { border: 1px solid #333; border-collapse: collapse; }';
				html += '.rssTableCell { border: 1px solid #ccc; }';
				html += '</style>';
				
				html += "<table id='rssTable'>";
				for (var i = 0; i < items.length; i++) {
					html += '<tr>'
					html += "<td class='rssTableCell'>";
					html += '<span>'
					html += items[i];
					html += '</span>';
					html += '</td>';
				}
				html += '</tr> </table>';
				html += "<a id='rssLink' href='http://pokanikki.valta.me/ranking'>Pokanikki</a></div>";
				
				console.log(unix);

				var feed = new RSS( {
					title: 'Ranking',
					feed_url: 'http://pokanikki.valta.me/lsq_monthly.xml',
					site_url: 'http://pokanikki.valta.me/ranking',
					link: 'http://pokanikki.valta.me/ranking',
					ttl: 1,
					pubDate : date,
					description: 'LSQ:n rankinglista'

				});				
				
				feed.item( {
					title: 'Ranking',
					description: html,
					date : date,
					guid: 'asd'+unix,
				});
				
				var xml = feed.xml('\t');
				
				res.header("Cache-Control", "no-cache, no-store, must-revalidate");
				res.header("Pragma", "no-cache");
				res.header("Expires", 0);				
	
				res.set('Content-Type', 'text/xml');
				res.send(xml);
			}
		});
	}
	derp();
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
