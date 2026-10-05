// The Express application. Exported on its own so it can run three ways:
// as a Vercel Function (src/index.js), as a standalone server (npm start), or
// mounted inside the website's local dev server (../server/index.js).
const express = require('express');
const config = require('./config');
const { HttpError } = require('./lib/errors');
const contact = require('./routes/contact');
const admin = require('./routes/admin');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true);

  // Security headers and no caching for API answers.
  app.use('/api', (req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-store',
    });
    next();
  });

  // CORS for the website's own addresses (only needed when the website calls
  // the API directly instead of through its /api rewrite).
  app.use('/api', (req, res, next) => {
    const origin = (req.headers.origin || '').replace(/\/$/, '');
    if (origin && config.allowedOrigins().includes(origin)) {
      res.set({
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        Vary: 'Origin',
      });
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });

  // Photo uploads arrive as base64 JSON (≈4.5 MB maximum on Vercel).
  app.use('/api/admin/upload', express.json({ limit: '6mb' }));
  app.use('/api', express.json({ limit: '200kb' }));

  app.get('/', (req, res) => res.json({ name: 'The Art House API', status: 'ok', docs: '/api/health' }));
  app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
  app.use('/api/contact', contact);
  app.use('/api/admin', admin);

  app.use('/api', (req, res, next) => next(new HttpError(404, 'Not found.')));

  // Every error becomes a JSON answer the website can show.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    let status = err.status || err.statusCode || 500;
    let message = err.message;
    if (err.type === 'entity.too.large') {
      status = 413;
      message = 'That is too large to send.';
    } else if (err.type === 'entity.parse.failed') {
      status = 400;
      message = 'Invalid request.';
    } else if (status >= 500 && !(err instanceof HttpError)) {
      console.error(err);
      message = 'Something went wrong. Please try again.';
    }
    res.status(status).json({ error: message });
  });

  return app;
}

module.exports = { createApp };
