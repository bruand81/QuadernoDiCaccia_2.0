const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const rfs = require('rotating-file-stream');
const helmet = require('helmet');
const cors = require('cors');

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
require('winston-daily-rotate-file');

//Database connection
var mongoose = require('mongoose');
var dbhost = process.env.FULLDBPATH || 'mongodb://localhost:27017/pista';
mongoose.connect(dbhost, { useNewUrlParser: true });
//We have a pending connection to the test database running on localhost. We now need to get notified
// if we connect successfully or if a connection error occurs
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Succesfully connected");
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var scoutsRouter = require('./routes/scouts');

var app = express();

const logDirectory = path.join(__dirname, 'log');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a write stream (in append mode)
//const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
// create a rotating write stream
const accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
});

const transport = new (transports.DailyRotateFile)({
    filename: path.join(logDirectory,'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'warn'
});

const debug_transport = new (transports.DailyRotateFile)({
    filename: path.join(logDirectory,'debug-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'debug'
});

const console_transport = new (transports.Console)({
    level: 'error',
    stderrLevels: ['error', 'warn']
});

transport.on('rotate', function(oldFilename, newFilename) {
    console.log(oldFilename + " moved to "+newFilename);
});

const jsonerror = printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${JSON.stringify(info.message)}`;
});
const stringerror = printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

global.logger = createLogger({
    //levels: winston.config.syslog.levels,
    format: combine(
        label({ label: process.env.HOST||'localhost' }),
        timestamp(),
        jsonerror,
        stringerror,
        format.colorize()
    ),
    transports: [
        transport,
        debug_transport,
        console_transport
    ]
});

app.use(cors());
app.use(helmet());
app.use(helmet.noCache());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//app.use(logger('dev'));
app.use(logger('combined', {stream: accessLogStream}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/scouts', scoutsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
