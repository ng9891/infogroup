// const getQuery = require('../services/2014/getQuery');
const getQuery = require('../services/getQuery');
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

exports.reqGetGeocodeReverse = async (request, response) => {
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
  let json = await geocode.mqGeocodeReverse(request.query.lat, request.query.lon).catch((err) => {
    console.log(err);
    return response.status(500).json({
      status: 'Error',
      responseText: 'MapQuest service not responding correctly. Please contact dev.',
    });
  });
  // Status check.
  if(!json){
    return response.status(500).json({
      status: 'Error',
      responseText: 'MapQuest service not responding correctly. Please contact dev.',
    });
  }
  if(json.info.statuscode === 0){
    return successHandler(json, response);
  }else{
    return response.status(500).json({
      status: 'Error',
      responseText: `MapQuest responded with status code ${json.info.statuscode}. ${json.info.messages}`,
    });
  }
};

exports.reqGetDrivingDist = (request, response) => {
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

  getQuery
    .geoGetDrivingDist(request.query)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGetRailroad = (request, response) => {
  if (!request.query.station) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No station specified',
    });
  }

  getQuery
    .geoGetRailroad(request.query.station, request.query.route)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGetNearbyRoad = (request, response) => {
  if (!request.query.lat || !request.query.lon) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No latitude or longitude provided',
    });
  }

  let lat = parseFloat(request.query.lat.trim());
  let lon = parseFloat(request.query.lon.trim());
  let dist = request.query.dist;
  if (dist) dist = parseFloat(request.query.dist.trim());
  if (isNaN(lat) || isNaN(lon) || (dist && isNaN(dist))) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'Invalid latitude, longitude or distance.',
    });
  } else if (dist > 10) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'Due to memory limit, distance cannot be larger than 10 miles.',
    });
  } else if (dist <= 0) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'Distance cannot be less than 0.',
    });
  }
  getQuery
    .geoGetRoadListFromPoint(lat, lon, dist)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGetConame = (request, response) => {
  if (!request.params.coname) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No company name specified',
    });
  }

  getQuery
    .geoGetConameList(request.params.coname)
    .then((data) => {
      return successHandler(data, response);
    })
    .catch((err) => {
      return errorHandler(err, response);
    });
};

exports.reqGetCounty = (request, response) => {
  if (!request.params.county) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No county specified',
    });
  }

  getQuery
    .geoGetCounty(request.params.county, request.query)
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
