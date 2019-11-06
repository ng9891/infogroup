/**
 * Advanced Search Controller which performs SQL query
 * This controller is being called from public/loadAdvancedSearchEstablishments.js
 * 
 */
'use strict';
let db_service = require('../utils/db_service');

function advancedSearch(formBody) {
  return new Promise(function(resolve, reject) {
    let [sql, params] = build_query(formBody);
    db_service.runQuery(sql, params, (err, data) => {
      if (err) return reject(err.stack);
      resolve(data.rows);
    });
  });
}

const advancedSearchRequest = function(request, response) {
  if (!request.query) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No query',
    });
  }
  advancedSearch(request.query).then(
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

// Helper function to parameterized query string.
function build_query(form) {
  let from_statement = 'businesses_2014';
  if (form.query_version === 'original') from_statement = 'businesses_2014_o';
  let select = `
    SELECT
    id, 
    ST_ASGeoJSON(ST_transform(b.geom,4326)) as geoPoint, 
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
    `;
  let from = `FROM ${from_statement} as b\n`;
  let where = `WHERE `;
  // Helper function to build string in the where clause
  function addANDStatement(statement) {
    if (where.length <= 6) {
      return statement + '\n';
    }
    return 'AND ' + statement + '\n';
  }

  let params = [];
  if (form.industry !== '') {
    where += addANDStatement(`"NAICSDS" = $${params.length + 1}`);
    params.push(form.industry);
  }
  if (form.naicscd !== '') {
    where += addANDStatement(`"NAICSCD" = $${params.length + 1}`);
    params.push(+form.naicscd);
  }
  if (form.minEmp !== '' || form.maxEmp !== '') {
    // TODO: INCLUDE NULL statement to search null ALEMPSZ
    if (form.minEmp !== '') {
      where += addANDStatement(`"ALEMPSZ" >= $${params.length + 1}`);
      params.push(+form.minEmp);
    }
    if (form.maxEmp !== '') {
      where += addANDStatement(`"ALEMPSZ" <= $${params.length + 1}`);
      params.push(+form.maxEmp);
    }
  }
  if (form.lsalvol !== '') {
    where += addANDStatement(`"LSALVOLDS" = $${params.length + 1}`);
    params.push(form.lsalvol);
  }
  if (form.mun !== '') {
    from += `,(
            SELECT geom
            FROM(
                SELECT c.name, c.muni_type, c.county, c.geom
                FROM cities_towns c
                UNION ALL
                SELECT v.name, 'village' as muni_type, v.county, v.geom
                FROM villages v
            ) l
            WHERE UPPER(name) = UPPER($${params.length + 1})\n`;
    params.push(form.mun);
    from += `AND UPPER(muni_type) = UPPER($${params.length + 1})\n`;
    params.push(form.mun_type);
    from += `AND UPPER(county) = UPPER($${params.length + 1})
            ) as mun\n`;
    params.push(form.mun_county);
    where += addANDStatement(`ST_Contains(mun.geom, b.geom)`);
  } else if (form.county !== '') {
    from += `,( 
            SELECT county.geom
            FROM counties_shoreline as county
            WHERE UPPER(county.name) = UPPER($${params.length + 1})
            LIMIT 1) as county\n`;
    where += addANDStatement(`ST_Contains(county.geom, b.geom)`);
    params.push(form.county);
  } else if (form.mpo !== '') {
    from += `,(
            SELECT mpo.geom
            FROM mpo
            WHERE UPPER(mpo.mpo) = UPPER($${params.length + 1})
            OR UPPER(mpo.mpo_name) = UPPER($${params.length + 1})
            LIMIT 1) as mpo\n`;
    params.push(form.mpo);
    where += addANDStatement(`ST_Contains(mpo.geom, b.geom)`);
  }

  where += 'ORDER BY COALESCE("ALEMPSZ", 0) DESC\n';

  // If its only Employee size query, limit result
  if (params.length <= 2) {
    // If only range query.
    if (form.minEmp !== '' && form.maxEmp !== '') {
      where += 'LIMIT 5000';
    } else if (params.length === 1) {
      // if only min or max is input.
      if (form.minEmp !== '' || form.maxEmp !== '') {
        where += 'LIMIT 5000';
      }
    }
  }
  let sql = select + from + where;
  return [sql, params];
}
module.exports = advancedSearchRequest;
