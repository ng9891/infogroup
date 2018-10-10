'use strict';
let db_service = require('../utils/db_service')

function geobyrectangle(minLon, minLat, maxLon, maxLat) {
    return new Promise(function (resolve, reject) {
        let sql =
            `SELECT
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
            FROM businesses_2014
            WHERE ST_Contains(ST_MakeEnvelope(${minLon}, ${minLat}, ${maxLon}, ${maxLat}, 4326), ST_transform(geom,4326));
        `;

        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err.stack);
            resolve(data.rows);
        });
    });
}

const geoByRectangleRequest = function (request, response) {

    if (!request.query.maxLon) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No Longitude specified'
            });
    }
    if (!request.query.maxLat) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No Longitude specified'
            });
    }
    if (!request.query.minLon) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No Longitude specified'
            });
    }
    if (!request.query.minLat) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No Longitude specified'
            });
    }
    
    geobyrectangle(request.query.minLon, request.query.minLat, request.query.maxLon, request.query.maxLat)
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

module.exports = geoByRectangleRequest;