/**
 * @file
 * Connection to KMDCognitoLocal database with information about shops.
 */

const Q = require('q');
const sql = require('mssql');


/**
 * This object encapsulate the communication with the database.
 *
 * @param logger
 * @param cache
 * @param options
 *
 * @constructor
 */
let Cognito = function Cognito(logger, cache, options) {
  this.config = options;
  this.logger = logger;
  this.cache = cache;

  this.fields = [
    'Navn',
    'Branchekode',
    'Branche',
    'Adresse',
    'PostNummer',
    'PostDistrikt',
    'Latitude',
    'Longitude'
  ];

  this.connection = new sql.Connection({
    user: this.config.user,
    password: this.config.password,
    server: this.config.server,
    database: this.config.database
  }, function (err) {
    if (err) {
      logger.error(err.message);
    }
  });
};

/**
 * Get information about a industry by id.
 *
 * @param {number} id
 *   The id of the industry to fetch information
 * @returns {*|promise}
 *   When resolved GeoJson is returned else an error.
 */
Cognito.prototype.getIndustryById = function getIndustryById(id) {
  let self = this;
  let deferred = Q.defer();

  let cid = 'cognito_branch_' + id;
  let query = 'SELECT ' + self.fields.join(', ') + ' FROM CVR_ProduktionEnhed WHERE Kommunenummer=' + this.config.kommunenummer + ' AND Branchekode = ' + id;

  self.cache.get(cid, function(err, res) {
    if (err) {
      self.logger.error('Cognito: cache encountered an error in load.');
      deferred.reject(err);
    }
    else {
      if (res !== null) {
        deferred.resolve(JSON.parse(res));
      }
      else {
        new sql.Request(self.connection).query(query).then(function(records) {
          let geoJson = {
            type: 'FeatureCollection',
            crs: {
              type: 'EPSG',
              properties: {
                code: 4326
              }
            },
            features: []
          };

          for (let i in records) {
            let record = records[i];

            // Fixes strings.
            record.PostDistrikt = record.PostDistrikt.trim();

            // Add markers (to make the front-end add popups).
            record.markers = true;

            geoJson.features.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [record.Longitude.replace(',', '.'), record.Latitude.replace(',', '.')],
              },
              properties: record
            });
          }

          // Save in cache for one day.
          self.cache.setExpire(cid, JSON.stringify(geoJson), 86400, function(err, res) {
            if (err) {
              self.logger.error(err);
            }
          });

          deferred.resolve(geoJson);
        }).catch(function(err) {
          self.logger.error(err.message);
          deferred.reject(err);
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
  let cognito = new Cognito(imports.logger, imports.cache, options);

  // This plugin extends the server plugin and do not provide new services.
  register(null, {
    "cognito": cognito
  });
};

