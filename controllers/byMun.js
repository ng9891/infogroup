'use strict';
let db_service = require('../utils/db_service');

//Takes an offset and limit to load the county with pagination.
function geobymun(mun_name, version = 'current', mun_type, county, offset = 0, limit = null) {
  let from_statement = 'businesses_2014';
  if (version === 'original') from_statement = 'businesses_2014_o';
  return new Promise(function(resolve, reject) {
    // Get all municipality
    let sql_setup = `
      WITH mun AS (
        SELECT 
        geom
        FROM(
            SELECT c.name, c.muni_type, c.county, c.geom
            FROM cities_towns c
            UNION ALL
            SELECT v.name, 'village' as muni_type, v.county, v.geom
            FROM villages v
            ) l
        WHERE UPPER(name) = UPPER($1)`;
    let value = [mun_name];
    // Specific municipality query
    if (mun_type && county) {
      value.push(mun_type, county);
      sql_setup += `
      AND UPPER(muni_type) = UPPER($${value.length - 1})
      AND UPPER(county) = UPPER($${value.length})`;
    }

    let sql =
      sql_setup +
      `
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
        FROM ${from_statement} as business, mun
        WHERE ST_Contains(mun.geom, business.geom)
        ORDER BY COALESCE("ALEMPSZ", 0) DESC
        OFFSET $${value.length + 1}
        LIMIT $${value.length + 2}
      `;
    value.push(offset, limit);

    db_service.runQuery(sql, value, (err, data) => {
      if (err) return reject(err.stack);
      resolve(data.rows);
    });
  });
}

const geoByMunRequest = (request, response) => {
  if (!request.params.mun) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Municipality specified',
    });
  }

  geobymun(
    request.params.mun,
    request.query.v,
    request.query.mun_type,
    request.query.county,
    request.query.offset,
    request.query.limiter
  ).then(
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

module.exports = geoByMunRequest;
