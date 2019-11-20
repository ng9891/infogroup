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
    console.log(sql, params);
    db_service.runQuery(sql, params, (err, data) => {
      if (err) return reject(err.stack);
      resolve(data.rows);
    });
  });
}

const advancedSearchRequest = (request, response) => {
  if (!request.query) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No query',
    });
  }

  // Copy query object.
  let query = Object.assign({}, request.query);
  // Sanitize input
  Object.keys(query).forEach((k) => {
    if (!query[k]) return delete query[k];
    if (k === 'naicscd' || k === 'minEmp' || k === 'maxEmp' || k === 'roadNo' || k === 'roadGid' || k === 'roadDist') {
      if (isNaN(+query[k])) return delete query[k];
    }
  });
  // Empty query or only version property included. Return empty array.
  if (Object.keys(query).length <= 1)
    return response.status(200).json({
      data: [],
    });
  advancedSearch(query).then(
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

/**
 * Helper function to parameterized query string.
 * @param {Object} param0 
 */
function build_query(
  {
    version = 'current',
    naicsds = '',
    naicscd = '',
    minEmp = '',
    maxEmp = '',
    lsalvol = '',
    roadNo = null,
    roadGid = null,
    roadSigning = '',
    roadDist = 0.3,
    mun = '',
    mun_type = '',
    mun_county = '',
    county = '',
    mpo = '',
  } = {}
) {
  let from_statement = 'businesses_2014';
  if (version === 'original') from_statement = 'businesses_2014_o';
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
    // Check if its the first condition in Where statement.
    if (where.length <= 6) {
      return statement + '\n';
    }
    return 'AND ' + statement + '\n';
  }

  let params = [];
  if (naicsds !== '') {
    where += addANDStatement(`"NAICSDS" = $${params.length + 1}`);
    params.push(naicsds);
  }
  if (naicscd !== '') {
    where += addANDStatement(`"NAICSCD" = $${params.length + 1}`);
    params.push(+naicscd);
  }
  if (minEmp !== '' || maxEmp !== '') {
    // TODO: INCLUDE NULL statement to search null ALEMPSZ
    if (minEmp !== '') {
      where += addANDStatement(`"ALEMPSZ" >= $${params.length + 1}`);
      params.push(+minEmp);
    }
    if (maxEmp !== '') {
      where += addANDStatement(`"ALEMPSZ" <= $${params.length + 1}`);
      params.push(+maxEmp);
    }
  }
  if (lsalvol !== '') {
    where += addANDStatement(`"LSALVOLDS" = $${params.length + 1}`);
    params.push(lsalvol);
  }

  // If its a road query.
  if (roadNo !== null || roadSigning !== '' || roadGid !== null) {
    from += `,(
      SELECT ST_Union(geom) as geom
      FROM roadway\n`;
    if (roadNo === null) from += `WHERE route_no IS NULL`;
    else {
      from += `WHERE route_no = $${params.length + 1}::int`;
      params.push(roadNo);
    }
    from += `
      AND (NULLIF($${params.length + 1}, '')::varchar(40) IS NULL OR UPPER(county_name) = UPPER($${params.length + 1}))
      AND (NULLIF($${params.length + 2}, '')::varchar(10) IS NULL OR signing = UPPER($${params.length + 2}))
      AND ($${params.length + 3}::varchar(10) IS NULL OR gid = $${params.length + 3}::int)
      AND (NULLIF($${params.length + 4}, '')::varchar(40) IS NULL OR UPPER(muni_name) = UPPER($${params.length + 4}))
      AND (NULLIF($${params.length + 5}, '')::varchar(40) IS NULL OR UPPER(mpo_desc) = UPPER($${params.length + 5}))
    ) as r\n`;
    where += addANDStatement(`ST_DWithin(r.geom, b.geom, $${params.length + 6})`);
    params.push(county, roadSigning, roadGid, mun, mpo, convertToMeters(roadDist));
  } else {
    if (mun !== '') {
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
      params.push(mun);
      from += `AND UPPER(muni_type) = UPPER($${params.length + 1})\n`;
      params.push(mun_type);
      from += `AND UPPER(county) = UPPER($${params.length + 1})
              ) as mun\n`;
      params.push(mun_county);
      where += addANDStatement(`ST_Contains(mun.geom, b.geom)`);
    } else if (county !== '') {
      from += `,( 
              SELECT county.geom
              FROM counties_shoreline as county
              WHERE UPPER(county.name) = UPPER($${params.length + 1})
              LIMIT 1) as county\n`;
      where += addANDStatement(`ST_Contains(county.geom, b.geom)`);
      params.push(county);
    } else if (mpo !== '') {
      from += `,(
              SELECT mpo.geom
              FROM mpo
              WHERE UPPER(mpo.mpo) = UPPER($${params.length + 1})
              OR UPPER(mpo.mpo_name) = UPPER($${params.length + 1})
              LIMIT 1) as mpo\n`;
      params.push(mpo);
      where += addANDStatement(`ST_Contains(mpo.geom, b.geom)`);
    }
  }

  where += 'ORDER BY COALESCE("ALEMPSZ", 0) DESC\n';

  // If its only Employee size query, limit result
  if (params.length <= 2) {
    // If only range query.
    if (minEmp !== '' && maxEmp !== '') {
      where += 'LIMIT 5000';
    } else if (params.length === 1) {
      // if only min or max is input.
      if (minEmp !== '' || maxEmp !== '') {
        where += 'LIMIT 5000';
      }
    }
  }
  let sql = select + from + where;
  return [sql, params];
}

function convertToMeters(val) {
  return val / 0.00062137;
}
module.exports = advancedSearchRequest;
