var express = require('express');
var router = express.Router();

let byZip = require('../controllers/byZip')
let byId = require('../controllers/byId')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendfile('./public/index.html');
});


router.get( '/api/byzip/:zipcode', byZip);

router.get( '/api/byid/:id', byId);

module.exports = router;
