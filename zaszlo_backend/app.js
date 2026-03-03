var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var zaszlokRouter = require('./routes/zaszlok');
var szamlakRouter = require('./routes/szamlak');

var app = express();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8081',
  'http://localhost:3000',
  'http://10.0.2.2:5173',
];

const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredOrigins])];
const localNetworkOriginRegex = /^https?:\/\/(?:10(?:\.\d{1,3}){3}|127(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?::\d{1,5})?$/;

var corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || localNetworkOriginRegex.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('A CORS origin nincs engedelyezve.'));
  },
};

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', usersRouter);
app.use('/zaszlok', zaszlokRouter);
app.use('/szamlak', szamlakRouter);

app.use((err, req, res, next) => {
  console.error('Szerver hiba:', err.stack);
  res.status(500).json({ message: 'Belso szerverhiba tortent!', error: err.message });
});

module.exports = app;
