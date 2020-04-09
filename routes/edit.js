const router = require('express').Router();
const {isLoggedIn, secureAPI} = require('../middleware/middleware.js');

router.use(secureAPI);

let editCtrl = require('../controllers/editController');

// EDIT ROUTES
// router.get('/:bus_id/edit', (request, response) => {
//   // Get page to edit data for a business.
// });

router.get('/datatable', editCtrl.reqEditListDatatable);
router.get('/', editCtrl.reqEditPage);

// Get business log by id.
router.get('/:edit_id', editCtrl.reqEditListById);
router.put('/:edit_id/accept', editCtrl.reqAcceptEdit);
router.put('/:edit_id/reject', editCtrl.reqRejectEdit);
router.put('/:edit_id/withdraw', editCtrl.reqWithdrawEdit);
/*
WITHDRAWN
REPLACED
RETIRED
*/

router.get('/business/:bus_id', editCtrl.reqEditListByBusId);
router.post('/business/:bus_id', editCtrl.reqProposeBusinessChange);
router.get('/user/:user_id', editCtrl.reqEditListByUserId);

module.exports = router;
