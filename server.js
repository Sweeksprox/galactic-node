var http = require('http');
var path = require('path');

var async = require('async');
var express = require('express');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var cors = require('cors');
var mongoose = require('mongoose');
var database = require('./database.js');

var router = express();
router.use(helmet());
router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var dbURI = 'mongodb://localhost/my_database';  
var dbOptions = {
  server : {
    auto_reconnect : true
  }
};
var dbInfo = {
  online : false,
  status : 'OFF'
};

var mongoConnect = function(db, opts) {
  mongoose.connect(db, opts)
  .then(function() {
    console.log('mongo working...');
    dbInfo.online = true;
  }, function(err) {
    console.log('mongo failed...');
    console.log(err);
    setTimeout(function() { mongoConnect();}, 10000);
  });
};

mongoConnect(dbURI, dbOptions);

var errorHandler = function(error, req, res, next) {
  console.log('Error Handler');
  console.log(error);
  res.status(error.code);
  res.send(error);
};

var checkDatabase = function(req, res, next) {
  if (!dbInfo.online) {
    var error = {};
    error.code = 503;
    error.message = 'Database offline.';
    error.redirect = 'landing.html';
    return next(error);
  }
  next();
};

var validate = function(req, res, next) {
  console.log('validating');
  var user = req.body.user;
  var pass1 = req.body.pass1;
  var pass2 = req.body.pass2;
  var error = {};
  if (pass1 != pass2) {
    error.code = 400;
    error.message = 'Passwords don\'t match.';
    error.redirect = null;
    return next(error);
  }
  if (database.users[user]) {
    error.code = 400;
    error.message = 'User exists.';
    error.redirect = null;
    return next(error);
  }
  next();
};

var authenticate = function(req, res, next) {
  var user = req.body.user;
  var pass = req.body.pass;
  if (database.users[user].password != pass) {
    var error = {};
    error.code = 401;
    error.message = 'Unauthorized, login credentials invalid.';
    error.redirect = null;
    return next(error);
  }
  next();
};

var checkToken = function(req, res, next) {
  console.log(req.body);
  var user = req.body.user;
  var token = req.body.token;
  var error = {};
  if (!database.users[user]) {
    error.code = 400;
    error.message = 'Unknown user...';
    error.redirect = 'landing.html';
    return next(error);
  }
  if (database.users[user].token != token) {
    error.code = 402;
    error.message = 'Login session expired, please re-authenticate.';
    error.redirect = 'landing.html';
    return next(error);
  }
  next();
};

var validMove = function(req, res, next) {
  var n = req.body.origin;
  var d = req.body.destination;
  var o = database.planets.filter(function (o) {
          return o.id === n;
      })[0];
  if (o.nodes.indexOf(d) == -1) {
    var error = {};
    error.code = 400;
    error.message = 'Invalid move, nodes do not connect. Were you trying to cheat?';
    error.redirect = null;
    return next(error);
  }
  next();
};

router.post('/signup', [validate, errorHandler], function(req, res) {
  var user = req.body.user;
  var pass = req.body.pass1;
  var token = generateToken(user, pass);
  database.users[user] = {};
  database.users[user]['password'] = pass;
  database.users[user]['token'] = token;
  database.users[user]['games'] = [];
  var data = {};
  data.user = user;
  data.token = token;
  data.redirect = 'main.html';
  data.message = 'Signup successful';
  res.status(200);
  res.send(data);
});

router.post('/login', [checkDatabase, authenticate, errorHandler], function(req, res) {
  var user = req.body.user;
  var pass = req.body.pass;
  var token = generateToken(user, pass);
  database.users[user].token = token;
  var data = {user : user,
              token : token, 
              redirect : 'main.html',
              message : 'Login successful',
              status : 200
  };
  res.send(data);
});

router.post('/retrievegames', [checkDatabase, checkToken, errorHandler], function(req, res) {
  var user = req.body.user;
  var games = [];
  database.users[user].games.forEach(function(game) {
    games.push(game);
  });
  var data = {
    games : games,
    redirect : null
  };
  res.send(data);
});

router.post('/gameinfo', [checkDatabase, checkToken, errorHandler], function(req, res) {
  var game = req.body.game;
  var data = {
    info : database.games[game].info,
    redirect : null
  };
  res.send(data);
});

router.post('/playerlocations', [checkDatabase, checkToken, errorHandler], function(req, res) {
  var user = req.body.user;
  var game = req.body.game;
  var location = database.games[game].players[user].location;
  var faction = database.games[game].players[user].faction;
  var allies = database.games[game].factions[faction];
  var planets = database.games[game].locations;
  var data = {location : location,
              allies : allies,
              planets : planets
  };
  res.send(data);
});

router.post('/moveplayer', [checkDatabase, checkToken, validMove, errorHandler], function(req, res) {
  console.log('Success!');
  res.status(200);
  res.send('Valid move, movement complete!');
});

router.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0");

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function generateToken(u, p) {
  var d = new Date();
  var t = d.getDate();
  var y = d.getFullYear();
  var token = ( u + t + p + y).hashCode();
  return token;
}