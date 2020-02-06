const router = require('express').Router();
const {isLoggedIn} = require('../middleware/middleware.js');
const passport = require('passport');

const apiRoutes = require('./api');
const adminRoutes = require('./admin');
const editRoutes = require('./edit');
const auditRoutes = require('./audit');

router.use('/api', apiRoutes);
router.use('/admin', adminRoutes);
router.use('/edit', editRoutes);
router.use('/audit', auditRoutes);

router.get('/login', (req, res) => {
  // res.sendFile(path.join(__dirname, '../public/views/login.html'));.
  if (req.user) return res.redirect('/');
  res.render('../views/login.ejs', {noSearchBar: true});
});

router.post('/login', (req, res, next) => {
  if (req.user) {
    return res.redirect('/');
  }
  // console.log('Inside POST /login callback');
  passport.authenticate('local', (err, user, info) => {
    // console.log('authenticated', err, user, info);
    if (info) {
      return res.json(info.message);
    }
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json('not authenticated');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({status: 'logged in'});
    });
  })(req, res, next);
});

router.get('/logout', (req, res, next) => {
  req.logout();
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie(req.sessionID);
      return res.redirect('/login');
    });
  }
});

/* GET home page. */
router.get('/infogroup', (req, res) => {
  // res.sendFile(path.join(__dirname, '../public/views/index.html'));
  res.render('../views/landing.ejs');
});

/* GET home page. */
router.get('/', isLoggedIn, (req, res) => {
  // res.sendFile(path.join(__dirname, '../public/views/index.html'));
  res.render('../views/index.ejs');
});

module.exports = router;
