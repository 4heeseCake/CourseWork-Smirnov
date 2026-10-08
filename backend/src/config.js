const crypto = require('node:crypto');
module.exports = {
  sessionSecret:
    process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  allowedOrigin: process.env.PUBLIC_ORIGIN || 'http://localhost:3000',
  csp: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
};
