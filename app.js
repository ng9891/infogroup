//Module dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const indexRoutes = require('./routes/index');
const passport = require('./utils/passport.js');
const uuid = require('uuid/v4');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

//Create server
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Session setup
app.use(
  session({
    genid: (req) => {
      return uuid(); // use UUIDs for session IDs
    },
    store: new FileStore({logFn: function() {}}),
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware for locals variables
app.use((req, res, next) => {
  res.locals.localUser = req.user;
  next();
});

app.use('/', indexRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.render('./error/500.ejs', {
    status: err.status || 500,
    error: err,
  });
});

module.exports = app;
