'use strict';
let db_service = require('../utils/db_service')

function geobycounty(county_name) {
    return new Promise(function (resolve, reject) {
        let sql =
        `
        with business as (
            SELECT 
            id, 
            ST_Transform(geom, 4326) AS geom,
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
            FROM businesses_2014
        ),
        borough as (
            SELECT ST_Transform(geom, 4326) AS geom
            FROM nymtc
            WHERE nymtc.county LIKE '%${county_name}%'
            LIMIT 1
        )
        SELECT 
        id, ST_ASGeoJSON(business.geom) AS geoPoint,
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
        FROM business, borough
        WHERE ST_Contains(borough.geom, business.geom)
        LIMIT 2000
        `;

        db_service.runQuery(sql, [], (err, data) => {
            if (err) reject(err)
            resolve(data.rows)
        });
    });
}

const geoByCountyRequest = function (request, response) {
    // response.json(request.params.county);
    if (!request.params.county) {
        response.status(400)
            .json({
                status: 'Error',
                responseText: 'No zipcode specified'
            });
    }

    geobycounty(request.params.county)
        .catch(function (err) {
            return next(err);
        })
        .then(data => {
            response.status(200)
                .json({
                    data: data,
                });
        });
}


module.exports = geoByCountyRequest;