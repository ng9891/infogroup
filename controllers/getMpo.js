'use strict';
let db_service = require('../utils/db_service');

function geogetmpo(mpo_name) {
    return new Promise(function (resolve, reject) {
        let sql =
            `
            SELECT 
            mpo.mpo AS abbrv,
            mpo.mpo_name AS name,
            ST_ASGeoJSON(ST_Transform(geom, 4326)) AS geom
            FROM mpo
            WHERE UPPER(mpo.mpo) LIKE UPPER('${mpo_name}%')
            OR UPPER(mpo.mpo_name) LIKE UPPER('${mpo_name}%');
            `;
        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err.stack);
            resolve(data.rows);
        });
    });
}

const geoGetMpoRequest = function (request, response) {
    if (!request.params.mpo) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No MPO specified'
            });
    }

    geogetmpo(request.params.mpo)
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

module.exports = geoGetMpoRequest;