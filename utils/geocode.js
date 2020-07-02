const fetch = require('node-fetch');
/**
  * Depends on Nominatim API. @https://nominatim.org/
  * Makes a request to Nominatim Geocoding API to get GeoJSON
  * @param {String} input 
  */
exports.nomGeocode = (input) => {
  return new Promise(async (resolve, reject) => {
    if (!input || typeof input !== 'string') return reject('Invalid input');

    let URL = `https://nominatim.openstreetmap.org/search?accept-language=en&format=geojson&polygon_geojson=1&countrycodes=us&q=${input.trim()}`;
    let options = {
      headers: {
        'User-Agent': 'InfoApp',
      },
    };

    fetch(URL, options)
      .then((response) => {
        if (!response.ok) throw response;
        return response.json();
      })
      .then((json) => {
        return resolve(json);
      })
      .catch((err) => {
        console.error(err);
        return reject(err);
      });
  });
};

exports.mqGeocode = (input) => {
  return new Promise(async (resolve, reject) => {
    return resolve();
  });
};

/**
 * Using the Mapquest API to reverse geocode.
 * @param {String} lat 
 * @param {String} lon 
 */
exports.mqGeocodeReverse = (lat, lon) => {
  return new Promise(async (resolve, reject) => {
    let URL = `http://www.mapquestapi.com/geocoding/v1/reverse?key=${process.env.MAPQUEST_KEY}&location=${lat},${lon}`;
    fetch(URL)
      .then((response) => {
        if (!response.ok) throw response;
        return response.json(); // we only get here if there is no error
      })
      .then((json) => {
        return resolve(json);
      })
      .catch((err) => {
        console.error(err);
        return reject(err);
      });
  });
};
