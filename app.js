#!/usr/bin/env node

/**
 * @file
 * This is the main application that uses architect to build the application
 * base on plugins.
 */
'use strict';

var path = require('path');
var architect = require('architect');

// Load config file.
var config = require(__dirname + '/config.json');

// Configure the plugins.
var plugins = [
  {
    packagePath: './plugins/logger',
    logs: config.logs
  },
  {
    packagePath: './plugins/server',
    port: config.port,
    path: path.join(__dirname, 'public')
  },
  {
    packagePath: './plugins/api',
    secret: config.secret,
    apikey: config.apikey,
    kortforsyningen: config.kortforsyningen
  }
];

// User the configuration to start the application.
config = architect.resolveConfig(plugins, __dirname);
architect.createApp(config, function (err, app) {
  if (err) {
    throw err;
  }
});

// Ensure proper process exit when killed in term.
process.once('SIGINT', function () { process.exit(); });
process.once('SIGTERM', function () { process.exit(); });
