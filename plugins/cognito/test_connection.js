const sql = require('mssql');

let connection = new sql.Connection({
  user: 'Cognito_Reader',
  password: 'Cognito_PW',
  server: 'localhost',
  database: 'KMDCognitoLocal'
}, function (err) {
  if (err) {
    console.error(err);
  }
  else {
    // Query
    new sql.Request(connection).query('SELECT TOP 4 Navn, Branchekode, Branche, Adresse, PostNummer, PostDistrikt, Latitude, Longitude FROM CVR_ProduktionEnhed WHERE Kommunenummer=751 AND Branchekode IN (471110, 471120,471130)').then(function(recordset) {
      console.dir(recordset);
      connection.close();
    }).catch(function(err) {
      // ... query error checks
    });
  }
});



