'use strict';
let db_service = require('../utils/db_service')

function getSalesVolume() {
    return new Promise(function (resolve, reject) {
        let sql =
            `
        SELECT 
        DISTINCT "LSALVOLDS", "LSALVOLCD" 
        FROM businesses_2014 
        ORDER BY "LSALVOLCD";
        `
        // first time 3.2 sec, then ~436 msec --table need to be indexed
        // must be written in a local file once,
        // then check the file if not empty use the list from there.
        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err.stack);
            resolve(data.rows);
        });
    });
}

const getSalesVolumeRequest = function (request, response) {
    if (!request) {
        response.status(400)
            .json({
                status: 'Error',
                responseText: 'No zipcode specified'
            });
    }

    getSalesVolume()
        .then(data => {
            response.status(200)
                .json({
                    data: data,
                });
        }, function (err) {
            response.status(500)
                .json({
                    status: 'Error',
                    responseText: 'Error in query ' + err
                });
        });
}

module.exports = getSalesVolumeRequest;