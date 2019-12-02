// const byQuery = require('../services/2014/byQuery');
const byQuery = require('../services/byQuery');
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

exports.reqGeoBySearch = (request, response) => {
  if (!request.query) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No query',
    });
  }
  // Copy query object.
  let query = Object.assign({}, request.query);
  // Sanitize input
  Object.keys(query).forEach((k) => {
    if (!query[k]) return delete query[k];
    if (k === 'naicscd' || k === 'minEmp' || k === 'maxEmp' || k === 'roadNo' || k === 'roadGid' || k === 'roadDist') {
      if (isNaN(+query[k])) return delete query[k];
    }
  });
  // Empty query or only version property included. Return empty array.
  if (Object.keys(query).length <= 1)
    return response.status(200).json({
      data: [],
    });
  byQuery
    .geoBySearch(query)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoByCounty = (request, response) => {
  if (!request.params.county) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No county specified',
    });
  }

  byQuery
    .geoByCounty(request.params.county, request.query.v, request.query.offset, request.query.limit)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoByDistance = (request, response) => {
  if (!request.query.lon) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Longitude specified',
    });
  }
  if (!request.query.lat) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No latitude specified',
    });
  }
  if (!request.query.dist) {
    request.query.dist = process.env.QUERY_DIST || 1609; //QUERY_DIST from env file. Default: 1 mi.
  }

  byQuery
    .geoByDistance(request.query)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoById = (request, response) => {
  if (!request.params.id) {
    response.status(400).json({
      status: 'Error',
      responseText: 'No id',
    });
  }

  byQuery
    .geoById(request.params.id, request.query.v)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoByMpo = (request, response) => {
  if (!request.params.mpo) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No county specified',
    });
  }
  byQuery
    .geoByMpo(request.params.mpo, request.query.v, request.query.offset, request.query.limit)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoByMun = (request, response) => {
  if (!request.params.mun) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Municipality specified',
    });
  }

  byQuery
    .geoByMun(request.params.mun, request.query)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoByRectangle = (request, response) => {
  if (!request.query.maxLon) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Longitude specified',
    });
  }
  if (!request.query.maxLat) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Longitude specified',
    });
  }
  if (!request.query.minLon) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Longitude specified',
    });
  }
  if (!request.query.minLat) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Longitude specified',
    });
  }

  byQuery
    .geoByRectangle(request.query)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoByZip = (request, response) => {
  if (!request.params.zipcode) {
    response.status(400).json({
      status: 'Error',
      responseText: 'No zipcode specified',
    });
  }
  byQuery
    .geoByZip(request.params.zipcode, request.query.v)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};
