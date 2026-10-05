// fetch() with a hard timeout, so a slow third-party service (GitHub, Resend)
// can never hold a request – and a serverless function – open indefinitely.
async function fetchWithTimeout(url, init = {}, ms = 10000) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(ms), redirect: 'error' });
}

module.exports = { fetchWithTimeout };
