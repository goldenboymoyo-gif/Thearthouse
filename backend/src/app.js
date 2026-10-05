// The Express application. Exported on its own so it can run three ways:
// inside the website's Vercel project (pages/api/[...path].js), as a
// standalone server (npm start) or inside the local dev server.
//
// Request pipeline for /api/*:
//   client IP → security headers → CORS → global rate limit → origin/CSRF +
//   JSON-only guard → size-limited JSON body parser → route (own rate
//   limits, schema validation, authentication) → JSON error handler.
const express = require('express');
const config = require('./config');
const { HttpError } = require('./lib/errors');
const { clientIp } = require('./lib/clientIp');
const { limit } = require('./lib/rateLimit');
const { guardWrite } = require('./lib/auth');
const log = require('./lib/log');
const contact = require('./routes/contact');
const admin = require('./routes/admin');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.disable('etag');
  // IPs are worked out by lib/clientIp.js (TRUST_PROXY), never by trusting
  // X-Forwarded-For blindly.
  app.set('trust proxy', false);

  app.use((req, res, next) => {
    req.clientIp = clientIp(req);
    next();
  });

  app.use('/api', (req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store, max-age=0',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'X-Robots-Tag': 'noindex, nofollow',
    });
    next();
  });

  // CORS: only the website's own addresses (ALLOWED_ORIGINS), never "*".
  app.use('/api', (req, res, next) => {
    const origin = String(req.headers.origin || '').replace(/\/+$/, '');
    if (origin && config.allowedOrigins().includes(origin)) {
      res.set({
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Access-Control-Max-Age': '600',
      });
    }
    res.vary('Origin');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });

  app.use('/api', limit('global'));
  app.use('/api', guardWrite);

  // Bodies: photo uploads arrive as base64 JSON (Vercel caps requests at
  // 4.5 MB anyway); everything else is small.
  app.use('/api/admin/upload', express.json({ limit: '5mb', strict: true }));
  app.use('/api', express.json({ limit: '100kb', strict: true }));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/contact', contact);
  app.use('/api/admin', admin);

  app.use('/api', (req, res, next) => next(new HttpError(404, 'Not found.')));

  // Every error becomes a short JSON answer. Details (stack traces, file
  // paths, upstream messages) are logged on the server only.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    let status = Number(err.status || err.statusCode) || 500;
    let message = err instanceof HttpError ? err.message : 'Something went wrong. Please try again.';
    if (err.type === 'entity.too.large') {
      status = 413;
      message = 'That is too large to send.';
    } else if (err.type === 'entity.parse.failed' || err.type === 'encoding.unsupported' || err.type === 'charset.unsupported') {
      status = 400;
      message = 'Invalid request.';
    }
    if (status < 400 || status > 599) status = 500;
    if (status >= 500) {
      log.error('server_error', { ...log.ctx(req), status, error: err.message, stack: config.isProduction() ? undefined : err.stack });
      if (!(err instanceof HttpError)) message = 'Something went wrong. Please try again.';
    }
    if (err.retryAfter) res.set('Retry-After', String(err.retryAfter));
    if (res.headersSent) return undefined;
    return res.status(status).json({ error: message });
  });

  return app;
}

module.exports = { createApp };
