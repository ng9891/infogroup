var express = require('express');
var router = express.Router();

let byZip = require('../controllers/byZip');
let byId = require('../controllers/byId');
let byCounty = require('../controllers/byCounty');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendfile('./public/index.html');
});


router.get( '/api/byzip/:zipcode', byZip);
router.get( '/api/byid/:id', byId);
router.get( '/api/bycounty/:county', byCounty);


module.exports = router;
