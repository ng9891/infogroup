const router = require('express').Router();
const {isLoggedIn, secureAPI} = require('../middleware/middleware.js');

router.use(secureAPI);

// Get admin overview page
router.get('/:user_id', (request, response) => {
  // get user info.
  if(!request.params.user_id) request.params.user_id = req.user.id;
  else{
    // TODO: CHECK IF USER EXISTS
  }
  // Display profile with stats and audit done.
  response.render('../views/profile.ejs', {noSearchBar: true, user: request.params.user_id})
});

// revert change (?)

// Query non inactive
module.exports = router;
