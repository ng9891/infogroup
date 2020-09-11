const router = require('express').Router();
const {isLoggedIn, secureAPI} = require('../middleware/middleware.js');

router.use(secureAPI);

// Get user overview page
router.get('/:user_id', (request, response) => {
  // get user info.
  if (!request.params.user_id) request.params.user_id = request.user.id;
  else {
    // TODO: CHECK IF USER EXISTS
  }
  
  if((request.params.user_id != request.user.id) && (request.user.authLevel !== 5 && request.user.authLevel !== 10)){
    response.status(401);
    return response.redirect("/");
  }
  // Display profile with stats and audit done.
  response.render('../views/profile.ejs', {noSearchBar: true, user: request.params.user_id});
});

// revert change (?)

// Query non inactive
module.exports = router;
