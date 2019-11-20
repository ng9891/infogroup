'use strict';
let db_service = require('../utils/db_service');

//Takes an offset and limit to load the county with pagination.
function geobycounty(county_name, version = 'current', offset = 0, limit = null) {
  let from_statement = 'businesses_2014';
  if (version === 'original') from_statement = 'businesses_2014_o';
  return new Promise(function(resolve, reject) {
    let sql = `WITH county AS (
                  SELECT 
                  geom
                  FROM counties_shoreline as county
                  WHERE UPPER(county.name) = UPPER($1)
                  LIMIT 1
              )
      SELECT
      id,
      ST_ASGeoJSON(ST_Transform(business.geom, 4326)) AS geoPoint,
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
      FROM ${from_statement} as business, county
      WHERE ST_Contains(county.geom, business.geom)
      ORDER BY COALESCE("ALEMPSZ", 0) DESC
      OFFSET $2
      LIMIT $3
    `;
    let value = [county_name, offset, limit];

    db_service.runQuery(sql, value, (err, data) => {
      if (err) return reject(err.stack);
      resolve(data.rows);
    });
  });
}

const geoByCountyRequest = (request, response) => {
  if (!request.params.county) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No county specified',
    });
  }

  geobycounty(request.params.county, request.query.v, request.query.offset, request.query.limiter).then(
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

module.exports = geoByCountyRequest;
