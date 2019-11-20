'use strict';
let db_service = require('../../utils/db_service');

function editBusiness(id, form) {
  return new Promise(function(resolve, reject) {
    let [sql, values] = build_query(id, form);
    // console.log(sql,values);
    db_service.runQuery(sql, values, (err, data) => {
      if (err) return reject(err.stack);
      resolve('success');
    });
  });
}

const editBusinessRequest = (request, response) => {
  if (!request.params.bus_id || isNaN(parseInt(request.params.bus_id, 10))) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Business specified or is not correct',
    });
  }

  editBusiness(request.params.bus_id, request.body).then(
    (data) => {
      return response.status(200).json({
        data: data,
      });
    },
    (err) => {
      console.error(err);
      return response.status(500).json({
        status: 'Error',
        responseText: 'Error in query ' + err,
      });
    }
  );
};
module.exports = editBusinessRequest;

// Key names have to match with table column name in DB
function build_query(id, form) {
  let sql = '';
  let now_string = "(now() at time zone 'utc')";
  let insert_str = ''; // Contains the string for the INSERT in the sql. Keys.
  let value_str = ''; // Contains the Parameterized string for the VALUES in the sql
  let values = []; // Array of values to insert into table

  // Inserting businessID first
  insert_str += 'business_id,';
  value_str += '$1,';
  values.push(id);

  let key_arr = Object.keys(form);
  let j = 2;
  for (let i = 0; i < key_arr.length; i++) {
    let k = key_arr[i];
    if (form[k]) {
      insert_str += '"' + k + '",';
      value_str += '$' + j++ + ',';
      values.push(form[k]);
    }
  }
  insert_str = insert_str.slice(0, -1);
  value_str = value_str.slice(0, -1);

  sql += `
      INSERT INTO business_audit(created_at,record_status,status,by,${insert_str})
      VALUES (${now_string},0,0,'test-admin',${value_str});
      `;
  return [sql, values];
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
