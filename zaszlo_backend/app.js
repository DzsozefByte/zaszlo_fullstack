var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
require("dotenv").config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var zaszlokRouter = require('./routes/zaszlok');
var szamlakRouter = require('./routes/szamlak');

var app = express();

// CORS beállítások - adjuk hozzá a 8080-at is a biztonság kedvéért, ha azon futna valami
var corsOptions = {
    credentials: true,
    origin: [
        'http://localhost:5173',
        'http://localhost:8081',
        'http://localhost:3000'
    ],
};

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Útvonalak regisztrálása (MINDENBŐL CSAK EGY!)
app.use('/', indexRouter);
app.use('/auth', usersRouter);
app.use('/zaszlok', zaszlokRouter);
app.use('/szamlak', szamlakRouter);

// Hibakezelő middleware (hogy a 500-as hiba ne némán omoljon össze)
app.use((err, req, res, next) => {
    console.error("Szerver hiba:", err.stack);
    res.status(500).json({ message: "Belső szerverhiba történt!", error: err.message });
});

module.exports = app;