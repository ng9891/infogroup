'use strict';
let db_service = require('../utils/db_service');

function geogetzip(zip) {
    return new Promise(function (resolve, reject) {
        let sql =
            `
            SELECT 
            zcta5ce10 AS name,
            ST_ASGeoJSON(ST_Transform(geom, 4326)) AS geom
            FROM zip
            WHERE "zcta5ce10" LIKE '${zip}%'
            ORDER BY CAST(zcta5ce10 AS int);
            `;
        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err.stack);
            resolve(data.rows);
        });
    });
}

const geoGetZipRequest = function (request, response) {
    if (!request.params.zip) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No Zip specified'
            });
    }

    geogetzip(request.params.zip)
        .then(data => {
            return response.status(200)
                .json({
                    data: data,
                });
        }, function (err) {
            return response.status(500)
                .json({
                    status: 'Error',
                    responseText: 'Error in query ' + err
                });
        });
}

module.exports = geoGetZipRequest;