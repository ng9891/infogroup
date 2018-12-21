'use strict';
let db_service = require('../utils/db_service')

function geobyNaics(naics, version='current') {
    let from_statement = 'businesses_2014';
    if(version === 'original') from_statement = 'businesses_2014_o';
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
            "ACEMPSZ",
            "SQFOOTCD",
            "SQFOOTDS",
            "PRMSICCD",
            "PRMSICDS",
            "PRMADDR",
            "PRMCITY",
            "PRMSTATE",
            "PRMZIP",
            "LATITUDEO",
            "LONGITUDEO",
            "LSALVOLCD",
            "LSALVOLDS",
            "ALSLSVOL",
            "CSALVOLCD",
            "CSALVOLDS",
            "ACSLSVOL"
            FROM ${from_statement}
            WHERE "NAICSCD"::text LIKE '${naics}%';
        `;

        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err.stack)
            resolve(data.rows)
        });
    });
}

const requestGeoByNaics = function (request, response) {
    if (!request.params.naics) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No Naics'
            })
    }
    if (!request.params.naics.match("^[0-9]+$")) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'Invalid Naics'
            })
    }
    if(request.params.naics.length < 4){
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'Invalid length Naics'
            })
    }

    geobyNaics(request.params.naics, request.query.v)
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

module.exports = requestGeoByNaics;