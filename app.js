//Module dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const indexRoutes = require('./routes/index');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const uuid = require('uuid/v4');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const fetch = require('node-fetch');

//Create server
const app = express();

app.set('view engine', 'ejs');
app.use(cors());
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(
  session({
    genid: (req) => {
      console.log('Inside the session init/genid. SessionID', req.sessionID);
      return uuid(); // use UUIDs for session IDs
    },
    store: new FileStore(),
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// configure passport.js to use the local strategy
passport.use(
  new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    const HOST = 'https://availauth.availabs.org/';
    fetch(`${HOST}login/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, odata=verbose, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email: email, password: password, project: 'NPMRDS', token: null}),
    })
      .then((response) => response.json())
      .then((json) => {
        console.log('LocalStrat - got auth response from avail auth', json);
        if (json && JSON.stringify(json.error)) {
          return done(false, false, {message: json.error, error: 'not authenticated'});
          //if(email == user.email || password == user.password) {
        }
        if (JSON.stringify(json.id)) {
          return done(null, JSON.stringify(json));
        }
        return done(null, {message: 'unknown error'});
      })
      .catch((error) => {
        console.log(error);
      });
  })
);

// tell passport how to serialize the user
passport.serializeUser(function(json, done) {
  done(null, json);
});

// deserializer
passport.deserializeUser(function(json, done) {
  done(null, json);
});

// Middleware for locals variables
app.use((req, res, next) => {
  res.locals.localUser = req.user;
  next();
});

app.use('/api', apiRoutes);
app.use('/', indexRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
