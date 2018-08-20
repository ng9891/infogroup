'use strict';
let db_service = require('../utils/db_service')

function geobycounty(county_name, offset, limit) {
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
        ORDER BY id
        LIMIT ${limit}
        OFFSET ${offset};
        `;

        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err);
            resolve(data.rows);
        });
    });
}

const geoByCountyRequest = function (request, response) {
    if (!request.params.county) {
        response.status(400)
            .json({
                status: 'Error',
                responseText: 'No county specified'
            });
    }

    //Check for offset params. Set to 0 if none.
    //increase to the amount of default value for limit
    if (request.query.offset === undefined) {
        request.query.offset = 0;
    }

    //Sets the amount of point to display in the map.
    if (request.query.limiter === undefined) {
        request.query.limiter = process.env.QUERY_LIMIT; //QUERY_LIMIT from env file.
    }

    geobycounty(request.params.county, request.query.offset, request.query.limiter)
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

module.exports = geoByCountyRequest;