'use strict';
let db_service = require('../utils/db_service');

function geogetcity(mun_name) {
    return new Promise(function (resolve, reject) {
        // let sql =
        //     `
        //     SELECT 
        //     name,
        //     ST_ASGeoJSON(ST_Transform(MAX(geom), 4326)) AS geom
        //     FROM(
        //             SELECT geom, name
        //             FROM cities_towns as cities
        //             WHERE UPPER(cities.name) LIKE UPPER('${mun_name}%')
        //             UNION
        //             SELECT geom, name
        //             FROM villages
        //             WHERE UPPER(villages.name) LIKE UPPER('${mun_name}%')
        //         ) mun
        //     GROUP BY name
        //     `;
        // allows duplication
        // let sql =
        //     `
        //     SELECT 
        //     name,
        //     ST_ASGeoJSON(ST_Transform(geom, 4326))) AS geom
        //     FROM(
        //             SELECT geom, name
        //             FROM cities_towns as cities
        //             WHERE UPPER(cities.name) LIKE UPPER('${mun_name}%')
        //             UNION
        //             SELECT geom, name
        //             FROM villages
        //             WHERE UPPER(villages.name) LIKE UPPER('${mun_name}%')
        //         ) mun
        //     `;
        let sql =
            `
            SELECT 
            name,
            muni_type,
            ST_ASGeoJSON(ST_Transform(geom, 4326)) AS geom
            FROM(
                SELECT c.name, c.muni_type, c.geom
                FROM cities_towns c
                UNION ALL
                SELECT v.name, 'village' as muni_type, v.geom
                FROM villages v
            ) muni
            WHERE UPPER(name) LIKE UPPER('${mun_name}%')
            ORDER BY name
            `;
        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err);
            resolve(data.rows);
        });
    });
}

const geoGetCityRequest = function (request, response) {
    if (!request.params.city) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No city specified'
            });
    }

    geogetcity(request.params.city)
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

module.exports = geoGetCityRequest;