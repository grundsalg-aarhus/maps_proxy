/**
 * @file
 * Connection to bunyt.dk to get information about schools etc.
 */

const Q = require('q');
const parseXmlString = require('xml2js').parseString;
const request = require('request');

/**
 * This object encapsulate the communication with the database.
 *
 * @param logger
 * @param cache
 * @param options
 *
 * @constructor
 */
let BUnyt = function BUnyt(logger, cache, options) {
  this.config = options;
  this.logger = logger;
  this.cache = cache;
};

/**
 * Get information about a industry by id.
 *
 * @param {string} type
 *   The id of the industry to fetch information. Types: dagtilbud, dagpleje,
 *   fritid, intinst, vuggestue, bornehave, specskole, skole, sfo, fu,
 *   privtilbud, tandplejen, privskole.
 * @returns {*|promise}
 *   When resolved GeoJson is returned else an error.
 */
BUnyt.prototype.getInstitutionByType = function getInstitutionByType(type) {
  let self = this;
  let deferred = Q.defer();

  let cid = 'institution_';

  self.cache.get(cid, function(err, res) {
    if (err) {
      self.logger.error('BU-nyt: cache encountered an error in load.');
      deferred.reject(err);
    }
    else {
      if (res !== null) {
        // Cache hit, so return the cached content.
        let institution = JSON.parse(res);
        deferred.resolve(institution[type]);
      }
      else {
        request(self.config.url, function (error, response, body) {
          if (error || response.statusCode !== 200) {
            deferred.reject(new Error('bunyt.dk service did not return result'));
          }
          else {
            // Transform
            parseXmlString(body, function (err, json) {
              if (err) {
                deferred.reject(err);
              }
              else {
                // This is a string to get fast object clone in the data
                // structure below.
                let geoJsonBase = JSON.stringify({
                  type: 'FeatureCollection',
                  crs: {
                    type: 'EPSG',
                    properties: {
                      code: 4326
                    }
                  },
                  features: []
                });

                // The JSON hack here is to get a clone of the object and not a
                // reference to the same object.
                let institution = {
                  'dagtilbud': JSON.parse(geoJsonBase),
                  'dagpleje': JSON.parse(geoJsonBase),
                  'fritid': JSON.parse(geoJsonBase),
                  'intinst': JSON.parse(geoJsonBase),
                  'vuggestue': JSON.parse(geoJsonBase),
                  'bornehave': JSON.parse(geoJsonBase),
                  'specskole': JSON.parse(geoJsonBase),
                  'skole': JSON.parse(geoJsonBase),
                  'sfo': JSON.parse(geoJsonBase),
                  'fu': JSON.parse(geoJsonBase),
                  'privtilbud': JSON.parse(geoJsonBase),
                  'tandplejen': JSON.parse(geoJsonBase),
                  'privskole': JSON.parse(geoJsonBase)
                };

                // Build GeoJson feature for each marker based on type.
                for (let i in json.markers.marker) {
                  let marker = json.markers.marker[i]['$'];
                  institution[marker.enhtype].features.push({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [marker.lng, marker.lat],
                    },
                    properties: marker
                  });
                }

                // Save in cache for 7 day.
                self.cache.setExpire(cid, JSON.stringify(institution), 604800, function(err, res) {
                  if (err) {
                    self.logger.error(err);
                  }
                });
                deferred.resolve(institution[type]);
              }
            });

            deferred.resolve(body);
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
  let bunyt = new BUnyt(imports.logger, imports.cache, options);

  // This plugin extends the server plugin and do not provide new services.
  register(null, {
    "bunyt": bunyt
  });
};

