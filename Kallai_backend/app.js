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

app.use('/', indexRouter);
app.use('/users', usersRouter);

const zaszlokRouter = require('./routes/zaszlok');
app.use('/zaszlok', zaszlokRouter);


const cors = require('cors');
var corsOptions = {
    "credentials": true,
    origin: '*',

}
app.use(cors(corsOptions));



module.exports = app;
