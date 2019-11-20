'use strict';
let db_service = require('../utils/db_service');

function geobyzip(zipcode, version = 'current') {
  let from_statement = 'businesses_2014';
  if (version === 'original') from_statement = 'businesses_2014_o';
  return new Promise(function(resolve, reject) {
    let sql = `
      SELECT 
      id, 
      ST_ASGeoJSON(ST_transform(geom,4326)) as geoPoint, 
      "CONAME",
      alias,
      "NAICSCD",
      "NAICSDS", 
      "LEMPSZCD", 
      "LEMPSZDS",
      "ALEMPSZ", 
      "ACEMPSZ",
      "SQFOOTCD",
      "SQFOOTDS",
      "PRMSICCD",
      "PRMSICDS",
      "PRMADDR",
      "PRMCITY",
      "PRMSTATE",
      "PRMZIP",
      "LATITUDEO",
      "LONGITUDEO",
      "LSALVOLCD",
      "LSALVOLDS",
      "ALSLSVOL",
      "CSALVOLCD",
      "CSALVOLDS",
      "ACSLSVOL",
      "MATCHCD",
      "TRANSTYPE",
      "TRANSTYPE",
      "INDFIRMCD",
      "INDFIRMDS"
      "BE_Payroll_Expense_Code",
      "BE_Payroll_Expense_Range",
      "BE_Payroll_Expense_Description"
      FROM ${from_statement}  
      WHERE "PRMZIP" = $1;
    `;

    db_service.runQuery(sql, [zipcode], (err, data) => {
      if (err) return reject(err.stack);
      resolve(data.rows);
    });
  });
}

const geoByZipRequest = (request, response) => {
  if (!request.params.zipcode) {
    response.status(400).json({
      status: 'Error',
      responseText: 'No zipcode specified',
    });
  }

  geobyzip(request.params.zipcode, request.query.v).then(
    (data) => {
      return response.status(200).json({
        data: data,
      });
    },
    (err) => {
      console.error(err);
      return response.status(500).json({
        status: 'Error',
        responseText: 'Error in query ' + err,
      });
    }
  );
};

module.exports = geoByZipRequest;
