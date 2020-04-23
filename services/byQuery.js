'use strict';
let dbService = require('../utils/db_service');
let utils = require('../utils/utils');

const defaultBufferSize = 0.5; // miles
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
  `;

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
  geoByDrivingDist: ({lat, lon, dist = defaultBufferSize, directed = false, v = 'current'} = {}) => {
    let bussinessVersion = getBusinessVersion(v);
    let withStatement = `
      WITH driving as (SELECT ST_SetSRID(ST_ConvexHull(
        (	SELECT ST_Collect(the_geom)
          FROM pgr_drivingDistance(
            'SELECT id, source, target, km AS cost, (CASE WHEN reverse_cost < 1000000 THEN -(km) ELSE 1000000 END) as reverse_cost FROM public.at_2po_4pgr',
            (SELECT source FROM public.at_2po_4pgr
            ORDER BY ST_Distance(
              ST_StartPoint(the_geom),
              ST_GeomFromText('SRID=4326;POINT(' || $1 || ' ' || $2 || ')'),
              true
            ) ASC
            LIMIT 1),
            $3, $4
          ) as pt
          JOIN public.at_2po_4pgr rd ON pt.edge = rd.id
        )),4326) as geom
      )
    `;
    let sql = `
      ${withStatement}
      SELECT ${selectStatement}
      FROM ${bussinessVersion} as b, driving as d
      WHERE ST_Intersects(ST_Transform(b.geom, 4326), d.geom)
    `;
    return queryDB(sql, [lon, lat, utils.convertMilesToKmeters(dist), directed]);
  },
  geoByRailroad: (station, route = null, dist = defaultBufferSize, v = 'current') => {
    // station = decodeURI(station);
    let bussinessVersion = getBusinessVersion(v);
    let withStatement = `
      WITH station AS(
        SELECT *
        FROM (
          SELECT stop_name, 'MN' as mta, geom
          FROM mta_mn
          UNION ALL
          SELECT stop_name, 'LI' as mta, geom
          FROM mta_li
          UNION ALL
          SELECT stop_name, daytime_routes as mta, geom
          FROM mta_nyc
          UNION ALL
          SELECT SUBSTRING(a."STNNAME" FROM 0 FOR POSITION(',' IN a."STNNAME")) as stopname, 'AMTK' as mta, geom
          FROM amtrak as a 
          WHERE a."STATE" = 'NY'
        ) as railroads
        WHERE UPPER(stop_name) LIKE UPPER($1)
        AND ($2::char IS NULL OR UPPER(mta) LIKE UPPER($2))
        LIMIT 10
      )
    `;
    let sql = `
      ${withStatement}
      SELECT ${selectStatement}
      FROM ${bussinessVersion} as b
      INNER JOIN station as s
      ON ST_DWithin(s.geom::geography, ST_Transform(b.geom,4326)::geography, $3)
    `;
    let params = [`${station}%`];
    if (route) params.push(`%${decodeURI(route)}%`);
    else params.push(null);
    params.push(utils.convertMilesToMeters(dist));
    return queryDB(sql, params);
  },
  /**
   * Creates a geometry from GeoJSON and query points around a buffer of 'dist' value.
   * Input should be a valid geoJSON
   * @param {GeoJSON} geoJson 
   * @param {String} v 
   * @param {Number} dist 
   */
  geoByGeoJson: (geoJson, dist = defaultBufferSize, v = 'current') => {
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
  geoByPolyline: (coordArr, dist = defaultBufferSize, v = 'current') => {
    let bussinessVersion = getBusinessVersion(v);

    function createLinestringSQLFromArr(lineCoordArr) {
      let str = `ST_GeomFromText('LINESTRING(`;
      for (const [index, [lat, lon]] of lineCoordArr.entries()) {
        str += `${lat} ${lon}`;
        if (index < lineCoordArr.length - 1) str += ',';
      }
      return (str += `)',4326)`);
    }

    let sql = `
      SELECT ${selectStatement}
      FROM ${bussinessVersion} as b
      WHERE ST_DWithin(${createLinestringSQLFromArr(coordArr)}::geography,\
      ST_Transform(geom,4326)::geography,$1);
    `;
    return queryDB(sql, [utils.convertMilesToMeters(dist)]);
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
      naicsDS = null,
      naicsCD = null,
      prmSicDs = '',
      minEmp = '',
      maxEmp = '',
      lsalvol = '',
      roadNo = null,
      roadId = null,
      roadSigning = null,
      roadDist = defaultBufferSize,
      mun = '',
      mun_type = '',
      mun_county = '',
      county = '',
      state = null,
      stateCode = null,
      mpo = '',
      matchCD = null,
    } = {}
  ) => {
    coname = decodeURIComponent(coname);
    prmSicDs = decodeURIComponent(prmSicDs);
    lsalvol = decodeURIComponent(lsalvol);
    county = county ? decodeURIComponent(county) : '';
    state = state ? decodeURIComponent(state) : null;
    stateCode = stateCode ? decodeURIComponent(stateCode) : null;
    mpo = mpo ? decodeURIComponent(mpo) : '';

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
    if (naicsCD) {
      let andStatement = ``;
      let separation = naicsCD.indexOf('-');
      if (separation !== -1) {
        let left = naicsCD.slice(0, separation);
        let right = naicsCD.slice(separation + 1);
        let diff = +right - +left;
        for (let i = 0; i <= diff; i++) {
          if (i === 0) {
            andStatement += `"${column.NAICSCD}"::TEXT LIKE $${params.length + 1}`;
            params.push(`${+left + i}%`);
          } else {
            andStatement += ` OR "${column.NAICSCD}"::TEXT LIKE $${params.length + 1}`;
            params.push(`${+left + i}%`);
          }
        }
        where += addANDStatement(`(${andStatement})`);
      } else {
        andStatement = `"${column.NAICSCD}"::TEXT LIKE $${params.length + 1}`;
        where += addANDStatement(andStatement);
        params.push(`${naicsCD}%`);
      }
    }
    if (naicsDS) {
      where += addANDStatement(`"${column.NAICSDS}" LIKE $${params.length + 1}`);
      params.push(`${naicsDS}%`);
    }
    if (prmSicDs !== '') {
      where += addANDStatement(`"${column.PRMSICDS}" LIKE $${params.length + 1}`);
      params.push(`${prmSicDs}%`);
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

    if (matchCD) {
      if (matchCD === 'NULL') {
        where += addANDStatement(`"${column.MATCHCD}" IS NULL`);
      } else {
        where += addANDStatement(`"${column.MATCHCD}" = $${params.length + 1}`);
        params.push(matchCD);
      }
    }

    // If its a road query.
    if (roadNo !== null || roadSigning !== null || roadId !== null) {
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
        AND ($${params.length + 3}::varchar(10) IS NULL OR dot_id = $${params.length + 3}::int)
        AND (NULLIF($${params.length + 4}, '')::varchar(40) IS NULL OR UPPER(muni_name) = UPPER($${params.length + 4}))
        AND (NULLIF($${params.length + 5}, '')::varchar(40) IS NULL OR UPPER(mpo_desc) = UPPER($${params.length + 5}))
      ) as r\n`;
      where += addANDStatement(`ST_DWithin(r.geom, b.geom, $${params.length + 6})`);
      params.push(county, roadSigning, roadId, mun, mpo, utils.convertMilesToMeters(roadDist));
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
      if (minEmp && maxEmp) {
        where += 'LIMIT 5000';
      } else if (params.length === 1) {
        // if only min or max is input.
        if (minEmp || maxEmp) {
          where += 'LIMIT 5000';
        }
      }

      // If only match code is selected and it is parcel.
      if (matchCD && matchCD === 'P') {
        where += 'LIMIT 200000';
      }
    }

    let sql = 'SELECT' + selectStatement + from + where;
    // console.log(sql);
    return queryDB(sql, params);
  },
};
