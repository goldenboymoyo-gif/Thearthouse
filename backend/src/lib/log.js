// Structured security/application logging: one JSON object per line on
// stdout/stderr, which Vercel (and any log drain such as Datadog, Axiom or
// Better Stack) can index and alert on. Values whose key looks sensitive are
// replaced, and long strings are cut, so secrets and personal data such as
// messages or passwords never end up in the logs.
const SENSITIVE = /pass(word)?|secret|token|authorization|cookie|session|api[-_]?key|data|message|email|phone/i;

function clean(value, depth = 0) {
  if (value == null || typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.length > 300 ? `${value.slice(0, 300)}…` : value;
  if (depth > 3) return '[…]';
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => clean(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = SENSITIVE.test(k) ? '[redacted]' : clean(v, depth + 1);
    return out;
  }
  return String(value);
}

function write(level, event, fields = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...clean(fields) });
  if (level === 'error' || level === 'warn') console.error(line);
  else console.log(line);
}

// Common request context for security events.
const ctx = (req) => ({ ip: req.clientIp, method: req.method, path: (req.originalUrl || req.url || '').split('?')[0].slice(0, 200) });

module.exports = {
  info: (event, fields) => write('info', event, fields),
  warn: (event, fields) => write('warn', event, fields),
  error: (event, fields) => write('error', event, fields),
  security: (event, req, fields = {}) => write('warn', event, { ...ctx(req), ...fields }),
  audit: (event, req, fields = {}) => write('info', event, { ...ctx(req), ...fields }),
  ctx,
};
