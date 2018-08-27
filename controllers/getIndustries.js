'use strict';
let db_service = require('../utils/db_service')

function getIndustries() {
    return new Promise(function (resolve, reject) {
        let sql =
            `
        SELECT  
        DISTINCT "NAICSDS" 
        FROM businesses_2014 
        WHERE "NAICSDS" IS NOT NULL;
        `
        // ~500 msec, 931 rows
        // must be written in a local file once,
        // then check the file if not empty use the list from there.
        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err);
            resolve(data.rows);
        })
    });
}

const getIndustriesRequest = function (request, response) {
    if (!request) {
        response.status(400)
            .json({
                status: 'Error',
                responseText: 'No zipcode specified'
            });
    }

    getIndustries()
        .then(data => {
            response.status(200)
                .json({
                    data: data,
                });
        }, function (err) {
            response.status(500)
                .json({
                    status: 'Error',
                    responseText: 'Error in query'
                });
        });
}

module.exports = getIndustriesRequest;