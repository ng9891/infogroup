const router = require('express').Router();
const {isLoggedIn, secureAPI} = require('../middleware/middleware.js');

router.use(secureAPI);

let editBusiness = require('../controllers/editing/editBusiness');
let approveBusiness = require('../controllers/editing/approveBusiness');

//EDIT ROUTES
// router.post('/:bus_id', isLoggedIn, editBusiness);
// router.put('/:audit_id', approveBusiness);

module.exports = router;