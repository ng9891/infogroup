var express = require('express');
var path = require('path');
var router = express.Router();

let byZip = require('../controllers/byZip');
let byId = require('../controllers/byId');
let byCounty = require('../controllers/byCounty');
let byMpo = require('../controllers/byMpo');
let byCity = require('../controllers/byCity');
let byDistance = require('../controllers/byDistance');
let byRectangle= require('../controllers/byRectangle');

let getIndustries = require('../controllers/getIndustries');
let getZip = require('../controllers/getZip');
let getCounty = require('../controllers/getCounty');
let getMpo = require('../controllers/getMpo');
let getCity = require('../controllers/getCity');

let advancedSearch = require('../controllers/advancedSearch');

//API ROUTES
router.get('/api/byzip/:zipcode', byZip);
router.get('/api/byid/:id', byId);
router.get('/api/bycounty/:county', byCounty);
router.get('/api/bympo/:mpo', byMpo);
router.get('/api/bycity/:city', byCity);
router.get('/api/bydistance', byDistance);
router.get('/api/byrectangle', byRectangle);

router.get('/api/getindustries', getIndustries);
router.get('/api/getzip/:zip', getZip);
router.get('/api/getcounty/:county', getCounty);
router.get('/api/getmpo/:mpo', getMpo);
router.get('/api/getcity/:city', getCity);

router.get('/api/advancedSearch', advancedSearch);


/* GET home page. */
router.get('*', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;
