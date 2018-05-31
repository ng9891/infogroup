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
            if (err) reject(err)
            resolve(data.rows)
        })
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
        .catch(function (err) {
            return next(err);
        })
        .then(data => {
            response.status(200)
                .json({
                    data: data,
                })
        })

}
module.exports = requestGeoById
