'use strict';
let dbService = require('../../utils/db_service');
let utils = require('../../utils/utils');

const selectStatement = `
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
  "BE_Payroll_Expense_Code",
  "BE_Payroll_Expense_Range",
  "BE_Payroll_Expense_Description"\n`;

function queryDB(query, params) {
  return new Promise((resolve, reject) => {
    dbService.runQuery(query, params, (err, data) => {
      if (err) return reject(err);
      resolve(data.rows);
    });
  });
}

function getBusinessVersion(version) {
  if (version === 'original') return 'businesses_2014_o';
  return 'businesses_2014';
}

module.exports = {
  geoByCounty: (county_name, v = 'current', offset = 0, limit = null) => {
    let bussinessVersion = getBusinessVersion(v);
    let withStatement = `
      WITH county AS (
        SELECT 
        geom
        FROM counties_shoreline as county
        WHERE UPPER(county.name) = UPPER($1)
        LIMIT 1
      )
    `;
    let sql = `
      ${withStatement}
      SELECT ${selectStatement}
      FROM ${bussinessVersion} as b, county
      WHERE ST_Contains(county.geom, b.geom)
      ORDER BY COALESCE("ALEMPSZ", 0) DESC
      OFFSET $2
      LIMIT $3
    `;
    return queryDB(sql, [county_name, offset, limit]);
  },
  geoByDistance: ({lon, lat, dist = 1609, v = 'current'} = {}) => {
    let bussinessVersion = getBusinessVersion(v);
    let sql = `
      SELECT ${selectStatement}
      FROM ${bussinessVersion} as b
      WHERE ST_DWithin(ST_GeogFromText('SRID=4326;POINT(' || $1 || ' ' || $2 || ')'), geography(ST_transform(b.geom,4326)), $3);
    `;
    return queryDB(sql, [lon, lat, dist]);
  },
  geoById: (businessId, v = 'current') => {
    let bussinessVersion = getBusinessVersion(v);
    let sql = `
      SELECT ${selectStatement}
      FROM ${bussinessVersion} as b
      WHERE id = $1;
    `;
    return queryDB(sql, [businessId]);
  },
  geoByMpo: (mpo, v = 'current', offset = 0, limit = null) => {
    let bussinessVersion = getBusinessVersion(v);
    let withStatement = `
      WITH mpo AS (
        SELECT 
        geom
        FROM mpo
        WHERE UPPER(mpo.mpo) = UPPER($1)
        OR UPPER(mpo.mpo_name) = UPPER($1)
        LIMIT 1
      )
    `;
    let sql = ` 
      ${withStatement}
      SELECT ${selectStatement}
      FROM ${bussinessVersion} as b, mpo
      WHERE ST_Contains(mpo.geom, b.geom)
      ORDER BY COALESCE("ALEMPSZ", 0) DESC
      OFFSET $2
      LIMIT $3
    `;
    return queryDB(sql, [mpo, offset, limit]);
  },
  geoByMun: (mun, {v = 'current', munType, county, offset = 0, limit = null} = {}) => {
    let bussinessVersion = getBusinessVersion(v);
    // Get all municipality
    let withStatement = `
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
    let params = [mun];
    // Specific municipality query
    if (munType && county) {
      params.push(munType, county);
      withStatement += `
        AND UPPER(muni_type) = UPPER($${params.length - 1})
        AND UPPER(county) = UPPER($${params.length})`;
    }

    let sql = ` 
      ${withStatement}
      )
      SELECT ${selectStatement}
      FROM ${bussinessVersion} as b, mun
      WHERE ST_Contains(mun.geom, b.geom)
      ORDER BY COALESCE("ALEMPSZ", 0) DESC
      OFFSET $${params.length + 1}
      LIMIT $${params.length + 2}
    `;
    params.push(offset, limit);
    return queryDB(sql, params);
  },
  geoByRectangle: ({minLon = 0, minLat = 0, maxLon = 0, maxLat = 0, v = 'current'} = {}) => {
    let bussinessVersion = getBusinessVersion(v);
    let sql = `
      SELECT ${selectStatement}
      FROM ${bussinessVersion} as b
      WHERE ST_Contains(ST_MakeEnvelope($1, $2, $3, $4, 4326), ST_transform(geom,4326));
    `;
    return queryDB(sql, [minLon, minLat, maxLon, maxLat]);
  },
  geoByZip: (zipcode, v = 'current') => {
    let bussinessVersion = getBusinessVersion(v);
    let sql = `
      SELECT ${selectStatement}
      FROM ${bussinessVersion} as b
      WHERE "PRMZIP" = $1;
    `;
    return queryDB(sql, [zipcode]);
  },
  geoBySearch: (
    {
      v = 'current',
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
  ) => {
    let bussinessVersion = getBusinessVersion(v);
    let from = `FROM ${bussinessVersion} as b\n`;
    let where = `WHERE `;
    // Helper function to build string in the where clause
    function addANDStatement(statement) {
      // Check if its the first condition in Where statement.
      if (where.length <= 6) return statement + '\n';
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
      params.push(county, roadSigning, roadGid, mun, mpo, utils.convertMilesToMeters(roadDist));
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

    let sql = 'SELECT' + selectStatement + from + where;
    return queryDB(sql, params);
  },
};
