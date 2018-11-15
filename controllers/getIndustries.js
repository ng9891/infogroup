'use strict';
let db_service = require('../utils/db_service')

function getIndustries(type = 'BOTH') {
    return new Promise(function (resolve, reject) {
        let selection = '';

        type = type.trim().toUpperCase();

        switch (type) {
            case "'DS'":
                selection = `"NAICSDS"`
                break;
            case "'CD'":
                selection = `"NAICSCD"`
                break;
            default:
                selection = `"NAICSCD", "NAICSDS"`
                break;
        }
        let sql =
            `
            SELECT  
            DISTINCT ${selection}
            FROM businesses_2014 
            WHERE "NAICSCD" IS NOT NULL;
            `;

        // ~500 msec, 931 rows
        // must be written in a local file once,
        // then check the file if not empty use the list from there.
        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err.stack);
            resolve(data.rows);
        });
    });
}

const getIndustriesRequest = function (request, response) {
    if (!request) {
        response.status(400)
            .json({
                status: 'Error',
                responseText: 'No request specified'
            });
    }

    getIndustries(request.query.type)
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

module.exports = getIndustriesRequest;