const router = require('express').Router();
const {isLoggedIn, secureAPI} = require('../middleware/middleware.js');

router.use(secureAPI);

let byCtrl = require('../controllers/byReqController');
let getCtrl = require('../controllers/getReqController');

// API Routes
router.get('/search', byCtrl.reqGeoBySearch);
router.get('/bycounty/:county', byCtrl.reqGeoByCounty);
router.get('/bydistance', byCtrl.reqGeoByDistance);
router.get('/byid/:id', byCtrl.reqGeoById);
router.get('/bympo/:mpo', byCtrl.reqGeoByMpo);
router.get('/bymun/:mun', byCtrl.reqGeoByMun);
router.get('/byrectangle', byCtrl.reqGeoByRectangle);
router.get('/byzip/:zipcode', byCtrl.reqGeoByZip);

// GET Routes
router.get('/getconame/:coname', getCtrl.reqGetConame);
router.get('/getcounty/:county', getCtrl.reqGetCounty);
router.get('/getempsize', getCtrl.reqGetEmpSize);
router.get('/getindustries', getCtrl.reqGetNaics);
router.get('/getmpo/:mpo', getCtrl.reqGeoGetMpo);
router.get('/getmun/:mun', getCtrl.reqGeoGetMun);
router.get('/getroad', getCtrl.reqGeoGetRoad);
router.get('/getsalesvolume', getCtrl.reqGetSalesVolume);
router.get('/getsic/:sic', getCtrl.reqGetSic);
router.get('/getsic', getCtrl.reqGetSic);
router.get('/getsqfoot', getCtrl.reqGetSqFoot);
router.get('/getzip/:zip', getCtrl.reqGeoGetZip);

module.exports = router;
