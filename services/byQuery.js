'use strict';
let dbService = require('../utils/db_service');
let utils = require('../utils/utils');

const column = utils.columnNames;
const table = utils.tableNames;

const selectStatement = `
  "${column.id}" as id,
  ST_ASGeoJSON(ST_transform(b."${column.geom}",4326)) as geoPoint,
  "${column.PRMADDR}" as "PRMADDR",
  "${column.PRMCITY}" as "PRMCITY",
  "${column.PRMSTATE}" as "PRMSTATE",
  "${column.PRMZIP}" as "PRMZIP",
  "${column.COUNTY}" as "COUNTY",
  "${column.CONAME}" as alias,
  "${column.CONAME}" as "CONAME",
  "${column.NAICSCD}" as "NAICSCD",
  "${column.NAICSDS}" as "NAICSDS", 
  "${column.LEMPSZCD}" as "LEMPSZCD", 
  "${column.LEMPSZDS}" as "LEMPSZDS",
  "${column.ALEMPSZ}" as "ALEMPSZ", 
  "${column.ACEMPSZ}" as "ACEMPSZ",
  "${column.SQFOOTCD}" as "SQFOOTCD",
  "${column.SQFOOTDS}" as "SQFOOTDS",
  "${column.PRMSICCD}" as "PRMSICCD",
  "${column.PRMSICDS}" as "PRMSICDS",
  "${column.LSALVOLCD}" as "LSALVOLCD",
  "${column.LSALVOLDS}" as "LSALVOLDS",
  "${column.ALSLSVOL}" as "ALSLSVOL",
  "${column.CSALVOLCD}" as "CSALVOLCD",
  "${column.CSALVOLDS}" as "CSALVOLDS",
  "${column.ACSLSVOL}" as "ACSLSVOL",
  "${column.MATCHCD}" as "MATCHCD",
  "${column.INDIVIDUAL_FIRM_CODE}" as "INDIVIDUAL_FIRM_CODE",
  "${column.INDIVIDUAL_FIRM_DESC}" as "INDIVIDUAL_FIRM_DESC",
  "${column.YEAR_SIC_ADDED}" as "YEAR_SIC_ADDED",
  "${column.BIG_BUSINESS}" as "BIG_BUSINESS",
  "${column.HIGHTECHBUSINESS}" as "HIGHTECHBUSINESS",
  "${column.LATITUDEO}" as "LATITUDEO",
  "${column.LONGITUDEO}" as "LONGITUDEO"
\n`;

function queryDB(query, params) {
  return new Promise((resolve, reject) => {
    dbService.runQuery(query, params, (err, data) => {
      if (err) return reject(err);
      resolve(data.rows);
    });
  });
}

function getBusinessVersion(version) {
  if (version === 'original') return `${table.business}_o`;
  return `${table.business}`;
}

module.exports = {
  /**
   * Creates a geometry from GeoJSON and query points around a buffer of 'dist' value.
   * Input should be a valid geoJSON
   * @param {GeoJSON} geoJson 
   * @param {String} v 
   * @param {Number} dist 
   */
  geoByGeoJson: (geoJson, v = 'current', dist = 0.5) => {
    let json = JSON.stringify(geoJson);
    let bussinessVersion = getBusinessVersion(v);
    let withStatement = `
      WITH geojson as (
        SELECT ST_GeomFromGeoJSON(json_array_elements(gdata.gj->'features')->>'geometry') as geom
        FROM (
          SELECT $1::json as gj
        ) as gdata
      )
    `;
    let sql = `
      ${withStatement}
      SELECT ${selectStatement}
      FROM (
        SELECT ST_Transform(ST_Collect(ST_SetSRID(geojson.geom,4326)),26918) AS geom
        FROM geojson
      ) as geoCollection, ${bussinessVersion} as b
      WHERE ST_DWithin(geoCollection.geom, b.geom, $2);
    `;
    return queryDB(sql, [json, utils.convertMilesToMeters(dist)]);
  },
  geoByCounty: (county_name, {state = null, stateCode = null, v = 'current', offset = 0, limit = null} = {}) => {
    let bussinessVersion = getBusinessVersion(v);
    let withStatement = `
      WITH county AS (
        SELECT 
        geom
        FROM (
          SELECT name,'NEW YORK' as state,'NY' as state_code, ST_Transform(geom,26918) as geom
          FROM "counties_shoreline" 
          UNION ALL
          SELECT DISTINCT name, state, state_code, geom
          FROM "counties_neighbor"
        ) as county
        WHERE UPPER(county.name) = UPPER($1)
        AND ($2::char IS NULL OR UPPER(state) = UPPER($2))
        AND ($3::char IS NULL OR UPPER(state_code) = UPPER($3))
        LIMIT 1
      )
    `;
    let sql = `
      ${withStatement}
      SELECT ${selectStatement}
      FROM ${bussinessVersion} as b, county
      WHERE ST_Contains(county.geom, b.geom)
      ORDER BY COALESCE("${column.ALEMPSZ}", 0) DESC
      OFFSET $4
      LIMIT $5
    `;
    return queryDB(sql, [county_name, state, stateCode, offset, limit]);
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
      ORDER BY COALESCE("${column.ALEMPSZ}", 0) DESC
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
      ORDER BY COALESCE("${column.ALEMPSZ}", 0) DESC
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
      WHERE "${column.PRMZIP}" = $1;
    `;
    return queryDB(sql, [zipcode]);
  },
  geoBySearch: (
    {
      v = 'current',
      coname = '',
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
      state = null,
      stateCode = null,
      mpo = '',
    } = {}
  ) => {
    coname = decodeURIComponent(coname);
    naicsds = decodeURIComponent(naicsds);
    lsalvol = decodeURIComponent(lsalvol);
    county = (county) ? decodeURIComponent(county) : '';
    state = (state) ? decodeURIComponent(state) : null;
    stateCode = (stateCode) ? decodeURIComponent(stateCode) : null;
    mpo = (mpo) ? decodeURIComponent(mpo) : '';

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
    if (coname !== '') {
      where += addANDStatement(`UPPER("${column.CONAME}") LIKE UPPER($${params.length + 1})`);
      params.push(`${coname}%`);
    }
    if (naicsds !== '') {
      where += addANDStatement(`"${column.NAICSDS}" LIKE $${params.length + 1}`);
      params.push(`${naicsds}%`);
    }
    if (naicscd !== '') {
      where += addANDStatement(`"${column.NAICSCD}" = $${params.length + 1}`);
      params.push(+naicscd);
    }
    if (minEmp !== '' || maxEmp !== '') {
      // TODO: INCLUDE NULL statement to search null ALEMPSZ
      if (minEmp !== '') {
        where += addANDStatement(`"${column.ALEMPSZ}" >= $${params.length + 1}`);
        params.push(+minEmp);
      }
      if (maxEmp !== '') {
        where += addANDStatement(`"${column.ALEMPSZ}" <= $${params.length + 1}`);
        params.push(+maxEmp);
      }
    }
    if (lsalvol !== '') {
      where += addANDStatement(`"${column.LSALVOLDS}" = $${params.length + 1}`);
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
        AND (NULLIF($${params.length + 1}, '')::varchar(40) IS NULL OR UPPER(county_name) = UPPER($${params.length +
        1}))
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
              SELECT counties.geom
              FROM (
                SELECT name,'NEW YORK' as state,'NY' as state_code, ST_Transform(geom,26918) as geom
                FROM "counties_shoreline"
                UNION ALL
                SELECT DISTINCT name, state, state_code, geom
                FROM "counties_neighbor"
              ) as counties
              WHERE UPPER(counties.name) = UPPER($${params.length + 1})
              AND ($${params.length + 2}::char IS NULL OR UPPER(state) = UPPER($${params.length + 2}))
              AND ($${params.length + 3}::char IS NULL OR UPPER(state_code) = UPPER($${params.length + 3}))
              LIMIT 1) as county\n`;
        where += addANDStatement(`ST_Contains(county.geom, b.geom)`);
        params.push(county, state, stateCode);
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

    where += `ORDER BY COALESCE("${column.ALEMPSZ}", 0) DESC\n`;

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
