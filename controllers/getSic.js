'use strict';
let db_service = require('../utils/db_service')

function getSic(sic, type = 'BOTH') {
    return new Promise(function (resolve, reject) {
        let columnToQuery = '';
        let whereStatement = '';
        if(!sic){
            columnToQuery = `"PRMSICCD", "PRMSICDS"`;
            whereStatement = `WHERE "PRMSICCD" IS NOT NULL`
        }else{
            type = type.trim().toUpperCase();
            switch (type) {
                case "'DS'":
                    columnToQuery = `"PRMSICDS"`;
                    whereStatement = `WHERE UPPER("PRMSICDS") LIKE UPPER('${sic}%')`;
                    break;
                case "'CD'":
                    columnToQuery = `"PRMSICCD"`;
                    whereStatement = `WHERE UPPER(cast("PRMSICCD" as varchar)) LIKE UPPER('${sic}%')`;
                    break;
                default:
                    columnToQuery = `"PRMSICCD", "PRMSICDS"`;
                    whereStatement = `WHERE UPPER(cast("PRMSICCD" as varchar)) LIKE UPPER('${sic}%') 
                    OR UPPER("PRMSICDS") LIKE UPPER('${sic}%')`
                    break;
            }
        }

        let sql =
            `
            SELECT  
            DISTINCT ${columnToQuery}
            FROM businesses_2014 
            ${whereStatement}
            ORDER BY ${columnToQuery};
            `;
        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err.stack);
            resolve(data.rows);
        });
    });
}

const getSicRequest = function (request, response) {
    // if (!request.params.sic) {
    //     return response.status(400)
    //         .json({
    //             status: 'Error',
    //             responseText: 'No SIC specified'
    //         });
    // }

    getSic(request.params.sic, request.query.type)
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

module.exports = getSicRequest;