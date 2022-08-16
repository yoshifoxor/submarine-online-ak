const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const Strategy = require('passport-twitter').Strategy;
require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

passport.use(new Strategy({
    consumerKey: process.env.TWITTER_CONSUMERKEY,
    consumerSecret: process.env.TWITTER_CONSUMERSECRET,
    callbackURL: process.env.TWITTER_CALLBACKURL
  }, (token, tokenSecret, profile, cb) => {
    process.nextTick(() => cb(null, profile))
  }
));

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", 'abs.twimg.com', 'pbs.twimg.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/login/twitter',
  passport.authenticate('twitter')
);

app.get('/oauth_callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);

app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
