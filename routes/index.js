const path = require('path');
const router = require('express').Router();
const passport = require('passport');

let editBusiness = require('../controllers/editing/editBusiness');
let approveBusiness = require('../controllers/editing/approveBusiness');

//EDIT ROUTES
//TODO: check for auth and permission
// router.post('/edit/:bus_id', editBusiness);
// router.put('/:audit_id', approveBusiness);

router.get('/login', function(req, res, next) {
  // res.sendFile(path.join(__dirname, '../public/views/login.html'));.
  res.render('../views/login.ejs');
});

router.post('/login', function(req, res, next) {
  console.log('Inside POST /login callback');
  passport.authenticate('local', (err, user, info) => {
    console.log('/login POST - authenticated', err, user, info);
    if (info) {
      return res.json(info.message);
    }
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json('not authenticated');
    }
    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res.redirect('/login');
      }
      return res.json({status: 'logged in'});
    });
  })(req, res, next);
});

router.get('/logout', function(req, res, next) {
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      }
      console.log('you are logged out, Please log in again!\n');
      return res.redirect('/login');
    });
  }
});

/* GET home page. */
router.get('*', function(req, res, next) {
  // res.sendFile(path.join(__dirname, '../public/views/index.html'));
  res.render('../views/index.ejs');
});

module.exports = router;
