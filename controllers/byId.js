'use strict';
let db_service = require('../utils/db_service')

function geobyid(bp_id) {
    return new Promise(function (resolve, reject) {
        let sql =
            `select 
        id, 
        ST_ASGeoJSON(ST_transform(geom,4326)) as geoPoint, 
        "CONAME",
        "NAICSCD",
        "NAICSDS", 
        "LEMPSZCD", 
        "LEMPSZDS", 
        "ALEMPSZ",  
        "BE_Payroll_Expense_Code",
        "BE_Payroll_Expense_Range",
        "BE_Payroll_Expense_Description" 
        from businesses_2014  
        where id = ${bp_id};`

        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err.stack)
            resolve(data.rows)
        });
    });
}

const requestGeoById = function (request, response) {
    if (!request.params.id) {
        response.status(400)
            .json({
                status: 'Error',
                responseText: 'No id'
            })
    }

    geobyid(request.params.id)
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

module.exports = requestGeoById;