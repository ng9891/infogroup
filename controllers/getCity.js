'use strict';
let db_service = require('../utils/db_service');

function geogetcity(city_name) {
    return new Promise(function (resolve, reject) {
        let sql =
            `
            SELECT 
            name,
            ST_ASGeoJSON(ST_Transform(geom, 4326)) AS geom
            FROM cities_towns as cities
            WHERE UPPER(cities.name) LIKE UPPER('%${city_name}%')
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