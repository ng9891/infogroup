'use strict';
let db_service = require('../utils/db_service');

//Takes an offset and limit to load the county with pagination.
function geobycity(mun_name, offset, limit) {
    return new Promise(function (resolve, reject) {
        // TODO: distinguish between city, town, village or county
        let sql =
            `WITH city AS (
                SELECT 
                geom
                FROM (
					SELECT geom
					FROM cities_towns as cities
					WHERE UPPER(cities.name) LIKE UPPER('%${mun_name}%')
					UNION
					SELECT geom
					FROM villages
					WHERE UPPER(villages.name) LIKE UPPER('%${mun_name}%')
				) mun
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
            FROM businesses_2014 as business, city
            WHERE ST_Contains(city.geom, business.geom)
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

const geoByCityRequest = function (request, response) {
    if (!request.params.city) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No city specified'
            });
    }

    if (!request.query.offset) {
        request.query.offset = 0;
    }

    //Sets the amount of point to display in the map.
    // if (!request.query.limiter) {
    //     request.query.limiter = process.env.QUERY_LIMIT; //QUERY_LIMIT from env file.
    // }

    geobycity(request.params.city, request.query.offset, request.query.limiter)
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

module.exports = geoByCityRequest;