const express = require('express');
const next = require('next');

const apiRouter = require('./routes/api');

const dev = process.env.NODE_ENV !== 'production' && !process.argv.includes('--prod');
const port = parseInt(process.env.PORT, 10) || 3000;

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();

app.use('/api', apiRouter);

nextApp
  .prepare()
  .then(() => {
    app.all('*', (req, res) => handle(req, res));

    const server = app.listen(port, () => {
      console.log(
        `› The Art House Victoria Falls running on http://localhost:${port} (${dev ? 'development' : 'production'})`
      );
    });

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