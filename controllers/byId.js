'use strict';
let db_service = require('../utils/db_service');

function geobyid(business_id, version = 'current') {
  let from_statement = 'businesses_2014';
  if (version === 'original') from_statement = 'businesses_2014_o';
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
            FROM ${from_statement}
            WHERE id = $1;
        `;

    db_service.runQuery(sql, [business_id], (err, data) => {
      if (err) return reject(err.stack);
      resolve(data.rows);
    });
  });
}

const requestGeoById = function(request, response) {
  if (!request.params.id) {
    response.status(400).json({
      status: 'Error',
      responseText: 'No id',
    });
  }

  geobyid(request.params.id, request.query.v).then(
    (data) => {
      return response.status(200).json({
        data: data,
      });
    },
    function(err) {
      console.error(err);
      return response.status(500).json({
        status: 'Error',
        responseText: 'Error in query ' + err,
      });
    }
  );
};

module.exports = requestGeoById;
