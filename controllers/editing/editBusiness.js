'use strict';
let db_service = require('../../utils/db_service');

//Takes an offset and limit to load the county with pagination.
function editBusiness(id, form) {
    return new Promise(function (resolve, reject) {
        let sql = build_query(id, form);
        db_service.runQuery(sql, [], (err, data) => {
            if (err) return reject(err.stack);
            resolve('success');
        });
    });
}

const editBusinessRequest = function (request, response) {
    if (!request.params.bus_id || isNaN(request.params.bus_id)) {
        return response.status(400)
            .json({
                status: 'Error',
                responseText: 'No Business specified or is not correct'
            });
    }

    editBusiness(request.params.bus_id, request.body)
        .then(data => {
            return response.status(200)
                .json({
                    data: data
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

module.exports = editBusinessRequest;

//Key names have to match with table column name in DB
function build_query(id, form) {
    let sql  = '';
    let now_string = "(now() at time zone 'utc')";
    let insert_str = ''; //Contains the string for the INSERT in the sql. Keys.
    let value_str = ''; //Contains the string for the VALUES in the sql
    
    let key_arr = Object.keys(form);
    // key_arr = key_arr.filter().map((k,i) => {
        // if (i === key_arr.length-1) {
        //     // last one
        //     insert_str += '"'+k+'"';
        //     value_str += form[k];
        // } else {
        //     // not last one
        //     insert_str += '"'+k+'",'; //keys
        //     value_str += form[k]+',';
        // }
    // });

    for(let i=0; i < key_arr.length; i++){
        let k = key_arr[i];
        if (form[k]){
            insert_str += '"'+k+'",';
            value_str += form[k]+',';
        }
    }
    insert_str = insert_str.slice(0, -1);
    value_str = value_str.slice(0, -1);

    sql += 
        `
        INSERT INTO business_audit(business_id,created_at,record_status,status,by,${insert_str})
        VALUES (${id},${now_string},0,0,'test-admin',${value_str});
        `;

    // console.log(form);
    // console.log(sql);
    // return `
    // INSERT INTO business_audit(business_id,created_at,record_status,status)
    // VALUES (${id},${now_string},0,0);
    // `;
    return sql;
}

//list
/*
    id
    business_id
    by
    record_status
    status
    PRMSICCD
    PRMSICDS
    NAICSCD
    NAICSDS
    ALEMPSZ
    ACEMPSZ
    LEMPSZCD
    LEMPSZSZ
    SQFOOTCD
    SQFOOTDS
    LATITUDEO
    LONGITUDEO
    created_at
    started_at
    ended_at
    geom
    LSALVOLCD
    LSALVOLDS
    
    CSALVOLCD
    CSALVOLDS
    ACSLSVOL
*/

/*
Record Status:
    0 - PROPOSED
    1 - REJECTED
    2 - ACCEPTED
    3 - WITHDRAWN
Status:
    0 - INACTIVE
    1 - ACTIVE
    2 - REPLACED/INACTIVE
 */