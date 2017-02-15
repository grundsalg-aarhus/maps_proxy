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
 * @param options
 *
 * @constructor
 */
let API = function (app, logger, cognito, options) {
  "use strict";

  let self = this;
  this.logger = logger;

  app.get('/api', function (req, res) {
    res.status(200);
    res.send('Hello world');
    res.end();
  });

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
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  // Create the API routes using the API object.
  let api = new API(imports.app, imports.logger, imports.cognito, options);

  // This plugin extends the server plugin and do not provide new services.
  register(null, null);
};
