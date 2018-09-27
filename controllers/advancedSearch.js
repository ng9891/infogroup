'use strict';
let db_service = require('../utils/db_service')

function advancedSearch(industry, employee, borough) {
    return new Promise(function (resolve, reject) {
        let sql =
            ` 
            WITH borough AS ( 
                SELECT 
                ST_Transform(geom, 4326) AS geom 
                FROM county 
                WHERE UPPER(county.name) LIKE UPPER('%${borough}%')
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
            AND  upper("NAICSDS") LIKE upper('%${industry}%') 
            AND "ALEMPSZ" ${employee} 
            LIMIT 2000 
            `;

        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err);
            resolve(data.rows);
        })
    });
}

const advancedSearchRequest = function (request, response) {
    if (!request.query.industry) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No industry specified'
            });
    }
    if (!request.query.employee) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No employee specified'
            });
    }
    if (!request.query.borough) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No borough specified'
            });
    }

    advancedSearch(request.query.industry, request.query.employee, request.query.borough)
        .then(data => {
            return response.status(200)
                .json({
                    data: data,
                });
        }, function (err) {
            return response.status(500)
                .json({
                    status: 'Error',
                    responseText: 'Error in query'
                });
        });
}

module.exports = advancedSearchRequest;