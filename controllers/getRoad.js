'use strict';
let db_service = require('../utils/db_service');

function geogetroad({roadNo = null, county = null, signing = 'I', gid = null, offset = 0, limit = null} = {}) {
  return new Promise(function(resolve, reject) {
    let value = [];
    let sql = `
      SELECT ST_ASGeoJSON(ST_Transform(geom, 4326)) as geom, gid, gis_id, dot_id, road_name, route,\
       county_name, muni_name, mpo_desc,signing, fc
      FROM roadway\n`;
    if (roadNo === null) sql += `WHERE route_no IS NULL`;
    else {
      sql += `WHERE route_no = $1::int`;
      value.push(roadNo);
    }
    sql += `  
      AND ($${value.length + 1}::varchar(40) IS NULL OR UPPER(county_name) = UPPER($${value.length + 1}))
      AND ($${value.length + 2}::varchar(10) IS NULL OR signing = UPPER($${value.length + 2}))
      AND ($${value.length + 3}::int IS NULL OR gid = $${value.length + 3})
      OFFSET $${value.length + 4}
      LIMIT $${value.length + 5}
    ;`;
    value.push(county, signing, gid, offset, limit);
    // console.log(sql,value);
    db_service.runQuery(sql, value, (err, data) => {
      if (err) return reject(err.stack);
      resolve(data.rows);
    });
  });
}

const geoGetRoadRequest = (request, response) => {
  if (!request.query) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No road number specified',
    });
  }
  // Copy query object.
  let query = Object.assign({}, request.query);
  // Sanitize input
  Object.keys(query).forEach((k) => {
    if (!query[k] || query[k] == 'undefined') return delete query[k];
    if (k === 'gid') {
      if (isNaN(+query[k])) return delete query[k];
    }
  });
  // Empty query or road is not a number. Return empty array.
  if (Object.keys(query).length === 0)
    return response.status(200).json({
      data: [],
    });

  geogetroad(query).then(
    (data) => {
      return response.status(200).json({
        data: data,
      });
    },
    (err) => {
      return response.status(500).json({
        status: 'Error',
        responseText: 'Error in query ' + err,
      });
    }
  );
};

module.exports = geoGetRoadRequest;

/*
SELECT ST_ASGeoJSON(ST_Transform(ST_Union(geom),4326)), gis_id, dot_id, route
FROM roadway
WHERE UPPER(county_name) = UPPER('ALBANY')
AND route_no = 87
AND direction = 1
GROUP BY gis_id, dot_id, route
*/

/* no grouping
SELECT ST_ASGeoJSON(ST_Transform(geom, 4326)) as geom, gis_id, dot_id, route
FROM roadway
WHERE UPPER(county_name) = UPPER('ALBANY')
AND route_no = 87
*/
