//Module dependencies

let express = require('express')
var cors = require('cors')
var path = require('path');
var bodyParser = require('body-parser');
let routes = require('./routes')

//Create server
var app = express();

app.use(cors())
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
// app.use(express.static(__dirname + '/public'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


module.exports = app;