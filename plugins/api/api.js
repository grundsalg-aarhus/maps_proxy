/**
 * @file
 * Added API to send content into the search engine
 */

var Q = require('q');
var request = require('request');

// Get JWT module for access restrictions.
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

/**
 * This object encapsulate the RESET API.
 *
 * @param app
 * @param logger
 * @param options
 *
 * @constructor
 */
var API = function (app, logger, options) {
  "use strict";

  var self = this;
  this.logger = logger;

  app.get('/api', function (req, res) {
    res.status(200);
    res.send('Hello world');
    res.end();
  });

  app.post('/api/token', function (req, res) {
    if (!req.body.hasOwnProperty('apikey')) {
      res.status(404).json({ 'message': 'API key not found in the request.' });
    }
    else {
      var key = req.body.apikey;

      if (key === options.apikey) {
        // Create profile.
        var profile = {
          "apikey": key
        };

        // API key accepted, so send back token (expire in 2 min.).
        var token = jwt.sign(profile, options.secret, { "expiresIn": 120});
        res.status(200).json({'token': token});
        res.end();
      }
      else {
        res.status(401).json({ 'message': 'API key could not be validated.' });
        res.end();
      }
    }
  });

  app.get('/api/kfticket', expressJwt({"secret": options.secret}), function (req, res) {
    res.set('Access-Control-Allow-Origin', '*');

    var cred = options.kortforsyningen;
    var url = 'http://services.kortforsyningen.dk/service?request=GetTicket&login=' + cred.username + '&password=' + cred.password;
    request(url, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        res.status(400);
        res.end();
      }
      else if (body.indexOf('<') !== -1) {
        // Contains HTML and not a ticket.
        res.status(400);
        res.send(body);
        res.end();
      }
      else {
        console.log('SEND 200 with BODY');
        res.status(200);
        res.send(body);
        res.end();
      }
    });
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  // Create the API routes using the API object.
  var api = new API(imports.app, imports.logger, options);

  // This plugin extends the server plugin and do not provide new services.
  register(null, null);
};
