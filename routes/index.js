var express = require('express');
var path = require('path');
var router = express.Router();

let byZip = require('../controllers/byZip');
let byId = require('../controllers/byId');
let byCounty = require('../controllers/byCounty');
let byDistance = require('../controllers/byDistance');
let byRectangle= require('../controllers/byRectangle');

//API ROUTES
router.get('/api/byzip/:zipcode', byZip);
router.get('/api/byid/:id', byId);
router.get('/api/bycounty/:county', byCounty);
router.get('/api/bydistance', byDistance);
router.get('/api/byrectangle', byRectangle);

/* GET home page. */
router.get('*', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;
