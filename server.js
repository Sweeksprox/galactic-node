var http = require('http');
var path = require('path');

var async = require('async');
var express = require('express');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var cors = require('cors');
var planets = require('./planets.js');
var players = require('./players.js');

var router = express();
router.use(helmet());
router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

var errorHandler = function(error, req, res, next) {
  console.log('Error Handler');
  console.log(error);
  var errorInfo = {};
  switch(error) {
    case 400:
      errorInfo.message = 'Movement requirements unmet, you trying to cheat?';
      res.status(error);
      res.send(errorInfo);
      break;
    case 401:
      errorInfo.message = 'Unauthorized, login credentials invalid.';
      res.status(error);
      res.send(errorInfo);
      break;
    case 402:
      errorInfo.message = 'Login session expired, please re-authenticate.';
      errorInfo.route = 'landing.html';
      res.status(400);
      res.send(errorInfo);
      break;
    default:
      res.send(error);
  }
}

var authenticate = function(req, res, next) {
  var user = req.body.user;
  var pass = req.body.pass;
  if (players.users[user].password != pass) {
    return next(401);
  }
  next();
};

var checkToken = function(req, res, next) {
  console.log(req.body);
  var user = req.body.user;
  var token = req.body.token;
  if (players.users[user].token != token) {
    return next(402);
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
    return next(400);
  }
  next();
};

router.post('/login', [authenticate, errorHandler], function(req, res) {
  var user = req.body.user;
  var pass = req.body.pass;
  var d = new Date();
  var today = d.getDate();
  var year = d.getFullYear();
  var token = ( user + today + pass + year).hashCode();
  players.users[user].token = token;
  var data = {user : user,
              token : token, 
              route : 'main.html',
              message : 'Login successful',
              status : 200
  };
  res.send(data);
});

router.post('/playerlocations', [checkToken, errorHandler], function(req, res) {
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

router.post('/moveplayer', [checkToken, validMove, errorHandler], function(req, res) {
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
