// const getQuery = require('../services/2014/getQuery');
const getQuery = require('../services/getQuery');
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

exports.reqGetCounty = (request, response) => {
  if (!request.params.county) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No county specified',
    });
  }

  getQuery
    .geoGetCounty(request.params.county)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGetEmpSize = (request, response) => {
  if (!request) {
    response.status(400).json({
      status: 'Error',
      responseText: 'No request specified',
    });
  }

  getQuery
    .getEmpSizeList()
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGetNaics = (request, response) => {
  if (!request) {
    response.status(400).json({
      status: 'Error',
      responseText: 'No request specified',
    });
  }

  getQuery
    .getNaicsList(request.query.type)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoGetMpo = (request, response) => {
  if (!request.params.mpo) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No MPO specified',
    });
  }

  getQuery
    .geoGetMpo(request.params.mpo)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoGetMun = (request, response) => {
  if (!request.params.mun) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Municipality specified',
    });
  }

  getQuery
    .geoGetMun(request.params.mun, request.query.munType, request.query.county, request.query.exact)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoGetRoad = (request, response) => {
  if (!request.query) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No road number specified',
    });
  }
  // Copy query object.
  let query = Object.assign({}, request.query);
  // Sanitize input
  Object.keys(query).forEach((k) => {
    if (!query[k] || query[k] == 'undefined') return delete query[k];
    if (k === 'gid') {
      if (isNaN(+query[k])) return delete query[k];
    }
  });
  // Empty query or road is not a number. Return empty array.
  if (Object.keys(query).length === 0)
    return response.status(200).json({
      data: [],
    });

  getQuery
    .geoGetRoad(query)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGetSalesVolume = (request, response) => {
  if (!request) {
    response.status(400).json({
      status: 'Error',
      responseText: 'No zipcode specified',
    });
  }

  getQuery
    .getSalesVolumeList()
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};
exports.reqGetSic = (request, response) => {
  getQuery
    .getSic(request.params.sic, request.query.type)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGetSqFoot = (request, response) => {
  if (!request) {
    response.status(400).json({
      status: 'Error',
      responseText: 'No request specified',
    });
  }

  getQuery
    .getSqFootList()
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoGetZip = (request, response) => {
  if (!request.params.zip) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Zip specified',
    });
  }

  getQuery
    .geoGetZip(request.params.zip)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};
