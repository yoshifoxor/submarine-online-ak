'use strict';

const { Hono } = require('hono');
const { logger } = require('hono/logger');
const { secureHeaders } = require('hono/secure-headers');
const { trimTrailingSlash } = require('hono/trailing-slash');
const { serveStatic } = require('@hono/node-server/serve-static');

const indexRouter = require('./routes/index');

const app = new Hono();

app.use(logger());
app.use(serveStatic({ root: './public' }));
app.use(trimTrailingSlash());
app.use(
  secureHeaders({
    contentSecurityPolicy: {
      imgSrc: ["'self'", '*.googleusercontent.com'],
    },
  })
);

app.route('/', indexRouter);

module.exports = app;
