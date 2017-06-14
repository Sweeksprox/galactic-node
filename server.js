var http = require('http');
var path = require('path');

var async = require('async');
var express = require('express');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var cors = require('cors');
var mongoose = require('mongoose');
var planets = require('./planets.js');
var players = require('./players.js');

var router = express();
router.use(helmet());
router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var dbInfo = {online : false,
              status : 'OFF',
              
};
              
var mongoConnect = function() {
  mongoose.connect('mongodb://localhost/my_database')
  .then(function() {
    console.log('mongo working...');
    dbInfo.online = true;
  }, function(err) {
    console.log('mongo failed...')
    console.log(err);
    setTimeout(function() { mongoConnect();}, 10000);
  });
}

var errorHandler = function(error, req, res, next) {
  console.log('Error Handler');
  console.log(error);
  switch(error.code) {
    case 400:
      res.status(error.code);
      res.send(error);
      break;
    case 401:
      res.status(error.code);
      res.send(error.message);
      break;
    case 402:
      res.status(error.code);
      res.send(error);
      break;
    case 503:
      res.status(error.code);
      res.send(error);
    default:
      res.send(error);
  }
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

var authenticate = function(req, res, next) {
  var user = req.body.user;
  var pass = req.body.pass;
  if (players.users[user].password != pass) {
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
  if (players.users[user].token != token) {
    var error = {};
    error.code = 402;
    error.message = 'Login session expired, please re-authenticate.';
    error.redirect = null;
    return next(error);
  }
  next();
};

var validMove = function(req, res, next) {
  var n = req.body.origin;
  var d = req.body.destination;
  var o = planets.filter(function (o) {
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

router.post('/login', [checkDatabase, authenticate, errorHandler], function(req, res) {
  var user = req.body.user;
  var pass = req.body.pass;
  var d = new Date();
  var today = d.getDate();
  var year = d.getFullYear();
  var token = ( user + today + pass + year).hashCode();
  players.users[user].token = token;
  var data = {user : user,
              token : token, 
              redirect : 'main.html',
              message : 'Login successful',
              status : 200
  };
  res.send(data);
});

router.post('/playerlocations', [checkDatabase, checkToken, errorHandler], function(req, res) {
  var user = req.body.user;
  var location = players.users[user].location;
  var faction = players.users[user].faction;
  var allies = players.factions[faction];
  var planets = players.locations;
  var data = {location : location,
              allies : allies,
              planets : planets
  };
  res.send(data);
});

router.post('/planetinfo', [checkToken, errorHandler], function(req, res) {
  var n = req.body.planet;
  var o = players.locations[n];
  res.send(o);
});

router.post('/moveplayer', [checkDatabase, checkToken, validMove, errorHandler], function(req, res) {
  console.log('Success!');
  res.status(200);
  res.send('Valid move, movement complete!');
});

router.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0");
mongoConnect();

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
