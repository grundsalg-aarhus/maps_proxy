#!/usr/bin/env node

/**
 * @file
 * This is the main application that uses architect to build the application
 * base on plugins.
 */
'use strict';

const path = require('path');
const architect = require('architect');

// Load config file.
const config = require(__dirname + '/config.json');

// Configure the plugins.
let plugins = [
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
    kortforsyningen: config.kortforsyningen
  },
  {
    packagePath: "./plugins/cache",
    config: config.cache
  },
  {
    packagePath: './plugins/cognito',
    user: config.cognito.user,
    password: config.cognito.password,
    server: config.cognito.server,
    database: config.cognito.database,
    kommunenummer: config.cognito.kommunenummer
  },
  {
    packagePath: './plugins/bunyt',
    url: config.bunyt.url,
  }
];

// User the configuration to start the application.
architect.createApp(architect.resolveConfig(plugins, __dirname), function (err, app) {
  if (err) {
    throw err;
  }
});

// Ensure proper process exit when killed in term.
process.once('SIGINT', function () { process.exit(); });
process.once('SIGTERM', function () { process.exit(); });
