'use strict';
let db_service = require('../utils/db_service');

function geogetcounty(county_name) {
    return new Promise(function (resolve, reject) {
        let sql =
            `
            SELECT 
            county.name AS name,
            ST_ASGeoJSON(ST_Transform(geom, 4326)) AS geom
            FROM counties_shoreline AS county
            WHERE UPPER(county.name) LIKE UPPER('${county_name}%');
            `;
        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err);
            resolve(data.rows);
        });
    });
}

const geoGetCountyRequest = function (request, response) {
    if (!request.params.county) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No county specified'
            });
    }

    geogetcounty(request.params.county)
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

module.exports = geoGetCountyRequest;