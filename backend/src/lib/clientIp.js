// Works out the visitor's IP address without trusting headers a client could
// forge. Which header is trustworthy depends on the hosting (TRUST_PROXY in
// config.js); anything not covered falls back to the TCP connection address.
const net = require('net');
const config = require('../config');

const valid = (ip) => (ip && net.isIP(ip.trim()) ? ip.trim() : null);
const first = (h) => (typeof h === 'string' ? h.split(',')[0] : null);

function clientIp(req) {
  const mode = config.trustProxy();
  const h = req.headers;
  let ip = null;
  if (mode === 'vercel') {
    // Set by Vercel's edge, which discards client-supplied values.
    ip = valid(h['x-real-ip']) || valid(first(h['x-vercel-forwarded-for']));
  } else if (mode === 'cloudflare') {
    ip = valid(h['cf-connecting-ip']);
  } else if (typeof mode === 'number' && mode > 0) {
    const chain = String(h['x-forwarded-for'] || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    ip = valid(chain[chain.length - mode]);
  }
  if (!ip) ip = valid((req.socket && req.socket.remoteAddress) || '') || 'unknown';
  return ip.replace(/^::ffff:/, '');
}

module.exports = { clientIp };
