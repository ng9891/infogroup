'use strict';
let db_service = require('../utils/db_service');

function advancedSearch(industry,  minempl, maxempl, salvol, borough) {
    return new Promise(function (resolve, reject) {

    //TODO: BETTER TO USE Squel.Js or simial packages for sql query generation

        let sql, where_clause;

        if (industry == 'null' && maxempl != 'null' && salvol != 'null') { // industry not specified
            where_clause = `WHERE "ALEMPSZ" BETWEEN ${minempl} AND ${maxempl} 
                            AND "LSALVOLDS" = '${salvol}' `;
        }
        else if (maxempl == 'null' && industry != 'null' && salvol != 'null') { // employee size not specified
            where_clause = `WHERE upper("NAICSDS") LIKE upper('%${industry}%') 
                            AND "LSALVOLDS" = '${salvol}' `;
        }
        else if (salvol == 'null' && industry != 'null' && maxempl != 'null') { // sales volume not specified
            where_clause = `WHERE upper("NAICSDS") LIKE upper('%${industry}%') 
                            AND "ALEMPSZ" BETWEEN ${minempl} AND ${maxempl} `;
        }
        else if (industry == 'null' && maxempl == 'null' && salvol != 'null') { // industry and employee size not specified
            where_clause = `WHERE "LSALVOLDS" = '${salvol}' `;
        }
        else if (industry == 'null' && salvol == 'null' && maxempl != 'null') { // industry and sales volume not specified
            where_clause = `WHERE "ALEMPSZ" BETWEEN ${minempl} AND ${maxempl} `;
        }
        else if (industry == 'null' && salvol == 'null' && maxempl == 'null') { // nothing specified 
            where_clause = ` `;
        }
        else if (industry != 'null' && salvol != 'null' && maxempl != 'null') { // everything specified 
            where_clause = `WHERE upper("NAICSDS") LIKE upper('%${industry}%') 
                            AND "ALEMPSZ" BETWEEN ${minempl} AND ${maxempl} 
                            AND "LSALVOLDS" = '${salvol}' `;
        }

        if (borough == 'null') { // borough not specified 

            sql = `SELECT 
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
                    FROM businesses_2014 as business 
                    `+where_clause+`
                 `;
        } 
        else { // borough specified
            sql = `WITH borough AS ( 
                        SELECT 
                        ST_Transform(geom, 4326) AS geom 
                        FROM nymtc 
                        WHERE nymtc.county LIKE '%${borough}%' 
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
                    FROM businesses_2014 as business, borough 
                    `+where_clause+`
                    AND ST_Contains(borough.geom, ST_Transform(business.geom, 4326)) 
                `;
        }
        
        //console.log(sql);

        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err.stack);
            resolve(data.rows);
        });
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
    if (!request.query.minempl) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No min employee specified'
            });
    }
    if (!request.query.maxempl) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No max employee specified'
            });
    }
    if (!request.query.salvol) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No sales volume specified'
            });
    }
    if (!request.query.borough) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No borough specified'
            });
    }

    advancedSearch(request.query.industry, request.query.minempl, request.query.maxempl, request.query.salvol, request.query.borough)
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

module.exports = advancedSearchRequest;