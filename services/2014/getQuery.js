'use strict';
let dbService = require('../../utils/db_service');

function queryDB(query, params) {
  return new Promise((resolve, reject) => {
    dbService.runQuery(query, params, (err, data) => {
      if (err) return reject(err);
      resolve(data.rows);
    });
  });
}

const bussinessVersion = 'businesses_2014';

module.exports = {
  geoGetCounty: (county) => {
    let sql = `
      SELECT 
      county.name AS name,
      ST_ASGeoJSON(ST_Transform(geom, 4326)) AS geom
      FROM counties_shoreline AS county
      WHERE UPPER(county.name) LIKE UPPER($1);
    `;
    return queryDB(sql, [`${county}%`]);
  },
  getEmpSizeList: () => {
    let sql = `
      SELECT DISTINCT "LEMPSZDS", "LEMPSZCD"
      FROM ${bussinessVersion}
      WHERE "LEMPSZCD" IS NOT NULL
      ORDER BY "LEMPSZCD";
    `;
    return queryDB(sql, []);
  },
  getNaicsList: (type = 'BOTH') => {
    let select = '';
    type = type.trim().toUpperCase();
    switch (type) {
      case "'DS'":
        select = `"NAICSDS"`;
        break;
      case "'CD'":
        select = `"NAICSCD"`;
        break;
      default:
        select = `"NAICSCD", "NAICSDS"`;
        break;
    }
    let sql = `
      SELECT  
      DISTINCT ${select}
      FROM ${bussinessVersion}
      WHERE "NAICSCD" IS NOT NULL
      AND "NAICSDS" IS NOT NULL;
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
  geoGetRoad: ({roadNo = null, county = null, signing = 'I', gid = null, offset = 0, limit = null} = {}) => {
    let params = [];
    let sql = `
      SELECT ST_ASGeoJSON(ST_Transform(geom, 4326)) as geom, gid, gis_id, dot_id, road_name, route,\
       county_name, muni_name, mpo_desc,signing, fc
      FROM roadway\n`;
    if (roadNo === null) sql += `WHERE route_no IS NULL`;
    else {
      sql += `WHERE route_no = $1::int`;
      params.push(roadNo);
    }
    sql += `  
      AND ($${params.length + 1}::varchar(40) IS NULL OR UPPER(county_name) = UPPER($${params.length + 1}))
      AND ($${params.length + 2}::varchar(10) IS NULL OR signing = UPPER($${params.length + 2}))
      AND ($${params.length + 3}::int IS NULL OR gid = $${params.length + 3})
      OFFSET $${params.length + 4}
      LIMIT $${params.length + 5}
    ;`;
    params.push(county, signing, gid, offset, limit);
    return queryDB(sql, params);
  },
  getSalesVolumeList: () => {
    let sql = `
      SELECT 
      DISTINCT "LSALVOLDS", "LSALVOLCD" 
      FROM ${bussinessVersion}
      ORDER BY "LSALVOLCD";
    `;
    return queryDB(sql, []);
  },
  getSic: (sic, type = 'BOTH') => {
    let columnToQuery = '';
    let whereStatement = '';
    let param = [];
    if (!sic) {
      columnToQuery = `"PRMSICCD", "PRMSICDS"`;
      whereStatement = `WHERE "PRMSICCD" IS NOT NULL`;
    } else {
      type = type.trim().toUpperCase();
      param.push(`${sic}%`);
      switch (type) {
        case "'DS'":
          columnToQuery = `"PRMSICDS"`;
          whereStatement = `WHERE UPPER("PRMSICDS") LIKE UPPER($1)`;
          break;
        case "'CD'":
          columnToQuery = `"PRMSICCD"`;
          whereStatement = `WHERE UPPER(cast("PRMSICCD" as varchar)) LIKE UPPER($1)`;
          break;
        default:
          columnToQuery = `"PRMSICCD", "PRMSICDS"`;
          whereStatement = `WHERE UPPER(cast("PRMSICCD" as varchar)) LIKE UPPER($1) 
                    OR UPPER("PRMSICDS") LIKE UPPER($1)`;
          break;
      }
    }
    let sql = `
      SELECT  
      DISTINCT ${columnToQuery}
      FROM ${bussinessVersion} 
      ${whereStatement}
      ORDER BY ${columnToQuery};
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
      SELECT DISTINCT "SQFOOTCD", "SQFOOTDS"
      FROM ${bussinessVersion}
      WHERE "SQFOOTCD" IS NOT NULL
      ORDER BY "SQFOOTCD";
    `;
    return queryDB(sql, []);
  },
};
