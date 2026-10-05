// Serialises structured data for <script type="application/ld+json">.
// JSON.stringify alone is not safe inside a <script> tag: a value containing
// "</script>" (for example an FAQ answer edited in the admin dashboard) could
// close the tag and inject HTML. Escaping <, >, & and the JS line separators
// keeps the JSON identical for search engines but inert for the browser.
export function jsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
