'use strict';
let db_service = require('../utils/db_service');

function geobydistance(lon, lat, dist) {
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
      WHERE ST_DWithin(ST_GeogFromText('SRID=4326;POINT(' || $1 || ' ' || $2 || ')'), geography(ST_transform(geom,4326)), $3);
    `;

    db_service.runQuery(sql, [lon, lat, dist], (err, data) => {
      if (err) return reject(err.stack);
      resolve(data.rows);
    });
  });
}

const geoByDistanceRequest = (request, response) => {
  if (!request.query.lon) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Longitude specified',
    });
  }
  if (!request.query.lat) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No latitude specified',
    });
  }

  if (!request.query.dist) {
    request.query.dist = process.env.QUERY_DIST || 1609; //QUERY_DIST from env file. Default: 1 mi.
  }

  // console.log(request.query.dist);

  geobydistance(request.query.lon, request.query.lat, request.query.dist).then(
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

module.exports = geoByDistanceRequest;
