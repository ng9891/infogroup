const adminQuery = require('../services/adminQuery');
function successHandler(data, response) {
  return response.status(200).json({
    data: data,
  });
}
function errorHandler(err, response) {
  console.error(err.stack);
  return response.status(500).json({
    status: 'Error',
    responseText: 'Error in query ' + err,
  });
}
exports.reqAuditList = (request, response) => {
  adminQuery
    .auditList(request.query.limit, request.query.offset)
    .then((data) => {
      successHandler(data, response);
    })
    .catch((e) => {
      errorHandler(e, response);
    });
};

exports.reqAuditById = (request, response) => {
  if (!request.params.audit_id) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No audit id specified',
    });
  }
  // TODO: sanitize for param?
  adminQuery
    .auditById(request.params.audit_id)
    .then((data) => {
      successHandler(data, response);
    })
    .catch((e) => {
      errorHandler(e, response);
    });
};

exports.reqAuditByUser = (request, response) => {
  if (!request.params.user_id) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No user id specified',
    });
  }
  // TODO: sanitize for param?
  adminQuery
    .auditByUser(request.params.user_id, request.query.limit, request.query.offset)
    .then((data) => {
      successHandler(data, response);
    })
    .catch((e) => {
      errorHandler(e, response);
    });
};