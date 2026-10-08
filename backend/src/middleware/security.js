const crypto = require('node:crypto');
const { allowedOrigin } = require('../config');
function requireUser(req, res, next) {
  if (!req.session.user)
    return res.status(401).json({ message: 'Authentication required' });
  next();
}
function checkOrigin(req, res, next) {
  if (
    req.mode === 'protected' &&
    req.get('Origin') &&
    req.get('Origin') !== allowedOrigin
  ) {
    return res.status(403).json({ message: 'Invalid request origin' });
  }
  next();
}
function requireCsrf(req, res, next) {
  if (req.mode === 'vulnerable') return next();
  const actual = req.get('X-CSRF-Token') || req.body._csrf;
  const expected = req.session.csrfToken;
  if (
    typeof actual !== 'string' ||
    !expected ||
    Buffer.byteLength(actual) !== Buffer.byteLength(expected) ||
    !crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  ) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  next();
}
module.exports = { requireUser, checkOrigin, requireCsrf };
