
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
require("dotenv").config();


var app = express();

var corsOptions = {
    "credentials": true,
    origin: [
        'http://localhost:5173',
        'http://localhost:8081',
    ],

}
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', usersRouter);

var zaszlokRouter = require('./routes/zaszlok');
app.use('/zaszlok', zaszlokRouter);








module.exports = app;
