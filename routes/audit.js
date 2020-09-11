const router = require('express').Router();
const {isLoggedIn, secureAPI, isAdmin} = require('../middleware/middleware.js');

router.use(secureAPI);
router.use(isAdmin);

let auditCtrl = require('../controllers/auditController');

// AUDIT ROUTES
router.get('/', auditCtrl.reqAuditList);
// Get business logs for an auditid. Logs created by a trigger.
router.get('/:audit_id', auditCtrl.reqAuditById);
// Get audit done by user. using id
router.get('/user/:user_id', auditCtrl.reqAuditByUser);

module.exports = router;
