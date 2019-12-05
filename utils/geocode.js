const request = require('request-promise');
const fetch = require('node-fetch');
/**
  * Depends on Nominatim API. @https://nominatim.org/
  * Makes a request to Nominatim Geocoding API to get GeoJSON
  * @param {String} input 
  */
exports.nomGeocode = (input) => {
  return new Promise(async (resolve, reject) => {
    if (!input || typeof input !== 'string') return reject('Invalid input');

    let params = {
      'accept-language': 'en',
      format: 'geojson',
      polygon_geojson: '1',
      countrycodes: 'us',
      q: input.trim(),
    };

    let URL = 'https://nominatim.openstreetmap.org/search';
    let options = {
      uri: URL,
      headers: {
        'User-Agent': 'InfoApp',
      },
      json: true, // Automatically parses the JSON string in the response
      qs: params,
    };

    let geoJson = await request(options).catch((err) => {
      console.log(err);
    });

    return resolve(geoJson);
  });
};
