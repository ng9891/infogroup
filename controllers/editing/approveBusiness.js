'use strict';
let db_service = require('../../utils/db_service');

//Takes an offset and limit to load the county with pagination.
function approveBusiness() {
    return new Promise(function (resolve, reject) {
        let sql = 'select id from business_audit limit 1';
        db_service.transQuery(sql,(err, data) => {
            if (err) return reject(err.stack);
            resolve('Approved');
        });
    });

    function testing(err, data){
        console.log(err);
    }
}

const approveBusinessRequest = function (request, response) {
    // if (!request.params.bus_id || isNaN(request.params.bus_id)) {
    //     return response.status(400)
    //         .json({
    //             status: 'Error',
    //             responseText: 'No Business specified or is not correct'
    //         });
    // }

    approveBusiness()
        .then(data => {
            return response.status(200)
                .json({
                    data: data
                });
        }, function (err) {
            return response.status(500)
                .json({
                    status: 'Error',
                    responseText: 'Error in query ' + err
                });
        });
}

module.exports = approveBusinessRequest;