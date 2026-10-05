// Self-hosted / local server: one process runs both the website (Next.js)
// and the Express backend in /backend.
//   npm run dev   – development
//   npm start     – production (after `npm run build`)
// On Vercel this file is not used: the website runs on Vercel's platform and
// pages/api/[...path].js hands /api/* to the same Express backend.
const express = require('express');
const next = require('next');

const prod = process.argv.includes('--prod') || process.env.NODE_ENV === 'production';
// Make sure every part of the app (Next.js, backend cookies/CSP/logging)
// agrees that this is production.
if (prod) process.env.NODE_ENV = 'production';
const dev = !prod;
const port = parseInt(process.env.PORT, 10) || 3000;

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(() => {
    // Loaded after prepare() so .env.local (ADMIN_PASSWORD etc.) is available.
    const { createApp } = require('../backend/src/app');
    const config = require('../backend/src/config');
    const app = express();
    app.disable('x-powered-by');
    app.set('trust proxy', false);

    // Behind a TLS-terminating proxy (TRUST_PROXY set): send plain-HTTP
    // visitors to HTTPS. The header is only believed when a proxy is trusted.
    if (prod && process.env.FORCE_HTTPS !== 'false' && config.trustProxy() !== 'none') {
      app.use((req, res, nextFn) => {
        const proto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
        if (proto === 'http') {
          const host = String(req.headers.host || '').replace(/[^A-Za-z0-9.:-]/g, '');
          return res.redirect(308, `https://${host}${req.originalUrl}`);
        }
        return nextFn();
      });
    }

    app.use(createApp());
    app.all('*', (req, res) => handle(req, res));

    const server = app.listen(port, () => {
      console.log(
        `› The Art House Victoria Falls running on http://localhost:${port} (${dev ? 'development' : 'production'})\n` +
          `› Backend API on http://localhost:${port}/api – admin at http://localhost:${port}/admin`
      );
    });
    // Slow-client protection (slowloris): cap header and request times.
    server.headersTimeout = 20000;
    server.requestTimeout = 30000;
    server.keepAliveTimeout = 5000;

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(
          `\nPort ${port} is already in use, so the server cannot start.\n` +
            `  - Another copy of this server is probably still running.\n` +
            `  - Close it, or start this one on a different port:\n\n` +
            `      $env:PORT=3001; npm run dev\n`
        );
        process.exit(1);
      }
      console.error('Failed to start server:', err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
