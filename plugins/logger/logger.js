/**
 * @file
 * This is a wrapper class to handel the system logger.
 */

// Node core modules.
var fs = require('fs');
var path = require('path');

// NPM modules.
var winston = require('winston');
var Rotate = require('winston-logrotate').Rotate;

/**
 * Define the Base object (constructor).
 */
var Logger = function Logger(logs) {
  "use strict";

  var levels = winston.config.syslog.levels;

  if (logs.hasOwnProperty('info')) {
    this.infoLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new Rotate({
          file: path.join(__dirname, '../../' + logs.info),
          level: 'info',
          colorize: false,
          timestamp: true,
          json: false,
          max: '100m',
          keep: 5,
          compress: false
        })
      ],
      exitOnError: false
    });
  }

  if (logs.hasOwnProperty('debug')) {
    this.debugLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new Rotate({
          file: path.join(__dirname, '../../' + logs.debug),
          level: 'debug',
          colorize: false,
          timestamp: true,
          json: false,
          max: '100m',
          keep: 5,
          compress: false
        })
      ],
      exitOnError: false
    });
  }

  if (logs.hasOwnProperty('error')) {
    this.errorLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new Rotate({
          file: path.join(__dirname, '../../' + logs.error),
          level: 'error',
          colorize: false,
          timestamp: true,
          json: false,
          max: '100m',
          keep: 5,
          compress: false
        })
      ],
      exitOnError: false
    });
  }

  if (logs.hasOwnProperty('socket')) {
    this.socketLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new Rotate({
          file: path.join(__dirname, '../../' + logs.socket),
          level: 'socket',
          colorize: false,
          timestamp: true,
          json: false,
          max: '100m',
          keep: 5,
          compress: false
        })
      ],
      exitOnError: false
    });
  }
};

/**
 * Log error message.
 *
 * @param message
 *   The message to send to the logger.
 */
Logger.prototype.error = function error(message) {
  "use strict";

  if (this.errorLog !== undefined) {
    this.errorLog.error(message);
  }
};

/**
 * Log info message.
 *
 * @param message
 *   The message to send to the logger.
 */
Logger.prototype.info = function info(message) {
  "use strict";

  if (this.infoLog !== undefined) {
    this.infoLog.info(message);
  }
};

/**
 * Log debug message.
 *
 * @param message
 *   The message to send to the logger.
 */
Logger.prototype.debug = function debug(message) {
  "use strict";

  if (this.debugLog !== undefined) {
    this.debugLog.debug(message);
  }
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  var logger = new Logger(options.logs);

  // Register the plugin with the system.
  register(null, {
    "logger": logger
  });
};
