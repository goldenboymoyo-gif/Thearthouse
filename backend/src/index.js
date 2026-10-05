// Entry point. On Vercel the exported Express app becomes one Vercel
// Function (zero configuration). Run directly (`npm start`) it listens on
// PORT (default 4000).
const express = require('express'); // eslint-disable-line no-unused-vars -- lets Vercel detect Express
const { createApp } = require('./app');

const app = createApp();

if (require.main === module) {
  try {
    process.loadEnvFile?.(require('path').join(__dirname, '..', '.env'));
  } catch {
    /* no .env file */
  }
  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => console.log(`› The Art House API on http://localhost:${port}`));
}

module.exports = app;
