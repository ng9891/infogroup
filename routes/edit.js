const router = require('express').Router();

let editBusiness = require('../controllers/editing/editBusiness');
let approveBusiness = require('../controllers/editing/approveBusiness');

//EDIT ROUTES
//TODO: check for auth and permission
// router.post('/edit/:bus_id', editBusiness);
// router.put('/:audit_id', approveBusiness);

module.exports = router;