'use strict';
let db_service = require('../utils/db_service')

function geobycounty(county_name) {
    return new Promise(function (resolve, reject) {
        let sql =
        `
        WITH borough AS (
            SELECT ST_Transform(geom, 4326) AS geom
            FROM nymtc
            WHERE nymtc.county LIKE '%${county_name}%'
            LIMIT 1
        )
        SELECT 
        id, 
		ST_ASGeoJSON(ST_Transform(business.geom, 4326)) AS geoPoint,
        "CONAME",
        "NAICSCD",
        "NAICSDS", 
        "LEMPSZCD", 
        "LEMPSZDS", 
        "ALEMPSZ", 
        "PRMSICDS", 
        "LSALVOLDS", 
        "SQFOOTCD", 
        "BE_Payroll_Expense_Code",
        "BE_Payroll_Expense_Range",
        "BE_Payroll_Expense_Description" 
        FROM businesses_2014 as business, borough
        WHERE ST_Contains(borough.geom, ST_Transform(business.geom, 4326))
        ORDER BY NAICSCD
        LIMIT 2000
        `;

        db_service.runQuery(sql, [], (err, data) => {
            if (err){
                reject(err);
                // console.log(err);
                // resolve(err);
            }else{
                // console.log(data);
                resolve(data.rows);
            } 
        });
    });
}

const geoByCountyRequest = function (request, response) {
    // response.json(request.params.county);
    if (!request.params.county) {
        response.status(400)
            .json({
                status: 'Error',
                responseText: 'No county specified'
            });
    }

    geobycounty(request.params.county)
        .catch(function (err) {
            // console.log(err);
            return err;
            // return next(err);
        })
        .then(data => {
            if(data.name !== 'error'){
                response.status(200)
                .json({
                    data: data,
                });
            }else{
                // console.log(Object.getOwnPropertyNames(data));
                console.log(data.stack);
                response.status(400)
                .json({
                    status: 'Error',
                    responseText: 'Error in query'
                });
            }
        });
}


module.exports = geoByCountyRequest;