// const byQuery = require('../services/2014/byQuery');
const byQuery = require('../services/byQuery');
const geocode = require('../utils/geocode');
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

exports.reqGeoByDrivingDist = (request, response) => {
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

  byQuery
    .geoByDrivingDist(request.query)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoByRailroad = (request, response) => {
  if (!request.query.station) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No station specified',
    });
  }

  byQuery
    .geoByRailroad(request.query.station, request.query.route, request.query.dist, request.query.v)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

/**
 * Endpoint will geocode with parameter 'q'.
 * Geocode API will be specified with query 'geocode'.
 * Default Geocode API is Nominatim.
 * After receiving geoJSON from API, Service geoByGeoJson() will be called
 * to query data with the geoJSON.
 */
exports.reqGeoByGeocode = async (request, response) => {
  if (!request.params.q) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No address specified',
    });
  }
  let query = decodeURIComponent(request.params.q.trim());
  let geoJson;
  try {
    switch (request.query.geocoder) {
      case 'mapquest':
        // geoJson = await geocode.mqGeocode(query);
        break;
      default:
        geoJson = await geocode.nomGeocode(query);
    }
  } catch (err) {
    console.log(err);
    return response.status(500).json({
      status: 'Error',
      responseText: 'Geocoding service not responding',
    });
  }
  if (!geoJson || typeof geoJson !== 'object')
    return response.status(500).json({
      status: 'Error',
      responseText: 'Geocoding service not responding',
    });

  byQuery
    .geoByGeoJson(geoJson, request.query.dist, request.query.v)
    .then((data) => {
      return response.status(200).json({
        data: data,
        overlayJson: JSON.stringify(geoJson),
      });
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoBySearch = (request, response) => {
  // if (!request.query) {
  //   return response.status(400).json({
  //     status: 'Error',
  //     responseText: 'No query',
  //   });
  // }
  // Copy query object.
  let query = Object.assign({}, request.query);
  if (request.method === 'POST') query = Object.assign({}, request.body);

  // Sanitize input
  let inputKeys = Object.keys(query);
  // Empty query or only version property included. Return empty array.
  if (inputKeys.length <= 1)
    return response.status(200).json({
      data: [],
    });
  let empty = true;
  inputKeys.forEach((k) => {
    if (!query[k]) return delete query[k];
    if (query[k] && k !== 'v') {
      // console.log('not empty for %s', k);
      empty = false;
    }
    // Checking if valid number.
    if (
      k === 'naicscd' ||
      k === 'minEmp' ||
      k === 'maxEmp' ||
      k === 'roadNo' ||
      k === 'roadId' ||
      k === 'roadDist' ||
      k === 'dist'
    ) {
      if (isNaN(parseFloat(query[k]))) return delete query[k];
    }
  });
  if (empty) {
    return successHandler([], response);
  }
  if (query['roadDist'] && query['roadDist'] > 10)
    return response.status(400).json({
      status: 'Error',
      responseText: 'Due to memory limit, distance cannot be larger than 10 miles.',
    });
  else if (query['roadDist'] && query['roadDist'] <= 0) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'Distance cannot be less than 0.',
    });
  }
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
    .geoByCounty(request.params.county, request.query)
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
    return response.status(400).json({
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

exports.reqGeoByPolyline = (request, response) => {
  let coord;
  try {
    coord = JSON.parse(request.query.coord);
  } catch (e) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'Invalid Polyline.\n' + e,
    });
  }
  if (!request.query.coord) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Polyline specified',
    });
  }
  byQuery
    .geoByPolyline(coord, request.query.dist, request.query.v)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGeoByZip = (request, response) => {
  if (!request.params.zipcode) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No zipcode specified',
    });
  } else if (isNaN(parseInt(request.params.zipcode, 10))) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'Invalid Zipcode',
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
