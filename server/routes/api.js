const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Every other /api route (e.g. POST /api/contact) is handled by Next.js in
// app/api.
module.exports = router;
