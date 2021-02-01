/**
 * @file
 * Connection to Midttrafik WFS.
 *
 * This proxy to midt trafik only exists because of 'No
 * 'Access-Control-Allow-Origin' header is present on the requested resource.'.
 */

const Q = require('q');
const request = require('request');

/**
 * This object encapsulate the communication.
 *
 * @param logger
 * @param cache
 * @param options
 *
 * @constructor
 */
let Midttrafik = function Midttrafik(logger, cache, options) {
  this.config = options;
  this.logger = logger;
  this.cache = cache;
};

/**
 * Get information from midt trafik geoserver.
 *
 * @param {object} parameters
 *   Extra parameters use in the request.
 * @returns {*|promise}
 *   When resolved GeoJson is returned else an error.
 */
Midttrafik.prototype.getLayer = function getLayer(parameters) {
  let self = this;
  let deferred = Q.defer();

  let query = '';
  for (let name in parameters) {
    query += '&' + name + '=' + parameters[name];
  }

  let cid = 'midtrafik_' + query;

  self.cache.get(cid, function(err, res) {
    if (err) {
      self.logger.error('Midttrafik: cache encountered an error in load.');
      deferred.reject(err);
    }
    else {
      if (res !== null) {
        deferred.resolve(JSON.parse(res));
      }
      else {
        // Build URL.
        let url = 'http://87.54.23.210/geoserver/ows?' + query;

        request(url, { timeout: 1500 }, function (error, response, body) {
          if (error || response.statusCode !== 200) {
            deferred.reject(new Error('Midttrafik service did not return result'));
          }
          else {
            // Save in cache for 7 day.
            self.cache.setExpire(cid, body, 604800, function(err, res) {
              if (err) {
                self.logger.error(err);
              }
            });

            deferred.resolve(JSON.parse(body));
          }
        });
      }
    }
  });

  return deferred.promise;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  // Create the API routes using the API object.
  let mt = new Midttrafik(imports.logger, imports.cache, options);

  // This plugin extends the server plugin and do not provide new services.
  register(null, {
    "midttrafik": mt
  });
};

