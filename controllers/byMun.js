'use strict';
let db_service = require('../utils/db_service');

//Takes an offset and limit to load the county with pagination.
function geobymun(mun_name, mun_type, county, offset, limit) {
    return new Promise(function (resolve, reject) {
        let sql_setup = 
            `
            WITH mun AS (
                SELECT 
                geom
                FROM(
                    SELECT c.name, c.muni_type, c.county, c.geom
                    FROM cities_towns c
                    UNION ALL
                    SELECT v.name, 'village' as muni_type, v.county, v.geom
                    FROM villages v
                ) l
                WHERE UPPER(name) = UPPER('${mun_name}')`;

        if(mun_type && county)
            sql_setup += 
            `
                AND UPPER(muni_type) = UPPER('${mun_type}')
                AND UPPER(county) = UPPER('${county}')`;

        let sql = sql_setup +
            `
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
            FROM businesses_2014 as business, mun
            WHERE ST_Contains(mun.geom, business.geom)
            ORDER BY COALESCE("ALEMPSZ", 0) DESC
            OFFSET ${offset}
        `;
        if(limit){
            sql += ' LIMIT ' + limit;
        }

        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err.stack);
            resolve(data.rows);
        });
    });
}

const geoByMunRequest = function (request, response) {
    if (!request.params.mun) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No Municipality specified'
            });
    }

    if (!request.query.offset) {
        request.query.offset = 0;
    }

    //Sets the amount of point to display in the map.
    // if (!request.query.limiter) {
    //     request.query.limiter = process.env.QUERY_LIMIT; //QUERY_LIMIT from env file.
    // }

    geobymun(request.params.mun, request.query.mun_type, request.query.county, request.query.offset, request.query.limiter)
        .then(data => {
            return response.status(200)
                .json({
                    data: data,
                });
        }, function (err) {
            return response.status(500)
                .json({
                    status: 'Error',
                    responseText: 'Error in query ' + err
                });
        });
}

module.exports = geoByMunRequest;