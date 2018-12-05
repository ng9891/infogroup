'use strict';
let db_service = require('../utils/db_service')

function geobyzip(zipcode, version='current') {
    let from_statement = 'businesses_2014';
    if(version === 'original') from_statement = 'businesses_2014_o';
    return new Promise(function (resolve, reject) {
        let sql =
            `
        select 
        id, 
        ST_ASGeoJSON(ST_transform(geom,4326)) as geoPoint, 
        "CONAME",
        "NAICSCD",
        "NAICSDS", 
        "LEMPSZCD", 
        "LEMPSZDS", 
        "ALEMPSZ", 
        "PRMSICDS", 
        "LSALVOLDS", 
        "ALSLSVOL", 
        "SQFOOTCD", 
        "BE_Payroll_Expense_Code",
        "BE_Payroll_Expense_Range",
        "BE_Payroll_Expense_Description"
        from ${from_statement}  
        where "PRMZIP" = ${zipcode};
        `

        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err.stack);
            resolve(data.rows);
        });
    });
}

const geoByZipRequest = function (request, response) {
    if (!request.params.zipcode) {
        response.status(400)
            .json({
                status: 'Error',
                responseText: 'No zipcode specified'
            });
    }

    geobyzip(request.params.zipcode, request.query.v)
        .then(data => {
            return response.status(200)
                .json({
                    data: data,
                });
        }, function (err) {
            console.error(err);
            return response.status(500)
                .json({
                    status: 'Error',
                    responseText: 'Error in query ' + err
                });
        });
}

module.exports = geoByZipRequest;