'use strict';
let dbService = require('../utils/db_service');
let utils = require('../utils/utils');
let hstore = require('pg-hstore')();

const column = utils.columnNames;
const table = utils.tableNames;

const editSelectStatement = `
  e."${column.id}" as id,
  "business_id" as bus_id,
  ST_ASGeoJSON(ST_transform(e."${column.geom}",4326)) as geoPoint,
  "${column.PRMADDR}" as "PRMADDR",
  "${column.PRMCITY}" as "PRMCITY",
  "${column.PRMSTATE}" as "PRMSTATE",
  "${column.PRMZIP}" as "PRMZIP",
  "${column.CONAME}" as alias,
  "${column.CONAME}" as "CONAME",
  "${column.NAICSCD}" as "NAICSCD",
  "${column.NAICSDS}" as "NAICSDS", 
  "${column.LEMPSZCD}" as "LEMPSZCD", 
  "${column.LEMPSZDS}" as "LEMPSZDS",
  "${column.ALEMPSZ}" as "ALEMPSZ", 
  "${column.SQFOOTCD}" as "SQFOOTCD",
  "${column.SQFOOTDS}" as "SQFOOTDS",
  "${column.PRMSICCD}" as "PRMSICCD",
  "${column.PRMSICDS}" as "PRMSICDS",
  "${column.LSALVOLCD}" as "LSALVOLCD",
  "${column.LSALVOLDS}" as "LSALVOLDS",
  "${column.ALSLSVOL}" as "ALSLSVOL",
  "${column.CSALVOLCD}" as "CSALVOLCD",
  "${column.CSALVOLDS}" as "CSALVOLDS",
  "${column.ACSLSVOL}" as "ACSLSVOL",
  "${column.MATCHCD}" as "MATCHCD",
  "${column.LATITUDEO}" as "LATITUDEO",
  "${column.LONGITUDEO}" as "LONGITUDEO",
  e.by,
  e.by_id,
  last_modified_by,
  last_modified_comment,
  record_status,
  status,
  created_at,
  started_at,
  ended_at,
  e.comment,
  hstore_to_json_loose(e.row_data) as row_data,
  hstore_to_json_loose(e.changed_fields) as changed_fields_json,
  e.changed_fields
  `;

const auditSelectStatement = `
  id,
  business_edit_id,
  timestamp,
  action,
  type,
  row_data,
  changed_fields,
  by_id,
  by,
  comment
`;

function queryDB(query, params) {
  return new Promise((resolve, reject) => {
    dbService.runQuery(query, params, (err, data) => {
      if (err) return reject(err);
      resolve(data.rows);
    });
  });
}

function transDB(query, params) {
  return new Promise((resolve, reject) => {
    dbService.transQuery(query, params, (err, data) => {
      if (err) return reject(err);
      resolve(data.rows);
    });
  });
}

exports.editListDatatable = (
  record_status = null,
  status = null,
  limit = null,
  offset = 0,
  orderCol = null,
  orderDir = null
) => {
  let sql = `
    SELECT ${editSelectStatement},
    (SELECT COUNT(*) FROM ${table.edit} WHERE record_status = 0) as recordsTotal
    FROM ${table.edit} as e
    WHERE ($1::int IS NULL OR record_status = $1)
    AND ($2::int IS NULL OR status = $2)
    ORDER BY ${orderCol} ${orderDir}
    LIMIT $3
    OFFSET $4;
  `;
  // console.log(sql);
  return queryDB(sql, [record_status, status, limit, offset]);
};

exports.editList = (record_status = null, status = null, limit = null, offset = 0) => {
  let sql = `
    SELECT ${editSelectStatement}
    FROM ${table.edit} as e
    WHERE ($1::int IS NULL OR e.record_status = $1::int)
    AND ($2::int IS NULL OR e.status = $2::int)
    LIMIT $3
    OFFSET $4;
  `;
  return queryDB(sql, [record_status, status, limit, offset]);
};

exports.editListByEditId = (id, record_status = null, status = null, limit = null, offset = 0) => {
  let sql = `
    SELECT ${editSelectStatement}
    FROM ${table.edit} as e
    WHERE id = $1::int
    LIMIT $2
    OFFSET $3;
  `;
  return queryDB(sql, [id, limit, offset]);
};

exports.editListByBusId = (id, limit = null, offset = 0) => {
  let sql = `
    SELECT ${editSelectStatement}
    FROM ${table.edit} as e
    WHERE business_id = $1::int
    LIMIT $2
    OFFSET $3;
  `;
  return queryDB(sql, [id, limit, offset]);
};

exports.editListByUserId = (id, type = null, limit = null, offset = 0) => {
  let sql = `
    SELECT ${editSelectStatement},
    (SELECT COUNT(*) FROM ${table.edit} WHERE record_status = 0) as recordsTotal,
    a.type
    FROM ${table.edit} as e
      JOIN (
        SELECT DISTINCT ON (business_edit_id) *
		    FROM ${table.audit}
		    ORDER BY business_edit_id, timestamp desc
      ) as a  
	    ON e.id = a.business_edit_id
    WHERE e.by_id = $1::int
    AND ($2::char IS NULL OR UPPER(a.type) = UPPER($2))
    LIMIT $3
    OFFSET $4;
  `;
  return queryDB(sql, [id, type, limit, offset]);
};

exports.auditList = (limit = null, offset = 0) => {
  let sql = `
    SELECT ${auditSelectStatement}
    FROM ${table.audit} as al
    LIMIT $1
    OFFSET $2
  `;
  return queryDB(sql, [limit, offset]);
};

exports.auditById = (id) => {
  let sql = `
    SELECT ${auditSelectStatement}
    FROM ${table.audit} as al
    WHERE business_edit_id = $1::int
  `;
  return queryDB(sql, [id]);
};

exports.auditByUser = (id, limit = null, offset = 0) => {
  let sql = `
    SELECT ${auditSelectStatement}
    FROM ${table.audit} as al
    WHERE by_id = $1::int
    ORDER BY timestamp DESC
    LIMIT $2
    OFFSET $3
  `;
  return queryDB(sql, [id, limit, offset]);
};

exports.proposeBusinessChange = (id, form, originalData, user) => {
  // Key names have to match with table column name in DB
  function build_query(id, form, originalData, user) {
    let sql = '';
    // let now_string = "(now() at time zone 'utc')";
    let insert_str = ''; // Contains the string for the INSERT in the sql. Keys.
    let value_str = ''; // Contains the Parameterized string for the VALUES in the sql
    let values = []; // Array of values to insert into table

    // Inserting businessID first
    insert_str += 'business_id,';
    value_str += '$1,';
    values.push(id);

    // Create GEOM
    let geom = "'SRID=26918;POINT(0 0)'";
    if (form['LATITUDE_1'] && form['LONGITUDE_1']) {
      geom = `(ST_Transform(ST_SetSRID(ST_MakePoint($2, $3), 4326),26918))`;
      values.push(form['LONGITUDE_1']);
      values.push(form['LATITUDE_1']);
    }

    // For HSTORE fields in audit table
    let originalTableColumns = {};
    // Format the key to have the same name as the column names.
    for(const r in originalData){
      let key = column[r];
      if(!key) continue;
      originalTableColumns[key] = originalData[r];
    }
    originalTableColumns['alias'] = originalData['alias'];

    let row_data = `('${hstore.stringify(originalTableColumns)}'::hstore)`;
    let changed_fields = `('${hstore.stringify(form)}'::hstore - ${row_data}) - '{comment}'::text[]`;

    // Owner of submit
    form['by'] = user.email;
    form['by_id'] = user.id;
    form['last_modified_by'] = user.email;
    form['last_modified_by_id'] = user.id;

    let key_arr = Object.keys(form);
    let j = values.length + 1;
    for (let i = 0; i < key_arr.length; i++) {
      let k = key_arr[i];
      if (k === 'id') continue;
      if (form[k]) {
        insert_str += `"${k}",`;
        value_str += `$${j++},`;
        values.push(form[k]);
      }
    }
    insert_str = insert_str.slice(0, -1);
    value_str = value_str.slice(0, -1);

    sql += `
        INSERT INTO ${table.edit}(geom,row_data,changed_fields,${insert_str})
        VALUES (${geom},${row_data},${changed_fields},${value_str});
        `;
    return [sql, values];
  }
  let [sql, params] = build_query(id, form, originalData, user);
  return queryDB(sql, params);
};

exports.acceptProposalById = (edit_id, comment = '') => {
  let sql = `
    UPDATE ${table.edit}
    SET record_status = 4,
      status = 1,
      last_modified_comment = $1
    WHERE
      id = $2
  `;
  return transDB(sql, [comment, edit_id]);
};

exports.rejectProposalById = (edit_id, comment = '') => {
  let sql = `
    UPDATE ${table.edit}
    SET record_status = 2,
      status = 0,
      last_modified_comment = $1
    WHERE
      id = $2
  `;
  return transDB(sql, [comment, edit_id]);
};

exports.withdrawProposalById = (edit_id, comment = '') => {
  let sql = `
    UPDATE ${table.edit}
    SET record_status = 1,
      status = 0,
      last_modified_comment = $1
    WHERE
      id = $2
  `;
  return transDB(sql, [comment, edit_id]);
};
