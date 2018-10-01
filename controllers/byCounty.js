'use strict';
let db_service = require('../utils/db_service');

//Takes an offset and limit to load the county with pagination.
function geobycounty(county_name, offset, limit) {
    return new Promise(function (resolve, reject) {
        let sql =
            `WITH county AS (
                SELECT 
                geom
                FROM counties as county
                WHERE UPPER(county.name) = UPPER('${county_name}')
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
            "ALSLSVOL", 
            "SQFOOTCD", 
            "BE_Payroll_Expense_Code",
            "BE_Payroll_Expense_Range",
            "BE_Payroll_Expense_Description"
            FROM businesses_2014 as business, county
            WHERE ST_Contains(county.geom, business.geom)
            ORDER BY COALESCE("ALEMPSZ", 0) DESC
            OFFSET ${offset}
        `;
        if(limit){
            sql += ' LIMIT ' + limit;
        }else{

        }

        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err);
            resolve(data.rows);
        });
    });
}

const geoByCountyRequest = function (request, response) {
    if (!request.params.county) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No county specified'
            });
    }

    if (!request.query.offset) {
        request.query.offset = 0;
    }

    //Sets the amount of point to display in the map.
    // if (!request.query.limiter) {
    //     request.query.limiter = process.env.QUERY_LIMIT; //QUERY_LIMIT from env file.
    // }

    geobycounty(request.params.county, request.query.offset, request.query.limiter)
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

module.exports = geoByCountyRequest;