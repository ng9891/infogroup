/**
 * Advanced Search Controller which performs SQL query
 * using "Knex Query Builder" (installed from npm). 
 * Depending on parameters structure of SQL query changes.
 * This controller is being called from public/loadAdvancedSearchEstablishments.js
 * 
 */

'use strict';
let db_service = require('../utils/db_service');
let knex       = require('../utils/knex/knex');

function advancedSearch(industry,  minempl, maxempl, salvol, county_name, mpo_name, mun_name, mun_type, mun_county, naicscode, qversion) {
    return new Promise(function (resolve, reject) {
        var with_clause = knex;
        var from_clause = (qversion != 'original') ? {business: 'businesses_2014'} : {business: 'businesses_2014_o'};
        var where_county = '', where_mpo = '', where_mun='';
        var where_industry = (industry != 'null') ? {NAICSDS: industry} : {};
        var where_salvol = (salvol != 'null') ? {LSALVOLDS: salvol} : {};
        var where_emplsize = (maxempl != 'null') ? '"ALEMPSZ" BETWEEN '+minempl+' AND '+maxempl+' ' : '';
        var where_naicscode = (naicscode != 'null') ? {NAICSCD: parseInt(naicscode)} : {};
        if (county_name != 'null') {
            with_clause = with_clause.with('county', 
                            knex.raw('SELECT ST_Transform(geom, 4326) AS geom FROM counties as county WHERE county.name LIKE \'%'+county_name+'%\' LIMIT 1' ));
            from_clause["county"] = 'county';
            where_county = 'ST_Contains(county.geom, ST_Transform(business.geom, 4326))';
        }
        if (mpo_name != 'null') {
            with_clause = with_clause.with('mpo', 
                            knex.raw('SELECT geom FROM mpo WHERE UPPER(mpo.mpo) = UPPER(\''+mpo_name+'\') OR UPPER(mpo.mpo_name) = UPPER(\''+mpo_name+'\') LIMIT 1'));
            from_clause["mpo"] = 'mpo';
            where_mpo = 'ST_Contains(mpo.geom, business.geom)';
        }
        if (mun_name != 'null') {
            var village = 'village', with_where='';
            if (mun_type != 'null' && mun_county != 'null') {
                with_where += ' AND UPPER(muni_type) = UPPER(\''+mun_type+'\') AND UPPER(county) = UPPER(\''+mun_county+'\')';
            }
            with_clause = with_clause.with('mun', 
                            knex.raw('SELECT geom FROM (SELECT c.name, c.muni_type, c.county, c.geom FROM cities_towns c '+
                                'UNION ALL SELECT v.name, \''+village+'\'::CHARACTER VARYING(10) as muni_type, v.county, v.geom FROM villages v) t '+
                                'WHERE UPPER(name) = UPPER(\''+mun_name+'\')'+with_where));
            from_clause["mun"] = 'mun';
            where_mun = 'ST_Contains(mun.geom, business.geom)';
        }
        
        var sql = with_clause.
                            column('id', 
                            knex.raw('ST_ASGeoJSON(ST_Transform(business.geom, 4326)) AS geoPoint'),
                            'CONAME',
                            'NAICSCD',
                            'NAICSDS',
                            'LEMPSZCD',
                            'LEMPSZDS',
                            'ALEMPSZ',
                            'PRMSICDS',
                            'LSALVOLDS',
                            'ALSLSVOL',
                            'SQFOOTCD',
                            'BE_Payroll_Expense_Code',
                            'BE_Payroll_Expense_Range',
                            'BE_Payroll_Expense_Description',
                            'BE_Payroll_Expense_Description').select().from(from_clause).
                            where(where_industry).
                            where(where_naicscode).
                            where(where_salvol).
                            whereRaw(where_emplsize).
                            whereRaw(where_county).
                            whereRaw(where_mpo).
                            whereRaw(where_mun);
        
        sql = sql.toString();

        // console.log(sql);

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
    if (!request.query.county_name) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No county_name specified'
            });
    }
    if (!request.query.mpo_name) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No mpo_name specified'
            });
    }
    if (!request.query.mun_name) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No mun_name specified'
            });
    }

    advancedSearch(request.query.industry, request.query.minempl, request.query.maxempl, request.query.salvol, 
                    request.query.county_name, request.query.mpo_name, request.query.mun_name, request.query.mun_type, 
                    request.query.mun_county, request.query.naicscode,request.query.qversion)
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

module.exports = advancedSearchRequest;