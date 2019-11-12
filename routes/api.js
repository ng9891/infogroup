const router = require('express').Router();

let byZip = require('../controllers/byZip');
let byId = require('../controllers/byId');
let byCounty = require('../controllers/byCounty');
let byMpo = require('../controllers/byMpo');
let byMun = require('../controllers/byMun');
let byDistance = require('../controllers/byDistance');
let byRectangle = require('../controllers/byRectangle');

let getIndustries = require('../controllers/getIndustries');
let getSalesVolume = require('../controllers/getSalesVolume');
let getEmpSize = require('../controllers/getEmpSize');
let getSqFoot = require('../controllers/getSqFoot');
let getZip = require('../controllers/getZip');
let getCounty = require('../controllers/getCounty');
let getMpo = require('../controllers/getMpo');
let getMun = require('../controllers/getMun');
let getSic_AutoComplete = require('../controllers/getSic');
let getSic = require('../controllers/getSic');

let advancedSearch = require('../controllers/advancedSearch');

//API ROUTES
router.get('/byzip/:zipcode', byZip);
router.get('/byid/:id', byId);
router.get('/bycounty/:county', byCounty);
router.get('/bympo/:mpo', byMpo);
router.get('/bymun/:mun', byMun);
router.get('/bydistance', byDistance);
router.get('/byrectangle', byRectangle);

router.get('/getindustries', getIndustries);
router.get('/getsalesvolume', getSalesVolume);
router.get('/getempsize', getEmpSize);
router.get('/getsqfoot', getSqFoot);
router.get('/getzip/:zip', getZip);
router.get('/getcounty/:county', getCounty);
router.get('/getmpo/:mpo', getMpo);
router.get('/getmun/:mun', getMun);
router.get('/getsic/:sic', getSic_AutoComplete);
router.get('/getsic', getSic);

router.get('/search', advancedSearch);

module.exports = router;
