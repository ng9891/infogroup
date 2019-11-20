'use strict';
let db_service = require('../utils/db_service');

function geobyrectangle(minLon=0, minLat=0, maxLon=0, maxLat=0) {
  return new Promise(function(resolve, reject) {
    let sql = `SELECT
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
      FROM businesses_2014
      WHERE ST_Contains(ST_MakeEnvelope($1, $2, $3, $4, 4326), ST_transform(geom,4326));
    `;

    db_service.runQuery(sql, [minLon, minLat, maxLon, maxLat], (err, data) => {
      if (err) return reject(err.stack);
      resolve(data.rows);
    });
  });
}

const geoByRectangleRequest = (request, response) => {
  if (!request.query.maxLon) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Longitude specified',
    });
  }
  if (!request.query.maxLat) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Longitude specified',
    });
  }
  if (!request.query.minLon) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Longitude specified',
    });
  }
  if (!request.query.minLat) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Longitude specified',
    });
  }

  geobyrectangle(request.query.minLon, request.query.minLat, request.query.maxLon, request.query.maxLat).then(
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

module.exports = geoByRectangleRequest;
