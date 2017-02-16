/**
 * @file
 * Added API to send content into the search engine
 */

const Q = require('q');
const request = require('request');

/**
 * This object encapsulate the RESET API.
 *
 * @param app
 * @param logger
 * @param cognito
 * @param bunyt
 * @param midttrafik
 * @param options
 *
 * @constructor
 */
let API = function (app, logger, cognito, bunyt, midttrafik, options) {
  "use strict";

  let self = this;
  this.logger = logger;

  /**
   * Test callback.
   */
  app.get('/api', function (req, res) {
    res.status(200);
    res.send('Hello world');
    res.end();
  });

  /**
   * Get ticket to access web-services at KS.
   */
  app.get('/api/kfticket', function (req, res) {
    res.set('Access-Control-Allow-Origin', '*');

    let cred = options.kortforsyningen;
    let url = 'http://services.kortforsyningen.dk/service?request=GetTicket&login=' + cred.username + '&password=' + cred.password;
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
        res.status(200);
        res.send(body);
        res.end();
      }
    });
  });

  /**
   * Get information about the industries and there locations.
   */
  app.get('/api/industry/:id', function (req, res) {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.params.hasOwnProperty('id')) {
      cognito.getIndustryById(req.params.id).then(function (json) {
        res.status(200).json(json);
      });
    }
    else {
      self.logger.error('API: missing id parameter in cognito branch.');
      res.status(500).send('Missing parameter.');
    }
  });

  /**
   * Get information from BU about institutions in the city.
   */
  app.get('/api/bunyt/:type', function (req, res) {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.params.hasOwnProperty('type')) {
      bunyt.getInstitutionByType(req.params.type).then(function (json) {
        res.status(200).json(json);
      });
    }
    else {
      self.logger.error('API: missing id parameter in cognito branch.');
      res.status(500).send('Missing parameter.');
    }
  });

  /**
   * Get information from Midt trafik.
   */
  app.get('/api/midttrafik', function (req, res) {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.hasOwnProperty('query')) {
      midttrafik.getLayer(req.query).then(function (json) {
        res.status(200).json(json);
      });
    }
    else {
      self.logger.error('API: missing id parameter in cognito branch.');
      res.status(500).send('Missing parameter.');
    }
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  // Create the API routes using the API object.
  let api = new API(imports.app, imports.logger, imports.cognito, imports.bunyt, imports.midttrafik, options);

  // This plugin extends the server plugin and do not provide new services.
  register(null, null);
};
