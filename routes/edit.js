const router = require('express').Router();
const {isLoggedIn, secureAPI, isEditUser, isAdmin} = require('../middleware/middleware.js');

router.use(isLoggedIn);

let editCtrl = require('../controllers/editController');

// EDIT ROUTES
// router.get('/:bus_id/edit', (request, response) => {
//   // Get page to edit data for a business.
// });

router.get('/datatable', isAdmin, editCtrl.reqEditListDatatable);
router.get('/', isAdmin, editCtrl.reqEditPage);
router.get('/list', isAdmin, editCtrl.reqEditList);

// Get business log by id.
router.get('/:edit_id', isAdmin, editCtrl.reqEditListById);
router.put('/:edit_id/accept', isAdmin, editCtrl.reqAcceptEdit);
router.put('/:edit_id/reject', isAdmin, editCtrl.reqRejectEdit);

router.get('/business/:bus_id', isAdmin, editCtrl.reqEditListByBusId);
/*
WITHDRAWN
REPLACED
RETIRED
*/

router.post('/business/:bus_id', isEditUser, editCtrl.reqProposeBusinessChange);

router.get('/user/:user_id', editCtrl.reqEditListByUserId);
// TODO: Check if same user that submitted
router.put('/:edit_id/withdraw', isEditUser, editCtrl.reqWithdrawEdit);

module.exports = router;
