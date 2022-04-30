var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.use('/products', usersRouter);

app.get('/loaderio-a8b9f62937245e22fb4a38f357b901af/', (req, res) => {
  console.log('shheeeeeesh');
  res.sendFile('/loaderio-a8b9f62937245e22fb4a38f357b901af.txt');
});

module.exports = app;
