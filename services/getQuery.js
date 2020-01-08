'use strict';
let dbService = require('../utils/db_service');
let utils = require('../utils/utils');

function queryDB(query, params) {
  return new Promise((resolve, reject) => {
    dbService.runQuery(query, params, (err, data) => {
      if (err) return reject(err);
      resolve(data.rows);
    });
  });
}

const column = utils.columnNames;
const table = utils.tableNames;
const bussinessVersion = table.business;

module.exports = {
  geoGetRoadListFromPoint: (lat = null, lon = null, dist=0.1) => {
    let withStatement = `
    WITH roadwaysFromP AS (
      SELECT ST_Transform(geom,4326), *
      FROM roadway
      WHERE ST_DWithin(geography(ST_SetSRID(ST_MakePoint($1, $2),4326)), geography(ST_Transform(geom,4326)),$3)
    )
    `;
    let sql = `
    ${withStatement}
    SELECT ST_ASGeoJSON(ST_transform(ST_Collect(rp.geom),4326)) as geopoint, dot_id as dot_id, signing, route_no, road_name, county_name
    FROM roadwaysFromP as rp
    GROUP BY rp.dot_id, 3,4,5,6
    `;
    return queryDB(sql, [lon,lat, utils.convertMilesToMeters(dist)]);
  },
  geoGetConameList: (coname) => {
    let sql = `
      SELECT DISTINCT "${column.CONAME}" as name
      FROM businesses as b
      WHERE UPPER("${column.CONAME}") LIKE UPPER($1)
      ORDER BY "${column.CONAME}";
    `;
    return queryDB(sql, [`${coname}%`]);
  },
  geoGetCounty: (county, {state = null, stateCode = null} = {}) => {
    let sql = `
      SELECT 
      INITCAP(county.name) AS name,
      state,
      state_code,
      ST_ASGeoJSON(ST_Transform(geom, 4326)) AS geom
      FROM (SELECT name, 'NEW YORK' as state, 'NY' as state_code, geom
          FROM "counties_shoreline" 
          UNION ALL
          SELECT DISTINCT name, state, state_code, geom
          FROM "counties_neighbor"
        )AS county
      WHERE UPPER(county.name) LIKE UPPER($1)
      AND ($2::char IS NULL OR UPPER(state) = UPPER($2))
      AND ($3::char IS NULL OR UPPER(state_code) = UPPER($3))
      ORDER BY name;
    `;
    return queryDB(sql, [`${county}%`, state, stateCode]);
  },
  getEmpSizeList: () => {
    let sql = `
      SELECT DISTINCT "${column.LEMPSZDS}" as "LEMPSZDS", "${column.LEMPSZCD}" as "LEMPSZCD"
      FROM ${bussinessVersion}
      WHERE "${column.LEMPSZCD}" IS NOT NULL
      ORDER BY "${column.LEMPSZCD}";
    `;
    return queryDB(sql, []);
  },
  getNaicsList: (type = 'BOTH') => {
    let select = '';
    type = type.trim().toUpperCase();
    switch (type) {
      case "'DS'":
        select = `"${column.NAICSDS}" as "NAICSDS"`;
        break;
      case "'CD'":
        select = `"${column.NAICSCD}" as "NAICSCD"`;
        break;
      default:
        select = `"${column.NAICSCD}" as "NAICSCD", "${column.NAICSDS}" as "NAICSDS"`;
        break;
    }
    let sql = `
      SELECT  
      DISTINCT ${select}
      FROM ${bussinessVersion}
      WHERE "${column.NAICSCD}" IS NOT NULL
      AND "${column.NAICSDS}" IS NOT NULL;
    `;
    return queryDB(sql, []);
  },
  geoGetMpo: (mpo) => {
    let sql = `
      SELECT 
      mpo.mpo AS abbrv,
      mpo.mpo_name AS name,
      ST_ASGeoJSON(ST_Transform(geom, 4326)) AS geom
      FROM mpo
      WHERE UPPER(mpo.mpo) LIKE UPPER($1)
      OR UPPER(mpo.mpo_name) LIKE UPPER($1);
    `;
    return queryDB(sql, [`${mpo}%`]);
  },
  geoGetMun: (mun, munType, county, exact = 0) => {
    let params = [];
    let sql = `
      SELECT 
      name,
      county,
      muni_type,
      ST_ASGeoJSON(ST_Transform(geom, 4326)) AS geom
      FROM(
          SELECT c.name, c.muni_type, c.county, c.geom
          FROM cities_towns c
          UNION ALL
          SELECT v.name, 'village' as muni_type, v.county, v.geom
          FROM villages v
      ) muni
    `;
    // Exact params for overlay query without mun_type and county
    if (exact === '1') {
      sql += `WHERE UPPER(name) = UPPER($1)`;
      params.push(mun);
    } else {
      sql += `WHERE UPPER(name) LIKE UPPER($1)`;
      params.push(`${mun}%`);
    }

    if (munType && county) {
      sql += `
        AND UPPER(muni_type) = UPPER($2)
        AND UPPER(county) = UPPER($3)
      `;
      params.push(munType, county);
    }
    sql += `\nORDER BY name;`;
    return queryDB(sql, params);
  },
  geoGetRoad: ({roadNo = null, county = null, signing = null, roadId = null, offset = 0, limit = null} = {}) => {
    let params = [];
    let sql = `
      SELECT ST_ASGeoJSON(ST_Transform(geom, 4326)) as geom, gid, gis_id, dot_id, road_name, route,\
       county_name, muni_name, mpo_desc,signing, fc
      FROM roadway\n`;
    if (roadNo === null) sql += `WHERE (route_no IS NULL)`;
    else {
      sql += `WHERE route_no = $1::int`;
      params.push(roadNo);
    }
    sql += `  
      AND ($${params.length + 1}::varchar(40) IS NULL OR UPPER(county_name) = UPPER($${params.length + 1}))
      AND ($${params.length + 2}::varchar(10) IS NULL OR signing = UPPER($${params.length + 2}))
      AND ($${params.length + 3}::int IS NULL OR dot_id = $${params.length + 3})
      OFFSET $${params.length + 4}
      LIMIT $${params.length + 5}
    ;`;
    params.push(county, signing, roadId, offset, limit);
    return queryDB(sql, params);
  },
  getSalesVolumeList: () => {
    let sql = `
      SELECT 
      DISTINCT "${column.LSALVOLDS}" as "LSALVOLDS", "${column.LSALVOLCD}" as "LSALVOLCD" 
      FROM ${bussinessVersion}
      ORDER BY "${column.LSALVOLCD}";
    `;
    return queryDB(sql, []);
  },
  getSic: (sic, type = 'BOTH') => {
    let columnToQuery = '';
    let whereStatement = '';
    let orderBy = '';
    let param = [];
    if (!sic) {
      columnToQuery = `"${column.PRMSICCD}" as "PRMSICCD", "${column.PRMSICDS}" as "PRMSICDS"`;
      whereStatement = `WHERE "${column.PRMSICDS}" IS NOT NULL`;
      orderBy = `"${column.PRMSICCD}", "${column.PRMSICDS}"`;
    } else {
      type = type.trim().toUpperCase();
      param.push(`${sic}%`);
      switch (type) {
        case "'DS'":
          columnToQuery = `"${column.PRMSICDS}" as "PRMSICDS"`;
          whereStatement = `WHERE UPPER("${column.PRMSICDS}") LIKE UPPER($1)`;
          orderBy = `"${column.PRMSICDS}"`;
          break;
        case "'CD'":
          columnToQuery = `"${column.PRMSICCD}" as "PRMSICCD"`;
          whereStatement = `WHERE UPPER(cast("${column.PRMSICCD}" as varchar)) LIKE UPPER($1)`;
          orderBy = `"${column.PRMSICCD}"`;
          break;
        default:
          columnToQuery = `"${column.PRMSICCD}" as "PRMSICCD", "${column.PRMSICDS}" as "PRMSICDS"`;
          whereStatement = `WHERE UPPER(cast("${column.PRMSICCD}" as varchar)) LIKE UPPER($1) 
                            OR UPPER("${column.PRMSICDS}") LIKE UPPER($1)`;
          orderBy = `"${column.PRMSICCD}", "${column.PRMSICDS}"`;
          break;
      }
    }
    let sql = `
      SELECT  
      DISTINCT ${columnToQuery}
      FROM ${bussinessVersion} 
      ${whereStatement}
      ORDER BY ${orderBy};
    `;
    return queryDB(sql, param);
  },
  geoGetZip: (zip) => {
    let sql = `
      SELECT 
      zcta5ce10 AS name,
      ST_ASGeoJSON(ST_Transform(geom, 4326)) AS geom
      FROM zip
      WHERE "zcta5ce10" LIKE $1
      ORDER BY CAST(zcta5ce10 AS int);
    `;
    return queryDB(sql, [`${zip}%`]);
  },
  getSqFootList: () => {
    let sql = `
      SELECT DISTINCT "${column.SQFOOTCD}" as "SQFOOTCD", "${column.SQFOOTDS}" as "SQFOOTDS"
      FROM ${bussinessVersion}
      WHERE "${column.SQFOOTCD}" IS NOT NULL
      ORDER BY "${column.SQFOOTCD}";
    `;
    return queryDB(sql, []);
  },
};
