'use strict';
let db_service = require('../utils/db_service');

function geogetmun(mun_name, mun_type, county, exact) {
    return new Promise(function (resolve, reject) {
        let sql =
            `
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
        if(exact === '1') sql += `WHERE UPPER(name) = UPPER('${mun_name}')`;
        else sql += `WHERE UPPER(name) LIKE UPPER('${mun_name}%')`;

        if(mun_type && county)
            sql += 
            `
            AND UPPER(muni_type) = UPPER('${mun_type}')
            AND UPPER(county) = UPPER('${county}')
            `;

        sql += `ORDER BY name;`
        // console.log(sql);
        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err);
            resolve(data.rows);
        });
    });
}

const geoGetMunRequest = function (request, response) {
    if (!request.params.mun) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No Municipality specified'
            });
    }

    geogetmun(request.params.mun, request.query.mun_type, request.query.county, request.query.exact)
        .then(data => {
            return response.status(200)
                .json({
                    data: data,
                });
        }, function (err) {
            return response.status(500)
                .json({
                    status: 'Error',
                    responseText: 'Error in query'
                });
        });
}

module.exports = geoGetMunRequest;